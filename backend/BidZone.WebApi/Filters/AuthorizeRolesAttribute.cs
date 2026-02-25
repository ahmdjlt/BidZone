using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace BidZone.WebApi.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeRolesAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _roles;

    public AuthorizeRolesAttribute(params string[] roles)
    {
        _roles = roles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var userId = context.HttpContext.Items["UserId"];
        if (userId == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (_roles.Length > 0)
        {
            var userRole = context.HttpContext.Items["UserRole"]?.ToString();
            if (userRole == null || !_roles.Contains(userRole))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}
