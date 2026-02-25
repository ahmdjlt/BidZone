using BidZone.DAL.Interfaces;

namespace BidZone.WebApi.Middleware;

public class AuthMiddleware
{
    private readonly RequestDelegate _next;

    public AuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ISessionRepository sessionRepo)
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
            var session = await sessionRepo.GetByTokenAsync(token);
            if (session != null)
            {
                context.Items["UserId"] = session.UserId;
                context.Items["UserRole"] = session.User.Role;
                context.Items["Token"] = token;
            }
        }

        await _next(context);
    }
}
