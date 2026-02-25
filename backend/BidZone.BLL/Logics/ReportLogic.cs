using BidZone.BLL.Core;
using BidZone.BLL.Interfaces;
using BidZone.Models;
using BidZone.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BLL.Logics;

public class ReportLogic : BaseLogic, IReportLogic
{
    public ReportLogic(AppDbContext context) : base(context) { }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var stats = new DashboardStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            TotalAuctions = await _context.Auctions.CountAsync(),
            ActiveAuctions = await _context.Auctions.CountAsync(a => a.Status == "Active"),
            TotalBids = await _context.Bids.CountAsync(),
            TotalRevenue = await _context.Auctions
                .Where(a => a.Status == "Closed")
                .SumAsync(a => a.CurrentPrice),
            RecentBidActivity = await GetBidActivityAsync(7)
        };

        return stats;
    }

    public async Task<List<BidActivityDto>> GetBidActivityAsync(int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);

        var activity = await _context.Bids
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
