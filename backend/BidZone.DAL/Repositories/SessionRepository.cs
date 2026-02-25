using BidZone.DAL.Interfaces;
using BidZone.Models;
using BidZone.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.DAL.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly AppDbContext _context;

    public SessionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Session?> GetByTokenAsync(string token)
        => await _context.Sessions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Token == token && s.IsValid && s.ExpiresAt > DateTime.UtcNow);

    public async Task<Session> InsertAsync(Session session)
    {
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task InvalidateAsync(string token)
    {
        var session = await _context.Sessions.FirstOrDefaultAsync(s => s.Token == token);
        if (session != null)
        {
            session.IsValid = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task CleanExpiredAsync()
    {
        var expired = await _context.Sessions
            .Where(s => s.ExpiresAt <= DateTime.UtcNow || !s.IsValid)
            .ToListAsync();
        _context.Sessions.RemoveRange(expired);
        await _context.SaveChangesAsync();
    }
}
