using BidZone.BusinessLogic.Interface;
using BidZone.Api.Extensions;
using BidZone.Domains.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    internal IAuthLogic _auth;

    public AuthController()
    {
        var bl = new BusinessLogicFactory();
        _auth = bl.AuthAction();
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _auth.LoginAsync(request);
        if (!result.Succeeded || result.Response == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result.Response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _auth.RegisterAsync(request);
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
        var result = await _auth.LogoutAsync(userId);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.GetRequiredUserId();
        var user = await _auth.GetCurrentUserAsync(userId);
        if (user == null)
            return Unauthorized();

        return Ok(user);
    }
}
