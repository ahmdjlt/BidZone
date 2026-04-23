using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Structure;

public class WatchlistExecution : WatchlistLogic, IWatchlistLogic
{
    public Task<List<WatchlistDto>> GetUserWatchlistAsync(int userId) => GetUserWatchlistExecution(userId);
    public Task<WatchlistDto?> AddAsync(int userId, int auctionId) => AddExecution(userId, auctionId);
    public Task RemoveAsync(int userId, int auctionId) => RemoveExecution(userId, auctionId);
    public Task<bool> IsWatchingAsync(int userId, int auctionId) => IsWatchingExecution(userId, auctionId);
}
