using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Structure;

public class AuthExecution : AuthLogic, IAuthLogic
{
    public Task<AuthResultDto> LoginAsync(LoginRequestDto request) => LoginExecution(request);
    public Task<AuthResultDto> RegisterAsync(RegisterRequestDto request) => RegisterExecution(request);
    public Task<UserDto?> GetCurrentUserAsync(int userId) => GetCurrentUserExecution(userId);
    public Task<ActionResponse> LogoutAsync(int userId) => LogoutExecution(userId);
}
