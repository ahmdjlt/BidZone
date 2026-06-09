using System.Globalization;
using System.Diagnostics;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using BidZone.BusinessLogic.Helpers;
using BidZone.DataAccess.Context;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

internal sealed record MarketplaceImportOptions(
    int ActiveCount = 24,
    int ClosedCount = 4,
    bool ReplaceImported = true)
{
    public static MarketplaceImportOptions Parse(string[] args)
    {
        var options = new MarketplaceImportOptions();

        for (var index = 0; index < args.Length; index++)
        {
            var arg = args[index];
            if (string.Equals(arg, "--keep-imported", StringComparison.OrdinalIgnoreCase))
            {
                options = options with { ReplaceImported = false };
                continue;
            }

            if (string.Equals(arg, "--active", StringComparison.OrdinalIgnoreCase) && index + 1 < args.Length)
            {
                options = options with { ActiveCount = Math.Max(1, ParsePositiveInt(args[++index], options.ActiveCount)) };
                continue;
            }

            if (string.Equals(arg, "--closed", StringComparison.OrdinalIgnoreCase) && index + 1 < args.Length)
            {
                options = options with { ClosedCount = Math.Max(0, ParsePositiveInt(args[++index], options.ClosedCount)) };
            }
        }

        if (options.ClosedCount >= options.ActiveCount)
        {
            options = options with { ClosedCount = Math.Max(0, options.ActiveCount - 1) };
        }

        return options;
    }

    private static int ParsePositiveInt(string value, int fallback) =>
        int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var parsed) ? parsed : fallback;
}

internal static class MarketplaceImporter
{
    private const string ImportedDescriptionPrefix = "Imported from ";
    private const int SellerId = 1000;
    private const int BidderId = 3;
    private const int MaxImages = 8;

    public static async Task<int> RunAsync(MarketplaceImportOptions options, CancellationToken cancellationToken = default)
    {
        using var scraper = new MarketplaceScraper();
        var targetCount = options.ActiveCount + options.ClosedCount;
        var scrapeReport = await scraper.ScrapeAsync(targetCount + 8, cancellationToken);

        PrintScrapeReport(scrapeReport);

        var items = scrapeReport.Items
            .GroupBy(item => NormalizeTitle(item.Title), StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First())
            .Take(targetCount)
            .ToList();

        if (items.Count == 0)
        {
            Console.WriteLine("No importable marketplace listings were found.");
            return 1;
        }

        var activeCount = Math.Min(options.ActiveCount, Math.Max(1, items.Count - Math.Min(options.ClosedCount, items.Count - 1)));
        var closedCount = Math.Min(options.ClosedCount, items.Count - activeCount);
        if (closedCount >= activeCount)
        {
            closedCount = Math.Max(0, activeCount - 1);
        }

        await using var db = new AppDbContext();
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var sellerExists = await db.Users.AnyAsync(user => user.Id == SellerId, cancellationToken);
        var bidderExists = await db.Users.AnyAsync(user => user.Id == BidderId, cancellationToken);
        if (!sellerExists || !bidderExists)
        {
            throw new InvalidOperationException("Expected seeded BidZone users are missing. Run database migrations/seeds first.");
        }

        if (options.ReplaceImported)
        {
            await RemovePreviouslyImportedAsync(db, cancellationToken);
        }

        var categories = await db.Categories.ToDictionaryAsync(category => category.Slug, cancellationToken);
        var now = DateTime.UtcNow;
        var auctions = new List<Auction>();

        for (var index = 0; index < items.Count; index++)
        {
            var item = items[index];
            var isClosed = index >= activeCount && index < activeCount + closedCount;
            var auction = CreateAuction(item, categories, now, index, isClosed);
            AddBidTrail(auction, item, now, isClosed);
            auctions.Add(auction);
        }

        await db.Auctions.AddRangeAsync(auctions, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var totalImages = auctions.Sum(a => a.Images.Count);
        Console.WriteLine($"Imported {activeCount} active and {closedCount} closed marketplace auctions ({totalImages} images total).");
        Console.WriteLine(options.ReplaceImported
            ? "Previous imported marketplace auctions were replaced."
            : "Previous imported marketplace auctions were kept.");

        return 0;
    }

    private static async Task RemovePreviouslyImportedAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var auctionIds = await db.Auctions
            .Where(auction => EF.Functions.Like(auction.Description, $"{ImportedDescriptionPrefix}%"))
            .Select(auction => auction.Id)
            .ToListAsync(cancellationToken);

        if (auctionIds.Count == 0)
        {
            return;
        }

        db.WatchlistItems.RemoveRange(db.WatchlistItems.Where(item => auctionIds.Contains(item.AuctionId)));
        db.Bids.RemoveRange(db.Bids.Where(bid => auctionIds.Contains(bid.AuctionId)));
        db.AuctionImages.RemoveRange(db.AuctionImages.Where(image => auctionIds.Contains(image.AuctionId)));
        db.Auctions.RemoveRange(db.Auctions.Where(auction => auctionIds.Contains(auction.Id)));
        await db.SaveChangesAsync(cancellationToken);
    }

