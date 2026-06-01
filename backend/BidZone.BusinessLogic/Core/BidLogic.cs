using System.Data;
using BidZone.BusinessLogic.Interface;
using BidZone.DataAccess.Context;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class BidLogic
{
    public BidLogic() { }

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

    private static async Task<BidDto?> PlaceBidAttemptAsync(PlaceBidDto dto, int bidderId)
    {
        using var db = new AppDbContext();
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

        await TryAddBidderToWatchlistAsync(bidderId, dto.AuctionId);

        var created = await db.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .FirstAsync(b => b.Id == bid.Id);
        return Mappers.ToDto(created);
    }

    private static async Task TryAddBidderToWatchlistAsync(int bidderId, int auctionId)
    {
        try
        {
            using var watchlistDb = new AppDbContext();
            var alreadyWatching = await watchlistDb.WatchlistItems.AnyAsync(w => w.UserId == bidderId && w.AuctionId == auctionId);
            if (!alreadyWatching)
            {
                watchlistDb.WatchlistItems.Add(new WatchlistItem
                {
                    UserId = bidderId,
                    AuctionId = auctionId,
                    AddedAt = DateTime.UtcNow
                });
                await watchlistDb.SaveChangesAsync();
            }
        }
        catch (DbUpdateException)
        {
            // Race condition: watchlist item inserted concurrently. The bid was already saved above.
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
        using var db = new AppDbContext();
        var bids = await db.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .ToListAsync();
        return Mappers.ToDtoList(bids);
    }

    internal async Task<List<BidDto>> GetByUserExecution(int userId)
    {
        using var db = new AppDbContext();
        var bids = await db.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .Where(b => b.BidderId == userId)
            .OrderByDescending(b => b.PlacedAt)
            .ToListAsync();
        return Mappers.ToDtoList(bids);
    }

    internal async Task<List<BidDto>> GetRecentExecution(int limit)
    {
        using var db = new AppDbContext();
        var take = Math.Clamp(limit, 1, 30);
        var bids = await db.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .OrderByDescending(b => b.PlacedAt)
            .Take(take)
            .ToListAsync();
        return Mappers.ToDtoList(bids);
    }

    internal async Task<BidDto?> GetHighestBidExecution(int auctionId)
    {
        using var db = new AppDbContext();
        var bid = await db.Bids
            .Include(b => b.Bidder)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .FirstOrDefaultAsync();
        return bid == null ? null : Mappers.ToDto(bid);
    }
}
