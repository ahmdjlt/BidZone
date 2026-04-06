using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public AuthController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _businessLogic.Auth.LoginAsync(request);
        if (!result.Succeeded || result.Response == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result.Response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _businessLogic.Auth.RegisterAsync(request);
        if (!result.Succeeded || result.Response == null)
        {
            return BadRequest(new
            {
                message = "Registration failed",
                errors = result.Errors
            });
        }

        return Ok(result.Response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.GetRequiredUserId();
        await _businessLogic.Auth.LogoutAsync(userId);
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.GetRequiredUserId();
        var user = await _businessLogic.Auth.GetCurrentUserAsync(userId);
        if (user == null)
            return Unauthorized();

        return Ok(user);
    }
}