    private static Auction CreateAuction(
        ScrapedMarketplaceItem item,
        IReadOnlyDictionary<string, Category> categories,
        DateTime now,
        int index,
        bool isClosed)
    {
        var currentPrice = Math.Max(1m, item.Price ?? BuildFallbackPrice(item.Title));
        var startingPrice = Math.Max(1m, Math.Round(currentPrice * 0.72m, 2));
        var category = categories[InferCategorySlug(item.Title)];
        var startTime = isClosed ? now.AddDays(-14 - index) : now.AddDays(-Math.Min(7, index + 1));
        var endTime = isClosed ? now.AddDays(-1 - index) : now.AddDays(2 + (index % 10));

        var fallbackImage = "/auction-images/abstract-oil-canvas.svg";
        var imageUrls = item.ImageUrls.Count > 0 ? item.ImageUrls : [fallbackImage];
        var primaryImage = imageUrls[0];

        // Build description: always start with the import prefix (used for cleanup detection),
        // then append the real description if available.
        var itemDescription = !string.IsNullOrWhiteSpace(item.Description)
            ? item.Description
            : GenerateDescription(item.Title);

        var descriptionParts = new List<string>
        {
            $"{ImportedDescriptionPrefix}{item.Source}. Source: {item.Url}.\n\n{itemDescription}"
        };

        return new Auction
        {
            Title = item.Title,
            Slug = SlugHelper.GenerateSlug($"{item.Source} {item.Title}"),
            Description = string.Join("", descriptionParts),
            ImageUrl = primaryImage,
            StartingPrice = startingPrice,
            CurrentPrice = currentPrice,
            ReservePrice = Math.Round(currentPrice * 1.15m, 2),
            StartTime = startTime,
            EndTime = endTime,
            Status = isClosed ? "Closed" : "Active",
            SellerId = SellerId,
            CategoryId = category.Id,
            ConcurrencyStamp = Guid.NewGuid(),
            Images = imageUrls
                .Take(MaxImages)
                .Select((url, i) => new AuctionImage { Url = url, SortOrder = i })
                .ToList()
        };
    }

    private static void AddBidTrail(Auction auction, ScrapedMarketplaceItem item, DateTime now, bool isClosed)
    {
        var bidRows = Math.Clamp(item.BidCount ?? 3, 1, 6);
        var priceStep = (auction.CurrentPrice - auction.StartingPrice) / bidRows;

        for (var index = 0; index < bidRows; index++)
        {
            var isLast = index == bidRows - 1;
            auction.Bids.Add(new Bid
            {
                Amount = Math.Round(isLast ? auction.CurrentPrice : auction.StartingPrice + priceStep * (index + 1), 2),
                PlacedAt = isClosed
                    ? auction.EndTime.AddMinutes(-((bidRows - index) * 7))
                    : now.AddMinutes(-((bidRows - index) * 11)),
                Status = isLast
                    ? isClosed ? "Won" : "Winning"
                    : isClosed ? "Lost" : "Outbid",
                BidderId = BidderId
            });
        }
    }

    private static void PrintScrapeReport(MarketplaceScrapeReport report)
    {
        foreach (var source in report.Sources)
        {
            if (source.ItemCount > 0)
            {
                Console.WriteLine($"{source.Name}: parsed {source.ItemCount} listings.");
            }
            else
            {
                Console.WriteLine($"{source.Name}: skipped ({source.Message}).");
            }
        }
    }

