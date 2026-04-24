using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Interface;

public interface IAuthLogic
{
    Task<AuthResultDto> LoginAsync(LoginRequestDto request, string? ipAddress = null);
    Task<AuthResultDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null);
    Task<AuthResultDto> RefreshSessionAsync(string refreshToken, string? ipAddress = null);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task<ActionResponse> LogoutAsync(int userId, string? ipAddress = null);
}
