using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Interface;

public interface IAuctionLogic
{
    Task<List<AuctionDto>> GetAllAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice);
    Task<PaginatedResult<AuctionDto>> GetAllPagedAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice, PaginationParams pagination);
    Task<AuctionDto?> GetByIdAsync(int id);
    Task<AuctionDto?> GetBySlugAsync(string slug);
    Task<List<AuctionDto>> GetActiveAsync();
    Task<List<AuctionDto>> GetByCategoryAsync(int categoryId);
    Task<List<AuctionDto>> GetBySellerAsync(int sellerId);
    Task<AuctionContactDto?> GetContactForUserAsync(int auctionId, int userId);
    Task<AuctionDto> CreateAsync(CreateAuctionDto dto, int sellerId);
    Task<AuctionDto?> UpdateAsync(int id, UpdateAuctionDto dto, int sellerId);
    Task<ActionResponse> DeleteAsync(int id, int sellerId);
}
