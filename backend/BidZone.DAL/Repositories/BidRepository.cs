using BidZone.DAL.Interfaces;
using BidZone.Models;
using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.DAL.Repositories;

public class BidRepository : IBidRepository
{
    private readonly AppDbContext _context;

    public BidRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Bid>> GetByAuctionAsync(int auctionId)
        => await _context.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .ToListAsync();

    public async Task<List<Bid>> GetByUserAsync(int userId)
        => await _context.Bids
            .Include(b => b.Bidder)
            .Include(b => b.Auction)
            .Where(b => b.BidderId == userId)
            .OrderByDescending(b => b.PlacedAt)
            .ToListAsync();

    public async Task<Bid?> GetHighestBidAsync(int auctionId)
        => await _context.Bids
            .Include(b => b.Bidder)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .FirstOrDefaultAsync();

    public async Task<Bid> InsertAsync(Bid bid)
    {
        _context.Bids.Add(bid);
        await _context.SaveChangesAsync();
        return bid;
    }

    public async Task UpdateAsync(Bid bid)
    {
        _context.Bids.Update(bid);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateStatusesAsync(int auctionId, int winningBidId)
    {
        var bids = await _context.Bids.Where(b => b.AuctionId == auctionId).ToListAsync();
        foreach (var bid in bids)
        {
            bid.Status = bid.Id == winningBidId ? "Won" : "Lost";
        }
        await _context.SaveChangesAsync();
    }
}
