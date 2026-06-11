# BidZone Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add slug routing, TanStack Query caching, proper error handling, and frontend cleanup to BidZone.

**Architecture:** Slugs are stored in the `Auctions` table (migration backfills existing rows), exposed via a new `GET /api/auctions/slug/{slug}` endpoint, and propagated through all DTOs. TanStack Query replaces direct-fetch patterns in the frontend; the 5-second polling interval is removed. A global exception middleware on the backend and an error boundary on the frontend ensure unhandled errors surface cleanly.

**Tech Stack:** ASP.NET Core 10 (backend), Next.js 16 App Router + React 19 + TypeScript + Zustand + TanStack Query (frontend), PostgreSQL + EF Core (database).

---

## Task 1: Backend — SlugHelper, Auction entity, DTOs, Mappers

**Files:**
- Create: `backend/BidZone.BusinessLogic/Helpers/SlugHelper.cs`
- Modify: `backend/BidZone.Domains/Entities/Auction.cs`
- Modify: `backend/BidZone.Domains/DTOs/AuctionDto.cs`
- Modify: `backend/BidZone.Domains/DTOs/AuctionSummaryDto.cs`
- Modify: `backend/BidZone.Domains/DTOs/BidDto.cs`
- Modify: `backend/BidZone.Domains/DTOs/WatchlistDto.cs`
- Modify: `backend/BidZone.BusinessLogic/Core/Mappers.cs`

- [ ] **Step 1: Create SlugHelper**

Create `backend/BidZone.BusinessLogic/Helpers/SlugHelper.cs`:

```csharp
using System.Text.RegularExpressions;

namespace BidZone.BusinessLogic.Helpers;

public static partial class SlugHelper
{
    private const string Chars = "abcdefghijklmnopqrstuvwxyz0123456789";

    public static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = NonAlphanumericSpaceRegex().Replace(slug, "");
        slug = WhitespaceRegex().Replace(slug, "-");
        slug = slug.Trim('-');
        var suffix = GenerateSuffix(4);
        return $"{slug}-{suffix}";
    }

    private static string GenerateSuffix(int length) =>
        new(Enumerable.Range(0, length)
            .Select(_ => Chars[Random.Shared.Next(Chars.Length)])
            .ToArray());

    [GeneratedRegex(@"[^a-z0-9\s]")]
    private static partial Regex NonAlphanumericSpaceRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
```

- [ ] **Step 2: Add Slug to Auction entity**

In `backend/BidZone.Domains/Entities/Auction.cs`, add after `Status`:

```csharp
[MaxLength(255)]
public string Slug { get; set; } = string.Empty;
```

- [ ] **Step 3: Add Slug to AuctionDto**

In `backend/BidZone.Domains/DTOs/AuctionDto.cs`, add after `Status`:

```csharp
public string Slug { get; set; } = string.Empty;
```

- [ ] **Step 4: Add Slug to AuctionSummaryDto**

In `backend/BidZone.Domains/DTOs/AuctionSummaryDto.cs`, add after `Status`:

```csharp
public string Slug { get; set; } = string.Empty;
```

- [ ] **Step 5: Add AuctionSlug to BidDto**

In `backend/BidZone.Domains/DTOs/BidDto.cs`, add after `AuctionTitle`:

```csharp
public string AuctionSlug { get; set; } = string.Empty;
```

- [ ] **Step 6: Add AuctionSlug to WatchlistDto**

In `backend/BidZone.Domains/DTOs/WatchlistDto.cs`, add after `AuctionTitle`:

```csharp
public string AuctionSlug { get; set; } = string.Empty;
```

- [ ] **Step 7: Update Mappers**

In `backend/BidZone.BusinessLogic/Core/Mappers.cs`:

Replace the `ToDto(Auction a)` method body — add `Slug = a.Slug,` after `Status = a.Status,`:

```csharp
public static AuctionDto ToDto(Auction a) => new()
{
    Id = a.Id,
    Title = a.Title,
    Description = a.Description,
    ImageUrl = a.ImageUrl,
    Images = a.Images?
        .OrderBy(image => image.SortOrder)
        .Select(image => new AuctionImageDto
        {
            Id = image.Id,
            Url = image.Url,
            SortOrder = image.SortOrder
        })
        .ToList() ?? [],
    StartingPrice = a.StartingPrice,
    CurrentPrice = a.CurrentPrice,
    ReservePrice = a.ReservePrice,
    StartTime = a.StartTime,
    EndTime = a.EndTime,
    Status = a.Status,
    Slug = a.Slug,
    SellerId = a.SellerId,
    SellerUsername = a.Seller?.UserName ?? string.Empty,
    CategoryId = a.CategoryId,
    CategoryName = a.Category?.Name ?? string.Empty,
    CategorySlug = a.Category?.Slug ?? string.Empty,
    BidCount = a.Bids?.Count ?? 0
};
```

Replace the `ToDto(Bid b)` method body — add `AuctionSlug = b.Auction?.Slug ?? string.Empty,` after `AuctionTitle`:

```csharp
public static BidDto ToDto(Bid b) => new()
{
    Id = b.Id,
    Amount = b.Amount,
    PlacedAt = b.PlacedAt,
    Status = b.Status,
    AuctionId = b.AuctionId,
    AuctionTitle = b.Auction?.Title ?? string.Empty,
    AuctionSlug = b.Auction?.Slug ?? string.Empty,
    BidderId = b.BidderId,
    BidderUsername = b.Bidder?.UserName ?? string.Empty
};
```

Replace the `ToDto(WatchlistItem w)` method body — add `AuctionSlug = w.Auction?.Slug ?? string.Empty,` after `AuctionTitle`:

```csharp
public static WatchlistDto ToDto(WatchlistItem w) => new()
{
    Id = w.Id,
    AuctionId = w.AuctionId,
    AuctionTitle = w.Auction?.Title ?? string.Empty,
    AuctionSlug = w.Auction?.Slug ?? string.Empty,
    AuctionImageUrl = w.Auction?.ImageUrl,
    CurrentPrice = w.Auction?.CurrentPrice ?? 0,
    EndTime = w.Auction?.EndTime ?? DateTime.MinValue,
    Status = w.Auction?.Status ?? string.Empty,
    AddedAt = w.AddedAt
};
```

