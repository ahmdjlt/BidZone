using BidZone.Models.Entities;

namespace BidZone.BLL.Security;

public interface IJwtTokenService
{
    JwtTokenResult GenerateToken(User user);
}
