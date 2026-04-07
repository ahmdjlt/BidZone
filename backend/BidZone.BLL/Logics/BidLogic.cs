using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;
using Microsoft.Extensions.Logging;

namespace BidZone.BLL.Logics;

public class BidLogic : IBidLogic
{
    private readonly IBidRepository _bidRepo;
    private readonly IAuctionRepository _auctionRepo;
    private readonly IAuctionFinalizationService _auctionFinalizationService;
    private readonly IWatchlistRepository _watchlistRepo;
    private readonly IMapper _mapper;
    private readonly ILogger<BidLogic> _logger;

    public BidLogic(
        IBidRepository bidRepo,
        IAuctionRepository auctionRepo,
        IAuctionFinalizationService auctionFinalizationService,
        IWatchlistRepository watchlistRepo,
        IMapper mapper,
        ILogger<BidLogic> logger)
    {
        _bidRepo = bidRepo;
        _auctionRepo = auctionRepo;
        _auctionFinalizationService = auctionFinalizationService;
        _watchlistRepo = watchlistRepo;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<BidDto?> PlaceBidAsync(PlaceBidDto dto, int bidderId)
    {
        var auction = await _auctionRepo.GetByIdAsync(dto.AuctionId);
        if (auction == null)
            return null;

        if (auction.Status == "Active" && auction.EndTime <= DateTime.UtcNow)
        {
            await _auctionFinalizationService.FinalizeAuctionIfExpiredAsync(dto.AuctionId);
            return null;
        }

        // Cannot bid on closed auction
        if (auction.Status != "Active")
            return null;

        // Cannot bid on own auction
        if (auction.SellerId == bidderId)
            return null;

        // Must exceed current price
        if (dto.Amount <= auction.CurrentPrice)
            return null;

        // Mark previous highest bid as Outbid
        var previousHighest = await _bidRepo.GetHighestBidAsync(dto.AuctionId);
        if (previousHighest != null)
        {
            previousHighest.Status = "Outbid";
            await _bidRepo.UpdateAsync(previousHighest);
        }

        var bid = new Bid
        {
            Amount = dto.Amount,
            PlacedAt = DateTime.UtcNow,
            Status = "Winning",
            AuctionId = dto.AuctionId,
            BidderId = bidderId
        };

        var created = await _bidRepo.InsertAsync(bid);
        _logger.LogInformation("Bid {BidId} placed on auction {AuctionId} by user {BidderId} for {Amount}", created.Id, dto.AuctionId, bidderId, dto.Amount);

        // Update auction current price
        await _auctionRepo.UpdatePriceAsync(dto.AuctionId, dto.Amount);

        // Auto-add to watchlist (ignore if already watching due to race condition)
        var isWatching = await _watchlistRepo.IsWatchingAsync(bidderId, dto.AuctionId);
        if (!isWatching)
        {
            try
            {
                await _watchlistRepo.AddAsync(new WatchlistItem
                {
                    UserId = bidderId,
                    AuctionId = dto.AuctionId,
                    AddedAt = DateTime.UtcNow
                });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // Duplicate watchlist entry from concurrent bid, safe to ignore
            }
        }

        // Re-fetch with includes
        var bids = await _bidRepo.GetByAuctionAsync(dto.AuctionId);
        var newBid = bids.First(b => b.Id == created.Id);
        return _mapper.Map<BidDto>(newBid);
    }

    public async Task<List<BidDto>> GetByAuctionAsync(int auctionId)
    {
        var bids = await _bidRepo.GetByAuctionAsync(auctionId);
        return _mapper.Map<List<BidDto>>(bids);
    }

    public async Task<List<BidDto>> GetByUserAsync(int userId)
    {
        var bids = await _bidRepo.GetByUserAsync(userId);
        return _mapper.Map<List<BidDto>>(bids);
    }

    public async Task<BidDto?> GetHighestBidAsync(int auctionId)
    {
        var bid = await _bidRepo.GetHighestBidAsync(auctionId);
        return bid == null ? null : _mapper.Map<BidDto>(bid);
    }
}
