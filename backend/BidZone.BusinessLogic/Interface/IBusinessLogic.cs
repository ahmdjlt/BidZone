namespace BidZone.BusinessLogic.Interface;

public interface IBusinessLogic
{
    IAuthLogic Auth { get; }
    IAuctionLogic Auctions { get; }
    IBidLogic Bids { get; }
    ICategoryLogic Categories { get; }
    IReportLogic Reports { get; }
    IUserLogic Users { get; }
    IWatchlistLogic Watchlist { get; }
}
