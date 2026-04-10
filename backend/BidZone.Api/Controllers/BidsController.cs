using BidZone.BusinessLogic.Interface;
using BidZone.Api.Extensions;
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

    public BidsController()
    {
        var bl = new BusinessLogicFactory();
        _bid = bl.BidAction();
    }

    [HttpPost]
    [Authorize(Roles = "Buyer,Admin")]
    public async Task<IActionResult> PlaceBid([FromBody] PlaceBidDto dto)
    {
        var bidderId = User.GetRequiredUserId();
        var bid = await _bid.PlaceBidAsync(dto, bidderId);
        if (bid == null)
            return BadRequest(new { message = "Cannot place bid. Check auction status and bid amount." });
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

    [HttpGet("auction/{auctionId}/highest")]
    public async Task<IActionResult> GetHighestBid(int auctionId)
    {
        var bid = await _bid.GetHighestBidAsync(auctionId);
        if (bid == null)
            return NotFound();
        return Ok(bid);
    }
}
