using BidZone.BusinessLogic.Interface;
using BidZone.BusinessLogic.Structure;
using BidZone.Domains;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class BidLogic
{
    public BidLogic() { }

    internal async Task<BidDto?> PlaceBidExecution(PlaceBidDto dto, int bidderId)
    {
        using var db = new AppDbContext();

        var auction = await db.Auctions.FirstOrDefaultAsync(a => a.Id == dto.AuctionId);
        if (auction == null)
            return null;

        if (auction.Status == "Active" && auction.EndTime <= DateTime.UtcNow)
        {
            var finalization = new AuctionFinalizationExecution();
            await finalization.FinalizeAuctionIfExpiredAsync(dto.AuctionId);
            return null;
        }

        if (auction.Status != "Active") return null;
        if (auction.SellerId == bidderId) return null;
        if (dto.Amount <= auction.CurrentPrice) return null;

        var previousHighest = await db.Bids
            .Where(b => b.AuctionId == dto.AuctionId)
            .OrderByDescending(b => b.Amount)
            .FirstOrDefaultAsync();
        if (previousHighest != null)
        {
            previousHighest.Status = "Outbid";
        }

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

        var alreadyWatching = await db.WatchlistItems.AnyAsync(w => w.UserId == bidderId && w.AuctionId == dto.AuctionId);
        if (!alreadyWatching)
        {
            db.WatchlistItems.Add(new WatchlistItem
            {
                UserId = bidderId,
                AuctionId = dto.AuctionId,
                AddedAt = DateTime.UtcNow
            });
        }

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Race condition on watchlist unique index — safe to swallow
        }

        var created = await db.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .FirstAsync(b => b.Id == bid.Id);
        return Mappers.ToDto(created);
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
