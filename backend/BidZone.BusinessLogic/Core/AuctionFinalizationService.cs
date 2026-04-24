using BidZone.DataAccess.Context;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class AuctionFinalizationLogic
{
    public AuctionFinalizationLogic() { }

    internal async Task<int> FinalizeExpiredExecution(CancellationToken cancellationToken = default)
    {
        using var db = new AppDbContext();
        var now = DateTime.UtcNow;

        var auctions = await db.Auctions
            .Include(a => a.Bids)
            .Where(a => a.Status == "Active" && a.EndTime <= now)
            .ToListAsync(cancellationToken);

        foreach (var auction in auctions)
            FinalizeAuction(auction);

        if (auctions.Count > 0)
            await db.SaveChangesAsync(cancellationToken);

        return auctions.Count;
    }

    internal async Task<bool> FinalizeIfExpiredExecution(int auctionId, CancellationToken cancellationToken = default)
    {
        using var db = new AppDbContext();
        var now = DateTime.UtcNow;

        var auction = await db.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == auctionId, cancellationToken);

        if (auction == null || auction.Status != "Active" || auction.EndTime > now)
            return false;

        FinalizeAuction(auction);
        await db.SaveChangesAsync(cancellationToken);
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
            auction.CurrentPrice = auction.StartingPrice;

        auction.Status = "Closed";
    }
}
