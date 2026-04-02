using BidZone.Models.DTOs;

namespace BidZone.BLL.Interfaces;

public interface IAuctionLogic
{
    Task<List<AuctionDto>> GetAllAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice);
    Task<AuctionDto?> GetByIdAsync(int id);
    Task<List<AuctionDto>> GetActiveAsync();
    Task<List<AuctionDto>> GetByCategoryAsync(int categoryId);
    Task<List<AuctionDto>> GetBySellerAsync(int sellerId);
    Task<AuctionDto> CreateAsync(CreateAuctionDto dto, int sellerId);
    Task<AuctionDto?> UpdateAsync(int id, UpdateAuctionDto dto, int sellerId);
    Task<bool> DeleteAsync(int id, int sellerId);
}
