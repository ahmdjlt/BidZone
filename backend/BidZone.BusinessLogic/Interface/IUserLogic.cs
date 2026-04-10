using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Interface;

public interface IUserLogic
{
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> GetProfileAsync(int userId);
    Task<UserDto?> UpdateAsync(int id, UserDto dto);
    Task<bool> DeleteAsync(int id);
}
