using System.ComponentModel.DataAnnotations;

namespace BidZone.Models.Entities;

public class Session
{
    public int Id { get; set; }

    [Required]
    public string Token { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public bool IsValid { get; set; } = true;
}