- [ ] **Step 8: Build backend to confirm no compile errors**

```powershell
cd backend
dotnet build BidZone.sln
```

Expected: `Build succeeded.`

- [ ] **Step 9: Commit**

```bash
git add backend/BidZone.BusinessLogic/Helpers/SlugHelper.cs \
        backend/BidZone.Domains/Entities/Auction.cs \
        backend/BidZone.Domains/DTOs/AuctionDto.cs \
        backend/BidZone.Domains/DTOs/AuctionSummaryDto.cs \
        backend/BidZone.Domains/DTOs/BidDto.cs \
        backend/BidZone.Domains/DTOs/WatchlistDto.cs \
        backend/BidZone.BusinessLogic/Core/Mappers.cs
git commit -m "add slug field to auction, bid, and watchlist DTOs"
```

---

## Task 2: Backend — EF Core Migration + AppDbContext Slug index

**Files:**
- Modify: `backend/BidZone.DataAccess/Context/AppDbContext.cs`
- Create: `backend/BidZone.DataAccess/Migrations/20260515000000_AddAuctionSlug.cs`

- [ ] **Step 1: Add unique index for Slug in AppDbContext**

In `backend/BidZone.DataAccess/Context/AppDbContext.cs`, in `OnModelCreating`, find the `Auction` entity configuration block and add the Slug index:

```csharp
modelBuilder.Entity<Auction>(e =>
{
    e.HasOne(a => a.Seller).WithMany(u => u.Auctions).HasForeignKey(a => a.SellerId).OnDelete(DeleteBehavior.Restrict);
    e.HasOne(a => a.Category).WithMany(c => c.Auctions).HasForeignKey(a => a.CategoryId);
    e.HasIndex(a => a.Slug).IsUnique();
});
```

- [ ] **Step 2: Generate the EF Core migration**

```powershell
cd backend
dotnet ef migrations add AddAuctionSlug --project BidZone.DataAccess --startup-project BidZone.Api
```

Expected: a new file appears at `backend/BidZone.DataAccess/Migrations/<timestamp>_AddAuctionSlug.cs`.

- [ ] **Step 3: Edit the generated migration to add backfill SQL**

Open the generated `<timestamp>_AddAuctionSlug.cs` file. The `Up` method will have `AddColumn` for `Slug`. Edit it so it:
1. Adds the column as nullable first
2. Runs backfill SQL
3. Makes it not-null and adds the index

Replace the entire `Up` and `Down` methods with:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "Slug",
        table: "Auctions",
        type: "character varying(255)",
        maxLength: 255,
        nullable: true);

    migrationBuilder.Sql(@"
        UPDATE ""Auctions""
        SET ""Slug"" = lower(
            regexp_replace(
                regexp_replace(""Title"", '[^a-zA-Z0-9 ]', '', 'g'),
                '\s+', '-', 'g'
            )
        ) || '-' || CAST(""Id"" AS text)
        WHERE ""Slug"" IS NULL;
    ");

    migrationBuilder.AlterColumn<string>(
        name: "Slug",
        table: "Auctions",
        type: "character varying(255)",
        maxLength: 255,
        nullable: false,
        oldClrType: typeof(string),
        oldType: "character varying(255)",
        oldNullable: true);

    migrationBuilder.CreateIndex(
        name: "IX_Auctions_Slug",
        table: "Auctions",
        column: "Slug",
        unique: true);
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropIndex(
        name: "IX_Auctions_Slug",
        table: "Auctions");

    migrationBuilder.DropColumn(
        name: "Slug",
        table: "Auctions");
}
```

- [ ] **Step 4: Apply the migration**

```powershell
dotnet ef database update --project BidZone.DataAccess --startup-project BidZone.Api
```

Expected: `Done.`

- [ ] **Step 5: Commit**

```bash
git add backend/BidZone.DataAccess/Context/AppDbContext.cs \
        backend/BidZone.DataAccess/Migrations/
