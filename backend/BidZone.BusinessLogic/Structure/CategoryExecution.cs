using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Structure;

public class CategoryExecution : CategoryLogic, ICategoryLogic
{
    public Task<List<CategoryDto>> GetAllAsync() => GetAllExecution();
    public Task<CategoryDto?> GetByIdAsync(int id) => GetByIdExecution(id);
}
