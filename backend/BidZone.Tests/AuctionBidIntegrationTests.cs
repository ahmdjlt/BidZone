using BidZone.Domains.DTOs;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;
using Xunit;

namespace BidZone.Tests;

public class AuctionBidIntegrationTests : IClassFixture<SqliteAuthFixture>
{
    private readonly SqliteAuthFixture _fixture;

    public AuctionBidIntegrationTests(SqliteAuthFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateAuctionAsync_PersistsNewListingWithExpectedDefaults()
    {
        _fixture.ResetDatabase();
        var auctions = new BusinessLogicFactory().AuctionAction();

        var created = await auctions.CreateAsync(
            new CreateAuctionDto
            {
                Title = "Integration Test Listing",
                Description = "Created from integration test.",
                ImageUrl = "https://example.com/listing.jpg",
                StartingPrice = 150m,
                ReservePrice = 300m,
                EndTime = DateTime.UtcNow.AddDays(5),
                CategoryId = 1
            },
            sellerId: 2);

        Assert.True(created.Id > 0);
        Assert.Equal("Integration Test Listing", created.Title);
        Assert.Equal(2, created.SellerId);
        Assert.Equal("Active", created.Status);
        Assert.Equal(150m, created.StartingPrice);
        Assert.Equal(150m, created.CurrentPrice);
        Assert.Equal(0, created.BidCount);

        var fetched = await auctions.GetByIdAsync(created.Id);
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched!.Id);
    }

    [Fact]
    public async Task PlaceBidAsync_UpdatesCurrentPriceAndBidStatusesAcrossMultipleBids()
    {
        _fixture.ResetDatabase();
        var bl = new BusinessLogicFactory();
        var bids = bl.BidAction();
        var auctions = bl.AuctionAction();

        var firstBid = await bids.PlaceBidAsync(
            new PlaceBidDto
            {
                AuctionId = 1,
                Amount = 1200m
            },
            bidderId: 3);

        Assert.NotNull(firstBid);
        Assert.Equal("Winning", firstBid!.Status);
        Assert.Equal(1200m, firstBid.Amount);

        var secondBid = await bids.PlaceBidAsync(
            new PlaceBidDto
            {
                AuctionId = 1,
                Amount = 1300m
            },
            bidderId: 1);

        Assert.NotNull(secondBid);
        Assert.Equal("Winning", secondBid!.Status);
        Assert.Equal(1300m, secondBid.Amount);

        var auction = await auctions.GetByIdAsync(1);
        Assert.NotNull(auction);
        Assert.Equal(1300m, auction!.CurrentPrice);
        Assert.Equal(2, auction.BidCount);

        var allBids = await bids.GetByAuctionAsync(1);
        Assert.Equal(2, allBids.Count);
        Assert.Equal("Winning", allBids[0].Status);
        Assert.Equal(1300m, allBids[0].Amount);
        Assert.Contains(allBids, bid => bid.Amount == 1200m && bid.Status == "Outbid");
    }

    [Fact]
    public async Task PlaceBidAsync_ReturnsNull_WhenCurrentHighestBidderBidsAgain()
    {
        _fixture.ResetDatabase();
        var bl = new BusinessLogicFactory();
        var bids = bl.BidAction();
        var auctions = bl.AuctionAction();

        var firstBid = await bids.PlaceBidAsync(
            new PlaceBidDto
            {
                AuctionId = 1,
                Amount = 1200m
            },
            bidderId: 3);

        Assert.NotNull(firstBid);

        var secondBidSameBidder = await bids.PlaceBidAsync(
            new PlaceBidDto
            {
                AuctionId = 1,
                Amount = 1300m
            },
            bidderId: 3);

        Assert.Null(secondBidSameBidder);

        var auction = await auctions.GetByIdAsync(1);
        Assert.NotNull(auction);
        Assert.Equal(1200m, auction!.CurrentPrice);
        Assert.Equal(1, auction.BidCount);
    }

    [Fact]
    public async Task GetRecentAsync_ReturnsNewestBidsWithinRequestedLimit()
    {
        _fixture.ResetDatabase();
        var bids = new BusinessLogicFactory().BidAction();

        var firstBid = await bids.PlaceBidAsync(
            new PlaceBidDto
            {
                AuctionId = 1,
                Amount = 1200m
            },
            bidderId: 3);

        var secondBid = await bids.PlaceBidAsync(
            new PlaceBidDto
            {
                AuctionId = 1,
                Amount = 1300m
            },
            bidderId: 1);

        Assert.NotNull(firstBid);
        Assert.NotNull(secondBid);

        var recent = await bids.GetRecentAsync(1);

        Assert.Single(recent);
        Assert.Equal(secondBid!.Id, recent[0].Id);
        Assert.Equal("buyer1", firstBid!.BidderUsername);
        Assert.Equal("admin", secondBid.BidderUsername);
    }
}
