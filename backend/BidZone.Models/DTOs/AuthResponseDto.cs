namespace BidZone.Models.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public DateTime ExpiresAtUtc { get; set; }
    public UserDto User { get; set; } = null!;
}
