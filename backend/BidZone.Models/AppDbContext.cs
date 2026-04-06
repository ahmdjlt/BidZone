using BidZone.Models.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Models;

public class AppDbContext : IdentityUserContext<User, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.Property(u => u.UserName).HasColumnName("Username").HasMaxLength(50);
            e.Property(u => u.NormalizedUserName).HasMaxLength(50);
            e.Property(u => u.Email).HasMaxLength(100);
            e.Property(u => u.NormalizedEmail).HasMaxLength(100);
            e.Property(u => u.FullName).HasMaxLength(100);
            e.Property(u => u.Role).HasMaxLength(20);
            e.HasIndex(u => u.NormalizedEmail).IsUnique();
            e.HasIndex(u => u.NormalizedUserName).IsUnique();
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
        var adminSecurityStamp = "d44e0d8f-0f86-4a4e-a1d9-a6bf29f50a41";
        var sellerSecurityStamp = "d15f4865-12ec-4880-9a8e-efec8d61cb08";
        var buyerSecurityStamp = "9db95bff-3eeb-4a2d-afd1-af80e0c31db2";

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

        // Demo users with Identity password hashes
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                UserName = "admin",
                NormalizedUserName = Normalize("admin"),
                FullName = "Admin",
                Email = "admin@bidzone.com",
                NormalizedEmail = Normalize("admin@bidzone.com"),
                PasswordHash = "AQAAAAIAAYagAAAAEIZHtCrpw/j1RV8ISXtKMS02S7jhq1dOzqyCRABr07G8TUzI4aIMYWuS7gRMeHSPnQ==", // Admin123A
                SecurityStamp = adminSecurityStamp,
                ConcurrencyStamp = "9a6560ca-cd10-4f76-b0e7-bf8ce5caa5db",
                EmailConfirmed = true,
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
            },
            new User
            {
                Id = 2,
                UserName = "seller1",
                NormalizedUserName = Normalize("seller1"),
                FullName = "Demo Seller",
                Email = "seller1@bidzone.com",
                NormalizedEmail = Normalize("seller1@bidzone.com"),
                PasswordHash = "AQAAAAIAAYagAAAAEOKn3iS6zRXJxbYnH6fG8R8bds/7coXisLNnePfdl5rCa0DW6Ot8z1NGUFbv4oCzUg==", // Seller123A
                SecurityStamp = sellerSecurityStamp,
                ConcurrencyStamp = "ec1d3f44-1730-4bd3-836d-a7da7318afdb",
                EmailConfirmed = true,
                Role = "Seller",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
            },
            new User
            {
                Id = 3,
                UserName = "buyer1",
                NormalizedUserName = Normalize("buyer1"),
                FullName = "Demo Buyer",
                Email = "buyer1@bidzone.com",
                NormalizedEmail = Normalize("buyer1@bidzone.com"),
                PasswordHash = "AQAAAAIAAYagAAAAEOxt2/uhhLlq+OgQNwz+4tkYkTas/HpQkGc/LtTIqctryoEiRDsrvJEqQ6AChKzgCQ==", // Buyer123A
                SecurityStamp = buyerSecurityStamp,
                ConcurrencyStamp = "87fda966-f7ca-4f43-a6f2-dcb92c1a24cf",
                EmailConfirmed = true,
                Role = "Buyer",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
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

    private static string Normalize(string value) => value.ToUpperInvariant();
}
