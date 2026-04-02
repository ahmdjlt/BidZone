namespace BidZone.BLL.Interfaces;

public interface IAuctionFinalizationService
{
    Task<int> FinalizeExpiredAuctionsAsync(CancellationToken cancellationToken = default);
    Task<bool> FinalizeAuctionIfExpiredAsync(int auctionId, CancellationToken cancellationToken = default);
}
