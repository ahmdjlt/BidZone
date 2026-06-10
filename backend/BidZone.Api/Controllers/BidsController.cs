using BidZone.BusinessLogic.Interface;
using BidZone.Api.Extensions;
using BidZone.Api.Services;
using BidZone.Domains.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/bids")]
public class BidsController : ControllerBase
{
    internal IBidLogic _bid;
    private readonly AuctionSocketManager _socketManager;

    public BidsController(AuctionSocketManager socketManager)
    {
        var bl = new BusinessLogicFactory();
        _bid = bl.BidAction();
        _socketManager = socketManager;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PlaceBid([FromBody] PlaceBidDto dto)
    {
        var bidderId = User.GetRequiredUserId();
        var bid = await _bid.PlaceBidAsync(dto, bidderId);
        if (bid == null)
            return BadRequest(new { message = "Cannot place bid. Check auction status and bid amount." });
        await _socketManager.BroadcastBidAsync(bid, HttpContext.RequestAborted);
        return Ok(bid);
    }

    [HttpGet("auction/{auctionId}")]
    public async Task<IActionResult> GetByAuction(int auctionId)
    {
        var bids = await _bid.GetByAuctionAsync(auctionId);
        return Ok(bids);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyBids()
    {
        var userId = User.GetRequiredUserId();
        var bids = await _bid.GetByUserAsync(userId);
        return Ok(bids);
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 15)
    {
        var bids = await _bid.GetRecentAsync(limit);
        return Ok(bids);
    }

    [HttpGet("auction/{auctionId}/highest")]
    public async Task<IActionResult> GetHighestBid(int auctionId)
    {
        var bid = await _bid.GetHighestBidAsync(auctionId);
        if (bid == null)
            return NotFound();
        return Ok(bid);
    }
}
