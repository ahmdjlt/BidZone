using BidZone.BLL.Interfaces;
using BidZone.WebApi.Filters;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/watchlist")]
[AuthorizeRoles]
public class WatchlistController : ControllerBase
{
    private readonly IWatchlistLogic _watchlistLogic;

    public WatchlistController(IWatchlistLogic watchlistLogic)
    {
        _watchlistLogic = watchlistLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetWatchlist()
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var items = await _watchlistLogic.GetUserWatchlistAsync(userId);
        return Ok(items);
    }

    [HttpPost("{auctionId}")]
    public async Task<IActionResult> Add(int auctionId)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var item = await _watchlistLogic.AddAsync(userId, auctionId);
        if (item == null)
            return BadRequest(new { message = "Already watching or auction not found" });
        return Ok(item);
    }

    [HttpDelete("{auctionId}")]
    public async Task<IActionResult> Remove(int auctionId)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        await _watchlistLogic.RemoveAsync(userId, auctionId);
        return NoContent();
    }
}
