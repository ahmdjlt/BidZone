using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/bids")]
public class BidsController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public BidsController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpPost]
    [Authorize(Roles = "Buyer,Admin")]
    public async Task<IActionResult> PlaceBid([FromBody] PlaceBidDto dto)
    {
        var bidderId = User.GetRequiredUserId();
        var bid = await _businessLogic.Bids.PlaceBidAsync(dto, bidderId);
        if (bid == null)
            return BadRequest(new { message = "Cannot place bid. Check auction status and bid amount." });
        return Ok(bid);
    }

    [HttpGet("auction/{auctionId}")]
    public async Task<IActionResult> GetByAuction(int auctionId)
    {
        var bids = await _businessLogic.Bids.GetByAuctionAsync(auctionId);
        return Ok(bids);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyBids()
    {
        var userId = User.GetRequiredUserId();
        var bids = await _businessLogic.Bids.GetByUserAsync(userId);
        return Ok(bids);
    }

    [HttpGet("auction/{auctionId}/highest")]
    public async Task<IActionResult> GetHighestBid(int auctionId)
    {
        var bid = await _businessLogic.Bids.GetHighestBidAsync(auctionId);
        if (bid == null)
            return NotFound();
        return Ok(bid);
    }
}
