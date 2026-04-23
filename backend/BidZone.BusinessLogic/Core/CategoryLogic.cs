using BidZone.Domains;
using BidZone.Domains.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class CategoryLogic
{
    public CategoryLogic() { }

    internal async Task<List<CategoryDto>> GetAllExecution()
    {
        using var db = new AppDbContext();
        var categories = await db.Categories.Include(c => c.Auctions).ToListAsync();
        return Mappers.ToDtoList(categories);
    }

    internal async Task<CategoryDto?> GetByIdExecution(int id)
    {
        using var db = new AppDbContext();
        var category = await db.Categories.Include(c => c.Auctions).FirstOrDefaultAsync(c => c.Id == id);
        return category == null ? null : Mappers.ToDto(category);
    }
}
