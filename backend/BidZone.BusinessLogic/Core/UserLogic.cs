using BidZone.Domains;
using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class UserLogic
{
    public UserLogic() { }

    internal async Task<List<UserDto>> GetAllExecution()
    {
        using var db = new AppDbContext();
        var users = await db.Users.ToListAsync();
        return Mappers.ToDtoList(users);
    }

    internal async Task<UserDto?> GetByIdExecution(int id)
    {
        using var db = new AppDbContext();
        var user = await db.Users.FindAsync(id);
        return user == null ? null : Mappers.ToDto(user);
    }

    internal async Task<UserDto?> UpdateExecution(int id, UserDto dto)
    {
        using var db = new AppDbContext();
        var user = await db.Users.FindAsync(id);
        if (user == null || !user.IsActive) return null;

        var newUsername = dto.Username.Trim();
        var newEmail = dto.Email.Trim();
        var normalizedUsername = AuthLogic.Normalize(newUsername);
        var normalizedEmail = AuthLogic.Normalize(newEmail);

        var conflict = await db.Users.AnyAsync(u =>
            u.Id != id &&
            (u.NormalizedUserName == normalizedUsername || u.NormalizedEmail == normalizedEmail));
        if (conflict) return null;

        user.UserName = newUsername;
        user.NormalizedUserName = normalizedUsername;
        user.Email = newEmail;
        user.NormalizedEmail = normalizedEmail;
        user.FullName = dto.FullName.Trim();
        user.ConcurrencyStamp = Guid.NewGuid().ToString();

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return null;
        }
        return Mappers.ToDto(user);
    }

    internal async Task<ActionResponse> DeleteExecution(int id)
    {
        using var db = new AppDbContext();
        var user = await db.Users.FindAsync(id);
        if (user == null)
            return ActionResponse.Failure("User was not found.");

        user.IsActive = false;
        user.SecurityStamp = Guid.NewGuid().ToString();
        await db.SaveChangesAsync();
        return ActionResponse.Success("User deleted successfully.");
    }
}
