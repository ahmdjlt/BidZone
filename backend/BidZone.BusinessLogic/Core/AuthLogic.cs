using BidZone.BusinessLogic.Security;
using BidZone.Domains;
using BidZone.Domains.Constants;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using BidZone.Domains.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core;

public class AuthLogic
{
    public AuthLogic() { }

    internal async Task<AuthResultDto> LoginExecution(LoginRequestDto request)
    {
        using var db = new AppDbContext();

        var normalizedEmail = Normalize(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);
        if (user == null || !user.IsActive)
            return AuthResultDto.Failure("Invalid email or password.");

        if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
            return AuthResultDto.Failure("Your account is locked.");

        var hasher = new PasswordHasher<User>();
        var verify = hasher.VerifyHashedPassword(user, user.PasswordHash ?? string.Empty, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            return AuthResultDto.Failure("Invalid email or password.");

        if (verify == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            await db.SaveChangesAsync();
        }

        return AuthResultDto.Success(CreateAuthResponse(user));
    }

    internal async Task<AuthResultDto> RegisterExecution(RegisterRequestDto request)
    {
        var role = RoleConstants.Normalize(request.Role);
        if (role == null)
            return AuthResultDto.Failure("Role must be Buyer or Seller.");

        using var db = new AppDbContext();

        var normalizedEmail = Normalize(request.Email);
        var normalizedUsername = Normalize(request.Username);

        var existing = await db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail || u.NormalizedUserName == normalizedUsername);
        if (existing)
            return AuthResultDto.Failure("Email or username is already in use.");

        var user = new User
        {
            UserName = request.Username.Trim(),
            NormalizedUserName = normalizedUsername,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            EmailConfirmed = true,
            Role = role,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };

        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return AuthResultDto.Failure("Email or username is already in use.");
        }

        return AuthResultDto.Success(CreateAuthResponse(user));
    }

    internal async Task<UserDto?> GetCurrentUserExecution(int userId)
    {
        using var db = new AppDbContext();
        var user = await db.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return null;
        return Mappers.ToDto(user);
    }

    internal async Task<ActionResponse> LogoutExecution(int userId)
    {
        using var db = new AppDbContext();
        var user = await db.Users.FindAsync(userId);
        if (user == null)
            return ActionResponse.Failure("User not found.");

        user.SecurityStamp = Guid.NewGuid().ToString();
        await db.SaveChangesAsync();
        return ActionResponse.Success("Logged out successfully.");
    }

    private static AuthResponseDto CreateAuthResponse(User user)
    {
        var jwt = new JwtTokenService().GenerateToken(user);
        return new AuthResponseDto
        {
            Token = jwt.Token,
            ExpiresAtUtc = jwt.ExpiresAtUtc,
            User = Mappers.ToDto(user)
        };
    }

    internal static string Normalize(string value) => value.Trim().ToUpperInvariant();
}
