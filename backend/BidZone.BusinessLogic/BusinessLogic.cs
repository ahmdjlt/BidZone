using BidZone.BusinessLogic.Functions.Auth;
using BidZone.BusinessLogic.Interface;
using BidZone.BusinessLogic.Structure;

namespace BidZone.BusinessLogic;

public class BusinessLogic : IBusinessLogic
{
    public BusinessLogic() { }

    public IAuthLogic AuthAction() => new AuthFlow();
    public IAuctionLogic AuctionAction() => new AuctionExecution();
    public IBidLogic BidAction() => new BidExecution();
    public ICategoryLogic CategoryAction() => new CategoryExecution();
    public IReportLogic ReportAction() => new ReportExecution();
    public IUserLogic UserAction() => new UserExecution();
    public IWatchlistLogic WatchlistAction() => new WatchlistExecution();
    public IAuctionFinalizationService AuctionFinalizationAction() => new AuctionFinalizationExecution();
}
