using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;

namespace BidZone.BLL.Logics;

public class UserLogic : IUserLogic
{
    private readonly IUserRepository _userRepo;
    private readonly IMapper _mapper;

    public UserLogic(IUserRepository userRepo, IMapper mapper)
    {
        _userRepo = userRepo;
        _mapper = mapper;
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
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return null;

        user.Username = dto.Username;
        user.Email = dto.Email;

        await _userRepo.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return false;

        user.IsActive = false;
        await _userRepo.UpdateAsync(user);
        return true;
    }
}