git commit -m "add auction slug migration with backfill"
```

---

## Task 3: Backend — GetBySlug endpoint

**Files:**
- Modify: `backend/BidZone.BusinessLogic/Core/AuctionLogic.cs`
- Modify: `backend/BidZone.BusinessLogic/Interface/IAuctionLogic.cs`
- Modify: `backend/BidZone.BusinessLogic/Structure/AuctionExecution.cs`
- Modify: `backend/BidZone.Api/Controllers/AuctionsController.cs`
- Modify: `backend/BidZone.BusinessLogic/Core/AuctionLogic.cs` (CreateExecution)

- [ ] **Step 1: Add GetBySlugExecution to AuctionLogic**

In `backend/BidZone.BusinessLogic/Core/AuctionLogic.cs`, add after `GetByIdExecution`:

```csharp
internal async Task<AuctionDto?> GetBySlugExecution(string slug)
{
    using var db = new AppDbContext();
    var auction = await db.Auctions
        .Include(a => a.Seller)
        .Include(a => a.Category)
        .Include(a => a.Images)
        .Include(a => a.Bids).ThenInclude(b => b.Bidder)
        .FirstOrDefaultAsync(a => a.Slug == slug);
    return auction == null ? null : Mappers.ToDto(auction);
}
```

- [ ] **Step 2: Add slug generation to CreateExecution**

In `backend/BidZone.BusinessLogic/Core/AuctionLogic.cs`, add the using at the top:

```csharp
using BidZone.BusinessLogic.Helpers;
```

In `CreateExecution`, add `Slug = SlugHelper.GenerateSlug(dto.Title),` to the `new Auction` initializer:

```csharp
var auction = new Auction
{
    Title = dto.Title,
    Description = dto.Description,
    ImageUrl = dto.ImageUrl,
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
```

- [ ] **Step 3: Add GetBySlugAsync to IAuctionLogic**

In `backend/BidZone.BusinessLogic/Interface/IAuctionLogic.cs`, add after `GetByIdAsync`:

```csharp
Task<AuctionDto?> GetBySlugAsync(string slug);
```

- [ ] **Step 4: Add delegation in AuctionExecution**

In `backend/BidZone.BusinessLogic/Structure/AuctionExecution.cs`, add after `GetByIdAsync`:

```csharp
public Task<AuctionDto?> GetBySlugAsync(string slug) => GetBySlugExecution(slug);
```

- [ ] **Step 5: Add GET api/auctions/slug/{slug} to AuctionsController**

In `backend/BidZone.Api/Controllers/AuctionsController.cs`, add before the `[HttpGet("{id}")]` action (order matters — slug route must come first):

```csharp
[HttpGet("slug/{slug}")]
public async Task<IActionResult> GetBySlug(string slug)
{
    var auction = await _auction.GetBySlugAsync(slug);
    if (auction == null)
        return NotFound();
    return Ok(auction);
}
```

- [ ] **Step 6: Build backend**

```powershell
cd backend
dotnet build BidZone.sln
```

Expected: `Build succeeded.`

- [ ] **Step 7: Commit**

```bash
git add backend/BidZone.BusinessLogic/Core/AuctionLogic.cs \
        backend/BidZone.BusinessLogic/Interface/IAuctionLogic.cs \
        backend/BidZone.BusinessLogic/Structure/AuctionExecution.cs \
        backend/BidZone.Api/Controllers/AuctionsController.cs
git commit -m "add GetBySlug endpoint and auto-generate slug on create"
```

---

## Task 4: Backend — Fix BidLogic race condition + Global exception middleware

**Files:**
- Modify: `backend/BidZone.BusinessLogic/Core/BidLogic.cs`
- Create: `backend/BidZone.Api/Middleware/ExceptionMiddleware.cs`
- Modify: `backend/BidZone.Api/Program.cs`

- [ ] **Step 1: Fix BidLogic SaveChangesAsync race condition**

In `backend/BidZone.BusinessLogic/Core/BidLogic.cs`, replace the block from `db.WatchlistItems.Add` through `catch (DbUpdateException)` with two separate saves:

```csharp
db.Bids.Add(bid);
auction.CurrentPrice = dto.Amount;
await db.SaveChangesAsync(); // bid + price — always succeeds or throws

try
{
    if (!alreadyWatching)
    {
        using var watchlistDb = new AppDbContext();
        watchlistDb.WatchlistItems.Add(new WatchlistItem
        {
            UserId = bidderId,
            AuctionId = dto.AuctionId,
            AddedAt = DateTime.UtcNow
        });
        await watchlistDb.SaveChangesAsync();
    }
}
catch (DbUpdateException)
{
    // Race condition: watchlist item inserted concurrently — bid was already saved
}
```

The full `PlaceBidExecution` method after the fix:

```csharp
internal async Task<BidDto?> PlaceBidExecution(PlaceBidDto dto, int bidderId)
{
    using var db = new AppDbContext();

    var auction = await db.Auctions.FirstOrDefaultAsync(a => a.Id == dto.AuctionId);
    if (auction == null)
        return null;

    if (auction.Status == "Active" && auction.EndTime <= DateTime.UtcNow)
    {
        var finalization = new AuctionFinalizationExecution();
        await finalization.FinalizeAuctionIfExpiredAsync(dto.AuctionId);
        return null;
    }

    if (auction.Status != "Active") return null;
    if (auction.SellerId == bidderId) return null;
    if (dto.Amount <= auction.CurrentPrice) return null;

    var previousHighest = await db.Bids
        .Where(b => b.AuctionId == dto.AuctionId)
        .OrderByDescending(b => b.Amount)
        .FirstOrDefaultAsync();

    if (previousHighest != null && previousHighest.BidderId == bidderId)
        return null;

    if (previousHighest != null)
        previousHighest.Status = "Outbid";

    var bid = new Bid
    {
        Amount = dto.Amount,
        PlacedAt = DateTime.UtcNow,
        Status = "Winning",
        AuctionId = dto.AuctionId,
        BidderId = bidderId
    };
    db.Bids.Add(bid);
    auction.CurrentPrice = dto.Amount;
    await db.SaveChangesAsync();

    var alreadyWatching = await db.WatchlistItems.AnyAsync(w => w.UserId == bidderId && w.AuctionId == dto.AuctionId);
    try
    {
        if (!alreadyWatching)
        {
            using var watchlistDb = new AppDbContext();
            watchlistDb.WatchlistItems.Add(new WatchlistItem
            {
                UserId = bidderId,
                AuctionId = dto.AuctionId,
                AddedAt = DateTime.UtcNow
            });
            await watchlistDb.SaveChangesAsync();
        }
    }
    catch (DbUpdateException)
    {
        // Race condition: watchlist item inserted concurrently — bid was already saved
    }

    var created = await db.Bids
        .Include(b => b.Bidder)
        .Include(b => b.Auction)
        .FirstAsync(b => b.Id == bid.Id);
    return Mappers.ToDto(created);
}
```

- [ ] **Step 2: Create ExceptionMiddleware**

Create `backend/BidZone.Api/Middleware/ExceptionMiddleware.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;

namespace BidZone.Api.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IWebHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";

            var problem = new ProblemDetails
            {
                Status = 500,
                Title = "An unexpected error occurred.",
                Detail = env.IsDevelopment() ? ex.Message : null
            };

            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}
```

- [ ] **Step 3: Register ExceptionMiddleware in Program.cs**

In `backend/BidZone.Api/Program.cs`, add at the very top of the middleware pipeline — immediately after `var app = builder.Build();` and before the `if (app.Environment.IsDevelopment())` block:

```csharp
app.UseMiddleware<BidZone.Api.Middleware.ExceptionMiddleware>();
```

- [ ] **Step 4: Build backend**

```powershell
cd backend
dotnet build BidZone.sln
```

Expected: `Build succeeded.`

- [ ] **Step 5: Commit**

```bash
git add backend/BidZone.BusinessLogic/Core/BidLogic.cs \
        backend/BidZone.Api/Middleware/ExceptionMiddleware.cs \
        backend/BidZone.Api/Program.cs
