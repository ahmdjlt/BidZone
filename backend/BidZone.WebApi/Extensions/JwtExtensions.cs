using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BidZone.BLL.Security;
using BidZone.Models.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace BidZone.WebApi.Extensions;

public static class JwtExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        if (string.IsNullOrWhiteSpace(jwtOptions.Key))
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
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
                        var principal = context.Principal;
                        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                            ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);
                        var tokenSecurityStamp = principal?.FindFirstValue("security_stamp");
                        var tokenRole = principal?.FindFirstValue(ClaimTypes.Role);

                        if (string.IsNullOrWhiteSpace(userId))
                        {
                            context.Fail("Invalid token subject.");
                            return;
                        }

                        var user = await userManager.FindByIdAsync(userId);
                        if (user == null || !user.IsActive)
                        {
                            context.Fail("User is inactive or no longer exists.");
                            return;
                        }

                        if (await userManager.IsLockedOutAsync(user))
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
