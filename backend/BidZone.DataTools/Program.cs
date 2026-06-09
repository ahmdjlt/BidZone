using BidZone.BusinessLogic.Helpers;
using BidZone.DataAccess;
using BidZone.DataAccess.Context;
using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

if (args.Length == 0 || !string.Equals(args[0], "seed-real-products", StringComparison.OrdinalIgnoreCase))
{
    Console.WriteLine("Usage:");
    Console.WriteLine("  dotnet run --project BidZone.DataTools -- seed-real-products");
    return 1;
}

LoadEnvironmentFile();

DbSession.ConnectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? throw new InvalidOperationException("DATABASE_URL is required.");

await using var db = new AppDbContext();
await using var transaction = await db.Database.BeginTransactionAsync();

var seller = await db.Users.FirstOrDefaultAsync(user =>
    user.Id == 1000 || user.NormalizedUserName == "BIDZONE");

if (seller == null)
{
    throw new InvalidOperationException("BidZone Admin user was not found.");
}

db.WatchlistItems.RemoveRange(db.WatchlistItems);
db.Bids.RemoveRange(db.Bids);
db.AuctionImages.RemoveRange(db.AuctionImages);
db.Auctions.RemoveRange(db.Auctions);
await db.SaveChangesAsync();

var now = DateTime.UtcNow;
var products = GetRealProducts(now, seller.Id);

await db.Auctions.AddRangeAsync(products);
await db.SaveChangesAsync();
await transaction.CommitAsync();

Console.WriteLine($"Deleted all bids and listings, then inserted {products.Count} listings for @{seller.UserName}.");
return 0;

