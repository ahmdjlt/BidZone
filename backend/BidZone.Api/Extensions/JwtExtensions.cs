using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BidZone.BusinessLogic.Security;
using BidZone.Domains;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BidZone.Api.Extensions;

public static class JwtExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var issuer = jwtSection["Issuer"] ?? string.Empty;
        var audience = jwtSection["Audience"] ?? string.Empty;
        var key = jwtSection["Key"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException("JWT settings are missing. Configure Jwt:Key in appsettings or JWT_KEY in the environment.");
        }

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var principal = context.Principal;
                        var userIdStr = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                            ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);
                        var tokenSecurityStamp = principal?.FindFirstValue("security_stamp");
                        var tokenRole = principal?.FindFirstValue(ClaimTypes.Role);

                        if (!int.TryParse(userIdStr, out var userId))
                        {
                            context.Fail("Invalid token subject.");
                            return;
                        }

                        using var db = new AppDbContext();
                        var user = await db.Users.FindAsync(new object?[] { userId }, context.HttpContext.RequestAborted);
                        if (user == null || !user.IsActive)
                        {
                            context.Fail("User is inactive or no longer exists.");
                            return;
                        }

                        if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
                        {
                            context.Fail("User is locked out.");
                            return;
                        }

                        if (!string.Equals(user.SecurityStamp, tokenSecurityStamp, StringComparison.Ordinal))
                        {
                            context.Fail("Token has been revoked.");
                            return;
                        }

                        if (!string.Equals(user.Role, tokenRole, StringComparison.Ordinal))
                        {
                            context.Fail("Token role is no longer valid.");
                        }
                    }
                };
            });

        services.AddAuthorization();

        return services;
    }
}
