using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;

namespace BidZone.BusinessLogic.Core;

internal static class Mappers
{
    public static UserDto ToDto(User u) => new()
    {
        Id = u.Id,
        Username = u.UserName ?? string.Empty,
        Email = u.Email ?? string.Empty,
        FullName = u.FullName,
        Role = u.Role,
        CreatedAt = u.CreatedAt,
        IsActive = u.IsActive
    };

    public static AuctionDto ToDto(Auction a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Description = a.Description,
        ImageUrl = a.ImageUrl,
        StartingPrice = a.StartingPrice,
        CurrentPrice = a.CurrentPrice,
        ReservePrice = a.ReservePrice,
        StartTime = a.StartTime,
        EndTime = a.EndTime,
        Status = a.Status,
        SellerId = a.SellerId,
        SellerUsername = a.Seller?.UserName ?? string.Empty,
        CategoryId = a.CategoryId,
        CategoryName = a.Category?.Name ?? string.Empty,
        CategorySlug = a.Category?.Slug ?? string.Empty,
        BidCount = a.Bids?.Count ?? 0
    };

    public static BidDto ToDto(Bid b) => new()
    {
        Id = b.Id,
        Amount = b.Amount,
        PlacedAt = b.PlacedAt,
        Status = b.Status,
        AuctionId = b.AuctionId,
        AuctionTitle = b.Auction?.Title ?? string.Empty,
        BidderId = b.BidderId,
        BidderUsername = b.Bidder?.UserName ?? string.Empty
    };

    public static CategoryDto ToDto(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        AuctionCount = c.Auctions?.Count ?? 0
    };

    public static WatchlistDto ToDto(WatchlistItem w) => new()
    {
        Id = w.Id,
        AuctionId = w.AuctionId,
        AuctionTitle = w.Auction?.Title ?? string.Empty,
        AuctionImageUrl = w.Auction?.ImageUrl,
        CurrentPrice = w.Auction?.CurrentPrice ?? 0,
        EndTime = w.Auction?.EndTime ?? DateTime.MinValue,
        Status = w.Auction?.Status ?? string.Empty,
        AddedAt = w.AddedAt
    };

    public static List<UserDto> ToDtoList(IEnumerable<User> items) => items.Select(ToDto).ToList();
    public static List<AuctionDto> ToDtoList(IEnumerable<Auction> items) => items.Select(ToDto).ToList();
    public static List<BidDto> ToDtoList(IEnumerable<Bid> items) => items.Select(ToDto).ToList();
    public static List<CategoryDto> ToDtoList(IEnumerable<Category> items) => items.Select(ToDto).ToList();
    public static List<WatchlistDto> ToDtoList(IEnumerable<WatchlistItem> items) => items.Select(ToDto).ToList();
}