static List<Auction> GetRealProducts(DateTime now, int sellerId)
{
    return
    [
        CreateAuction(
            "Apple iPhone 15 Pro Max 256GB - Natural Titanium",
            "Unlocked Apple iPhone 15 Pro Max with 256GB storage, natural titanium finish, original box, USB-C cable, and clean battery health report.",
            10,
            829,
            980,
            now,
            now.AddDays(5),
            sellerId,
            [
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Apple MacBook Pro 16-inch M3 Pro",
            "Space black 16-inch MacBook Pro configured with an M3 Pro chip, 18GB unified memory, 512GB SSD, MagSafe charger, and original packaging.",
            10,
            1849,
            2200,
            now,
            now.AddDays(8),
            sellerId,
            [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Sony Alpha 7 IV Mirrorless Camera Body",
            "Sony A7 IV full-frame mirrorless camera body with 33MP sensor, 4K recording, battery, charger, strap, and body cap.",
            15,
            1499,
            1780,
            now,
            now.AddDays(6),
            sellerId,
            [
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Canon RF 24-70mm f/2.8L IS USM Lens",
            "Professional Canon RF 24-70mm f/2.8L IS USM zoom lens with hood, caps, pouch, clean glass, and smooth autofocus.",
            15,
            1390,
            1650,
            now,
            now.AddDays(7),
            sellerId,
            [
                "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1617005082141-00c759b7c2b2?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Rolex Datejust 36 Two-Tone Automatic Watch",
            "Rolex Datejust 36 in stainless steel and yellow gold with automatic movement, fluted bezel, Jubilee bracelet, and service paperwork.",
            4,
            6950,
            8200,
            now,
            now.AddDays(10),
            sellerId,
            [
                "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Omega Speedmaster Professional Moonwatch",
            "Omega Speedmaster Professional Moonwatch with hesalite crystal, manual-wind chronograph movement, bracelet, presentation box, and papers.",
            4,
            4100,
            4850,
            now,
            now.AddDays(9),
            sellerId,
            [
                "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Nike Air Jordan 1 Retro High OG Chicago",
            "Authentic Air Jordan 1 Retro High OG Chicago pair with red, white, and black leather panels, original box, and extra laces.",
            5,
            390,
            520,
            now,
            now.AddDays(4),
            sellerId,
            [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Louis Vuitton Keepall Bandouliere 45 Travel Bag",
            "Louis Vuitton Keepall Bandouliere 45 monogram travel bag with shoulder strap, leather trim, brass hardware, and dust bag.",
            5,
            980,
            1200,
            now,
            now.AddDays(11),
            sellerId,
            [
                "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Herman Miller Aeron Chair - Size B",
            "Herman Miller Aeron ergonomic office chair in graphite, size B, with PostureFit support, adjustable arms, and smooth casters.",
            2,
            620,
            780,
            now,
            now.AddDays(6),
            sellerId,
            [
                "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Brompton C Line Explore Folding Bike",
            "Brompton C Line Explore six-speed folding bicycle with steel frame, mudguards, front carrier block, and compact city setup.",
            8,
            1050,
            1280,
            now,
            now.AddDays(7),
            sellerId,
            [
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Bose QuietComfort Ultra Wireless Headphones",
            "Bose QuietComfort Ultra wireless noise-cancelling headphones with spatial audio, carrying case, audio cable, and USB-C charging cable.",
            10,
            245,
            320,
            now,
            now.AddDays(3),
            sellerId,
            [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "DJI Mini 4 Pro Fly More Combo",
            "DJI Mini 4 Pro drone bundle with controller, three batteries, charging hub, propellers, shoulder bag, and 4K camera gimbal.",
            10,
            710,
            880,
            now,
            now.AddDays(8),
            sellerId,
            [
                "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Gibson Les Paul Standard '50s Electric Guitar",
            "Gibson Les Paul Standard '50s electric guitar with mahogany body, maple top, humbucker pickups, hard case, and setup paperwork.",
            16,
            1890,
            2250,
            now,
            now.AddDays(12),
            sellerId,
            [
                "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "LEGO Star Wars Millennium Falcon Collector Set",
            "Large LEGO Star Wars Millennium Falcon collector set with numbered bags, instruction book, display minifigures, and original box.",
            14,
            540,
            690,
            now,
            now.AddDays(5),
            sellerId,
            [
                "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Leica M6 35mm Film Camera Body",
            "Leica M6 35mm rangefinder film camera body in black chrome with working meter, clean viewfinder, and smooth film advance.",
            11,
            3250,
            3900,
            now,
            now.AddDays(9),
            sellerId,
            [
                "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=85"
            ]),
        CreateAuction(
            "Dyson Supersonic Hair Dryer - Nickel Copper",
            "Dyson Supersonic hair dryer in nickel copper with magnetic styling attachments, presentation case, and original power cord.",
            10,
            260,
            340,
            now,
            now.AddDays(4),
            sellerId,
            [
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
                "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=85"
            ])
    ];
}

static Auction CreateAuction(
    string title,
    string description,
    int categoryId,
    decimal startingPrice,
    decimal reservePrice,
    DateTime startTime,
    DateTime endTime,
    int sellerId,
    IReadOnlyList<string> imageUrls)
{
    return new Auction
    {
        Title = title,
        Slug = SlugHelper.GenerateSlug(title),
        Description = description,
        ImageUrl = imageUrls[0],
        StartingPrice = startingPrice,
        CurrentPrice = startingPrice,
        ReservePrice = reservePrice,
        StartTime = startTime,
        EndTime = endTime,
        Status = "Active",
        SellerId = sellerId,
        CategoryId = categoryId,
        ConcurrencyStamp = Guid.NewGuid(),
        Images = imageUrls
            .Select((url, index) => new AuctionImage
            {
                Url = url,
                SortOrder = index
            })
            .ToList()
    };
}

static void LoadEnvironmentFile()
{
    var currentDirectory = Directory.GetCurrentDirectory();
    var candidates = new[]
    {
        Path.Combine(currentDirectory, ".env"),
        Path.Combine(currentDirectory, "BidZone.Api", ".env"),
        Path.Combine(currentDirectory, "backend", "BidZone.Api", ".env")
    };

    foreach (var candidate in candidates)
    {
        if (!File.Exists(candidate))
        {
            continue;
        }

        foreach (var line in File.ReadAllLines(candidate))
        {
            var trimmed = line.Trim();
            if (trimmed.Length == 0 || trimmed.StartsWith('#'))
            {
                continue;
            }

            var separatorIndex = trimmed.IndexOf('=');
            if (separatorIndex <= 0)
            {
                continue;
            }

            var key = trimmed[..separatorIndex].Trim();
            var value = trimmed[(separatorIndex + 1)..].Trim().Trim('"');
            Environment.SetEnvironmentVariable(key, value);
        }

        return;
    }
}