    private static string GenerateDescription(string title)
    {
        var t = title.ToLowerInvariant();

        // Condition qualifiers extracted from common listing language
        var condition = ContainsAny(t, "new", "sealed", "mint", "unopened") ? "brand new" :
                        ContainsAny(t, "refurbished", "restored", "reconditioned") ? "professionally refurbished" :
                        ContainsAny(t, "vintage", "antique", "classic", "retro") ? "vintage" :
                        "pre-owned and in excellent condition";

        if (ContainsAny(t, "watch", "rolex", "omega", "timepiece", "chronograph"))
            return $"A {condition} timepiece offered with all available original accessories. Movement runs smoothly and the case shows minimal signs of wear. An excellent opportunity for collectors or everyday wearers.";

        if (ContainsAny(t, "ring", "bracelet", "necklace", "pendant", "diamond", "jewel"))
            return $"A {condition} fine jewellery piece. Metal and stone details are as pictured; clasp and settings are secure. Comes in a protective pouch or box where available.";

        if (ContainsAny(t, "iphone", "macbook", "laptop", "tablet", "ipad"))
            return $"A {condition} Apple device. Battery health is good, all ports and buttons function correctly, and the display is free of cracks. Reset to factory settings and ready for a new owner.";

        if (ContainsAny(t, "phone", "smartphone", "android", "samsung", "pixel"))
            return $"A {condition} smartphone, factory reset and unlocked. Screen and camera are in excellent shape; includes original charging cable where available.";

        if (ContainsAny(t, "camera", "lens", "dslr", "mirrorless", "leica", "canon", "nikon", "sony"))
            return $"A {condition} photography item. Glass is clean with no fungus or haze; mechanics and autofocus operate as expected. Comes with caps and included accessories.";

        if (ContainsAny(t, "drone", "mavic", "dji"))
            return $"A {condition} drone with all included batteries and propellers. Gimbal is stable, video transmission is clear, and the unit has been test-flown successfully.";

        if (ContainsAny(t, "guitar", "piano", "violin", "saxophone", "trumpet", "banjo", "ukulele", "amp", "amplifier"))
            return $"A {condition} musical instrument or audio piece. All hardware is intact, intonation is solid, and electronics (where applicable) work without issues. A great find for players and collectors alike.";

        if (ContainsAny(t, "speaker", "headphone", "bose", "audio", "stereo", "receiver"))
            return $"A {condition} audio item. Sound output is full and balanced with no distortion; all inputs and controls operate smoothly. Original accessories included where available.";

        if (ContainsAny(t, "ford", "chevy", "chevrolet", "dodge", "cadillac", "mustang", "corvette",
                           "pontiac", "nissan", "honda", "toyota", "lincoln", "buick", "oldsmobile",
                           "studebaker", "kenworth", "peterbilt", "freightliner", "mack",
                           "kawasaki", "yamaha", "harley", "ducati", "suzuki",
                           "truck", "vehicle", "motorcycle", "boat", "trailer", "tractor", "excavator",
                           "bobcat", "forklift", "skidsteer", "scissor lift")
            || Regex.IsMatch(t, @"^\d{4}[,\s]"))
            return $"A {condition} vehicle or powersports item listed with available documentation. Mechanical condition is as described; please review all photos and arrange an inspection before bidding.";

        if (ContainsAny(t, "coin", "stamp", "bullion", "silver", "gold", "numismatic"))
            return $"A {condition} numismatic or precious metal item. Surfaces are well-preserved; grading details are visible in the photos. Stored in protective holders where applicable.";

        if (ContainsAny(t, "painting", "artwork", "canvas", "sculpture", "lithograph", "watercolor"))
            return $"A {condition} work of art. Colours remain vibrant and the surface is free of tears or significant abrasions. Provenance details and dimensions are as noted in the listing.";

        if (ContainsAny(t, "lego", "toy", "figurine", "doll", "collectible", "pokemon", "trading card"))
            return $"A {condition} collectible or toy item. Pieces and components are complete as listed; packaging, where present, is intact. A great addition to any collection.";

        if (ContainsAny(t, "chair", "table", "sofa", "couch", "shelf", "dresser", "furniture", "cabinet"))
            return $"A {condition} furniture piece in solid structural shape. Upholstery and finishes are well-maintained with only light use marks consistent with age. Dimensions are included in the listing photos.";

        if (ContainsAny(t, "wine", "whisky", "whiskey", "bourbon", "scotch", "rum", "vodka", "cognac"))
            return $"A {condition} bottle stored upright in a climate-controlled environment. Fill level and label condition are as pictured. Available to verified buyers in compliance with applicable regulations.";

        if (ContainsAny(t, "book", "comic", "novel", "manuscript"))
            return $"A {condition} book or publication. Binding is tight, pages are clean, and any cover art is well-preserved. A welcome addition for readers and collectors.";

        // Generic fallback
        return $"A {condition} item offered in the condition shown in the listing photos. All original components present where noted. Winning bidder is responsible for arranging collection or shipping.";
    }

