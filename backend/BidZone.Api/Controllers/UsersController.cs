using BidZone.BusinessLogic.Interface;
using BidZone.Api.Extensions;
using BidZone.Domains.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    internal IUserLogic _user;

    public UsersController()
    {
        var bl = new BusinessLogicFactory();
        _user = bl.UserAction();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _user.GetByIdAsync(id);
        if (user == null)
            return NotFound();
        return Ok(user);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
    {
        var userId = User.GetRequiredUserId();
        var isAdmin = User.IsInRole("Admin");

        if (userId != id && !isAdmin)
            return Forbid();

        var existing = await _user.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        var user = await _user.UpdateAsync(id, dto);
        if (user == null)
        {
            return BadRequest(new { message = "Unable to update the profile. Email or username may already be in use." });
        }

        return Ok(user);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _user.GetAllAsync();
        return Ok(users);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetRequiredUserId();
        var isAdmin = User.IsInRole("Admin");

        if (userId != id && !isAdmin)
            return Forbid();

        var result = await _user.DeleteAsync(id);
        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }
}
