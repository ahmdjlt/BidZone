namespace BidZone.BusinessLogic.Email;

public static class EmailOptionsHolder
{
    public static string SmtpHost { get; set; } = "smtp.gmail.com";
    public static int SmtpPort { get; set; } = 587;
    public static string Username { get; set; } = string.Empty;
    public static string Password { get; set; } = string.Empty;
    public static string FromAddress { get; set; } = string.Empty;
    public static string FromName { get; set; } = "BidZone";
    public static int ConfirmationTokenHours { get; set; } = 24;
    public static string FrontendUrl { get; set; } = "http://localhost:3000";
    public static string ResendApiKey { get; set; } = string.Empty;

    public static bool HasResend => !string.IsNullOrWhiteSpace(ResendApiKey);
    public static bool HasSmtp => !string.IsNullOrWhiteSpace(Username) && !string.IsNullOrWhiteSpace(Password);
    public static bool IsConfigured => HasResend || HasSmtp;
}
