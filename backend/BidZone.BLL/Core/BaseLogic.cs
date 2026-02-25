using BidZone.Models;

namespace BidZone.BLL.Core;

public abstract class BaseLogic
{
    protected readonly AppDbContext _context;

    protected BaseLogic(AppDbContext context)
    {
        _context = context;
    }
}
