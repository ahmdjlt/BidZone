namespace BidZone.DataAccess;

public static class DbSession
{
    public static string? ConnectionString { get; set; }

    public static bool IsSqliteConnectionString(string connectionString) =>
        connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase);
}
