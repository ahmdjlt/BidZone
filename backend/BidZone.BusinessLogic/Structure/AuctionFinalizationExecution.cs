using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;

namespace BidZone.BusinessLogic.Structure;

public class AuctionFinalizationExecution : AuctionFinalizationLogic, IAuctionFinalizationService
{
    public Task<int> FinalizeExpiredAuctionsAsync(CancellationToken cancellationToken = default) => FinalizeExpiredExecution(cancellationToken);
    public Task<bool> FinalizeAuctionIfExpiredAsync(int auctionId, CancellationToken cancellationToken = default) => FinalizeIfExpiredExecution(auctionId, cancellationToken);
}
