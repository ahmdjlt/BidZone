using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Interface;

public interface IWatchlistLogic
{
    Task<List<WatchlistDto>> GetUserWatchlistAsync(int userId);
    Task<WatchlistDto?> AddAsync(int userId, int auctionId);
    Task RemoveAsync(int userId, int auctionId);
    Task<bool> IsWatchingAsync(int userId, int auctionId);
}
