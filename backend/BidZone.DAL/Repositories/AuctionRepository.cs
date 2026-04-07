using BidZone.DAL.Interfaces;
using BidZone.Models;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.DAL.Repositories;

public class AuctionRepository : IAuctionRepository
{
    private readonly AppDbContext _context;

    public AuctionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Auction>> GetAllAsync()
        => await _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .ToListAsync();

    public async Task<List<Auction>> GetAllLiteAsync()
        => await _context.Auctions
            .Include(a => a.Category)
            .AsNoTracking()
            .ToListAsync();

    public async Task<List<Auction>> GetFilteredAsync(AuctionFilterParams filters, int? categoryId = null)
    {
        var query = _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
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

        return await query.ToListAsync();
    }

    public async Task<(List<Auction> Items, int TotalCount)> GetFilteredPagedAsync(AuctionFilterParams filters, PaginationParams pagination, int? categoryId = null)
    {
        var query = _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
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

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Auction?> GetByIdAsync(int id)
        => await _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids).ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<List<Auction>> GetByCategoryAsync(int categoryId)
        => await _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .Where(a => a.CategoryId == categoryId)
            .ToListAsync();

    public async Task<List<Auction>> GetBySellerAsync(int sellerId)
        => await _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .Where(a => a.SellerId == sellerId)
            .ToListAsync();

    public async Task<List<Auction>> GetActiveAsync()
        => await _context.Auctions
            .Include(a => a.Seller)
            .Include(a => a.Category)
            .Include(a => a.Bids)
            .Where(a => a.Status == "Active" && a.EndTime > DateTime.UtcNow)
            .ToListAsync();

    public async Task<Auction> InsertAsync(Auction auction)
    {
        _context.Auctions.Add(auction);
        await _context.SaveChangesAsync();
        return auction;
    }

    public async Task<Auction> UpdateAsync(Auction auction)
    {
        _context.Auctions.Update(auction);
        await _context.SaveChangesAsync();
        return auction;
    }

    public async Task DeleteAsync(int id)
    {
        var auction = await _context.Auctions.FindAsync(id);
        if (auction != null)
        {
            _context.Auctions.Remove(auction);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdatePriceAsync(int auctionId, decimal newPrice)
    {
        var auction = await _context.Auctions.FindAsync(auctionId);
        if (auction != null)
        {
            auction.CurrentPrice = newPrice;
            await _context.SaveChangesAsync();
        }
    }
}
