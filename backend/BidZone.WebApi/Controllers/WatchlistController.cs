using BidZone.BLL.Interfaces;
using BidZone.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/watchlist")]
[Authorize]
public class WatchlistController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public WatchlistController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetWatchlist()
    {
        var userId = User.GetRequiredUserId();
        var items = await _businessLogic.Watchlist.GetUserWatchlistAsync(userId);
        return Ok(items);
    }

    [HttpPost("{auctionId}")]
    public async Task<IActionResult> Add(int auctionId)
    {
        var userId = User.GetRequiredUserId();
        var item = await _businessLogic.Watchlist.AddAsync(userId, auctionId);
        if (item == null)
            return BadRequest(new { message = "Already watching or auction not found" });
        return Ok(item);
    }

    [HttpDelete("{auctionId}")]
    public async Task<IActionResult> Remove(int auctionId)
    {
        var userId = User.GetRequiredUserId();
        await _businessLogic.Watchlist.RemoveAsync(userId, auctionId);
        return NoContent();
    }
}
