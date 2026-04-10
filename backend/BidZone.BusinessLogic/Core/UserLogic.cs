using AutoMapper;
using BidZone.BusinessLogic.Interface;
using BidZone.DataAccess.Interfaces;
using BidZone.Domains.DTOs;
using BidZone.Domains.Entities;
using BidZone.Domains.Responses;
using Microsoft.AspNetCore.Identity;

namespace BidZone.BusinessLogic.Core;

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

    public async Task<ActionResponse> DeleteAsync(int id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return ActionResponse.Failure("User was not found.");

        user.IsActive = false;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return ActionResponse.Failure("User could not be deleted.");

        await _userManager.UpdateSecurityStampAsync(user);
        return ActionResponse.Success("User deleted successfully.");
    }
}
