using BidZone.Models.Entities;

namespace BidZone.DAL.Interfaces;

public interface ISessionRepository
{
    Task<Session?> GetByTokenAsync(string token);
    Task<Session> InsertAsync(Session session);
    Task InvalidateAsync(string token);
    Task CleanExpiredAsync();
}
