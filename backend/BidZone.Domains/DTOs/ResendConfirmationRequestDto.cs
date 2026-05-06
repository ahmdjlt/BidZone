using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.DTOs;

public class ResendConfirmationRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}
