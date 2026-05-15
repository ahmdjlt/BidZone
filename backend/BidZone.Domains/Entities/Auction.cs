using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BidZone.Domains.Entities;

public class Auction
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal StartingPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ReservePrice { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Active"; // Active, Closed, Cancelled, Draft

    [MaxLength(255)]
    public string Slug { get; set; } = string.Empty;

    public int SellerId { get; set; }
    public User Seller { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    [ConcurrencyCheck]
    public Guid ConcurrencyStamp { get; set; } = Guid.NewGuid();

    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
    public ICollection<AuctionImage> Images { get; set; } = new List<AuctionImage>();
    public ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
}
