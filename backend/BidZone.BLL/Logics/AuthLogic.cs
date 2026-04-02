using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;

namespace BidZone.BLL.Logics;

public class AuthLogic : IAuthLogic
{
    private readonly IUserRepository _userRepo;
    private readonly ISessionRepository _sessionRepo;
    private readonly IMapper _mapper;

    public AuthLogic(IUserRepository userRepo, ISessionRepository sessionRepo, IMapper mapper)
    {
        _userRepo = userRepo;
        _sessionRepo = sessionRepo;
        _mapper = mapper;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
            return null;

        var hash = ComputeMd5(request.Password);
        if (user.PasswordHash != hash)
            return null;

        var session = new Session
        {
            Token = Guid.NewGuid().ToString("N"),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            IsValid = true
        };

        await _sessionRepo.InsertAsync(session);

        return new AuthResponseDto
        {
            Token = session.Token,
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request)
    {
        var existingEmail = await _userRepo.GetByEmailAsync(request.Email);
        if (existingEmail != null)
            return null;

        var existingUsername = await _userRepo.GetByUsernameAsync(request.Username);
        if (existingUsername != null)
            return null;

        var user = new User
        {
            Username = request.Username,
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = ComputeMd5(request.Password),
            Role = request.Role == "Seller" ? "Seller" : "Buyer",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userRepo.InsertAsync(user);

        var session = new Session
        {
            Token = Guid.NewGuid().ToString("N"),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            IsValid = true
        };

        await _sessionRepo.InsertAsync(session);

        return new AuthResponseDto
        {
            Token = session.Token,
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<UserDto?> ValidateTokenAsync(string token)
    {
        var session = await _sessionRepo.GetByTokenAsync(token);
        if (session == null)
            return null;

        return _mapper.Map<UserDto>(session.User);
    }

    public async Task LogoutAsync(string token)
    {
        await _sessionRepo.InvalidateAsync(token);
    }

    private static string ComputeMd5(string input)
    {
        var bytes = MD5.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
