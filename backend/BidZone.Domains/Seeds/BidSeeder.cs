using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Domains.Seeds;

public static class BidSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bid>().HasData(
            // Auction 1 – iPhone 15 Pro Max (seller: bidzone Id=1000), bidder: buyer1 Id=3
            new Bid
            {
                Id = 1, AuctionId = 1, BidderId = 3,
                Amount = 1020.00m, Status = "Outbid",
                PlacedAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc)
            },
            new Bid
            {
                Id = 2, AuctionId = 1, BidderId = 3,
                Amount = 1100.00m, Status = "Winning",
                PlacedAt = new DateTime(2026, 6, 5, 14, 30, 0, DateTimeKind.Utc)
            },

            // Auction 2 – Vintage Rolex Submariner, bidder: seller1 Id=2
            new Bid
            {
                Id = 3, AuctionId = 2, BidderId = 2,
                Amount = 15500.00m, Status = "Outbid",
                PlacedAt = new DateTime(2026, 6, 2, 9, 0, 0, DateTimeKind.Utc)
            },
            new Bid
            {
                Id = 4, AuctionId = 2, BidderId = 3,
                Amount = 16200.00m, Status = "Winning",
                PlacedAt = new DateTime(2026, 6, 4, 11, 0, 0, DateTimeKind.Utc)
            },

            // Auction 3 – Mountain Bike Trek, bidder: buyer1 Id=3
            new Bid
            {
                Id = 5, AuctionId = 3, BidderId = 3,
                Amount = 850.00m, Status = "Winning",
                PlacedAt = new DateTime(2026, 6, 3, 16, 0, 0, DateTimeKind.Utc)
            },

            // Auction 6 – PlayStation 5 (seller: seller1 Id=2), bidder: bidzone Id=1000
            new Bid
            {
                Id = 6, AuctionId = 6, BidderId = 1000,
                Amount = 480.00m, Status = "Outbid",
                PlacedAt = new DateTime(2026, 6, 6, 10, 0, 0, DateTimeKind.Utc)
            },
            new Bid
            {
                Id = 7, AuctionId = 6, BidderId = 1000,
                Amount = 520.00m, Status = "Winning",
                PlacedAt = new DateTime(2026, 6, 8, 15, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
