using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public UsersController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _businessLogic.Users.GetByIdAsync(id);
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

        var existing = await _businessLogic.Users.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        var user = await _businessLogic.Users.UpdateAsync(id, dto);
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
        var users = await _businessLogic.Users.GetAllAsync();
        return Ok(users);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _businessLogic.Users.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
