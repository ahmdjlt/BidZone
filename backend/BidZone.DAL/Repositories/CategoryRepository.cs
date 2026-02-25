using BidZone.DAL.Interfaces;
using BidZone.Models;
using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.DAL.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync()
        => await _context.Categories.Include(c => c.Auctions).ToListAsync();

    public async Task<Category?> GetByIdAsync(int id)
        => await _context.Categories.Include(c => c.Auctions).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Category?> GetBySlugAsync(string slug)
        => await _context.Categories.Include(c => c.Auctions).FirstOrDefaultAsync(c => c.Slug == slug);
}
