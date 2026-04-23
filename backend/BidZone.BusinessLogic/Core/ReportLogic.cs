using BidZone.Domains;
using BidZone.Domains.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class ReportLogic
{
    public ReportLogic() { }

    internal async Task<DashboardStatsDto> GetDashboardStatsExecution()
    {
        using var db = new AppDbContext();
        var stats = new DashboardStatsDto
        {
            TotalUsers = await db.Users.CountAsync(),
            TotalAuctions = await db.Auctions.CountAsync(),
            ActiveAuctions = await db.Auctions.CountAsync(a => a.Status == "Active"),
            TotalBids = await db.Bids.CountAsync(),
            TotalRevenue = await db.Auctions
                .Where(a => a.Status == "Closed" && a.Bids.Any(b => b.Status == "Won"))
                .SumAsync(a => (decimal?)a.CurrentPrice) ?? 0m,
            RecentBidActivity = await GetBidActivityExecution(7)
        };
        return stats;
    }

    internal async Task<List<BidActivityDto>> GetBidActivityExecution(int days = 30)
    {
        using var db = new AppDbContext();
        var startDate = DateTime.UtcNow.AddDays(-days);
        var activity = await db.Bids
            .Where(b => b.PlacedAt >= startDate)
            .GroupBy(b => b.PlacedAt.Date)
            .Select(g => new BidActivityDto
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                BidCount = g.Count(),
                TotalAmount = g.Sum(b => b.Amount)
            })
            .OrderBy(a => a.Date)
            .ToListAsync();
        return activity;
    }
}
