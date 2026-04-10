using BidZone.BusinessLogic.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace BidZone.BusinessLogic;

public class BusinessLogic : IBusinessLogic
{
    private static IHttpContextAccessor? _httpContextAccessor;

    public BusinessLogic() { }

    public static void Configure(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public IAuthLogic AuthAction() => Resolve<IAuthLogic>();
    public IAuctionLogic AuctionAction() => Resolve<IAuctionLogic>();
    public IBidLogic BidAction() => Resolve<IBidLogic>();
    public ICategoryLogic CategoryAction() => Resolve<ICategoryLogic>();
    public IReportLogic ReportAction() => Resolve<IReportLogic>();
    public IUserLogic UserAction() => Resolve<IUserLogic>();
    public IWatchlistLogic WatchlistAction() => Resolve<IWatchlistLogic>();

    private static T Resolve<T>() where T : notnull
    {
        var requestServices = _httpContextAccessor?.HttpContext?.RequestServices;
        if (requestServices == null)
        {
            throw new InvalidOperationException("BusinessLogic is not configured with the current request services.");
        }

        return requestServices.GetRequiredService<T>();
    }
}
