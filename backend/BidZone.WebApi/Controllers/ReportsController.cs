using BidZone.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public ReportsController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _businessLogic.Reports.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("bid-activity")]
    public async Task<IActionResult> GetBidActivity([FromQuery] int days = 30)
    {
        var activity = await _businessLogic.Reports.GetBidActivityAsync(days);
        return Ok(activity);
    }
}
