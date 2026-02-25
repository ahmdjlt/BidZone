using BidZone.DAL.Interfaces;
using BidZone.Models;
using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.DAL.Repositories;

public class WatchlistRepository : IWatchlistRepository
{
    private readonly AppDbContext _context;

    public WatchlistRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WatchlistItem>> GetByUserAsync(int userId)
        => await _context.WatchlistItems
            .Include(w => w.Auction).ThenInclude(a => a.Category)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync();

    public async Task<WatchlistItem> AddAsync(WatchlistItem item)
    {
        _context.WatchlistItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task RemoveAsync(int userId, int auctionId)
    {
        var item = await _context.WatchlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.AuctionId == auctionId);
        if (item != null)
        {
            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> IsWatchingAsync(int userId, int auctionId)
        => await _context.WatchlistItems.AnyAsync(w => w.UserId == userId && w.AuctionId == auctionId);
}