git commit -m "fix bid race condition and add global exception middleware"
```

---

## Task 5: Frontend — Install TanStack Query + QueryProvider + ErrorBoundary

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Create: `frontend/components/providers/QueryProvider.tsx`
- Create: `frontend/components/ErrorBoundary.tsx`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Install packages**

```powershell
cd frontend
npm install @tanstack/react-query
npm install --save-dev @tanstack/react-query-devtools
```

Expected: packages added to `package.json`.

- [ ] **Step 2: Create QueryProvider**

Create `frontend/components/providers/QueryProvider.tsx`:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Create ErrorBoundary**

Create `frontend/components/ErrorBoundary.tsx`:

```tsx
"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center p-8">
            <div className="max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
              <p className="text-sm font-semibold text-red-700">Something went wrong</p>
              <p className="mt-1 text-xs text-red-600">{this.state.message}</p>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, message: "" })}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 4: Update layout.tsx to include QueryProvider and ErrorBoundary**

Replace the content of `frontend/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import AuthBootstrapper from "@/components/auth/AuthBootstrapper";
import ThemeProvider from "@/components/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BidZone | Live Auction Marketplace",
  description:
    "BidZone helps buyers discover live auctions and sellers launch listings with real-time competition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        <QueryProvider>
          <ErrorBoundary>
            <ThemeProvider>
              <AuthBootstrapper />
              {children}
            </ThemeProvider>
          </ErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json \
        frontend/components/providers/QueryProvider.tsx \
        frontend/components/ErrorBoundary.tsx \
        frontend/app/layout.tsx
git commit -m "add TanStack Query, QueryProvider, and ErrorBoundary"
```

---

## Task 6: Frontend — TypeScript types + API function + Query hooks

**Files:**
- Modify: `frontend/types/auction.ts`
- Modify: `frontend/types/bid.ts`
- Modify: `frontend/lib/api/auctions.ts`
- Create: `frontend/hooks/queries/useAuction.ts`
- Create: `frontend/hooks/queries/useAuctions.ts`
- Create: `frontend/hooks/queries/useCategories.ts`
- Create: `frontend/hooks/queries/useBidHistory.ts`

- [ ] **Step 1: Add slug to Auction and AuctionSummary types**

In `frontend/types/auction.ts`, add `slug: string;` to `Auction` after `status`:

```typescript
export interface Auction {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  images: AuctionImage[];
  startingPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  startTime: string;
  endTime: string;
  status: "Active" | "Closed" | "Cancelled" | "Draft";
  slug: string;
  sellerId: number;
  sellerUsername: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  bidCount: number;
}
```

Add `slug: string;` to `AuctionSummary` after `status`:

```typescript
export interface AuctionSummary {
  id: number;
  title: string;
  imageUrl: string | null;
  currentPrice: number;
  endTime: string;
  status: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  bidCount: number;
}
```

Add `auctionSlug: string;` to `WatchlistItem` after `auctionTitle`:

```typescript
export interface WatchlistItem {
  id: number;
  auctionId: number;
  auctionTitle: string;
  auctionSlug: string;
  auctionImageUrl: string | null;
  currentPrice: number;
  endTime: string;
  status: string;
  addedAt: string;
}
```

- [ ] **Step 2: Add auctionSlug to Bid type**

In `frontend/types/bid.ts`, add `auctionSlug: string;` after `auctionTitle`:

```typescript
export interface Bid {
  id: number;
  amount: number;
  placedAt: string;
  status: "Active" | "Winning" | "Outbid" | "Won" | "Lost";
  auctionId: number;
  auctionTitle: string;
  auctionSlug: string;
  bidderId: number;
  bidderUsername: string;
}
```

- [ ] **Step 3: Add getAuctionBySlug to lib/api/auctions.ts**

In `frontend/lib/api/auctions.ts`, add after `getAuctionById`:

```typescript
export async function getAuctionBySlug(slug: string): Promise<Auction> {
  return apiFetch<Auction>(`/api/auctions/slug/${encodeURIComponent(slug)}`);
}
```

- [ ] **Step 4: Create useAuction hook**

Create `frontend/hooks/queries/useAuction.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getAuctionBySlug } from "@/lib/api/auctions";

export function useAuction(slug: string) {
  return useQuery({
    queryKey: ["auction", slug],
    queryFn: () => getAuctionBySlug(slug),
    staleTime: 30_000,
    enabled: !!slug,
  });
}
```

- [ ] **Step 5: Create useAuctions hook**

Create `frontend/hooks/queries/useAuctions.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getAuctions, type AuctionFilters } from "@/lib/api/auctions";

export function useAuctions(filters?: AuctionFilters) {
  return useQuery({
    queryKey: ["auctions", filters],
    queryFn: () => getAuctions(filters),
    staleTime: 60_000,
  });
}
```

- [ ] **Step 6: Create useCategories hook**

Create `frontend/hooks/queries/useCategories.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/auctions";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  });
}
```

- [ ] **Step 7: Create useBidHistory hook**

Create `frontend/hooks/queries/useBidHistory.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getBidsByAuction } from "@/lib/api/bids";

export function useBidHistory(auctionId: number | undefined) {
  return useQuery({
    queryKey: ["bids", auctionId],
    queryFn: () => getBidsByAuction(auctionId!),
    staleTime: 10_000,
    enabled: !!auctionId,
  });
}
```

- [ ] **Step 8: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add frontend/types/auction.ts \
        frontend/types/bid.ts \
        frontend/lib/api/auctions.ts \
        frontend/hooks/queries/
