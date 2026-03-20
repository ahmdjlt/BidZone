using BidZone.BLL.Interfaces;

namespace BidZone.WebApi.Middleware;

public class AuthMiddleware
{
    private readonly RequestDelegate _next;

    public AuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IAuthLogic authLogic)
    {
        string? token = null;

        // Try cookie first
        if (context.Request.Cookies.TryGetValue("bidzone_session", out var cookieToken))
        {
            token = cookieToken;
        }

        // Then try Authorization header
        if (string.IsNullOrEmpty(token))
        {
            var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                token = authHeader["Bearer ".Length..];
            }
        }

        if (!string.IsNullOrEmpty(token))
        {
            var user = await authLogic.ValidateTokenAsync(token);
            if (user != null)
            {
                context.Items["UserId"] = user.Id;
                context.Items["UserRole"] = user.Role;
                context.Items["Token"] = token;
            }
        }

        await _next(context);
    }
}
