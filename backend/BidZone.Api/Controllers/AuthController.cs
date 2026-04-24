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
        var result = await _auth.LoginAsync(request, GetClientIpAddress());
        if (!result.Succeeded || result.Response == null)
            return Unauthorized(new { message = "Invalid email or password" });

        WriteRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _auth.RegisterAsync(request, GetClientIpAddress());
        if (!result.Succeeded || result.Response == null)
        {
            return BadRequest(new
            {
                message = "Registration failed",
                errors = result.Errors
            });
        }

        WriteRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue(BidZone.BusinessLogic.Security.JwtOptionsHolder.RefreshCookieName, out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            ClearRefreshCookie();
            return Unauthorized(new { message = "Refresh token is missing." });
        }

        var result = await _auth.RefreshSessionAsync(refreshToken, GetClientIpAddress());
        if (!result.Succeeded || result.Response == null)
        {
            ClearRefreshCookie();
            return Unauthorized(new
            {
                message = result.Errors.FirstOrDefault() ?? "Session refresh failed."
            });
        }

        WriteRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.GetRequiredUserId();
        var result = await _auth.LogoutAsync(userId, GetClientIpAddress());
        ClearRefreshCookie();
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

    private string? GetClientIpAddress() => HttpContext.Connection.RemoteIpAddress?.ToString();

    private void WriteRefreshCookie(string? refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        Response.Cookies.Append(
            BidZone.BusinessLogic.Security.JwtOptionsHolder.RefreshCookieName,
            refreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps,
                Path = "/api/auth",
                Expires = DateTimeOffset.UtcNow.AddDays(BidZone.BusinessLogic.Security.JwtOptionsHolder.RefreshTokenDays)
            });
    }

    private void ClearRefreshCookie()
    {
        Response.Cookies.Delete(
            BidZone.BusinessLogic.Security.JwtOptionsHolder.RefreshCookieName,
            new CookieOptions
            {
                HttpOnly = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps,
                Path = "/api/auth"
            });
    }
}
