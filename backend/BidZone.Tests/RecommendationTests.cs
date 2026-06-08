using BidZone.Domains.DTOs;
using Microsoft.EntityFrameworkCore;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;
using Xunit;

namespace BidZone.Tests;

public class RecommendationTests : IClassFixture<SqliteAuthFixture>
{
    private readonly SqliteAuthFixture _fixture;

    public RecommendationTests(SqliteAuthFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task RecordBrowsingEventAsync_StoresAuctionViewWithCategoryContext()
    {
        _fixture.ResetDatabase();
        var auctions = new BusinessLogicFactory().AuctionAction();

        await auctions.RecordBrowsingEventAsync(
            new RecordBrowsingEventDto
            {
                EventType = "AuctionView",
                AuctionId = 2
            },
            userId: 3);

        using var db = _fixture.CreateDbContext();
        var stored = await db.BrowsingEvents.SingleAsync();

        Assert.Equal(3, stored.UserId);
        Assert.Equal(2, stored.AuctionId);
        Assert.Equal(4, stored.CategoryId);
        Assert.Equal("AuctionView", stored.EventType);
    }

    [Fact]
    public async Task GetRecommendationsAsync_RanksAuctionsBySearchSignals()
    {
        _fixture.ResetDatabase();
        var auctions = new BusinessLogicFactory().AuctionAction();

        await auctions.RecordBrowsingEventAsync(
            new RecordBrowsingEventDto
            {
                EventType = "Search",
                SearchTerm = "rolex"
            },
            userId: 3);

        var recommendations = await auctions.GetRecommendationsAsync(userId: 3, limit: 3);

        Assert.NotEmpty(recommendations);
        Assert.Equal(2, recommendations[0].Id);
    }

    [Fact]
    public async Task GetRecommendationsAsync_ReturnsFallbackAuctionsWithoutPersonalSignals()
    {
        _fixture.ResetDatabase();
        var auctions = new BusinessLogicFactory().AuctionAction();

        var recommendations = await auctions.GetRecommendationsAsync(userId: null, limit: 3);

        Assert.Equal(3, recommendations.Count);
        Assert.All(recommendations, auction => Assert.Equal("Active", auction.Status));
    }
}