    private static string InferCategorySlug(string title)
    {
        var value = title.ToLowerInvariant();

        if (ContainsAny(value, "watch", "rolex", "omega", "timepiece")) return "watches";
        if (ContainsAny(value, "ring", "bracelet", "jewel", "diamond", "necklace", "pendant") ||
            ContainsWord(value, "gold", "silver") && ContainsAny(value, "ring", "bracelet", "chain", "necklace")) return "jewellery";
        if (ContainsAny(value, "ford", "chevrolet", "chevy", "impala", "kenworth", "peterbilt", "freightliner", "dodge", "cadillac", "lincoln", "mustang", "corvette")
            || ContainsWord(value, "truck", "trailer", "boat", "vehicle", "auto", "motorcycle", "snowmobile", "atv", "tractor")
            || Regex.IsMatch(value, @"\b(car|van|suv|jeep|bmw|audi)\b")) return "cars-bikes";
        if (ContainsAny(value, "camera", "leica", "mavic", "drone") || ContainsWord(value, "lens", "photo")) return "photography";
        if (ContainsAny(value, "iphone", "macbook", "bose", "ductless", "amplifier", "stereo", "receiver")
            || ContainsWord(value, "phone", "laptop", "electric", "laser", "speaker", "printer")) return "electronics";
        if (ContainsAny(value, "recliner", "glider", "carport", "candle", "cabinet", "chandelier", "ottoman")
            || ContainsWord(value, "chair", "table", "sofa", "couch", "shelf", "dresser", "bed", "home")) return "interiors";
        if (ContainsAny(value, "guitar", "piano", "violin", "saxophone", "trumpet", "banjo", "ukulele")
            || ContainsWord(value, "speaker", "amp")) return "musical";
        if (ContainsAny(value, "coin", "stamp", "numismatic") || ContainsWord(value, "dollar", "penny", "quarter", "dime", "bullion")) return "coins-stamps";
        if (ContainsAny(value, "book", "comic", "novel", "manuscript")) return "books";
        if (ContainsAny(value, "lego", "figurine") || ContainsWord(value, "toy", "doll", "game")) return "toys";
        if (ContainsAny(value, "painting", "canvas", "sculpture", "artwork", "lithograph", "watercolor")) return "art";
        if (ContainsAny(value, "wine", "whisky", "whiskey", "bourbon", "scotch", "rum", "vodka", "cognac")) return "wine-spirits";
        if (ContainsAny(value, "jersey", "bat", "glove", "helmet", "skis", "surfboard") || ContainsWord(value, "ball", "sport")) return "sports";
        if (ContainsAny(value, "pokemon", "baseball card", "trading card", "stamp collection", "antique")) return "collectibles";

        return "other-items";
    }

    private static bool ContainsAny(string value, params string[] needles) =>
        needles.Any(value.Contains);

    private static bool ContainsWord(string value, params string[] words) =>
        words.Any(word => Regex.IsMatch(value, $@"\b{Regex.Escape(word)}\b"));

    private static decimal BuildFallbackPrice(string title)
    {
        var hash = Math.Abs(title.GetHashCode(StringComparison.Ordinal));
        return 75 + hash % 2400;
    }

    private static string NormalizeTitle(string title) =>
        Regex.Replace(title.Trim().ToLowerInvariant(), @"\s+", " ");
}

internal sealed record ScrapedMarketplaceItem(
    string Source,
    string Title,
    string Url,
    IReadOnlyList<string> ImageUrls,
    string? Description,
    decimal? Price,
    string? Currency,
    int? BidCount);

internal sealed record MarketplaceSourceReport(string Name, int ItemCount, string Message);

internal sealed record MarketplaceScrapeReport(
    IReadOnlyList<ScrapedMarketplaceItem> Items,
    IReadOnlyList<MarketplaceSourceReport> Sources);

internal sealed class MarketplaceScraper : IDisposable
{
    private const int DetailFetchConcurrency = 4;
    private const int MaxDetailImages = 8;

