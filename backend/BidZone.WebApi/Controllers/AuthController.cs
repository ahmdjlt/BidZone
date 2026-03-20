using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Filters;
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
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _businessLogic.Auth.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password" });

        SetSessionCookie(result.Token);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _businessLogic.Auth.RegisterAsync(request);
        if (result == null)
            return BadRequest(new { message = "Email or username already exists" });

        SetSessionCookie(result.Token);
        return Ok(result);
    }

    [HttpPost("logout")]
    [AuthorizeRoles]
    public async Task<IActionResult> Logout()
    {
        var token = HttpContext.Items["Token"]?.ToString();
        if (token != null)
        {
            await _businessLogic.Auth.LogoutAsync(token);
            Response.Cookies.Delete("bidzone_session");
        }
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("me")]
    [AuthorizeRoles]
    public async Task<IActionResult> GetCurrentUser()
    {
        var token = HttpContext.Items["Token"]?.ToString();
        if (token == null)
            return Unauthorized();

        var user = await _businessLogic.Auth.ValidateTokenAsync(token);
        if (user == null)
            return Unauthorized();

        return Ok(user);
    }

    private void SetSessionCookie(string token)
    {
        Response.Cookies.Append("bidzone_session", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(24),
            Path = "/"
        });
    }
}
