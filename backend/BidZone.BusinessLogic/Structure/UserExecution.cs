using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;
using BidZone.Domains.Responses;

namespace BidZone.BusinessLogic.Structure;

public class UserExecution : UserLogic, IUserLogic
{
    public Task<List<UserDto>> GetAllAsync() => GetAllExecution();
    public Task<UserDto?> GetByIdAsync(int id) => GetByIdExecution(id);
    public Task<UserDto?> GetProfileAsync(int userId) => GetByIdExecution(userId);
    public Task<UserDto?> UpdateAsync(int id, UserDto dto) => UpdateExecution(id, dto);
    public Task<ActionResponse> DeleteAsync(int id) => DeleteExecution(id);
}
