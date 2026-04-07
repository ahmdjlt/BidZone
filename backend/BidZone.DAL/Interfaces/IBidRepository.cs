using BidZone.Models.Entities;

namespace BidZone.DAL.Interfaces;

public interface IBidRepository
{
    Task<List<Bid>> GetByAuctionAsync(int auctionId);
    Task<List<Bid>> GetByUserAsync(int userId);
    Task<Bid?> GetHighestBidAsync(int auctionId);
    Task<Bid> InsertAsync(Bid bid);
    Task UpdateAsync(Bid bid);
    Task UpdateStatusesAsync(int auctionId, int winningBidId);
}
