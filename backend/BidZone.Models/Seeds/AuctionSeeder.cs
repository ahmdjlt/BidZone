using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Models.Seeds;

public static class AuctionSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Auction>().HasData(
            new Auction
            {
                Id = 1, Title = "iPhone 15 Pro Max", Description = "Brand new iPhone 15 Pro Max 256GB",
                ImageUrl = "/images/iphone15.jpg", StartingPrice = 999.99m, CurrentPrice = 999.99m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 1,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0004-0000-0000-000000000004")0,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000001")
            },
            new Auction
            {
                Id = 2, Title = "Vintage Rolex Submariner", Description = "1960s Rolex Submariner in excellent condition",
                ImageUrl = "/images/rolex.jpg", StartingPrice = 15000m, CurrentPrice = 15000m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 4,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0002-0000-0000-000000000002")
            },
            new Auction
            {
                Id = 3, Title = "Mountain Bike Trek", Description = "Trek X-Caliber 8, barely used",
                ImageUrl = "/images/trek.jpg", StartingPrice = 800m, CurrentPrice = 800m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 1,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0004-0000-0000-000000000004")2,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0003-0000-0000-000000000003")
            },
            new Auction
            {
                Id = 4, Title = "Oil Painting - Sunset", Description = "Original oil painting, 24x36 inches",
                ImageUrl = "/images/painting.jpg", StartingPrice = 250m, CurrentPrice = 250m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 1,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0004-0000-0000-000000000004")
            },
            new Auction
            {
                Id = 5, Title = "Tesla Model 3 2023", Description = "Tesla Model 3 Long Range, white, 10k miles",
                ImageUrl = "/images/tesla.jpg", StartingPrice = 35000m, CurrentPrice = 35000m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 8,
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0005-0000-0000-000000000005")
            }
        );
    }
}
