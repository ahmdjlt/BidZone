using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Structure;

public class AuctionExecution : AuctionLogic, IAuctionLogic
{
    public Task<List<AuctionDto>> GetAllAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice)
        => GetAllExecution(search, category, sort, status, minPrice, maxPrice);

    public Task<PaginatedResult<AuctionDto>> GetAllPagedAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice, PaginationParams pagination)
        => GetAllPagedExecution(search, category, sort, status, minPrice, maxPrice, pagination);

    public Task<AuctionDto?> GetByIdAsync(int id) => GetByIdExecution(id);
    public Task<AuctionDto?> GetBySlugAsync(string slug) => GetBySlugExecution(slug);
    public Task<List<AuctionDto>> GetActiveAsync() => GetActiveExecution();
    public Task<List<AuctionDto>> GetRecommendationsAsync(int? userId, int limit) => GetRecommendationsExecution(userId, limit);
    public Task<List<AuctionDto>> GetByCategoryAsync(int categoryId) => GetByCategoryExecution(categoryId);
    public Task<List<AuctionDto>> GetBySellerAsync(int sellerId) => GetBySellerExecution(sellerId);
    public Task<AuctionContactDto?> GetContactForUserAsync(int auctionId, int userId) => GetContactForUserExecution(auctionId, userId);
    public Task RecordBrowsingEventAsync(RecordBrowsingEventDto dto, int userId) => RecordBrowsingEventExecution(dto, userId);
    public Task<AuctionDto> CreateAsync(CreateAuctionDto dto, int sellerId) => CreateExecution(dto, sellerId);
    public Task<AuctionDto?> UpdateAsync(int id, UpdateAuctionDto dto, int sellerId) => UpdateExecution(id, dto, sellerId);
    public Task<ActionResponse> DeleteAsync(int id, int sellerId) => DeleteExecution(id, sellerId);
}
