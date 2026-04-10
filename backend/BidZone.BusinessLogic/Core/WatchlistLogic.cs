using AutoMapper;
using BidZone.BusinessLogic.Interface;
using BidZone.DataAccess.Interfaces;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using Microsoft.Extensions.Logging;

namespace BidZone.BusinessLogic.Core;

public class WatchlistLogic : IWatchlistLogic
{
    private readonly IWatchlistRepository _watchlistRepo;
    private readonly IAuctionRepository _auctionRepo;
    private readonly IMapper _mapper;
    private readonly ILogger<WatchlistLogic> _logger;

    public WatchlistLogic(IWatchlistRepository watchlistRepo, IAuctionRepository auctionRepo, IMapper mapper, ILogger<WatchlistLogic> logger)
    {
        _watchlistRepo = watchlistRepo;
        _auctionRepo = auctionRepo;
        _mapper = mapper;
        _logger = logger;
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
        _logger.LogInformation("User {UserId} added auction {AuctionId} to watchlist", userId, auctionId);

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
