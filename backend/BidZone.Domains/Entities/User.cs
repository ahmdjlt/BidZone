using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace BidZone.Domains.Entities;

public class User : IdentityUser<int>
{
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Buyer"; // Buyer, Seller, Admin

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
}
