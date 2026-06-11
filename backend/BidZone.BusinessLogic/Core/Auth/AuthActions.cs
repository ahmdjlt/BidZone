using System.Security.Cryptography;
using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Email;
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

        if (!user.EmailConfirmed && EmailOptionsHolder.IsConfigured)
            return AuthResultDto.Failure("Please confirm your email before signing in.");

        if (verify == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            user.ConcurrencyStamp = Guid.NewGuid().ToString();
        }

        return await CreateAuthResultAsync(db, user, ipAddress);
    }

    internal async Task<AuthResultDto> RegisterExecution(RegisterRequestDto request, string? ipAddress)
    {
        var role = RoleConstants.User;

        using var db = new AppDbContext();

        var normalizedEmail = Normalize(request.Email);
        var normalizedUsername = Normalize(request.Username);

        var existing = await db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail || u.NormalizedUserName == normalizedUsername);
        if (existing)
            return AuthResultDto.Failure("Email or username is already in use.");

        // When no email provider is configured, skip the confirmation step so accounts
        // can be used immediately instead of waiting on an email that will never arrive.
        var requireConfirmation = EmailOptionsHolder.IsConfigured;

        var user = new User
        {
            UserName = request.Username.Trim(),
            NormalizedUserName = normalizedUsername,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            EmailConfirmed = !requireConfirmation,
            EmailConfirmationToken = requireConfirmation ? GenerateConfirmationToken() : null,
            EmailConfirmationTokenExpiresAt = requireConfirmation
                ? DateTime.UtcNow.AddHours(EmailOptionsHolder.ConfirmationTokenHours)
                : null,
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

        if (!requireConfirmation)
        {
            return await CreateAuthResultAsync(db, user, ipAddress);
        }

        await SendConfirmationEmailAsync(user);
        return AuthResultDto.Pending(
            "Account created. Check your email for a confirmation link before signing in.",
            requiresEmailConfirmation: true);
    }

    internal async Task<AuthResultDto> ConfirmEmailExecution(ConfirmEmailRequestDto request)
    {
        using var db = new AppDbContext();
        var normalizedEmail = Normalize(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);
        if (user == null)
            return AuthResultDto.Failure("Confirmation link is invalid.");

        if (user.EmailConfirmed)
            return AuthResultDto.Pending("Your email is already confirmed. You can sign in.");

        if (string.IsNullOrEmpty(user.EmailConfirmationToken) ||
            !FixedTimeEquals(user.EmailConfirmationToken, request.Token))
            return AuthResultDto.Failure("Confirmation link is invalid.");

        if (user.EmailConfirmationTokenExpiresAt.HasValue &&
            user.EmailConfirmationTokenExpiresAt.Value < DateTime.UtcNow)
            return AuthResultDto.Failure("Confirmation link has expired. Please request a new one.");

        user.EmailConfirmed = true;
        user.EmailConfirmationToken = null;
        user.EmailConfirmationTokenExpiresAt = null;
        user.ConcurrencyStamp = Guid.NewGuid().ToString();
        await db.SaveChangesAsync();

        return AuthResultDto.Pending("Email confirmed. You can now sign in.");
    }

    internal async Task<AuthResultDto> ResendConfirmationExecution(ResendConfirmationRequestDto request)
    {
        using var db = new AppDbContext();
        var normalizedEmail = Normalize(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        // Always return the same response to avoid leaking which emails exist.
        if (user != null && !user.EmailConfirmed)
        {
            user.EmailConfirmationToken = GenerateConfirmationToken();
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(EmailOptionsHolder.ConfirmationTokenHours);
            await db.SaveChangesAsync();
            await SendConfirmationEmailAsync(user);
        }

        return AuthResultDto.Pending(
            "If an unconfirmed account exists for that email, a new confirmation link has been sent.",
            requiresEmailConfirmation: true);
    }

    private static string GenerateConfirmationToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        var aBytes = System.Text.Encoding.UTF8.GetBytes(a);
        var bBytes = System.Text.Encoding.UTF8.GetBytes(b);
        return CryptographicOperations.FixedTimeEquals(aBytes, bBytes);
    }

    private static async Task SendConfirmationEmailAsync(User user)
    {
        if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.EmailConfirmationToken))
            return;

        var baseUrl = EmailOptionsHolder.FrontendUrl.TrimEnd('/');
        var confirmUrl = $"{baseUrl}/verify-email?token={Uri.EscapeDataString(user.EmailConfirmationToken)}&email={Uri.EscapeDataString(user.Email)}";

        var subject = "Confirm your BidZone email";
        var body = $@"
            <div style=""font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222"">
              <h2 style=""color:#0848B8"">Welcome to BidZone</h2>
              <p>Hi {System.Net.WebUtility.HtmlEncode(user.FullName)},</p>
              <p>Confirm your email to activate your account. This link expires in {EmailOptionsHolder.ConfirmationTokenHours} hours.</p>
              <p style=""margin:24px 0"">
                <a href=""{confirmUrl}"" style=""background:#0848B8;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block"">
                  Confirm email
                </a>
              </p>
              <p style=""font-size:12px;color:#666"">If the button doesn't work, paste this URL into your browser:<br/>{confirmUrl}</p>
            </div>";

        try
        {
            await EmailSenderFactory.Create().SendAsync(user.Email, subject, body);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Failed to send confirmation email to {user.Email}: {ex.Message}");
        }
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
