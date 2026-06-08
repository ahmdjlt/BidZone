using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.Entities;

public class BrowsingEvent
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? AuctionId { get; set; }
    public Auction? Auction { get; set; }

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    [Required, MaxLength(32)]
    public string EventType { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? SearchTerm { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
