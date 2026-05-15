using System.Text.RegularExpressions;

namespace BidZone.BusinessLogic.Helpers;

public static partial class SlugHelper
{
    private const string Chars = "abcdefghijklmnopqrstuvwxyz0123456789";

    public static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = NonAlphanumericSpaceRegex().Replace(slug, "");
        slug = WhitespaceRegex().Replace(slug, "-");
        slug = slug.Trim('-');
        var suffix = GenerateSuffix(4);
        return $"{slug}-{suffix}";
    }

    private static string GenerateSuffix(int length) =>
        new(Enumerable.Range(0, length)
            .Select(_ => Chars[Random.Shared.Next(Chars.Length)])
            .ToArray());

    [GeneratedRegex(@"[^a-z0-9\s]")]
    private static partial Regex NonAlphanumericSpaceRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
