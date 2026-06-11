using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.DTOs;

public class LoginRequestDto
{
    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(256)]
    public string Password { get; set; } = string.Empty;
}
