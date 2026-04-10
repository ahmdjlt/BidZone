using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Interface;

public interface IReportLogic
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<List<BidActivityDto>> GetBidActivityAsync(int days = 30);
}
