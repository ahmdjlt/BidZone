using BidZone.Models.Entities;

namespace BidZone.DAL.Interfaces;

public interface IAuctionRepository
{
    Task<List<Auction>> GetAllAsync();
    Task<Auction?> GetByIdAsync(int id);
    Task<List<Auction>> GetByCategoryAsync(int categoryId);
    Task<List<Auction>> GetBySellerAsync(int sellerId);
    Task<List<Auction>> GetActiveAsync();
    Task<Auction> InsertAsync(Auction auction);
    Task<Auction> UpdateAsync(Auction auction);
    Task DeleteAsync(int id);
    Task UpdatePriceAsync(int auctionId, decimal newPrice);
}
