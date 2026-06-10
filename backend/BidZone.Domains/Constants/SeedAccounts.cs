namespace BidZone.Domains.Constants;

/// <summary>
/// Identifiers for the demo/seed accounts inserted via EF data seeding
/// (admin, seller1, buyer1, bidzone). These are not real marketplace users,
/// so their activity is excluded from marketplace reporting/statistics.
/// </summary>
public static class SeedAccounts
{
    public static readonly int[] UserIds = { 1, 2, 3, 1000 };
}