    private static readonly Regex HibidLotRegex = new(
        @"""Lot:(?<id>\d+)"":\{(?<body>.*?)(?=\},""(?:Lot|Auction|Auctioneer|CategoryTree|Link):\d+""|\}\}</script>)",
        RegexOptions.Compiled | RegexOptions.Singleline);

    // Matches LotImage entries embedded in HiBid page JSON: "LotImage:12345_1":{"url":"..."}
    private static readonly Regex HibidLotImageRegex = new(
        @"""LotImage:\d+_\d+"":\{[^}]*?""url"":""(?<url>(?:\\.|[^""\\])*?)""",
        RegexOptions.Compiled | RegexOptions.Singleline);

    private static readonly Regex EbayCardRegex = new(
        @"<li[^>]+class=""[^""]*s-item[^""]*""(?<card>.*?)</li>",
        RegexOptions.Compiled | RegexOptions.Singleline | RegexOptions.IgnoreCase);

    // Matches eBay item page image carousel entries
    private static readonly Regex EbayCarouselImageRegex = new(
        @"<img[^>]+class=""[^""]*ux-image-carousel[^""]*""[^>]+src=""(?<url>https://i\.ebayimg\.com/[^""]+)""",
        RegexOptions.Compiled | RegexOptions.Singleline | RegexOptions.IgnoreCase);

    private static readonly Regex GenericImageRegex = new(
        @"<img[^>]+(?:alt|title)=""(?<title>[^""]{8,180})""[^>]+src=""(?<image>https?://[^""]+)""",
        RegexOptions.Compiled | RegexOptions.Singleline | RegexOptions.IgnoreCase);

    private readonly HttpClient _httpClient = new();

    public MarketplaceScraper()
    {
        _httpClient.Timeout = TimeSpan.FromSeconds(20);
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36");
        _httpClient.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en-US,en;q=0.9");
        _httpClient.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    }

    public async Task<MarketplaceScrapeReport> ScrapeAsync(int maxItems, CancellationToken cancellationToken)
    {
        var allItems = new List<ScrapedMarketplaceItem>();
        var sourceReports = new List<MarketplaceSourceReport>();

        await ScrapeSourceAsync("eBay", "https://www.ebay.com/sch/i.html?_nkw=collectible%20auction&_sop=1&_ipg=25", ParseEbay, allItems, sourceReports, cancellationToken);
        await ScrapeSourceAsync("Catawiki", "https://www.catawiki.com/en", ParseGenericImageListings("Catawiki", "https://www.catawiki.com"), allItems, sourceReports, cancellationToken);
        await ScrapeSourceAsync("Cars & Bids", "https://carsandbids.com/auctions/", ParseGenericImageListings("Cars & Bids", "https://carsandbids.com"), allItems, sourceReports, cancellationToken);
        await ScrapeSourceAsync("HiBid", "https://hibid.com/", ParseHibid, allItems, sourceReports, cancellationToken);
        await ScrapeSourceAsync("HiBid Hot Lots", "https://hibid.com/lots?status=HOT", ParseHibid, allItems, sourceReports, cancellationToken);

        var dedupedItems = allItems
            .Where(item => !string.IsNullOrWhiteSpace(item.Title))
            .GroupBy(item => MarketplaceImporterKey(item), StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First())
            .Take(maxItems)
            .ToList();

        // Enrich items with detail page data (multiple images + descriptions)
        var enriched = await EnrichItemsWithDetailsAsync(dedupedItems, cancellationToken);

        return new MarketplaceScrapeReport(enriched, sourceReports);
    }

    private async Task<List<ScrapedMarketplaceItem>> EnrichItemsWithDetailsAsync(
        List<ScrapedMarketplaceItem> items,
        CancellationToken cancellationToken)
    {
        // HiBid lot detail pages are JavaScript-rendered and return empty responses —
        // all useful data is already extracted from the listing page JSON.
        // Only attempt eBay enrichment (multiple images + meta description from item pages).
        var semaphore = new SemaphoreSlim(DetailFetchConcurrency);
        var tasks = items.Select(async item =>
        {
            if (item.Source != "eBay")
            {
                return item;
            }

            await semaphore.WaitAsync(cancellationToken);
            try
            {
                return await EnrichEbayItemAsync(item, cancellationToken);
            }
            catch
            {
                return item;
            }
            finally
            {
                semaphore.Release();
            }
        });

        return [.. await Task.WhenAll(tasks)];
    }

    private async Task<ScrapedMarketplaceItem> EnrichEbayItemAsync(ScrapedMarketplaceItem item, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(item.Url) || item.Url == "https://www.ebay.com")
        {
            return item;
        }

        var page = await FetchHtmlAsync(item.Url, cancellationToken);
        if (!page.IsSuccess)
        {
            return item;
        }

