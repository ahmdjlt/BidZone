namespace BidZone.BusinessLogic.Interface;

public interface IBusinessLogic
{
    IAuthLogic AuthAction();
    IAuctionLogic AuctionAction();
    IBidLogic BidAction();
    ICategoryLogic CategoryAction();
    IReportLogic ReportAction();
    IUserLogic UserAction();
    IWatchlistLogic WatchlistAction();
    IAuctionFinalizationService AuctionFinalizationAction();
}
