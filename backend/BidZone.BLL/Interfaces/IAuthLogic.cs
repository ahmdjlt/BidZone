using BidZone.Models.DTOs;

namespace BidZone.BLL.Interfaces;

public interface IAuthLogic
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> ValidateTokenAsync(string token);
    Task LogoutAsync(string token);
}
