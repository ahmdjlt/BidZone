using BidZone.Models.DTOs;

namespace BidZone.BLL.Interfaces;

public interface IBidLogic
{
    Task<BidDto?> PlaceBidAsync(PlaceBidDto dto, int bidderId);
    Task<List<BidDto>> GetByAuctionAsync(int auctionId);
    Task<List<BidDto>> GetByUserAsync(int userId);
    Task<BidDto?> GetHighestBidAsync(int auctionId);
}
