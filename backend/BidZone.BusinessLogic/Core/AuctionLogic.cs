using AutoMapper;
using BidZone.BusinessLogic.Interface;
using BidZone.DataAccess.Interfaces;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using Microsoft.Extensions.Logging;

namespace BidZone.BusinessLogic.Core;

public class AuctionLogic : IAuctionLogic
{
    private readonly IAuctionRepository _auctionRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IMapper _mapper;
    private readonly ILogger<AuctionLogic> _logger;

    public AuctionLogic(
        IAuctionRepository auctionRepo,
        ICategoryRepository categoryRepo,
        IMapper mapper,
        ILogger<AuctionLogic> logger)
    {
        _auctionRepo = auctionRepo;
        _categoryRepo = categoryRepo;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<AuctionDto>> GetAllAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice)
    {
        int? categoryId = null;
        if (!string.IsNullOrEmpty(category))
        {
            var cat = await _categoryRepo.GetBySlugAsync(category);
            categoryId = cat?.Id;
        }

        var filters = new AuctionFilterParams
        {
            Search = search,
            Sort = sort,
            Status = status,
            MinPrice = minPrice,
            MaxPrice = maxPrice
        };

        var auctions = await _auctionRepo.GetFilteredAsync(filters, categoryId);
        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<PaginatedResult<AuctionDto>> GetAllPagedAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice, PaginationParams pagination)
    {
        int? categoryId = null;
        if (!string.IsNullOrEmpty(category))
        {
            var cat = await _categoryRepo.GetBySlugAsync(category);
            categoryId = cat?.Id;
        }

        var filters = new AuctionFilterParams
        {
            Search = search,
            Sort = sort,
            Status = status,
            MinPrice = minPrice,
            MaxPrice = maxPrice
        };

        var (items, totalCount) = await _auctionRepo.GetFilteredPagedAsync(filters, pagination, categoryId);
        return new PaginatedResult<AuctionDto>
        {
            Items = _mapper.Map<List<AuctionDto>>(items),
            TotalCount = totalCount,
            Page = pagination.Page,
            PageSize = pagination.PageSize
        };
    }

    public async Task<AuctionDto?> GetByIdAsync(int id)
    {
        var auction = await _auctionRepo.GetByIdAsync(id);
        if (auction == null) return null;

        return _mapper.Map<AuctionDto>(auction);
    }

    public async Task<List<AuctionDto>> GetActiveAsync()
    {
        var auctions = await _auctionRepo.GetActiveAsync();
        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<List<AuctionDto>> GetByCategoryAsync(int categoryId)
    {
        var auctions = await _auctionRepo.GetByCategoryAsync(categoryId);
        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<List<AuctionDto>> GetBySellerAsync(int sellerId)
    {
        var auctions = await _auctionRepo.GetBySellerAsync(sellerId);
        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<AuctionDto> CreateAsync(CreateAuctionDto dto, int sellerId)
    {
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

        var created = await _auctionRepo.InsertAsync(auction);
        _logger.LogInformation("Auction {AuctionId} created by seller {SellerId}", created.Id, sellerId);
        var full = await _auctionRepo.GetByIdAsync(created.Id);
        return _mapper.Map<AuctionDto>(full!);
    }

    public async Task<AuctionDto?> UpdateAsync(int id, UpdateAuctionDto dto, int sellerId)
    {
        var auction = await _auctionRepo.GetByIdAsync(id);
        if (auction == null || auction.SellerId != sellerId)
            return null;

        if (dto.Title != null) auction.Title = dto.Title;
        if (dto.Description != null) auction.Description = dto.Description;
        if (dto.ImageUrl != null) auction.ImageUrl = dto.ImageUrl;
        if (dto.ReservePrice.HasValue) auction.ReservePrice = dto.ReservePrice;
        if (dto.EndTime.HasValue) auction.EndTime = dto.EndTime.Value.ToUniversalTime();
        if (dto.CategoryId.HasValue) auction.CategoryId = dto.CategoryId.Value;

        await _auctionRepo.UpdateAsync(auction);
        var updated = await _auctionRepo.GetByIdAsync(id);
        return _mapper.Map<AuctionDto>(updated!);
    }

    public async Task<bool> DeleteAsync(int id, int sellerId)
    {
        var auction = await _auctionRepo.GetByIdAsync(id);
        if (auction == null || auction.SellerId != sellerId)
            return false;

        if (auction.Bids.Any())
            return false;

        await _auctionRepo.DeleteAsync(id);
        _logger.LogInformation("Auction {AuctionId} deleted by seller {SellerId}", id, sellerId);
        return true;
    }
}
