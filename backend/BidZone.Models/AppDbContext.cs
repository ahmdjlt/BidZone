using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();
    public DbSet<Session> Sessions => Set<Session>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
        });

        // Session
        modelBuilder.Entity<Session>(e =>
        {
            e.HasIndex(s => s.Token).IsUnique();
            e.HasOne(s => s.User).WithMany(u => u.Sessions).HasForeignKey(s => s.UserId);
        });

        // Auction
        modelBuilder.Entity<Auction>(e =>
        {
            e.HasOne(a => a.Seller).WithMany(u => u.Auctions).HasForeignKey(a => a.SellerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Category).WithMany(c => c.Auctions).HasForeignKey(a => a.CategoryId);
        });

        // Bid
        modelBuilder.Entity<Bid>(e =>
        {
            e.HasOne(b => b.Auction).WithMany(a => a.Bids).HasForeignKey(b => b.AuctionId);
            e.HasOne(b => b.Bidder).WithMany(u => u.Bids).HasForeignKey(b => b.BidderId).OnDelete(DeleteBehavior.Restrict);
        });

        // WatchlistItem
        modelBuilder.Entity<WatchlistItem>(e =>
        {
            e.HasOne(w => w.User).WithMany(u => u.WatchlistItems).HasForeignKey(w => w.UserId);
            e.HasOne(w => w.Auction).WithMany(a => a.WatchlistItems).HasForeignKey(w => w.AuctionId);
            e.HasIndex(w => new { w.UserId, w.AuctionId }).IsUnique();
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Categories (synced with frontend CategoryBar)
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Art", Slug = "art" },
            new Category { Id = 2, Name = "Interiors", Slug = "interiors" },
            new Category { Id = 3, Name = "Jewellery", Slug = "jewellery" },
            new Category { Id = 4, Name = "Watches", Slug = "watches" },
            new Category { Id = 5, Name = "Fashion", Slug = "fashion" },
            new Category { Id = 6, Name = "Coins & Stamps", Slug = "coins-stamps" },
            new Category { Id = 7, Name = "Comics", Slug = "comics" },
            new Category { Id = 8, Name = "Cars & Bikes", Slug = "cars-bikes" },
            new Category { Id = 9, Name = "Wine & Spirits", Slug = "wine-spirits" },
            new Category { Id = 10, Name = "Electronics", Slug = "electronics" },
            new Category { Id = 11, Name = "Collectibles", Slug = "collectibles" },
            new Category { Id = 12, Name = "Sports", Slug = "sports" },
            new Category { Id = 13, Name = "Books", Slug = "books" },
            new Category { Id = 14, Name = "Toys", Slug = "toys" },
            new Category { Id = 15, Name = "Photography", Slug = "photography" },
            new Category { Id = 16, Name = "Musical", Slug = "musical" }
        );

        // Admin user (password: admin123, MD5 hashed)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                FullName = "Admin",
                Email = "admin@bidzone.com",
                PasswordHash = "0192023a7bbd73250516f069df18b500", // MD5 of "admin123"
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            },
            new User
            {
                Id = 2,
                Username = "seller1",
                FullName = "Demo Seller",
                Email = "seller1@bidzone.com",
                PasswordHash = "e10adc3949ba59abbe56e057f20f883e", // MD5 of "123456"
                Role = "Seller",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            },
            new User
            {
                Id = 3,
                Username = "buyer1",
                FullName = "Demo Buyer",
                Email = "buyer1@bidzone.com",
                PasswordHash = "e10adc3949ba59abbe56e057f20f883e", // MD5 of "123456"
                Role = "Buyer",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            }
        );

        // Sample auctions
        modelBuilder.Entity<Auction>().HasData(
            new Auction
            {
                Id = 1, Title = "iPhone 15 Pro Max", Description = "Brand new iPhone 15 Pro Max 256GB",
                ImageUrl = "/images/iphone15.jpg", StartingPrice = 999.99m, CurrentPrice = 999.99m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 10 // Electronics
            },
            new Auction
            {
                Id = 2, Title = "Vintage Rolex Submariner", Description = "1960s Rolex Submariner in excellent condition",
                ImageUrl = "/images/rolex.jpg", StartingPrice = 15000m, CurrentPrice = 15000m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 4 // Watches
            },
            new Auction
            {
                Id = 3, Title = "Mountain Bike Trek", Description = "Trek X-Caliber 8, barely used",
                ImageUrl = "/images/trek.jpg", StartingPrice = 800m, CurrentPrice = 800m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 12 // Sports
            },
            new Auction
            {
                Id = 4, Title = "Oil Painting - Sunset", Description = "Original oil painting, 24x36 inches",
                ImageUrl = "/images/painting.jpg", StartingPrice = 250m, CurrentPrice = 250m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 1 // Art
            },
            new Auction
            {
                Id = 5, Title = "Tesla Model 3 2023", Description = "Tesla Model 3 Long Range, white, 10k miles",
                ImageUrl = "/images/tesla.jpg", StartingPrice = 35000m, CurrentPrice = 35000m,
                StartTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active", SellerId = 2, CategoryId = 8 // Cars & Bikes
            }
        );
    }
}
