using System.ComponentModel.DataAnnotations;

namespace BidZone.Models.DTOs;

public class RegisterRequestDto
{
    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Buyer"; // Buyer or Seller
}
