using System.ComponentModel.DataAnnotations;

namespace BidZone.Models.Entities;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Buyer"; // Buyer, Seller, Admin

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
    public ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}