git commit -m "add slug types and TanStack Query hooks"
```

---

## Task 7: Frontend — API client 30-second timeout

**Files:**
- Modify: `frontend/lib/api/client.ts`

- [ ] **Step 1: Add AbortController timeout to apiFetch**

Replace the `apiFetch` function in `frontend/lib/api/client.ts`:

```typescript
export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { retryOnAuthFailure = true, skipAuth = false, headers: initialHeaders, signal: externalSignal, ...requestInit } = options;
  const headers = new Headers(initialHeaders);

  if (requestInit.body && !(requestInit.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken && !skipAuth && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  if (externalSignal) {
    externalSignal.addEventListener("abort", () => controller.abort());
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      credentials: "include",
      headers,
      signal: controller.signal,
      ...requestInit,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401 && !skipAuth && retryOnAuthFailure) {
    const session = await refreshAccessToken();
    if (session) {
      return apiFetch<T>(url, { ...options, retryOnAuthFailure: false });
    }
  }

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
```

Also update `ApiFetchOptions` to expose `signal`:

```typescript
export interface ApiFetchOptions extends RequestInit {
  retryOnAuthFailure?: boolean;
  skipAuth?: boolean;
}
```

(`RequestInit` already includes `signal?: AbortSignal`, so no change needed here — the destructuring of `signal: externalSignal` from `options` handles it.)

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/api/client.ts
git commit -m "add 30s timeout to apiFetch via AbortController"
```

---

## Task 8: Frontend — WebSocket reconnect with exponential backoff

**Files:**
- Modify: `frontend/lib/socket.ts`

- [ ] **Step 1: Rewrite AuctionSocket with reconnect logic**

Replace the entire content of `frontend/lib/socket.ts`:

```typescript
import type { Bid } from "@/types/bid";
import { getApiBase } from "@/lib/api/client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || getApiBase();

type SocketEvent = "connect" | "disconnect" | "connecting" | "connection_failed" | "new-bid";

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30_000;

class AuctionSocket {
  private ws: WebSocket | null = null;
  private auctionId: string | number | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalDisconnect = false;

  private handlers = {
    connect: new Set<() => void>(),
    disconnect: new Set<() => void>(),
    connecting: new Set<() => void>(),
    connection_failed: new Set<() => void>(),
    "new-bid": new Set<(bid: Bid) => void>(),
  };

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  on(event: "connect" | "disconnect" | "connecting" | "connection_failed", handler: () => void): void;
  on(event: "new-bid", handler: (bid: Bid) => void): void;
  on(event: SocketEvent, handler: (() => void) | ((bid: Bid) => void)): void {
    if (event === "new-bid") {
      this.handlers[event].add(handler as (bid: Bid) => void);
    } else {
      this.handlers[event].add(handler as () => void);
    }
  }

  off(event: "connect" | "disconnect" | "connecting" | "connection_failed", handler: () => void): void;
  off(event: "new-bid", handler: (bid: Bid) => void): void;
  off(event: SocketEvent, handler: (() => void) | ((bid: Bid) => void)): void {
    if (event === "new-bid") {
      this.handlers[event].delete(handler as (bid: Bid) => void);
    } else {
      this.handlers[event].delete(handler as () => void);
    }
  }

  emit(event: "join-auction" | "leave-auction", auctionId: string | number): void {
    if (event === "join-auction") {
      this.connect(auctionId);
    } else if (this.auctionId === auctionId) {
      this.disconnect();
    }
  }

  connect(auctionId: string | number): void {
    if (this.connected && this.auctionId === auctionId) return;
    this.clearReconnectTimeout();
    this.isIntentionalDisconnect = false;
    this.reconnectAttempts = 0;
    this.auctionId = auctionId;
    this.openWebSocket(auctionId);
  }

  disconnect(): void {
    this.isIntentionalDisconnect = true;
    this.clearReconnectTimeout();
    this.closeWebSocket();
    this.auctionId = null;
    this.reconnectAttempts = 0;
  }

  private openWebSocket(auctionId: string | number): void {
    this.closeWebSocket();
    this.dispatch("connecting");

    const url = new URL(`/ws/auctions/${auctionId}`, SOCKET_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.dispatch("connect");
    });

    this.ws.addEventListener("close", () => {
      this.dispatch("disconnect");
      if (!this.isIntentionalDisconnect && this.auctionId != null) {
        this.scheduleReconnect(this.auctionId);
      }
    });

    this.ws.addEventListener("error", () => {
      // close event will fire after error, reconnect handled there
    });

    this.ws.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data as string) as { type?: string; bid?: Bid };
        if (message.type === "new-bid" && message.bid) {
          this.handlers["new-bid"].forEach((h) => h(message.bid!));
        }
      } catch {
        // ignore malformed messages
      }
    });
  }

  private scheduleReconnect(auctionId: string | number): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.dispatch("connection_failed");
      return;
    }

    const delay = Math.min(BASE_DELAY_MS * 2 ** this.reconnectAttempts, MAX_DELAY_MS);
    this.reconnectAttempts += 1;

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isIntentionalDisconnect) {
        this.openWebSocket(auctionId);
      }
    }, delay);
  }

  private closeWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout != null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private dispatch(event: "connect" | "disconnect" | "connecting" | "connection_failed"): void {
    this.handlers[event].forEach((h) => h());
  }
}

let socket: AuctionSocket | null = null;

export function connectSocket(): AuctionSocket {
  socket ??= new AuctionSocket();
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): AuctionSocket | null {
  return socket;
}

export function subscribeToAuction(auctionId: string | number): void {
  const s = socket ?? connectSocket();
  s.emit("join-auction", auctionId);
}

export function unsubscribeFromAuction(auctionId: string | number): void {
  socket?.emit("leave-auction", auctionId);
}
```

- [ ] **Step 2: Update useSocket hook to handle new events**

In `frontend/hooks/useSocket.ts`, update the `SocketEvent` subscriptions to handle the new `connecting` and `connection_failed` events:

```typescript
"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, subscribeToAuction, unsubscribeFromAuction } from "@/lib/socket";
import { useBidStore } from "@/store/bidStore";
import type { Bid } from "@/types/bid";

export function useSocket(auctionId?: string | number) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastBid, setLastBid] = useState<Bid | null>(null);
  const addBid = useBidStore((s) => s.addBid);

  useEffect(() => {
    if (!auctionId) return;

    const socket = connectSocket();

    function onConnect() {
      setIsConnected(true);
      setIsConnecting(false);
      subscribeToAuction(auctionId!);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnecting() {
      setIsConnecting(true);
    }

    function onNewBid(bid: Bid) {
      setLastBid(bid);
      addBid(bid);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connecting", onConnecting);
    socket.on("new-bid", onNewBid);

    subscribeToAuction(auctionId);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      unsubscribeFromAuction(auctionId!);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connecting", onConnecting);
      socket.off("new-bid", onNewBid);
      disconnectSocket();
    };
  }, [auctionId, addBid]);

  return { isConnected, isConnecting, lastBid };
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/socket.ts frontend/hooks/useSocket.ts
git commit -m "add WebSocket exponential backoff reconnect"
```

---

## Task 9: Frontend — Fix auctionStore error state

**Files:**
- Modify: `frontend/store/auctionStore.ts`

- [ ] **Step 1: Add error state to auctionStore**

Replace the entire content of `frontend/store/auctionStore.ts`:

```typescript
import { create } from "zustand";
import type { Auction, AuctionSummary } from "@/types/auction";
import { getAuctions, getAuctionById, type AuctionFilters } from "@/lib/api/auctions";

interface AuctionState {
  auctions: AuctionSummary[];
  selectedAuction: Auction | null;
  filters: AuctionFilters;
  isLoading: boolean;
  error: string | null;

  setAuctions: (auctions: AuctionSummary[]) => void;
  setSelectedAuction: (auction: Auction | null) => void;
  setFilters: (filters: AuctionFilters) => void;
  fetchAuctions: (filters?: AuctionFilters) => Promise<void>;
  fetchAuction: (id: string | number) => Promise<void>;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  auctions: [],
  selectedAuction: null,
  filters: {},
  isLoading: false,
  error: null,

  setAuctions: (auctions) => set({ auctions }),

  setSelectedAuction: (auction) => set({ selectedAuction: auction }),

  setFilters: (filters) => set({ filters }),

  fetchAuctions: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const f = filters ?? get().filters;
      const auctions = await getAuctions(f);
      set({ auctions, filters: f });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load auctions." });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAuction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const auction = await getAuctionById(id);
      set({ selectedAuction: auction });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load auction." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/store/auctionStore.ts
git commit -m "add error state to auctionStore"
```

---

## Task 10: Frontend — Rename route [id]→[slug] + refactor AuctionDetailPage

**Files:**
- Delete: `frontend/app/auctions/[id]/page.tsx`
- Create: `frontend/app/auctions/[slug]/page.tsx`
- Modify: `frontend/components/auction/AuctionDetailPage.tsx`
- Modify: `frontend/components/auction/AuctionCard.tsx`
- Modify: `frontend/app/(dashboard)/create-listing/page.tsx`
- Modify: `frontend/app/profile/page.tsx`

- [ ] **Step 1: Delete old [id] route and create [slug] route**

Delete `frontend/app/auctions/[id]/page.tsx`.

Create `frontend/app/auctions/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionDetailPageComponent from "@/components/auction/AuctionDetailPage";
import { getAuctionBySlug } from "@/lib/api/auctions";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const auction = await getAuctionBySlug(slug);
    return {
      title: `${auction.title} | BidZone`,
      description: auction.description?.slice(0, 160),
      openGraph: {
        title: `${auction.title} | BidZone`,
        description: auction.description?.slice(0, 160),
        images: auction.images?.[0]?.url ? [auction.images[0].url] : [],
      },
    };
  } catch {
    return { title: "Auction | BidZone" };
  }
}

export default async function AuctionDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug || slug.trim() === "") {
    notFound();
  }

  return (
    <>
      <Navbar />
      <AuctionDetailPageComponent slug={slug} />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Refactor AuctionDetailPage component**

Replace the entire content of `frontend/components/auction/AuctionDetailPage.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import BidForm from "./BidForm";
import BidHistory, { type Bid as BidHistoryItem } from "./BidHistory";
import { getAuctionContact } from "@/lib/api/auctions";
import { getBidsByAuction, placeBid } from "@/lib/api/bids";
import type { Auction, AuctionContact } from "@/types/auction";
import type { Bid } from "@/types/bid";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { useAuction } from "@/hooks/queries/useAuction";

export interface AuctionDetailPageProps {
  slug: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toBidHistory(bids: Bid[]): BidHistoryItem[] {
  return bids.map((bid) => ({
    id: String(bid.id),
    bidder: bid.bidderUsername,
    amount: formatCurrency(bid.amount),
    time: formatDateTime(bid.placedAt),
    isWinning: bid.status === "Winning" || bid.status === "Won",
  }));
}

export default function AuctionDetailPage({ slug }: AuctionDetailPageProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { data: auction, isLoading, error } = useAuction(slug);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isBidding, setIsBidding] = useState(false);
  const [contact, setContact] = useState<AuctionContact | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const { lastBid, isConnecting } = useSocket(auction?.id);
  const knownBidIdsRef = useRef(new Set<number>());

  // Load bids when auction id is available
  useEffect(() => {
    if (!auction?.id) return;
    let cancelled = false;

    getBidsByAuction(auction.id)
      .then((result) => { if (!cancelled) setBids(result); })
      .catch(() => { /* bids will be empty; WS fills them in */ });

    return () => { cancelled = true; };
  }, [auction?.id]);

  // Load contact info for closed auctions
  useEffect(() => {
    if (!auction || auction.status !== "Closed" || !user) {
      setContact(null);
      return;
    }
    let cancelled = false;

    getAuctionContact(auction.id)
      .then((c) => { if (!cancelled) setContact(c); })
      .catch(() => { if (!cancelled) setContact(null); });

    return () => { cancelled = true; };
  }, [auction?.id, auction?.status, user]);

  // Set initial selected image when auction loads (only on auction id change)
  useEffect(() => {
    if (!auction) { setSelectedImageUrl(""); return; }
    const first = auction.images?.[0]?.url;
    setSelectedImageUrl(first || auction.imageUrl || "/auction-images/abstract-oil-canvas.svg");
  }, [auction?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track known bid IDs for deduplication
  useEffect(() => {
    knownBidIdsRef.current = new Set(bids.map((b) => b.id));
  }, [bids]);

  // Merge WebSocket bids into local state + update query cache
  useEffect(() => {
    if (!lastBid || !auction || lastBid.auctionId !== auction.id) return;

    const isNewBid = !knownBidIdsRef.current.has(lastBid.id);
    knownBidIdsRef.current.add(lastBid.id);

    setBids((current) => {
      const updated = current
        .filter((b) => b.id !== lastBid.id)
        .map((b) => (b.status === "Winning" ? { ...b, status: "Outbid" as const } : b));
      return [lastBid, ...updated].sort((a, b) => b.amount - a.amount);
    });

    queryClient.setQueryData(["auction", slug], (old: Auction | undefined) => {
      if (!old || old.id !== lastBid.auctionId) return old;
      return {
        ...old,
        currentPrice: Math.max(old.currentPrice, lastBid.amount),
        bidCount: old.bidCount + (isNewBid ? 1 : 0),
      };
    });
  }, [lastBid, auction, slug, queryClient]);

  const handlePlaceBid = useCallback(
    async (amount: number) => {
      if (!auction) throw new Error("Auction not available.");
      setIsBidding(true);
      try {
        await placeBid(auction.id, amount);
        await queryClient.invalidateQueries({ queryKey: ["auction", slug] });
        const freshBids = await getBidsByAuction(auction.id);
        setBids(freshBids);
      } finally {
        setIsBidding(false);
      }
    },
    [auction, slug, queryClient]
  );

  const bidHistory = useMemo(() => toBidHistory(bids), [bids]);
  const myLatestBid = useMemo(() => {
    if (!user) return null;
    return (
      bids
        .filter((b) => b.bidderId == user.id)
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())[0] ?? null
    );
  }, [bids, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen page-gradient">
        <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
          <div className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-sm text-text-muted">
            Loading auction details...
          </div>
        </main>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen page-gradient">
        <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error instanceof Error ? error.message : "Auction not found."}
          </div>
        </main>
      </div>
    );
  }

  const isAuctionClosed = auction.status !== "Active";
  const isOwner = user?.id === auction.sellerId;
  const isWinning = myLatestBid?.status === "Winning";
  const isWon = myLatestBid?.status === "Won";
  const isOutbid = myLatestBid?.status === "Outbid";
  const isLost = myLatestBid?.status === "Lost";
  const isBidDisabled = isAuctionClosed || isBidding || isWinning || isOwner;

  let disabledLabel: string | undefined;
  if (isBidding) disabledLabel = "Placing bid...";
  else if (isWinning) disabledLabel = "Winning";
  else if (isAuctionClosed) disabledLabel = "Auction closed";

  let stateMessage: string | null = null;
  let stateTone: "success" | "warning" | "neutral" = "neutral";

  if (isWinning) { stateMessage = "You are currently the highest bidder."; stateTone = "success"; }
  else if (isOutbid) { stateMessage = "You were outbid. Increase your bid to take the lead."; stateTone = "warning"; }
  else if (isWon) { stateMessage = "Auction ended. You won this item."; stateTone = "success"; }
  else if (isLost) { stateMessage = "Auction ended. This item was won by another bidder."; stateTone = "warning"; }
  else if (isAuctionClosed) stateMessage = "This auction has ended.";

  return (
    <div className="min-h-screen page-gradient">
      <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
        {isConnecting && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
            Reconnecting to live updates...
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-card-bg card-shadow">
              <Image
                src={selectedImageUrl || auction.imageUrl || "/auction-images/abstract-oil-canvas.svg"}
                alt={auction.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {auction.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {auction.images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageUrl(image.url)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-md border transition ${
                      selectedImageUrl === image.url ? "border-accent" : "border-border-strong"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${auction.title} image ${image.sortOrder + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-border/40 pt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Description</p>
              <p className="text-sm leading-relaxed text-text-body">{auction.description}</p>
            </div>

            <div className="mt-5 border-t border-border/40 pt-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Category</p>
                  <p className="mt-0.5 text-sm text-text-heading">{auction.categoryName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Status</p>
                  <p className="mt-0.5 text-sm text-text-heading">{auction.status}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Start time</p>
                  <p className="mt-0.5 text-sm text-text-heading">{formatDateTime(auction.startTime)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">End time</p>
                  <p className="mt-0.5 text-sm text-text-heading">{formatDateTime(auction.endTime)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Starting price</p>
                  <p className="mt-0.5 text-sm text-text-heading">{formatCurrency(auction.startingPrice)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Reserve price</p>
                  <p className="mt-0.5 text-sm text-text-heading">
                    {auction.reservePrice == null ? "No reserve" : formatCurrency(auction.reservePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-heading sm:text-2xl">{auction.title}</h1>
            <p className="mt-1 text-sm text-text-muted">Sold by @{auction.sellerUsername}</p>

            <div className="mt-4">
              <BidForm
                currentBid={auction.currentPrice}
                minIncrement={1}
                totalBids={auction.bidCount}
                endTime={auction.endTime}
                onPlaceBid={handlePlaceBid}
                disabled={isBidDisabled}
                disabledLabel={disabledLabel}
                stateMessage={stateMessage}
                stateTone={stateTone}
                showBidButton={!isOwner}
              />
            </div>

            <div className="mt-6">
              <BidHistory bids={bidHistory} />
            </div>

            {contact && (
              <div className="mt-6 rounded-xl border border-border-strong bg-accent-soft/40 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Contact details</p>
                <p className="mt-2 text-sm text-text-heading">
                  {contact.viewerRole === "Buyer" ? "Seller" : "Buyer"}: @{contact.counterpartyUsername}
                </p>
                <p className="mt-1 text-sm text-text-heading">Email: {contact.counterpartyEmail}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Update AuctionCard to use slug**

In `frontend/components/auction/AuctionCard.tsx`, find `href={/auctions/${auction.id}}` and replace with `href={/auctions/${auction.slug}}`.

- [ ] **Step 4: Update create-listing redirect to use slug**

In `frontend/app/(dashboard)/create-listing/page.tsx`, find:

```typescript
router.push(`/auctions/${created.id}`);
```

Replace with:

```typescript
router.push(`/auctions/${created.slug}`);
```

- [ ] **Step 5: Update profile page auction/bid/watchlist links**

In `frontend/app/profile/page.tsx`, replace all instances of:

- `href={/auctions/${bid.auctionId}}` → `href={/auctions/${bid.auctionSlug}}`
- `href={/auctions/${auction.id}}` → `href={/auctions/${auction.slug}}`
- `href={/auctions/${item.auctionId}}` (for watchlist) → `href={/auctions/${item.auctionSlug}}`
- The `const href = /auctions/${auction.id};` line → `const href = /auctions/${auction.slug};`

There are 9 such instances across the file (lines 296, 341, 396, 456, 497, 564, 622, 678, 739). Update all of them.

- [ ] **Step 6: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/auctions/ \
        frontend/components/auction/AuctionDetailPage.tsx \
        frontend/components/auction/AuctionCard.tsx \
        frontend/app/"(dashboard)"/create-listing/page.tsx \
        frontend/app/profile/page.tsx
git commit -m "rename auction route to [slug] and refactor detail page"
```

---

## Task 11: Frontend — Categories from API + auction list page cleanup

**Files:**
- Create: `frontend/lib/categoryIcons.tsx`
- Modify: `frontend/app/auctions/page.tsx`

- [ ] **Step 1: Create categoryIcons map**

Create `frontend/lib/categoryIcons.tsx`:

```tsx
export const CATEGORY_ICONS: Record<string, string> = {
  art: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm12.75-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  interiors: "M2.25 12l8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  jewellery: "M6 3h12l3 5-9 13L3 8l3-5Zm3.5 5h5M6.5 8L12 3.5 17.5 8",
  watches: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  fashion: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  "coins-stamps": "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  comics: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
  "cars-bikes": "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  "wine-spirits": "M9 2.25h6m-6 0v3a6.005 6.005 0 0 1-1.764 4.236L9 2.25Zm6 0v3a6.005 6.005 0 0 0 1.764 4.236L15 2.25ZM7.5 21.75h9M12 17.25v4.5m0-4.5a6 6 0 0 1-6-6v-1.5h12v1.5a6 6 0 0 1-6 6Z",
  electronics: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  collectibles: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z",
  sports: "M15.59 14.37a6 6 0 1 0-7.04-7.02m7.04 7.02a6 6 0 0 1-7.04-7.02m7.04 7.02l-2.83 2.83-4.24 4.24M8.55 7.35L5.72 10.18 1.48 14.42m7.07-7.07L6.4 9.5m5.3.2L9.55 11.85m5.3.21l-2.15 2.15M8 6.5l2.15-2.15m.2 5.3L8.2 11.8",
  books: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
  toys: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.834 48.834 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z",
  photography: "M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316ZM16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z",
  musical: "M9 19.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 19.5V7.5l12-3v12",
};

export const GENERIC_ICON = "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z";
```

- [ ] **Step 2: Replace hardcoded categories in auctions/page.tsx with API data**

In `frontend/app/auctions/page.tsx`, make the following changes:

1. Remove the `categories` const array (lines 13–33)
2. Add imports for `useCategories` and `CATEGORY_ICONS`:

```typescript
import { useCategories } from "@/hooks/queries/useCategories";
import { CATEGORY_ICONS, GENERIC_ICON } from "@/lib/categoryIcons";
```

3. Inside `AuctionsPage`, add:

```typescript
const { data: apiCategories = [] } = useCategories();

const categories = [
  { label: "All", slug: null as string | null },
  ...apiCategories.map((c) => ({ label: c.name, slug: c.slug })),
];
```

4. Remove `as const` from `filterSections` and `sortOptions` (they rely on the old `categories` const type). Remove the `activeCategory` line that used the old const array type.

5. In the categories dropdown render, replace the icon rendering:

```tsx
{categories.map((cat) => (
  <button
    key={cat.slug ?? "all"}
    type="button"
    onClick={() => {
      handleCategoryChange(cat.slug);
      setIsCategoriesOpen(false);
    }}
    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
      activeCategorySlug === cat.slug
        ? "bg-accent font-medium text-white"
        : "text-text-heading hover:bg-accent-soft"
    }`}
  >
    {cat.slug && (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.slug] ?? GENERIC_ICON} />
      </svg>
    )}
    {cat.label}
  </button>
))}
```

6. Update the "Categories" button label to show active category from API data:

```tsx
{activeCategorySlug
  ? (apiCategories.find((c) => c.slug === activeCategorySlug)?.name ?? "Categories")
  : "Categories"}
```

- [ ] **Step 3: Add static metadata via auctions layout**

Since `app/auctions/page.tsx` is a client component (`"use client"`), metadata must be exported from a separate server component. Create `frontend/app/auctions/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Auctions | BidZone",
  description: "Browse all live auctions on BidZone. Filter by category, price, and more.",
};

export default function AuctionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 4: Add static metadata via profile layout**

Create `frontend/app/profile/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | BidZone",
  description: "Manage your BidZone profile, bids, and watchlist.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/categoryIcons.tsx \
        frontend/app/auctions/page.tsx \
        frontend/app/auctions/layout.tsx \
        frontend/app/profile/layout.tsx
git commit -m "replace hardcoded categories with API data and add page metadata"
```

---

## Task 12: Final verification

- [ ] **Step 1: Run backend**

```powershell
cd backend
dotnet run --project BidZone.Api
```

Expected: starts on port 5171, no errors.

- [ ] **Step 2: Run frontend**

```powershell
cd frontend
npm run dev
```

Expected: starts on port 3000, no TypeScript or build errors.

- [ ] **Step 3: Smoke test — auction detail by slug**

Navigate to `http://localhost:3000/auctions`. Click any auction card. Confirm the URL now shows `/auctions/<slug>` (e.g., `/auctions/iphone-15-pro-max-5`) instead of `/auctions/5`.

- [ ] **Step 4: Smoke test — categories dropdown**

On `http://localhost:3000/auctions`, open the Categories dropdown. Confirm categories are loaded from the API (not hardcoded), and each shows an icon from `CATEGORY_ICONS`.

- [ ] **Step 5: Smoke test — page title on auction detail**

Open an auction detail page. Check the browser tab title shows `"<Auction Title> | BidZone"`.

- [ ] **Step 6: Smoke test — 404 on invalid slug**

Navigate to `http://localhost:3000/auctions/this-does-not-exist`. Confirm the Next.js 404 page renders.

- [ ] **Step 7: Smoke test — backend exception middleware**

Temporarily add `throw new Exception("test");` to `AuctionsController.GetAll`, call `/api/auctions`, confirm the response is a JSON `{ "status": 500, "title": "An unexpected error occurred." }` object instead of an HTML stack trace. Remove the test exception.

- [ ] **Step 8: Commit final check**

```bash
git status
```

Expected: clean working tree. All changes committed across tasks 1–11.
