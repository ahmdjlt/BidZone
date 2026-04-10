using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class AuctionFinalizationService : BaseLogic, IAuctionFinalizationService
{
    public AuctionFinalizationService(AppDbContext context) : base(context) { }

    public async Task<int> FinalizeExpiredAuctionsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var auctions = await _context.Auctions
            .Include(a => a.Bids)
            .Where(a => a.Status == "Active" && a.EndTime <= now)
            .ToListAsync(cancellationToken);

        foreach (var auction in auctions)
        {
            FinalizeAuction(auction);
        }

        if (auctions.Count > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return auctions.Count;
    }

    public async Task<bool> FinalizeAuctionIfExpiredAsync(int auctionId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var auction = await _context.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == auctionId, cancellationToken);

        if (auction == null || auction.Status != "Active" || auction.EndTime > now)
        {
            return false;
        }

        FinalizeAuction(auction);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void FinalizeAuction(Auction auction)
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
}
