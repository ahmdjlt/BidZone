using BidZone.Models.DTOs;

namespace BidZone.BLL.Interfaces;

public interface IReportLogic
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<List<BidActivityDto>> GetBidActivityAsync(int days = 30);
}
