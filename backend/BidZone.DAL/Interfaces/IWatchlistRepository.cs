using BidZone.Models.Entities;

namespace BidZone.DAL.Interfaces;

public interface IWatchlistRepository
{
    Task<List<WatchlistItem>> GetByUserAsync(int userId);
    Task<WatchlistItem> AddAsync(WatchlistItem item);
    Task RemoveAsync(int userId, int auctionId);
    Task<bool> IsWatchingAsync(int userId, int auctionId);
}
