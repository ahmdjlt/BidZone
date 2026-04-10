using BidZone.Domains.Entities;

namespace BidZone.BusinessLogic.Security;

public interface IJwtTokenService
{
    JwtTokenResult GenerateToken(User user);
}
