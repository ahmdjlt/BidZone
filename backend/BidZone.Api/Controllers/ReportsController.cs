using BidZone.BusinessLogic.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    internal IReportLogic _report;

    public ReportsController()
    {
        var bl = new BusinessLogicFactory();
        _report = bl.ReportAction();
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _report.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("bid-activity")]
    public async Task<IActionResult> GetBidActivity([FromQuery] int days = 30)
    {
        var activity = await _report.GetBidActivityAsync(days);
        return Ok(activity);
    }
}
