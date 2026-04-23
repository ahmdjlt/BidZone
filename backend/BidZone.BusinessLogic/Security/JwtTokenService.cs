using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BidZone.Domains.Entities;
using Microsoft.IdentityModel.Tokens;

namespace BidZone.BusinessLogic.Security;

public class JwtTokenService
{
    public JwtTokenService() { }

    public JwtTokenResult GenerateToken(User user)
    {
        var key = JwtOptionsHolder.Key;
        if (string.IsNullOrWhiteSpace(key) || Encoding.UTF8.GetByteCount(key) < 32)
        {
            throw new InvalidOperationException("JWT signing key must be configured and at least 32 bytes long.");
        }

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(JwtOptionsHolder.ExpirationMinutes);
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new("security_stamp", user.SecurityStamp ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer: JwtOptionsHolder.Issuer,
            audience: JwtOptionsHolder.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new JwtTokenResult
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAtUtc
        };
    }
}
