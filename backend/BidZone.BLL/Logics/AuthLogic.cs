using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.BLL.Security;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using BidZone.Models.Constants;
using Microsoft.Extensions.Logging;

namespace BidZone.BLL.Logics;

public class AuthLogic : IAuthLogic
{
    private readonly UserManager<User> _userManager;
    private readonly IUserRepository _userRepo;
    private readonly IMapper _mapper;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthLogic> _logger;

    public AuthLogic(
        UserManager<User> userManager,
        IUserRepository userRepo,
        IMapper mapper,
        IJwtTokenService jwtTokenService,
        ILogger<AuthLogic> logger)
    {
        _userManager = userManager;
        _userRepo = userRepo;
        _mapper = mapper;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequestDto request)
    {
        var normalizedEmail = _userManager.NormalizeEmail(request.Email.Trim());
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);
        if (user == null || !user.IsActive)
            return AuthResultDto.Failure("Invalid email or password.");

        if (await _userManager.IsLockedOutAsync(user))
            return AuthResultDto.Failure("Your account is locked.");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
            return AuthResultDto.Failure("Invalid email or password.");

        _logger.LogInformation("User {Email} logged in", request.Email);
        return AuthResultDto.Success(CreateAuthResponse(user));
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterRequestDto request)
    {
        var role = RoleConstants.Normalize(request.Role);
        if (role == null)
            return AuthResultDto.Failure("Role must be Buyer or Seller.");

        var user = new User
        {
            UserName = request.Username.Trim(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            EmailConfirmed = true,
            Role = role,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return AuthResultDto.Failure(result.Errors.Select(error => error.Description).ToArray());
        }

        _logger.LogInformation("User {Username} registered as {Role}", user.UserName, role);
        return AuthResultDto.Success(CreateAuthResponse(user));
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            return null;

        return _mapper.Map<UserDto>(user);
    }

    public async Task LogoutAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return;

        await _userManager.UpdateSecurityStampAsync(user);
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var token = _jwtTokenService.GenerateToken(user);
        return new AuthResponseDto
        {
            Token = token.Token,
            ExpiresAtUtc = token.ExpiresAtUtc,
            User = _mapper.Map<UserDto>(user)
        };
    }

}
