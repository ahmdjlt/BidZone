using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.Entities;

public class AuctionImage
{
    public int Id { get; set; }

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public int AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;
}
