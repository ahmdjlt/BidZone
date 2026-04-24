namespace BidZone.BusinessLogic.Security;

public class RefreshTokenResult
{
    public string Token { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
}
