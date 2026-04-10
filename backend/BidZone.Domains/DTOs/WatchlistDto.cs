namespace BidZone.Domains.DTOs;

public class WatchlistDto
{
    public int Id { get; set; }
    public int AuctionId { get; set; }
    public string AuctionTitle { get; set; } = string.Empty;
    public string? AuctionImageUrl { get; set; }
    public decimal CurrentPrice { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; }
}
