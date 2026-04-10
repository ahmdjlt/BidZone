namespace BidZone.Domains.DTOs;

public class AuctionFilterParams
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public string? Sort { get; set; }
    public string? Status { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}
