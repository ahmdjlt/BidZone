using BidZone.DataAccess.Context;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using BidZone.Domains.Responses;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class AuctionLogic
{
    public AuctionLogic() { }

    internal async Task<List<AuctionDto>> GetAllExecution(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice)
    {
        using var db = new AppDbContext();

        int? categoryId = null;
        if (!string.IsNullOrEmpty(category))
        {
            var cat = await db.Categories.FirstOrDefaultAsync(c => c.Slug == category);
            categoryId = cat?.Id;
        }

        var query = BuildFilteredQuery(db, new AuctionFilterParams { Search = search, Sort = sort, Status = status, MinPrice = minPrice, MaxPrice = maxPrice }, categoryId);
        var auctions = await query.ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<PaginatedResult<AuctionDto>> GetAllPagedExecution(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice, PaginationParams pagination)
    {
        using var db = new AppDbContext();

        int? categoryId = null;
        if (!string.IsNullOrEmpty(category))
        {
            var cat = await db.Categories.FirstOrDefaultAsync(c => c.Slug == category);
            categoryId = cat?.Id;
        }

        var query = BuildFilteredQuery(db, new AuctionFilterParams { Search = search, Sort = sort, Status = status, MinPrice = minPrice, MaxPrice = maxPrice }, categoryId);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return new PaginatedResult<AuctionDto>
        {
            Items = Mappers.ToDtoList(items),
            TotalCount = totalCount,
            Page = pagination.Page,
            PageSize = pagination.PageSize
        };
    }

    internal async Task<AuctionDto?> GetByIdExecution(int id)
    {
        using var db = new AppDbContext();
        var auction = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids).ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(a => a.Id == id);
        return auction == null ? null : Mappers.ToDto(auction);
    }

    internal async Task<List<AuctionDto>> GetActiveExecution()
    {
        using var db = new AppDbContext();
        var auctions = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .Where(a => a.Status == "Active" && a.EndTime > DateTime.UtcNow)
            .ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<List<AuctionDto>> GetByCategoryExecution(int categoryId)
    {
        using var db = new AppDbContext();
        var auctions = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .Where(a => a.CategoryId == categoryId)
            .ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<List<AuctionDto>> GetBySellerExecution(int sellerId)
    {
        using var db = new AppDbContext();
        var auctions = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .Where(a => a.SellerId == sellerId)
            .ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<AuctionDto> CreateExecution(CreateAuctionDto dto, int sellerId)
    {
        using var db = new AppDbContext();

        var auction = new Auction
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            StartingPrice = dto.StartingPrice,
            CurrentPrice = dto.StartingPrice,
            ReservePrice = dto.ReservePrice,
            StartTime = DateTime.UtcNow,
            EndTime = dto.EndTime.ToUniversalTime(),
            Status = "Active",
            SellerId = sellerId,
            CategoryId = dto.CategoryId
        };

        db.Auctions.Add(auction);
        await db.SaveChangesAsync();

        var full = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .FirstAsync(a => a.Id == auction.Id);
        return Mappers.ToDto(full);
    }

    internal async Task<AuctionDto?> UpdateExecution(int id, UpdateAuctionDto dto, int sellerId)
    {
        using var db = new AppDbContext();
        var auction = await db.Auctions.FirstOrDefaultAsync(a => a.Id == id);
        if (auction == null || auction.SellerId != sellerId)
            return null;

        if (dto.Title != null) auction.Title = dto.Title;
        if (dto.Description != null) auction.Description = dto.Description;
        if (dto.ImageUrl != null) auction.ImageUrl = dto.ImageUrl;
        if (dto.ReservePrice.HasValue) auction.ReservePrice = dto.ReservePrice;
        if (dto.EndTime.HasValue) auction.EndTime = dto.EndTime.Value.ToUniversalTime();
        if (dto.CategoryId.HasValue) auction.CategoryId = dto.CategoryId.Value;

        await db.SaveChangesAsync();

        var updated = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .FirstAsync(a => a.Id == id);
        return Mappers.ToDto(updated);
    }

    internal async Task<ActionResponse> DeleteExecution(int id, int sellerId)
    {
        using var db = new AppDbContext();
        var auction = await db.Auctions.Include(a => a.Bids).FirstOrDefaultAsync(a => a.Id == id);
        if (auction == null || auction.SellerId != sellerId)
            return ActionResponse.Failure("Auction was not found or does not belong to the current seller.");

        if (auction.Bids.Any())
            return ActionResponse.Failure("Cannot delete auction with existing bids.");

        db.Auctions.Remove(auction);
        await db.SaveChangesAsync();
        return ActionResponse.Success("Auction deleted successfully.");
    }

    private static IQueryable<Auction> BuildFilteredQuery(AppDbContext db, AuctionFilterParams filters, int? categoryId)
    {
        var query = db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filters.Search))
            query = query.Where(a => a.Title.ToLower().Contains(filters.Search.ToLower()));

        if (categoryId.HasValue)
            query = query.Where(a => a.CategoryId == categoryId.Value);

        if (!string.IsNullOrEmpty(filters.Status))
            query = query.Where(a => a.Status.ToLower() == filters.Status.ToLower());

        if (filters.MinPrice.HasValue)
            query = query.Where(a => a.CurrentPrice >= filters.MinPrice.Value);

        if (filters.MaxPrice.HasValue)
            query = query.Where(a => a.CurrentPrice <= filters.MaxPrice.Value);

        query = filters.Sort switch
        {
            "price_asc" => query.OrderBy(a => a.CurrentPrice),
            "price_desc" => query.OrderByDescending(a => a.CurrentPrice),
            "ending_soon" => query.OrderBy(a => a.EndTime),
            "newest" => query.OrderByDescending(a => a.StartTime),
            _ => query.OrderByDescending(a => a.StartTime)
        };

        return query;
    }
}
