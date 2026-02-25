using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BidZone.Models.Entities;

public class Bid
{
    public int Id { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime PlacedAt { get; set; } = DateTime.UtcNow;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Active"; // Active, Winning, Outbid, Won, Lost

    public int AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;

    public int BidderId { get; set; }
    public User Bidder { get; set; } = null!;
}
