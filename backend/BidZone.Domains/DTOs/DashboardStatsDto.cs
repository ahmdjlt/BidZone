namespace BidZone.Domains.DTOs;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalAuctions { get; set; }
    public int ActiveAuctions { get; set; }
    public int TotalBids { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<BidActivityDto> RecentBidActivity { get; set; } = new();
}

public class BidActivityDto
{
    public string Date { get; set; } = string.Empty;
    public int BidCount { get; set; }
    public decimal TotalAmount { get; set; }
}
