using BidZone.Domains.Entities;
using BidZone.Domains.Seeds;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BidZone.DataAccess.Context;

public class AppDbContext : IdentityUserContext<User, int>
{
    public AppDbContext() { }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (optionsBuilder.IsConfigured)
        {
            return;
        }

        var connectionString = DbSession.ConnectionString;
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Database connection string has not been configured.");
        }

        if (DbSession.IsSqliteConnectionString(connectionString))
        {
            optionsBuilder.UseSqlite(connectionString);
            return;
        }

        optionsBuilder.UseNpgsql(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.ToTable("RefreshTokens");
            e.Property(r => r.TokenHash).HasMaxLength(128).IsRequired();
            e.Property(r => r.ReplacedByTokenHash).HasMaxLength(128);
            e.Property(r => r.CreatedByIp).HasMaxLength(64);
            e.Property(r => r.RevokedByIp).HasMaxLength(64);
            e.Property(r => r.Reason).HasMaxLength(200);
            e.HasIndex(r => r.TokenHash).IsUnique();
            e.HasIndex(r => new { r.UserId, r.ExpiresAtUtc });
            e.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Auction>(e =>
        {
            e.HasOne(a => a.Seller).WithMany(u => u.Auctions).HasForeignKey(a => a.SellerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Category).WithMany(c => c.Auctions).HasForeignKey(a => a.CategoryId);
        });

        modelBuilder.Entity<Bid>(e =>
        {
            e.HasOne(b => b.Auction).WithMany(a => a.Bids).HasForeignKey(b => b.AuctionId);
            e.HasOne(b => b.Bidder).WithMany(u => u.Bids).HasForeignKey(b => b.BidderId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WatchlistItem>(e =>
        {
            e.HasOne(w => w.User).WithMany(u => u.WatchlistItems).HasForeignKey(w => w.UserId);
            e.HasOne(w => w.Auction).WithMany(a => a.WatchlistItems).HasForeignKey(w => w.AuctionId);
            e.HasIndex(w => new { w.UserId, w.AuctionId }).IsUnique();
        });

        DatabaseSeeder.Seed(modelBuilder);
    }
}
