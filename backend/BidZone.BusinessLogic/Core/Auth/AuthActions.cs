using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Security;
using BidZone.DataAccess.Context;
using BidZone.Domains.Constants;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using BidZone.Domains.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BidZone.BusinessLogic.Core.Auth;

public class AuthActions
{
    public AuthActions() { }

    internal async Task<AuthResultDto> LoginExecution(LoginRequestDto request, string? ipAddress)
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
            user.ConcurrencyStamp = Guid.NewGuid().ToString();
        }

        return await CreateAuthResultAsync(db, user, ipAddress);
    }

    internal async Task<AuthResultDto> RegisterExecution(RegisterRequestDto request, string? ipAddress)
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

        return await CreateAuthResultAsync(db, user, ipAddress);
    }

    internal async Task<UserDto?> GetCurrentUserExecution(int userId)
    {
        using var db = new AppDbContext();
        var user = await db.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return null;
        return Mappers.ToDto(user);
    }

    internal async Task<AuthResultDto> RefreshExecution(string refreshToken, string? ipAddress)
    {
        using var db = new AppDbContext();
        var tokenHash = RefreshTokenService.HashToken(refreshToken);
        var storedToken = await db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

        if (storedToken == null)
        {
            return AuthResultDto.Failure("Refresh token is invalid.");
        }

        if (storedToken.RevokedAtUtc.HasValue)
        {
            return AuthResultDto.Failure("Refresh token has already been used.");
        }

        if (storedToken.ExpiresAtUtc <= DateTime.UtcNow)
        {
            return AuthResultDto.Failure("Refresh token has expired.");
        }

        var user = storedToken.User;
        if (user == null || !user.IsActive)
        {
            return AuthResultDto.Failure("User is inactive or no longer exists.");
        }

        if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
        {
            return AuthResultDto.Failure("Your account is locked.");
        }

        var nextRefreshToken = RefreshTokenService.GenerateToken();
        storedToken.RevokedAtUtc = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;
        storedToken.ReplacedByTokenHash = nextRefreshToken.TokenHash;
        storedToken.Reason = "Rotated.";

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = nextRefreshToken.TokenHash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = nextRefreshToken.ExpiresAtUtc,
            CreatedByIp = ipAddress
        });

        await db.SaveChangesAsync();
        return AuthResultDto.Success(CreateAuthResponse(user), nextRefreshToken.Token);
    }

    internal async Task<ActionResponse> LogoutExecution(int userId, string? ipAddress)
    {
        using var db = new AppDbContext();
        var user = await db.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return ActionResponse.Failure("User not found.");

        user.SecurityStamp = Guid.NewGuid().ToString();
        user.ConcurrencyStamp = Guid.NewGuid().ToString();

        var now = DateTime.UtcNow;
        foreach (var refreshToken in user.RefreshTokens.Where(r => !r.RevokedAtUtc.HasValue && r.ExpiresAtUtc > now))
        {
            refreshToken.RevokedAtUtc = now;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.Reason = "Logged out.";
        }

        await db.SaveChangesAsync();
        return ActionResponse.Success("Logged out successfully.");
    }

    private static async Task<AuthResultDto> CreateAuthResultAsync(AppDbContext db, User user, string? ipAddress)
    {
        var refreshToken = RefreshTokenService.GenerateToken();
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshToken.TokenHash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = refreshToken.ExpiresAtUtc,
            CreatedByIp = ipAddress
        });

        await db.SaveChangesAsync();
        return AuthResultDto.Success(CreateAuthResponse(user), refreshToken.Token);
    }

    private static AuthResponseDto CreateAuthResponse(User user)
    {
        var jwt = new JwtTokenService().GenerateToken(user);
        return new AuthResponseDto
        {
            AccessToken = jwt.AccessToken,
            ExpiresAtUtc = jwt.ExpiresAtUtc,
            User = Mappers.ToDto(user)
        };
    }

    internal static string Normalize(string value) => value.Trim().ToUpperInvariant();
}
