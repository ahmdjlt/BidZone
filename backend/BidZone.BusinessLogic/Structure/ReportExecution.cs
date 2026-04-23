using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Interface;
using BidZone.Domains.DTOs;

namespace BidZone.BusinessLogic.Structure;

public class ReportExecution : ReportLogic, IReportLogic
{
    public Task<DashboardStatsDto> GetDashboardStatsAsync() => GetDashboardStatsExecution();
    public Task<List<BidActivityDto>> GetBidActivityAsync(int days = 30) => GetBidActivityExecution(days);
}
