using BidZone.BLL.Interfaces;

namespace BidZone.WebApi.Services;

public class AuctionFinalizationHostedService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuctionFinalizationHostedService> _logger;

    public AuctionFinalizationHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<AuctionFinalizationHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await FinalizeExpiredAuctionsAsync(stoppingToken);

        using var timer = new PeriodicTimer(Interval);

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await FinalizeExpiredAuctionsAsync(stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
    }

    private async Task FinalizeExpiredAuctionsAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var finalizationService = scope.ServiceProvider.GetRequiredService<IAuctionFinalizationService>();
            var finalizedCount = await finalizationService.FinalizeExpiredAuctionsAsync(stoppingToken);

            if (finalizedCount > 0)
            {
                _logger.LogInformation("Finalized {FinalizedCount} expired auctions.", finalizedCount);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to finalize expired auctions.");
        }
    }
}
