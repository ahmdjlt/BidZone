using BidZone.BLL.Interfaces;
using BidZone.WebApi.Filters;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/reports")]
[AuthorizeRoles("Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportLogic _reportLogic;

    public ReportsController(IReportLogic reportLogic)
    {
        _reportLogic = reportLogic;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _reportLogic.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("bid-activity")]
    public async Task<IActionResult> GetBidActivity([FromQuery] int days = 30)
    {
        var activity = await _reportLogic.GetBidActivityAsync(days);
        return Ok(activity);
    }
}
