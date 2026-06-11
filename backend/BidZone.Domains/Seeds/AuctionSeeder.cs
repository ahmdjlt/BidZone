using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Domains.Seeds;

public static class AuctionSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Auction>().HasData(
            new Auction
            {
                Id = 1, Title = "iPhone 15 Pro Max", Description = "Brand new iPhone 15 Pro Max 256GB",
                ImageUrl = "https://picsum.photos/seed/iphone15/860/600", StartingPrice = 999.99m, CurrentPrice = 1100.00m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 1000, CategoryId = 1, Slug = "iphone-15-pro-max-1",
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000001")
            },
            new Auction
            {
                Id = 2, Title = "Vintage Rolex Submariner", Description = "1960s Rolex Submariner in excellent condition",
                ImageUrl = "https://picsum.photos/seed/rolex/860/600", StartingPrice = 15000m, CurrentPrice = 16200.00m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 1000, CategoryId = 4, Slug = "vintage-rolex-submariner-2",
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0002-0000-0000-000000000002")
            },
            new Auction
            {
                Id = 3, Title = "Mountain Bike Trek", Description = "Trek X-Caliber 8, barely used",
                ImageUrl = "https://picsum.photos/seed/trek/860/600", StartingPrice = 800m, CurrentPrice = 850.00m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 1000, CategoryId = 1, Slug = "mountain-bike-trek-3",
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0003-0000-0000-000000000003")
            },
            new Auction
            {
                Id = 4, Title = "Oil Painting - Sunset", Description = "Original oil painting, 24x36 inches",
                ImageUrl = "https://picsum.photos/seed/painting/860/600", StartingPrice = 250m, CurrentPrice = 250m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 1000, CategoryId = 1, Slug = "oil-painting-sunset-4",
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0004-0000-0000-000000000004")
            },
            new Auction
            {
                Id = 5, Title = "Tesla Model 3 2023", Description = "Tesla Model 3 Long Range, white, 10k miles",
                ImageUrl = "https://picsum.photos/seed/tesla/860/600", StartingPrice = 35000m, CurrentPrice = 35000m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 1000, CategoryId = 8, Slug = "tesla-model-3-2023-5",
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0005-0000-0000-000000000005")
            },
            new Auction
            {
                Id = 6, Title = "Sony PlayStation 5", Description = "PS5 Digital Edition, like new, includes two controllers",
                ImageUrl = "https://picsum.photos/seed/ps5/860/600", StartingPrice = 400m, CurrentPrice = 520.00m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 1, Slug = "sony-playstation-5-6",
                ConcurrencyStamp = Guid.Parse("a1b2c3d4-0006-0000-0000-000000000006")
            }
        );
    }
}
