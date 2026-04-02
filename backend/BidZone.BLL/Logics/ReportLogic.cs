using BidZone.BLL.Core;
using BidZone.BLL.Interfaces;
using BidZone.Models;
using BidZone.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BLL.Logics;

public class ReportLogic : BaseLogic, IReportLogic
{
    private readonly IAuctionFinalizationService _auctionFinalizationService;

    public ReportLogic(AppDbContext context, IAuctionFinalizationService auctionFinalizationService) : base(context)
    {
        _auctionFinalizationService = auctionFinalizationService;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        await _auctionFinalizationService.FinalizeExpiredAuctionsAsync();

        var stats = new DashboardStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            TotalAuctions = await _context.Auctions.CountAsync(),
            ActiveAuctions = await _context.Auctions.CountAsync(a => a.Status == "Active"),
            TotalBids = await _context.Bids.CountAsync(),
            TotalRevenue = await _context.Auctions
                .Where(a => a.Status == "Closed" && a.Bids.Any(b => b.Status == "Won"))
                .SumAsync(a => (decimal?)a.CurrentPrice) ?? 0m,
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
