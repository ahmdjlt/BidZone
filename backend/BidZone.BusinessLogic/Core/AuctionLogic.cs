using BidZone.BusinessLogic.Helpers;
using BidZone.DataAccess.Context;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using BidZone.Domains.Responses;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class AuctionLogic
{
    private const int MaxAuctionImages = 10;
    private const int MaxRecommendationLimit = 24;
    private const int MinPersonalSignalCount = 3;
    private const int BrowsingSignalDays = 45;
    private const int BrowsingEventRetentionDays = 90;
    private const int MaxStoredBrowsingEventsPerUser = 250;
    private const string AuctionViewEvent = "AuctionView";
    private const string CategoryViewEvent = "CategoryView";
    private const string SearchEvent = "Search";
    private static readonly string[] DefaultAllowedImageHosts = ["res.cloudinary.com", "picsum.photos", "images.unsplash.com"];

    public AuctionLogic() { }

    internal async Task<List<AuctionDto>> GetAllExecution(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice)
    {
        using var db = new AppDbContext();

        int? categoryId = null;
        if (!string.IsNullOrEmpty(category))
        {
            var cat = await db.Categories.FirstOrDefaultAsync(c => c.Slug == category);
            categoryId = cat?.Id;
        }

        var query = BuildFilteredQuery(db, new AuctionFilterParams { Search = search, Sort = sort, Status = status, MinPrice = minPrice, MaxPrice = maxPrice }, categoryId);
        var auctions = await query.ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<PaginatedResult<AuctionDto>> GetAllPagedExecution(string? search, string? category, string? sort, string? status, decimal? minPrice, decimal? maxPrice, PaginationParams pagination)
    {
        using var db = new AppDbContext();

        int? categoryId = null;
        if (!string.IsNullOrEmpty(category))
        {
            var cat = await db.Categories.FirstOrDefaultAsync(c => c.Slug == category);
            categoryId = cat?.Id;
        }

        var query = BuildFilteredQuery(db, new AuctionFilterParams { Search = search, Sort = sort, Status = status, MinPrice = minPrice, MaxPrice = maxPrice }, categoryId);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return new PaginatedResult<AuctionDto>
        {
            Items = Mappers.ToDtoList(items),
            TotalCount = totalCount,
            Page = pagination.Page,
            PageSize = pagination.PageSize
        };
    }

    internal async Task<AuctionDto?> GetByIdExecution(int id)
    {
        using var db = new AppDbContext();
        var auction = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids).ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(a => a.Id == id);
        return auction == null ? null : Mappers.ToDto(auction);
    }

    internal async Task<AuctionDto?> GetBySlugExecution(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug) || slug.Length > 255)
            return null;

        using var db = new AppDbContext();
        var auction = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids).ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(a => a.Slug == slug);
        return auction == null ? null : Mappers.ToDto(auction);
    }

    internal async Task<List<AuctionDto>> GetActiveExecution()
    {
        using var db = new AppDbContext();
        var auctions = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .Where(a => a.Status == "Active" && a.EndTime > DateTime.UtcNow)
            .ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<List<AuctionDto>> GetRecommendationsExecution(int? userId, int limit)
    {
        using var db = new AppDbContext();
        var take = Math.Clamp(limit, 1, MaxRecommendationLimit);
        var now = DateTime.UtcNow;
        var categoryScores = new Dictionary<int, double>();
        var searchTerms = new List<string>();
        var interactedAuctionIds = new HashSet<int>();
        var personalSignalCount = 0;

        if (userId.HasValue)
        {
            var bidSignals = await db.Bids
                .AsNoTracking()
                .Where(b => b.BidderId == userId.Value)
                .Select(b => new { b.AuctionId, b.PlacedAt, b.Auction.CategoryId })
                .ToListAsync();

            foreach (var signal in bidSignals)
            {
                AddScore(categoryScores, signal.CategoryId, 5.0 * GetRecencyWeight(signal.PlacedAt, now));
                interactedAuctionIds.Add(signal.AuctionId);
            }

            var watchlistSignals = await db.WatchlistItems
                .AsNoTracking()
                .Where(w => w.UserId == userId.Value)
                .Select(w => new { w.AuctionId, w.AddedAt, w.Auction.CategoryId })
                .ToListAsync();

            foreach (var signal in watchlistSignals)
            {
                AddScore(categoryScores, signal.CategoryId, 4.0 * GetRecencyWeight(signal.AddedAt, now));
                interactedAuctionIds.Add(signal.AuctionId);
            }

            var browsingCutoff = now.AddDays(-BrowsingSignalDays);
            var browsingSignals = await db.BrowsingEvents
                .AsNoTracking()
                .Where(e => e.UserId == userId.Value && e.CreatedAt >= browsingCutoff)
                .Select(e => new { e.EventType, e.AuctionId, e.CategoryId, e.SearchTerm, e.CreatedAt })
                .ToListAsync();

            foreach (var signal in browsingSignals)
            {
                var recencyWeight = GetRecencyWeight(signal.CreatedAt, now);
                if (signal.EventType == AuctionViewEvent && signal.CategoryId.HasValue)
                {
                    AddScore(categoryScores, signal.CategoryId.Value, 2.5 * recencyWeight);
                    if (signal.AuctionId.HasValue)
                    {
                        interactedAuctionIds.Add(signal.AuctionId.Value);
                    }
                }
                else if (signal.EventType == CategoryViewEvent && signal.CategoryId.HasValue)
                {
                    AddScore(categoryScores, signal.CategoryId.Value, 1.5 * recencyWeight);
                }
            }

            searchTerms = browsingSignals
                .Where(e => e.EventType == SearchEvent)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => NormalizeSearchTerm(e.SearchTerm))
                .Where(term => term != null)
                .Cast<string>()
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(5)
                .ToList();

            personalSignalCount = bidSignals.Count + watchlistSignals.Count + browsingSignals.Count;
        }

        var candidates = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .Include(a => a.WatchlistItems)
            .Where(a => a.Status == "Active" && a.EndTime > now)
            .Where(a => !userId.HasValue || a.SellerId != userId.Value)
            .ToListAsync();

        var hasEnoughPersonalData = personalSignalCount >= MinPersonalSignalCount;
        var candidatePool = hasEnoughPersonalData
            ? candidates.Where(a => !interactedAuctionIds.Contains(a.Id)).ToList()
            : candidates;

        if (candidatePool.Count == 0)
        {
            candidatePool = candidates;
        }

        var recommendations = candidatePool
            .Select(auction => new
            {
                Auction = auction,
                Score = ScoreRecommendation(auction, categoryScores, searchTerms, hasEnoughPersonalData, now)
            })
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Auction.EndTime)
            .ThenByDescending(item => item.Auction.Bids.Count)
            .ThenBy(item => item.Auction.Id)
            .Take(take)
            .Select(item => item.Auction)
            .ToList();

        return Mappers.ToDtoList(recommendations);
    }

    internal async Task RecordBrowsingEventExecution(RecordBrowsingEventDto dto, int userId)
    {
        var eventType = NormalizeEventType(dto.EventType);
        if (eventType == null)
        {
            throw new ArgumentException("Unsupported browsing event type.");
        }

        using var db = new AppDbContext();
        int? auctionId = null;
        int? categoryId = null;
        string? searchTerm = null;

        if (eventType == AuctionViewEvent)
        {
            if (!dto.AuctionId.HasValue)
            {
                throw new ArgumentException("Auction view events require an auction id.");
            }

            var auction = await db.Auctions
                .AsNoTracking()
                .Where(a => a.Id == dto.AuctionId.Value)
                .Select(a => new { a.Id, a.CategoryId })
                .FirstOrDefaultAsync();

            if (auction == null)
            {
                throw new ArgumentException("Auction was not found.");
            }

            auctionId = auction.Id;
            categoryId = auction.CategoryId;
        }
        else if (eventType == CategoryViewEvent)
        {
            var categorySlug = NormalizeSlug(dto.CategorySlug);
            if (categorySlug == null)
            {
                throw new ArgumentException("Category view events require a category slug.");
            }

            var category = await db.Categories
                .AsNoTracking()
                .Where(c => c.Slug == categorySlug)
                .Select(c => new { c.Id })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                throw new ArgumentException("Category was not found.");
            }

            categoryId = category.Id;
        }
        else if (eventType == SearchEvent)
        {
            searchTerm = NormalizeSearchTerm(dto.SearchTerm);
            if (searchTerm == null)
            {
                return;
            }
        }

        db.BrowsingEvents.Add(new BrowsingEvent
        {
            UserId = userId,
            AuctionId = auctionId,
            CategoryId = categoryId,
            EventType = eventType,
            SearchTerm = searchTerm,
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
        await TrimBrowsingEventsAsync(db, userId);
    }

    internal async Task<List<AuctionDto>> GetByCategoryExecution(int categoryId)
    {
        using var db = new AppDbContext();
        var auctions = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .Where(a => a.CategoryId == categoryId)
            .ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<List<AuctionDto>> GetBySellerExecution(int sellerId)
    {
        using var db = new AppDbContext();
        var auctions = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .Where(a => a.SellerId == sellerId)
            .ToListAsync();
        return Mappers.ToDtoList(auctions);
    }

    internal async Task<AuctionContactDto?> GetContactForUserExecution(int auctionId, int userId)
    {
        using var db = new AppDbContext();

        var auction = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Bids)
                .ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        if (auction == null || auction.Status != "Closed")
            return null;

        var winningBid = auction.Bids.FirstOrDefault(b => b.Status == "Won");
        if (winningBid == null || winningBid.Bidder == null || auction.Seller == null)
            return null;

        if (auction.SellerId == userId)
        {
            return new AuctionContactDto
            {
                ViewerRole = "Seller",
                CounterpartyUsername = winningBid.Bidder.UserName ?? string.Empty,
                CounterpartyEmail = winningBid.Bidder.Email ?? string.Empty
            };
        }

        if (winningBid.BidderId == userId)
        {
            return new AuctionContactDto
            {
                ViewerRole = "Buyer",
                CounterpartyUsername = auction.Seller.UserName ?? string.Empty,
                CounterpartyEmail = auction.Seller.Email ?? string.Empty
            };
        }

        return null;
    }

    internal async Task<AuctionDto> CreateExecution(CreateAuctionDto dto, int sellerId)
    {
        using var db = new AppDbContext();

        var auction = new Auction
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = null,
            StartingPrice = dto.StartingPrice,
            CurrentPrice = dto.StartingPrice,
            ReservePrice = dto.ReservePrice,
            StartTime = DateTime.UtcNow,
            EndTime = dto.EndTime.ToUniversalTime(),
            Status = "Active",
            Slug = SlugHelper.GenerateSlug(dto.Title),
            SellerId = sellerId,
            CategoryId = dto.CategoryId
        };

        SetAuctionImages(auction, dto.ImageUrls, dto.ImageUrl);

        db.Auctions.Add(auction);

        for (var attempt = 0; attempt < 5; attempt++)
        {
            try
            {
                await db.SaveChangesAsync();
                break; // success
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_Auctions_Slug") == true)
            {
                if (attempt == 4) throw new InvalidOperationException("Failed to generate a unique slug after 5 attempts.");
                auction.Slug = SlugHelper.GenerateSlug(dto.Title);
            }
        }

        var full = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .FirstAsync(a => a.Id == auction.Id);
        return Mappers.ToDto(full);
    }

    internal async Task<AuctionDto?> UpdateExecution(int id, UpdateAuctionDto dto, int sellerId)
    {
        using var db = new AppDbContext();
        var auction = await db.Auctions
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (auction == null || auction.SellerId != sellerId)
            return null;

        if (dto.Title != null) auction.Title = dto.Title;
        if (dto.Description != null) auction.Description = dto.Description;
        if (dto.ImageUrls != null)
        {
            SetAuctionImages(auction, dto.ImageUrls, dto.ImageUrl);
        }
        else if (dto.ImageUrl != null)
        {
            auction.ImageUrl = NormalizeAuctionImageUrl(dto.ImageUrl);
        }
        if (dto.ReservePrice.HasValue) auction.ReservePrice = dto.ReservePrice;
        if (dto.EndTime.HasValue) auction.EndTime = dto.EndTime.Value.ToUniversalTime();
        if (dto.CategoryId.HasValue) auction.CategoryId = dto.CategoryId.Value;

        await db.SaveChangesAsync();

        var updated = await db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .FirstAsync(a => a.Id == id);
        return Mappers.ToDto(updated);
    }

    internal async Task<ActionResponse> DeleteExecution(int id, int sellerId)
    {
        using var db = new AppDbContext();
        var auction = await db.Auctions.Include(a => a.Bids).FirstOrDefaultAsync(a => a.Id == id);
        if (auction == null || auction.SellerId != sellerId)
            return ActionResponse.Failure("Auction was not found or does not belong to the current seller.");

        if (auction.Bids.Any())
            return ActionResponse.Failure("Cannot delete auction with existing bids.");

        db.Auctions.Remove(auction);
        await db.SaveChangesAsync();
        return ActionResponse.Success("Auction deleted successfully.");
    }

    private static IQueryable<Auction> BuildFilteredQuery(AppDbContext db, AuctionFilterParams filters, int? categoryId)
    {
        var query = db.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Images)
            .Include(a => a.Bids)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filters.Search))
            query = query.Where(a => a.Title.ToLower().Contains(filters.Search.ToLower()));

        if (categoryId.HasValue)
            query = query.Where(a => a.CategoryId == categoryId.Value);

        if (!string.IsNullOrEmpty(filters.Status))
            query = query.Where(a => a.Status.ToLower() == filters.Status.ToLower());

        if (filters.MinPrice.HasValue)
            query = query.Where(a => a.CurrentPrice >= filters.MinPrice.Value);

        if (filters.MaxPrice.HasValue)
            query = query.Where(a => a.CurrentPrice <= filters.MaxPrice.Value);

        query = filters.Sort switch
        {
            "price_asc" => query.OrderBy(a => a.CurrentPrice),
            "price_desc" => query.OrderByDescending(a => a.CurrentPrice),
            "ending_soon" => query.OrderBy(a => a.EndTime),
            "newest" => query.OrderByDescending(a => a.StartTime),
            _ => query.OrderByDescending(a => a.StartTime)
        };

        return query;
    }

    private static void AddScore(Dictionary<int, double> scores, int categoryId, double value)
    {
        scores[categoryId] = scores.GetValueOrDefault(categoryId) + value;
    }

    private static double ScoreRecommendation(
        Auction auction,
        Dictionary<int, double> categoryScores,
        List<string> searchTerms,
        bool hasEnoughPersonalData,
        DateTime now)
    {
        var categoryScore = categoryScores.GetValueOrDefault(auction.CategoryId);
        var searchScore = searchTerms.Count(term => AuctionMatchesSearchTerm(auction, term)) * 3.0;
        var popularityScore = Math.Min(auction.Bids.Count, 20) * 0.6 + Math.Min(auction.WatchlistItems.Count, 20) * 0.45;
        var daysUntilClose = Math.Max(0, (auction.EndTime - now).TotalDays);
        var urgencyScore = Math.Max(0, 7 - daysUntilClose) * 0.1;
        var personalScore = categoryScore + searchScore;

        return hasEnoughPersonalData
            ? personalScore + popularityScore + urgencyScore
            : personalScore * 0.4 + popularityScore + urgencyScore;
    }

    private static bool AuctionMatchesSearchTerm(Auction auction, string term)
    {
        return auction.Title.Contains(term, StringComparison.OrdinalIgnoreCase) ||
            auction.Description.Contains(term, StringComparison.OrdinalIgnoreCase) ||
            (auction.Category?.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false);
    }

    private static double GetRecencyWeight(DateTime value, DateTime now)
    {
        var ageDays = Math.Max(0, (now - value).TotalDays);
        if (ageDays <= 7) return 1.0;
        if (ageDays <= 30) return 0.7;
        return 0.45;
    }

    private static string? NormalizeEventType(string? eventType)
    {
        if (string.IsNullOrWhiteSpace(eventType))
        {
            return null;
        }

        var trimmed = eventType.Trim();
        if (string.Equals(trimmed, AuctionViewEvent, StringComparison.OrdinalIgnoreCase)) return AuctionViewEvent;
        if (string.Equals(trimmed, CategoryViewEvent, StringComparison.OrdinalIgnoreCase)) return CategoryViewEvent;
        if (string.Equals(trimmed, SearchEvent, StringComparison.OrdinalIgnoreCase)) return SearchEvent;
        return null;
    }

    private static string? NormalizeSlug(string? slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        var cleaned = slug.Trim().ToLowerInvariant();
        return cleaned.Length > 100 ? cleaned[..100] : cleaned;
    }

    private static string? NormalizeSearchTerm(string? searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return null;
        }

        var cleaned = string.Join(
            ' ',
            searchTerm.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

        if (cleaned.Length == 0)
        {
            return null;
        }

        return cleaned.Length > 200 ? cleaned[..200] : cleaned;
    }

    private static async Task TrimBrowsingEventsAsync(AppDbContext db, int userId)
    {
        var cutoff = DateTime.UtcNow.AddDays(-BrowsingEventRetentionDays);
        var oldEvents = await db.BrowsingEvents
            .Where(e => e.UserId == userId && e.CreatedAt < cutoff)
            .ToListAsync();

        if (oldEvents.Count > 0)
        {
            db.BrowsingEvents.RemoveRange(oldEvents);
        }

        var overflowEvents = await db.BrowsingEvents
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Skip(MaxStoredBrowsingEventsPerUser)
            .ToListAsync();

        if (overflowEvents.Count > 0)
        {
            db.BrowsingEvents.RemoveRange(overflowEvents);
        }

        if (oldEvents.Count > 0 || overflowEvents.Count > 0)
        {
            await db.SaveChangesAsync();
        }
    }

    private static void SetAuctionImages(Auction auction, IEnumerable<string>? imageUrls, string? fallbackImageUrl)
    {
        var cleaned = (imageUrls ?? [])
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Select(url => url.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (cleaned.Count == 0 && !string.IsNullOrWhiteSpace(fallbackImageUrl))
        {
            cleaned.Add(fallbackImageUrl.Trim());
        }

        if (cleaned.Count > MaxAuctionImages)
        {
            throw new ArgumentException($"Auctions can have at most {MaxAuctionImages} images.");
        }

        cleaned = cleaned.Select(NormalizeAuctionImageUrl).Where(url => url != null).Cast<string>().ToList();

        auction.Images.Clear();
        for (var i = 0; i < cleaned.Count; i++)
        {
            auction.Images.Add(new AuctionImage
            {
                Url = cleaned[i],
                SortOrder = i
            });
        }

        auction.ImageUrl = cleaned.FirstOrDefault();
    }

    private static string? NormalizeAuctionImageUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return null;
        }

        var trimmed = url.Trim();
        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) ||
            !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) ||
            !GetAllowedImageHosts().Contains(uri.IdnHost.ToLowerInvariant()))
        {
            throw new ArgumentException("Auction images must use HTTPS URLs from an approved image host.");
        }

        return uri.ToString();
    }

    private static HashSet<string> GetAllowedImageHosts()
    {
        var configuredHosts = Environment.GetEnvironmentVariable("ALLOWED_IMAGE_HOSTS")
            ?? Environment.GetEnvironmentVariable("NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS");

        var hosts = string.IsNullOrWhiteSpace(configuredHosts)
            ? DefaultAllowedImageHosts
            : configuredHosts.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return hosts
            .Select(host => host.ToLowerInvariant())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }
}
