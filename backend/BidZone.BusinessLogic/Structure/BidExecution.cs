using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Structure;

public class BidExecution : BidLogic, IBidLogic
{
    public Task<BidDto?> PlaceBidAsync(PlaceBidDto dto, int bidderId) => PlaceBidExecution(dto, bidderId);
    public Task<List<BidDto>> GetByAuctionAsync(int auctionId) => GetByAuctionExecution(auctionId);
    public Task<List<BidDto>> GetByUserAsync(int userId) => GetByUserExecution(userId);
    public Task<BidDto?> GetHighestBidAsync(int auctionId) => GetHighestBidExecution(auctionId);
}
