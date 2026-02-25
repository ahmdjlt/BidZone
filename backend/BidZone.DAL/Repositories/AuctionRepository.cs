using BidZone.DAL.Interfaces;
using BidZone.Models;
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
