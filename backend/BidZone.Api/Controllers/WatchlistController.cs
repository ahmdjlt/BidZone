using BidZone.BusinessLogic.Interface;
using BidZone.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/watchlist")]
[Authorize]
public class WatchlistController : ControllerBase
{
    internal IWatchlistLogic _watchlist;

    public WatchlistController()
    {
        var bl = new BusinessLogicFactory();
        _watchlist = bl.WatchlistAction();
    }

    [HttpGet]
    public async Task<IActionResult> GetWatchlist()
    {
        var userId = User.GetRequiredUserId();
        var items = await _watchlist.GetUserWatchlistAsync(userId);
        return Ok(items);
    }

    [HttpPost("{auctionId}")]
    public async Task<IActionResult> Add(int auctionId)
    {
        var userId = User.GetRequiredUserId();
        var item = await _watchlist.AddAsync(userId, auctionId);
        if (item == null)
            return BadRequest(new { message = "Already watching or auction not found" });
        return Ok(item);
    }

    [HttpDelete("{auctionId}")]
    public async Task<IActionResult> Remove(int auctionId)
    {
        var userId = User.GetRequiredUserId();
        await _watchlist.RemoveAsync(userId, auctionId);
        return NoContent();
    }
}
