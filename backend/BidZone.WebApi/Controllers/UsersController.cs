using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Filters;
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
    [AuthorizeRoles]
    public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var role = HttpContext.Items["UserRole"]?.ToString();

        if (userId != id && role != "Admin")
            return Forbid();

        var user = await _businessLogic.Users.UpdateAsync(id, dto);
        if (user == null)
            return NotFound();
        return Ok(user);
    }

    [HttpGet]
    [AuthorizeRoles("Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _businessLogic.Users.GetAllAsync();
        return Ok(users);
    }

    [HttpDelete("{id}")]
    [AuthorizeRoles("Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _businessLogic.Users.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
