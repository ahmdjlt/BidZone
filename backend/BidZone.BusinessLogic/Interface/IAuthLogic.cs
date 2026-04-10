using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Interface;

public interface IAuthLogic
{
    Task<AuthResultDto> LoginAsync(LoginRequestDto request);
    Task<AuthResultDto> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task<ActionResponse> LogoutAsync(int userId);
}
