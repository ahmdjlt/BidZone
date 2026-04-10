using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Interface;

public interface ICategoryLogic
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int id);
}