        // Extract carousel images
        var imageUrls = EbayCarouselImageRegex.Matches(page.Html)
            .Select(m => Decode(m.Groups["url"].Value))
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(MaxDetailImages)
            .ToList();

        // Fall back to the thumbnail from the search card
        if (imageUrls.Count == 0 && item.ImageUrls.Count > 0)
        {
            imageUrls = [.. item.ImageUrls];
        }

        // Extract description from meta tag
        var description = item.Description;
        if (string.IsNullOrWhiteSpace(description))
        {
            var metaDesc = MatchString(page.Html, @"<meta\s+name=""description""\s+content=""(?<value>[^""]{10,600})""");
            if (!string.IsNullOrWhiteSpace(metaDesc))
                description = CleanupDescription(Decode(metaDesc));
        }

        return item with { ImageUrls = imageUrls, Description = description };
    }

    private async Task ScrapeSourceAsync(
        string sourceName,
        string url,
        Func<string, IReadOnlyList<ScrapedMarketplaceItem>> parse,
        List<ScrapedMarketplaceItem> allItems,
        List<MarketplaceSourceReport> sourceReports,
        CancellationToken cancellationToken)
    {
        try
        {
            var page = await FetchHtmlAsync(url, cancellationToken);
            var items = page.IsSuccess ? parse(page.Html) : [];

            if (items.Count == 0)
            {
                var reason = page.IsSuccess ? DetectSkipReason(page.Html) : page.Message;
                sourceReports.Add(new MarketplaceSourceReport(sourceName, 0, reason));
                return;
            }

            allItems.AddRange(items);
            sourceReports.Add(new MarketplaceSourceReport(sourceName, items.Count, "ok"));
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or OperationCanceledException)
        {
            sourceReports.Add(new MarketplaceSourceReport(sourceName, 0, ex.Message));
        }
    }

    private async Task<FetchedPage> FetchHtmlAsync(string url, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.GetAsync(url, cancellationToken);
        var html = await response.Content.ReadAsStringAsync(cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            if (LooksLikeEmptyShell(html))
            {
                var curlPage = await TryFetchWithCurlAsync(url, cancellationToken);
                if (curlPage is not null)
                {
                    return curlPage;
                }
            }

            return new FetchedPage(true, html, "ok");
        }

        if ((int)response.StatusCode == 403)
        {
            var curlPage = await TryFetchWithCurlAsync(url, cancellationToken);
            if (curlPage is not null)
            {
                return curlPage;
            }
        }

        return new FetchedPage(false, html, $"{(int)response.StatusCode} {response.ReasonPhrase}");
    }

    private static bool LooksLikeEmptyShell(string html)
    {
        var trimmed = html.Trim();
        return trimmed is "{}" or "[]" || trimmed.Length < 200;
    }

    private static async Task<FetchedPage?> TryFetchWithCurlAsync(string url, CancellationToken cancellationToken)
    {
        var executable = OperatingSystem.IsWindows() ? "curl.exe" : "curl";
        using var process = new Process();
        process.StartInfo.FileName = executable;
        process.StartInfo.ArgumentList.Add("-sS");
        process.StartInfo.ArgumentList.Add("-L");
        process.StartInfo.ArgumentList.Add("-A");
        process.StartInfo.ArgumentList.Add("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36");
        process.StartInfo.ArgumentList.Add("--max-time");
        process.StartInfo.ArgumentList.Add("20");
        process.StartInfo.ArgumentList.Add("-w");
        process.StartInfo.ArgumentList.Add("\n__HTTP_STATUS__:%{http_code}");
        process.StartInfo.ArgumentList.Add(url);
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.CreateNoWindow = true;

        try
        {
            process.Start();
        }
        catch
        {
            return null;
        }

        var outputTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var errorTask = process.StandardError.ReadToEndAsync(cancellationToken);
        await process.WaitForExitAsync(cancellationToken);

        var output = await outputTask;
        var error = await errorTask;
        var markerIndex = output.LastIndexOf("__HTTP_STATUS__:", StringComparison.Ordinal);
        if (markerIndex < 0)
        {
            return process.ExitCode == 0
                ? new FetchedPage(true, output, "ok")
                : new FetchedPage(false, output, string.IsNullOrWhiteSpace(error) ? $"curl exited {process.ExitCode}" : error.Trim());
        }

        var html = output[..markerIndex].TrimEnd();
        var statusText = output[(markerIndex + "__HTTP_STATUS__:".Length)..].Trim();
        var isSuccess = int.TryParse(statusText, CultureInfo.InvariantCulture, out var statusCode) && statusCode is >= 200 and < 300;

        return new FetchedPage(isSuccess, html, isSuccess ? "ok" : $"{statusText} from curl");
    }

    private static IReadOnlyList<ScrapedMarketplaceItem> ParseHibid(string html)
    {
        var items = new List<ScrapedMarketplaceItem>();

        foreach (Match match in HibidLotRegex.Matches(html))
        {
            var body = match.Groups["body"].Value;
            if (!body.Contains(@"""__typename"":""Lot""", StringComparison.Ordinal))
            {
                continue;
            }

            var title = Decode(JsonString(MatchString(body, @"""lead"":""(?<value>(?:\\.|[^""\\])*)""")));
            var highBid = MatchDecimal(body, @"""highBid"":(?<value>\d+(?:\.\d+)?)");
            var minBid = MatchDecimal(body, @"""minBid"":(?<value>\d+(?:\.\d+)?)");
            var priceRealized = MatchDecimal(body, @"""priceRealized"":(?<value>\d+(?:\.\d+)?)");
            var price = GreatestPositive(highBid, minBid, priceRealized);
            var bidCount = MatchInt(body, @"""bidCount"":(?<value>\d+)");
            var currency = MatchString(body, @"""currencyAbbreviation"":""(?<value>[A-Z]{3})""");

            // Prefer full-size image over thumbnail
            var fullSize = Decode(JsonString(MatchString(body, @"""fullSizeLocation"":""(?<value>(?:\\.|[^""\\])*)""")));
            var thumbnail = Decode(JsonString(MatchString(body, @"""thumbnailLocation"":""(?<value>(?:\\.|[^""\\])*)""")));
            var primaryImage = !string.IsNullOrWhiteSpace(fullSize) ? fullSize
                : !string.IsNullOrWhiteSpace(thumbnail) ? thumbnail
                : null;

            // Description: lot-level field, then auctioneer notes, then picture description
            // (picture description usually just repeats the title, so skip if identical)
            var rawDesc = MatchString(body, @"""lotDescription"":""(?<value>(?:\\.|[^""\\])*)""");
            if (string.IsNullOrWhiteSpace(rawDesc))
                rawDesc = MatchString(body, @"""notes"":""(?<value>(?:\\.|[^""\\])*)""");
            if (string.IsNullOrWhiteSpace(rawDesc))
            {
                var picDesc = Decode(JsonString(MatchString(body, @"""featuredPicture"".*?""description"":""(?<value>(?:\\.|[^""\\])*)""\s*[,}]")));
                if (!string.IsNullOrWhiteSpace(picDesc) && !picDesc.Equals(title, StringComparison.OrdinalIgnoreCase))
                    rawDesc = picDesc;
            }
            var description = string.IsNullOrWhiteSpace(rawDesc) ? null : CleanupDescription(Decode(JsonString(rawDesc)));

            if (title.Length < 4)
            {
                continue;
            }

            var imageUrls = primaryImage is null
                ? (IReadOnlyList<string>)[]
                : [primaryImage];

            items.Add(new ScrapedMarketplaceItem(
                "HiBid",
                CleanupTitle(title),
                $"https://hibid.com/lot/{match.Groups["id"].Value}",
                imageUrls,
                description,
                price,
                currency,
                bidCount));
        }

        return items;
    }

    private static decimal? GreatestPositive(params decimal?[] values)
    {
        var positives = values.Where(value => value is > 0).Cast<decimal>().ToList();
        return positives.Count == 0 ? null : positives.Max();
    }

    private static IReadOnlyList<ScrapedMarketplaceItem> ParseEbay(string html)
    {
        var items = new List<ScrapedMarketplaceItem>();

        foreach (Match match in EbayCardRegex.Matches(html))
        {
            var card = match.Groups["card"].Value;
            var title = CleanupTitle(StripTags(MatchString(card, @"s-item__title[^>]*>(?<value>.*?)</")));
            if (title.Length < 5 || title.Contains("shop on ebay", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var priceText = StripTags(MatchString(card, @"s-item__price[^>]*>(?<value>.*?)</"));
            var image = HtmlAttribute(card, "src");
            var url = HtmlAttribute(card, "href");
            var bidCount = MatchInt(card, @"(?<value>\d+)\s+bids?");

            var imageUrls = string.IsNullOrWhiteSpace(image)
                ? (IReadOnlyList<string>)[]
                : [Decode(image)];

            items.Add(new ScrapedMarketplaceItem(
                "eBay",
                title,
                string.IsNullOrWhiteSpace(url) ? "https://www.ebay.com" : Decode(url),
                imageUrls,
                null,
                ParsePrice(priceText),
                DetectCurrency(priceText),
                bidCount));
        }

        return items;
    }

    private static Func<string, IReadOnlyList<ScrapedMarketplaceItem>> ParseGenericImageListings(string source, string baseUrl) =>
        html =>
        {
            var items = new List<ScrapedMarketplaceItem>();
            foreach (Match match in GenericImageRegex.Matches(html))
            {
                var title = CleanupTitle(Decode(match.Groups["title"].Value));
                var image = Decode(match.Groups["image"].Value);
                if (title.Length < 8 || title.Equals(source, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                items.Add(new ScrapedMarketplaceItem(source, title, baseUrl, [image], null, null, null, null));
            }

            return items;
        };

    private static string DetectSkipReason(string html)
    {
        if (html.Contains("Access Denied", StringComparison.OrdinalIgnoreCase))
            return "access denied by source";

        if (html.Contains("Just a moment", StringComparison.OrdinalIgnoreCase) ||
            html.Contains("challenge-platform", StringComparison.OrdinalIgnoreCase))
            return "anti-bot challenge";

        if (html.Contains("Something went wrong", StringComparison.OrdinalIgnoreCase))
            return "source returned an error page";

        return "no parseable listing cards found";
    }

    private static decimal? MatchDecimal(string value, string pattern)
    {
        var text = MatchString(value, pattern);
        return decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;
    }

    private static int? MatchInt(string value, string pattern)
    {
        var text = MatchString(value, pattern);
        return int.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;
    }

    private static string MatchString(string value, string pattern)
    {
        var match = Regex.Match(value, pattern, RegexOptions.Singleline | RegexOptions.IgnoreCase);
        return match.Success ? match.Groups["value"].Value : string.Empty;
    }

    private static string HtmlAttribute(string html, string attribute)
    {
        var match = Regex.Match(html, $@"\s{attribute}=""(?<value>[^""]+)""", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups["value"].Value : string.Empty;
    }

    private static decimal? ParsePrice(string value)
    {
        var cleaned = Regex.Replace(value, @"[^\d.,]", string.Empty).Replace(",", string.Empty);
        return decimal.TryParse(cleaned, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;
    }

    private static string? DetectCurrency(string value)
    {
        if (value.Contains("USD", StringComparison.OrdinalIgnoreCase) || value.Contains('$')) return "USD";
        if (value.Contains("CAD", StringComparison.OrdinalIgnoreCase)) return "CAD";
        if (value.Contains("EUR", StringComparison.OrdinalIgnoreCase) || value.Contains('€')) return "EUR";
        if (value.Contains("GBP", StringComparison.OrdinalIgnoreCase) || value.Contains('£')) return "GBP";
        return null;
    }

    private static string StripTags(string value) =>
        Regex.Replace(value, "<.*?>", " ");

    private static string CleanupTitle(string title)
    {
        var decoded = Decode(title);
        decoded = Regex.Replace(decoded, @"\s+", " ").Trim();
        return decoded.Length > 180 ? decoded[..180].Trim() : decoded;
    }

    private static string CleanupDescription(string description)
    {
        var cleaned = Regex.Replace(description, @"\s+", " ").Trim();
        // Strip HTML tags that sometimes appear in descriptions
        cleaned = Regex.Replace(cleaned, @"<[^>]+>", " ");
        cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();
        return cleaned.Length > 1200 ? cleaned[..1200].Trim() + "…" : cleaned;
    }

    private static string JsonString(string value)
    {
        try
        {
            return JsonSerializer.Deserialize<string>($"\"{value}\"") ?? value;
        }
        catch (JsonException)
        {
            return value.Replace("\\\"", "\"").Replace("\\/", "/");
        }
    }

    private static string Decode(string value) =>
        WebUtility.HtmlDecode(value).Replace("\\u0026", "&");

    private static string MarketplaceImporterKey(ScrapedMarketplaceItem item) =>
        $"{item.Source}:{Regex.Replace(item.Title.ToLowerInvariant(), @"\s+", " ")}";

    public void Dispose()
    {
        _httpClient.Dispose();
    }

    private sealed record FetchedPage(bool IsSuccess, string Html, string Message);
}
