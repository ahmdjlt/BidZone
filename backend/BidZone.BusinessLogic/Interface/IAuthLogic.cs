using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Interface;

public interface IAuthLogic
{
    Task<AuthResultDto> LoginAsync(LoginRequestDto request);
    Task<AuthResultDto> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task LogoutAsync(int userId);
}
