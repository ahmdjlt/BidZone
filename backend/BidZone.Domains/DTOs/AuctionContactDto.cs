namespace BidZone.Domains.DTOs;

public class AuctionContactDto
{
    public string CounterpartyUsername { get; set; } = string.Empty;
    public string CounterpartyEmail { get; set; } = string.Empty;
    public string ViewerRole { get; set; } = string.Empty;
}
