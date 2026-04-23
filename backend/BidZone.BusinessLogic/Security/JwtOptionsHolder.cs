namespace BidZone.BusinessLogic.Security;

public static class JwtOptionsHolder
{
    public static string Issuer { get; set; } = string.Empty;
    public static string Audience { get; set; } = string.Empty;
    public static string Key { get; set; } = string.Empty;
    public static int ExpirationMinutes { get; set; } = 60;
}
