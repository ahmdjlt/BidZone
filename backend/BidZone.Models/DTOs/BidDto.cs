namespace BidZone.Models.DTOs;

public class BidDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime PlacedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public int AuctionId { get; set; }
    public string AuctionTitle { get; set; } = string.Empty;
    public int BidderId { get; set; }
    public string BidderUsername { get; set; } = string.Empty;
}
