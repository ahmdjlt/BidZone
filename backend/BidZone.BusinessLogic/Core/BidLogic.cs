using System.Data;
using BidZone.BusinessLogic.Interface;
using BidZone.DataAccess.Context;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace BidZone.BusinessLogic.Core;

public class BidLogic : IDisposable
{
    private readonly AppDbContext _db;
    private readonly bool _ownsDb;
    private readonly ILogger _logger;

    // Preferred constructor: AppDbContext (scoped) and ILogger are supplied via DI.
    public BidLogic(AppDbContext db, ILogger<BidLogic> logger)
    {
        _db = db;
        _ownsDb = false;
        _logger = logger;
    }

    // Fallback for the factory/inheritance path (BusinessLogic.BidAction -> new BidExecution()).
    // TODO: once BidExecution/BusinessLogic factory can move to DI, drop this and require the
    //       injected context/logger instead of self-creating a context.
    public BidLogic()
    {
        _db = new AppDbContext();
        _ownsDb = true;
        _logger = NullLogger<BidLogic>.Instance;
    }

    public void Dispose()
    {
        if (_ownsDb)
        {
            _db.Dispose();
        }
        GC.SuppressFinalize(this);
    }

    internal async Task<BidDto?> PlaceBidExecution(PlaceBidDto dto, int bidderId)
    {
        const int maxAttempts = 3;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                return await PlaceBidAttemptAsync(dto, bidderId);
            }
            catch (DbUpdateConcurrencyException) when (attempt < maxAttempts)
            {
                // Another bidder updated this auction first. Retry against the latest price/status.
            }
            catch (DbUpdateException ex) when (attempt < maxAttempts && IsRetryableBidWriteConflict(ex))
            {
                // Serializable transactions can surface provider-level retryable conflicts.
            }
        }

        return null;
    }

    private async Task<BidDto?> PlaceBidAttemptAsync(PlaceBidDto dto, int bidderId)
    {
        var db = _db;
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var auction = await db.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == dto.AuctionId);
        if (auction == null)
            return null;

        if (auction.Status == "Active" && auction.EndTime <= DateTime.UtcNow)
        {
            FinalizeExpiredAuction(auction);
            auction.ConcurrencyStamp = Guid.NewGuid();
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
            return null;
        }

        if (auction.Status != "Active") return null;
        if (auction.SellerId == bidderId) return null;
        if (dto.Amount <= auction.CurrentPrice) return null;

        var previousHighest = auction.Bids
            .OrderByDescending(b => b.Amount)
            .ThenBy(b => b.PlacedAt)
            .ThenBy(b => b.Id)
            .FirstOrDefault();

        if (previousHighest != null && previousHighest.BidderId == bidderId)
            return null;

        if (previousHighest != null && dto.Amount <= previousHighest.Amount)
            return null;

        if (previousHighest != null)
            previousHighest.Status = "Outbid";

        var bid = new Bid
        {
            Amount = dto.Amount,
            PlacedAt = DateTime.UtcNow,
            Status = "Winning",
            AuctionId = dto.AuctionId,
            BidderId = bidderId
        };
        db.Bids.Add(bid);
        auction.CurrentPrice = dto.Amount;
        auction.ConcurrencyStamp = Guid.NewGuid();
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        await TryAddBidderToWatchlistAsync(db, bidderId, dto.AuctionId);

        var created = await db.Bids
            .AsNoTracking()
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .FirstAsync(b => b.Id == bid.Id);
        return Mappers.ToDto(created);
    }

    private async Task TryAddBidderToWatchlistAsync(AppDbContext db, int bidderId, int auctionId)
    {
        try
        {
            // Reuse the single injected context; the bid was already committed above.
            var alreadyWatching = await db.WatchlistItems.AnyAsync(w => w.UserId == bidderId && w.AuctionId == auctionId);
            if (!alreadyWatching)
            {
                db.WatchlistItems.Add(new WatchlistItem
                {
                    UserId = bidderId,
                    AuctionId = auctionId,
                    AddedAt = DateTime.UtcNow
                });
                await db.SaveChangesAsync();
            }
        }
        catch (DbUpdateException ex)
        {
            // Race condition: watchlist item inserted concurrently. The bid was already saved above.
            _logger.LogWarning(ex, "Failed to add bidder {BidderId} to watchlist for auction {AuctionId}.", bidderId, auctionId);
        }
    }

    private static bool IsRetryableBidWriteConflict(DbUpdateException ex)
    {
        var inner = ex.InnerException;
        var sqlState = inner?.GetType().GetProperty("SqlState")?.GetValue(inner) as string;
        if (sqlState is "40001" or "40P01")
        {
            return true;
        }

        var message = inner?.Message ?? ex.Message;
        return message.Contains("database is locked", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("serialization failure", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("deadlock detected", StringComparison.OrdinalIgnoreCase);
    }

    private static void FinalizeExpiredAuction(Auction auction)
    {
        var highestBid = auction.Bids
            .OrderByDescending(b => b.Amount)
            .ThenBy(b => b.PlacedAt)
            .ThenBy(b => b.Id)
            .FirstOrDefault();

        var reserveMet = highestBid != null &&
            (!auction.ReservePrice.HasValue || highestBid.Amount >= auction.ReservePrice.Value);

        foreach (var bid in auction.Bids)
        {
            bid.Status = reserveMet && bid.Id == highestBid!.Id ? "Won" : "Lost";
        }

        if (highestBid == null)
        {
            auction.CurrentPrice = auction.StartingPrice;
        }

        auction.Status = "Closed";
    }

    internal async Task<List<BidDto>> GetByAuctionExecution(int auctionId)
    {
        var bids = await _db.Bids
            .AsNoTracking()
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .ToListAsync();
        return Mappers.ToDtoList(bids);
    }

    internal async Task<List<BidDto>> GetByUserExecution(int userId)
    {
        var bids = await _db.Bids
            .AsNoTracking()
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .Where(b => b.BidderId == userId)
            .OrderByDescending(b => b.PlacedAt)
            .ToListAsync();
        return Mappers.ToDtoList(bids);
    }

    internal async Task<List<BidDto>> GetRecentExecution(int limit)
    {
        var take = Math.Clamp(limit, 1, 30);
        var bids = await _db.Bids
            .AsNoTracking()
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .OrderByDescending(b => b.PlacedAt)
            .Take(take)
            .ToListAsync();
        return Mappers.ToDtoList(bids);
    }

    internal async Task<BidDto?> GetHighestBidExecution(int auctionId)
    {
        var bid = await _db.Bids
            .AsNoTracking()
            .Include(b => b.Bidder)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .FirstOrDefaultAsync();
        return bid == null ? null : Mappers.ToDto(bid);
    }
}
