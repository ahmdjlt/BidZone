using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;

namespace BidZone.BLL.Logics;

public class WatchlistLogic : IWatchlistLogic
{
    private readonly IWatchlistRepository _watchlistRepo;
    private readonly IAuctionRepository _auctionRepo;
    private readonly IMapper _mapper;

    public WatchlistLogic(IWatchlistRepository watchlistRepo, IAuctionRepository auctionRepo, IMapper mapper)
    {
        _watchlistRepo = watchlistRepo;
        _auctionRepo = auctionRepo;
        _mapper = mapper;
    }

    public async Task<List<WatchlistDto>> GetUserWatchlistAsync(int userId)
    {
        var items = await _watchlistRepo.GetByUserAsync(userId);
        return _mapper.Map<List<WatchlistDto>>(items);
    }

    public async Task<WatchlistDto?> AddAsync(int userId, int auctionId)
    {
        var auction = await _auctionRepo.GetByIdAsync(auctionId);
        if (auction == null) return null;

        var already = await _watchlistRepo.IsWatchingAsync(userId, auctionId);
        if (already) return null;

        var item = new WatchlistItem
        {
            UserId = userId,
            AuctionId = auctionId,
            AddedAt = DateTime.UtcNow
        };

        await _watchlistRepo.AddAsync(item);

        return new WatchlistDto
        {
            Id = item.Id,
            AuctionId = auction.Id,
            AuctionTitle = auction.Title,
            AuctionImageUrl = auction.ImageUrl,
            CurrentPrice = auction.CurrentPrice,
            EndTime = auction.EndTime,
            Status = auction.Status,
            AddedAt = item.AddedAt
        };
    }

    public async Task RemoveAsync(int userId, int auctionId)
    {
        await _watchlistRepo.RemoveAsync(userId, auctionId);
    }

    public async Task<bool> IsWatchingAsync(int userId, int auctionId)
    {
        return await _watchlistRepo.IsWatchingAsync(userId, auctionId);
    }
}
