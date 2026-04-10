namespace BidZone.Domains.Constants;

public static class RoleConstants
{
    public const string Admin = "Admin";
    public const string Seller = "Seller";
    public const string Buyer = "Buyer";

    public static readonly string[] AllowedRegistrationRoles = [Buyer, Seller];

    public static string? Normalize(string role)
    {
        if (string.Equals(role, Buyer, StringComparison.OrdinalIgnoreCase))
            return Buyer;

        if (string.Equals(role, Seller, StringComparison.OrdinalIgnoreCase))
            return Seller;

        return null;
    }
}
