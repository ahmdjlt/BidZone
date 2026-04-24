using BidZone.BusinessLogic.Security;
using BidZone.DataAccess;
using BidZone.DataAccess.Context;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Tests;

public sealed class SqliteAuthFixture : IDisposable
{
    private readonly string _databasePath = Path.Combine(
        Path.GetTempPath(),
        $"bidzone-auth-{Guid.NewGuid():N}.db");

    public SqliteAuthFixture()
    {
        DbSession.ConnectionString = $"Data Source={_databasePath}";
        JwtOptionsHolder.Issuer = "BidZone.Tests";
        JwtOptionsHolder.Audience = "BidZone.Tests";
        JwtOptionsHolder.Key = "BidZone.Tests.Jwt.Key.2026.This.Is.Long.Enough";
        JwtOptionsHolder.AccessTokenMinutes = 15;
        JwtOptionsHolder.RefreshTokenDays = 7;
        JwtOptionsHolder.RefreshCookieName = "bidzone.test.refresh";
        ResetDatabase();
    }

    public void ResetDatabase()
    {
        using var db = CreateDbContext();
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }

    public AppDbContext CreateDbContext() => new();

    public void Dispose()
    {
        using var db = CreateDbContext();
        db.Database.EnsureDeleted();

        if (File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }
}
