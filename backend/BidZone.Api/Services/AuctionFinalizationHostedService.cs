using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Services;

public class AuctionFinalizationHostedService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    private readonly ILogger<AuctionFinalizationHostedService> _logger;

    public AuctionFinalizationHostedService(ILogger<AuctionFinalizationHostedService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await FinalizeAsync(stoppingToken);

        using var timer = new PeriodicTimer(Interval);

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await FinalizeAsync(stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }

    private async Task FinalizeAsync(CancellationToken stoppingToken)
    {
        try
        {
            var bl = new BusinessLogicFactory();
            var finalization = bl.AuctionFinalizationAction();
            var count = await finalization.FinalizeExpiredAuctionsAsync(stoppingToken);

            if (count > 0)
            {
                _logger.LogInformation("Finalized {Count} expired auctions.", count);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to finalize expired auctions.");
        }
    }
}
