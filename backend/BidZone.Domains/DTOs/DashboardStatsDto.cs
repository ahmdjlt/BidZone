namespace BidZone.Domains.DTOs;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalAuctions { get; set; }
    public int ActiveAuctions { get; set; }
    public int TotalBids { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<BidActivityDto> RecentBidActivity { get; set; } = new();
    public List<RecentSaleDto> RecentSales { get; set; } = new();
}

public class RecentSaleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public string EndTime { get; set; } = string.Empty;
    public string SellerUsername { get; set; } = string.Empty;
}

public class BidActivityDto
{
    public string Date { get; set; } = string.Empty;
    public int BidCount { get; set; }
    public decimal TotalAmount { get; set; }
}
