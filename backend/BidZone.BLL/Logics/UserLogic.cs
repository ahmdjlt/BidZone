using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;
using Microsoft.AspNetCore.Identity;

namespace BidZone.BLL.Logics;

public class UserLogic : IUserLogic
{
    private readonly IUserRepository _userRepo;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;

    public UserLogic(IUserRepository userRepo, IMapper mapper, UserManager<User> userManager)
    {
        _userRepo = userRepo;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return _mapper.Map<List<UserDto>>(users);
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> GetProfileAsync(int userId)
    {
        return await GetByIdAsync(userId);
    }

    public async Task<UserDto?> UpdateAsync(int id, UserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null || !user.IsActive)
            return null;

        user.UserName = dto.Username.Trim();
        user.Email = dto.Email.Trim();
        user.FullName = dto.FullName.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return null;

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return false;

        user.IsActive = false;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return false;

        await _userManager.UpdateSecurityStampAsync(user);
        return true;
    }
}
