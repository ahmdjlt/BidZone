using System.Security.Cryptography;
using System.Text;

namespace BidZone.BusinessLogic.Security;

public static class RefreshTokenService
{
    public static RefreshTokenResult GenerateToken()
    {
        var rawBytes = RandomNumberGenerator.GetBytes(64);
        var token = Convert.ToBase64String(rawBytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .TrimEnd('=');

        return new RefreshTokenResult
        {
            Token = token,
            TokenHash = HashToken(token),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(JwtOptionsHolder.RefreshTokenDays)
        };
    }

    public static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
