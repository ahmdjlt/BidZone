using BidZone.Models.DTOs;

namespace BidZone.BLL.Interfaces;

public interface ICategoryLogic
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int id);
}
