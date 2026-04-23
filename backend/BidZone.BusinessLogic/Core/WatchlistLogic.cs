using BidZone.Domains;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class WatchlistLogic
{
    public WatchlistLogic() { }

    internal async Task<List<WatchlistDto>> GetUserWatchlistExecution(int userId)
    {
        using var db = new AppDbContext();
        var items = await db.WatchlistItems
            .Include(w => w.Auction).ThenInclude(a => a.Category)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync();
        return Mappers.ToDtoList(items);
    }

    internal async Task<WatchlistDto?> AddExecution(int userId, int auctionId)
    {
        using var db = new AppDbContext();

        var auction = await db.Auctions.FirstOrDefaultAsync(a => a.Id == auctionId);
        if (auction == null) return null;

        var already = await db.WatchlistItems.AnyAsync(w => w.UserId == userId && w.AuctionId == auctionId);
        if (already) return null;

        var item = new WatchlistItem
        {
            UserId = userId,
            AuctionId = auctionId,
            AddedAt = DateTime.UtcNow
        };
        db.WatchlistItems.Add(item);
        await db.SaveChangesAsync();

        return new WatchlistDto
        {
            Id = item.Id,
            AuctionId = auction.Id,
            AuctionTitle = auction.Title,
            AuctionImageUrl = auction.ImageUrl,
            CurrentPrice = auction.CurrentPrice,
            EndTime = auction.EndTime,
            Status = auction.Status,
            AddedAt = item.AddedAt
        };
    }

    internal async Task RemoveExecution(int userId, int auctionId)
    {
        using var db = new AppDbContext();
        var item = await db.WatchlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.AuctionId == auctionId);
        if (item != null)
        {
            db.WatchlistItems.Remove(item);
            await db.SaveChangesAsync();
        }
    }

    internal async Task<bool> IsWatchingExecution(int userId, int auctionId)
    {
        using var db = new AppDbContext();
        return await db.WatchlistItems.AnyAsync(w => w.UserId == userId && w.AuctionId == auctionId);
    }
}
