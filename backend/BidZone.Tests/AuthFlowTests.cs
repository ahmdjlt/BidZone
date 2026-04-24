using BidZone.BusinessLogic.Security;
using BidZone.Domains.DTOs;
using Microsoft.EntityFrameworkCore;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;
using Xunit;

namespace BidZone.Tests;

public class AuthFlowTests : IClassFixture<SqliteAuthFixture>
{
    private readonly SqliteAuthFixture _fixture;

    public AuthFlowTests(SqliteAuthFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task LoginAsync_IssuesAccessAndRefreshTokens()
    {
        _fixture.ResetDatabase();
        var auth = new BusinessLogicFactory().AuthAction();

        var result = await auth.LoginAsync(
            new LoginRequestDto
            {
                Email = "buyer1@bidzone.com",
                Password = "Buyer123A"
            },
            "127.0.0.1");

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Response);
        Assert.False(string.IsNullOrWhiteSpace(result.Response!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));

        using var db = _fixture.CreateDbContext();
        var storedHash = RefreshTokenService.HashToken(result.RefreshToken!);
        var storedToken = await db.RefreshTokens.SingleOrDefaultAsync(token => token.TokenHash == storedHash);

        Assert.NotNull(storedToken);
        Assert.Equal("127.0.0.1", storedToken!.CreatedByIp);
    }

    [Fact]
    public async Task RefreshSessionAsync_RotatesRefreshToken()
    {
        _fixture.ResetDatabase();
        var auth = new BusinessLogicFactory().AuthAction();
        var loginResult = await auth.LoginAsync(
            new LoginRequestDto
            {
                Email = "buyer1@bidzone.com",
                Password = "Buyer123A"
            },
            "127.0.0.1");

        var refreshResult = await auth.RefreshSessionAsync(loginResult.RefreshToken!, "127.0.0.2");

        Assert.True(refreshResult.Succeeded);
        Assert.NotEqual(loginResult.RefreshToken, refreshResult.RefreshToken);
        Assert.NotNull(refreshResult.Response);
        Assert.False(string.IsNullOrWhiteSpace(refreshResult.Response!.AccessToken));

        using var db = _fixture.CreateDbContext();
        var originalToken = await db.RefreshTokens.SingleAsync(token =>
            token.TokenHash == RefreshTokenService.HashToken(loginResult.RefreshToken!));
        var rotatedToken = await db.RefreshTokens.SingleAsync(token =>
            token.TokenHash == RefreshTokenService.HashToken(refreshResult.RefreshToken!));

        Assert.NotNull(originalToken.RevokedAtUtc);
        Assert.Equal(rotatedToken.TokenHash, originalToken.ReplacedByTokenHash);
        Assert.Equal("127.0.0.2", originalToken.RevokedByIp);
        Assert.Null(rotatedToken.RevokedAtUtc);
    }

    [Fact]
    public async Task LogoutAsync_RevokesRefreshTokensAndInvalidatesSecurityStamp()
    {
        _fixture.ResetDatabase();
        var auth = new BusinessLogicFactory().AuthAction();
        var loginResult = await auth.LoginAsync(
            new LoginRequestDto
            {
                Email = "buyer1@bidzone.com",
                Password = "Buyer123A"
            },
            "127.0.0.1");

        string initialSecurityStamp;
        using (var beforeLogoutDb = _fixture.CreateDbContext())
        {
            initialSecurityStamp = (await beforeLogoutDb.Users.SingleAsync(user => user.Email == "buyer1@bidzone.com")).SecurityStamp!;
        }

        var logoutResult = await auth.LogoutAsync(loginResult.Response!.User.Id, "127.0.0.3");
        var refreshAfterLogout = await auth.RefreshSessionAsync(loginResult.RefreshToken!, "127.0.0.4");

        Assert.True(logoutResult.IsSuccess);
        Assert.False(refreshAfterLogout.Succeeded);

        using var db = _fixture.CreateDbContext();
        var user = await db.Users.SingleAsync(currentUser => currentUser.Email == "buyer1@bidzone.com");
        var token = await db.RefreshTokens.SingleAsync(currentToken =>
            currentToken.TokenHash == RefreshTokenService.HashToken(loginResult.RefreshToken!));

        Assert.NotEqual(initialSecurityStamp, user.SecurityStamp);
        Assert.NotNull(token.RevokedAtUtc);
        Assert.Equal("127.0.0.3", token.RevokedByIp);
    }

    [Fact]
    public async Task RegisterAsync_CreatesSellerAndStoresRefreshToken()
    {
        _fixture.ResetDatabase();
        var auth = new BusinessLogicFactory().AuthAction();

        var result = await auth.RegisterAsync(
            new RegisterRequestDto
            {
                Username = "seller-two",
                FullName = "Seller Two",
                Email = "seller-two@bidzone.com",
                Password = "Seller123A",
                Role = "Seller"
            },
            "127.0.0.5");

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Response);
        Assert.Equal("Seller", result.Response!.User.Role);
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));

        using var db = _fixture.CreateDbContext();
        var user = await db.Users.SingleAsync(currentUser => currentUser.Email == "seller-two@bidzone.com");
        var refreshToken = await db.RefreshTokens.SingleAsync(currentToken => currentToken.UserId == user.Id);

        Assert.Equal("Seller", user.Role);
        Assert.Equal(RefreshTokenService.HashToken(result.RefreshToken!), refreshToken.TokenHash);
    }
}
