using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;

namespace BidZone.BLL.Logics;

public class AuctionLogic : IAuctionLogic
{
    private readonly IAuctionRepository _auctionRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IAuctionFinalizationService _auctionFinalizationService;
    private readonly IMapper _mapper;

    public AuctionLogic(
        IAuctionRepository auctionRepo,
        ICategoryRepository categoryRepo,
        IAuctionFinalizationService auctionFinalizationService,
        IMapper mapper)
    {
        _auctionRepo = auctionRepo;
        _categoryRepo = categoryRepo;
        _auctionFinalizationService = auctionFinalizationService;
        _mapper = mapper;
    }

    public async Task<List<AuctionDto>> GetAllAsync(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice)
    {
        await _auctionFinalizationService.FinalizeExpiredAuctionsAsync();
        var auctions = await _auctionRepo.GetAllAsync();

        if (!string.IsNullOrEmpty(search))
            auctions = auctions.Where(a => a.Title.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();

        if (!string.IsNullOrEmpty(category))
        {
            var cat = await _categoryRepo.GetBySlugAsync(category);
            if (cat != null)
                auctions = auctions.Where(a => a.CategoryId == cat.Id).ToList();
        }

        if (!string.IsNullOrEmpty(status))
            auctions = auctions.Where(a => a.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();

        if (minPrice.HasValue)
            auctions = auctions.Where(a => a.CurrentPrice >= minPrice.Value).ToList();

        if (maxPrice.HasValue)
            auctions = auctions.Where(a => a.CurrentPrice <= maxPrice.Value).ToList();

        auctions = sort switch
        {
            "price_asc" => auctions.OrderBy(a => a.CurrentPrice).ToList(),
            "price_desc" => auctions.OrderByDescending(a => a.CurrentPrice).ToList(),
            "ending_soon" => auctions.OrderBy(a => a.EndTime).ToList(),
            "newest" => auctions.OrderByDescending(a => a.StartTime).ToList(),
            _ => auctions.OrderByDescending(a => a.StartTime).ToList()
        };

        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<AuctionDto?> GetByIdAsync(int id)
    {
        await _auctionFinalizationService.FinalizeAuctionIfExpiredAsync(id);
        var auction = await _auctionRepo.GetByIdAsync(id);
        if (auction == null) return null;

        return _mapper.Map<AuctionDto>(auction);
    }

    public async Task<List<AuctionDto>> GetActiveAsync()
    {
        await _auctionFinalizationService.FinalizeExpiredAuctionsAsync();
        var auctions = await _auctionRepo.GetActiveAsync();
        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<List<AuctionDto>> GetByCategoryAsync(int categoryId)
    {
        await _auctionFinalizationService.FinalizeExpiredAuctionsAsync();
        var auctions = await _auctionRepo.GetByCategoryAsync(categoryId);
        return _mapper.Map<List<AuctionDto>>(auctions);
    }

    public async Task<List<AuctionDto>> GetBySellerAsync(int sellerId)
    {
        await _auctionFinalizationService.FinalizeExpiredAuctionsAsync();
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
        return true;
    }
}
