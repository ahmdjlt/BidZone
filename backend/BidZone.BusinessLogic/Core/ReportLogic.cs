using BidZone.DataAccess.Context;
using BidZone.Domains.Constants;
using BidZone.Domains.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class ReportLogic
{
    public ReportLogic() { }

    internal async Task<DashboardStatsDto> GetDashboardStatsExecution()
    {
        using var db = new AppDbContext();

        // Demo/seed accounts are not real marketplace users, so their activity
        // (bids, winning bids, revenue) is excluded from the statistics below.
        var seedUserIds = SeedAccounts.UserIds;

        var stats = new DashboardStatsDto
        {
            TotalUsers = await db.Users.CountAsync(u =>
                u.EmailConfirmed && u.IsActive && u.Role != "Admin" && !seedUserIds.Contains(u.Id)),
            TotalAuctions = await db.Auctions.CountAsync(),
            ActiveAuctions = await db.Auctions.CountAsync(a => a.Status == "Active"),
            TotalBids = await db.Bids.CountAsync(b => !seedUserIds.Contains(b.BidderId)),
            TotalRevenue = await db.Auctions
                .Where(a => a.Status == "Closed"
                    && a.Bids.Any(b => b.Status == "Won" && !seedUserIds.Contains(b.BidderId)))
                .SumAsync(a => (decimal?)a.CurrentPrice) ?? 0m,
            RecentBidActivity = await GetBidActivityExecution(7),
            RecentSales = await db.Auctions
                .Where(a => a.Status == "Closed"
                    && a.Bids.Any(b => b.Status == "Won" && !seedUserIds.Contains(b.BidderId)))
                .OrderByDescending(a => a.EndTime)
                .Take(6)
                .Select(a => new RecentSaleDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Slug = a.Slug,
                    CurrentPrice = a.CurrentPrice,
                    EndTime = a.EndTime.ToString("o"),
                    SellerUsername = a.Seller.UserName ?? string.Empty
                })
                .ToListAsync()
        };
        return stats;
    }

    internal async Task<List<BidActivityDto>> GetBidActivityExecution(int days = 30)
    {
        using var db = new AppDbContext();
        var seedUserIds = SeedAccounts.UserIds;
        var startDate = DateTime.UtcNow.AddDays(-days);
        var bids = await db.Bids
            .Where(b => b.PlacedAt >= startDate && !seedUserIds.Contains(b.BidderId))
            .Select(b => new { b.PlacedAt, b.Amount })
            .ToListAsync();

        var activity = bids
            .GroupBy(b => b.PlacedAt.Date)
            .Select(g => new BidActivityDto
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                BidCount = g.Count(),
                TotalAmount = g.Sum(b => b.Amount)
            })
            .OrderBy(a => a.Date)
            .ToList();
        return activity;
    }
}
