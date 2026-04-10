using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Interface;

public interface IBidLogic
{
    Task<BidDto?> PlaceBidAsync(PlaceBidDto dto, int bidderId);
    Task<List<BidDto>> GetByAuctionAsync(int auctionId);
    Task<List<BidDto>> GetByUserAsync(int userId);
    Task<BidDto?> GetHighestBidAsync(int auctionId);
}
