using BidZone.BusinessLogic.Core.Auth;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Functions.Auth;

public class AuthFlow : AuthActions, IAuthLogic
{
    public Task<AuthResultDto> LoginAsync(LoginRequestDto request, string? ipAddress = null) => LoginExecution(request, ipAddress);
    public Task<AuthResultDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null) => RegisterExecution(request, ipAddress);
    public Task<AuthResultDto> ConfirmEmailAsync(ConfirmEmailRequestDto request) => ConfirmEmailExecution(request);
    public Task<AuthResultDto> ResendConfirmationAsync(ResendConfirmationRequestDto request) => ResendConfirmationExecution(request);
    public Task<AuthResultDto> RefreshSessionAsync(string refreshToken, string? ipAddress = null) => RefreshExecution(refreshToken, ipAddress);
    public Task<UserDto?> GetCurrentUserAsync(int userId) => GetCurrentUserExecution(userId);
    public Task<ActionResponse> LogoutAsync(int userId, string? ipAddress = null) => LogoutExecution(userId, ipAddress);
}
