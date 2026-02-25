using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;

namespace BidZone.BLL.Logics;

public class BidLogic : IBidLogic
{
    private readonly IBidRepository _bidRepo;
    private readonly IAuctionRepository _auctionRepo;
    private readonly IWatchlistRepository _watchlistRepo;
    private readonly IMapper _mapper;

    public BidLogic(IBidRepository bidRepo, IAuctionRepository auctionRepo, IWatchlistRepository watchlistRepo, IMapper mapper)
    {
        _bidRepo = bidRepo;
        _auctionRepo = auctionRepo;
        _watchlistRepo = watchlistRepo;
        _mapper = mapper;
    }

    public async Task<BidDto?> PlaceBidAsync(PlaceBidDto dto, int bidderId)
    {
        var auction = await _auctionRepo.GetByIdAsync(dto.AuctionId);
        if (auction == null)
            return null;

        // Cannot bid on closed auction
        if (auction.Status != "Active" || auction.EndTime <= DateTime.UtcNow)
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
            // Save via context since we need to update status
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

        // Update auction current price
        await _auctionRepo.UpdatePriceAsync(dto.AuctionId, dto.Amount);

        // Auto-add to watchlist
        var isWatching = await _watchlistRepo.IsWatchingAsync(bidderId, dto.AuctionId);
        if (!isWatching)
        {
            await _watchlistRepo.AddAsync(new WatchlistItem
            {
                UserId = bidderId,
                AuctionId = dto.AuctionId,
                AddedAt = DateTime.UtcNow
            });
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
