using BidZone.Models.DTOs;

namespace BidZone.BLL.Interfaces;

public interface IAuthLogic
{
    Task<AuthResultDto> LoginAsync(LoginRequestDto request);
    Task<AuthResultDto> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task LogoutAsync(int userId);
}
