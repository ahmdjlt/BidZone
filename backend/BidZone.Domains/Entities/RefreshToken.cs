using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.Entities;

public class RefreshToken
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required, MaxLength(128)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    [MaxLength(128)]
    public string? ReplacedByTokenHash { get; set; }

    [MaxLength(64)]
    public string? CreatedByIp { get; set; }

    [MaxLength(64)]
    public string? RevokedByIp { get; set; }

    [MaxLength(200)]
    public string? Reason { get; set; }
}
