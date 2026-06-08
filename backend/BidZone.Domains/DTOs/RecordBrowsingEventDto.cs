namespace BidZone.Domains.DTOs;

public class RecordBrowsingEventDto
{
    public string EventType { get; set; } = string.Empty;
    public int? AuctionId { get; set; }
    public string? CategorySlug { get; set; }
    public string? SearchTerm { get; set; }
}
