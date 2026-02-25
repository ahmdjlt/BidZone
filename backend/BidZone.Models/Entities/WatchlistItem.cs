namespace BidZone.Models.Entities;

public class WatchlistItem
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
