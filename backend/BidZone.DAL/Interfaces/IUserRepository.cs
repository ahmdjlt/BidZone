using BidZone.Models.Entities;

namespace BidZone.DAL.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User> InsertAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(int id);
}
