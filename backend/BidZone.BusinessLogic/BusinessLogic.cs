using BidZone.BusinessLogic.Interface;

namespace BidZone.BusinessLogic;

public class BusinessLogic : IBusinessLogic
{
    public BusinessLogic(
        IAuthLogic auth,
        IAuctionLogic auctions,
        IBidLogic bids,
        ICategoryLogic categories,
        IReportLogic reports,
        IUserLogic users,
        IWatchlistLogic watchlist)
    {
        Auth = auth;
        Auctions = auctions;
        Bids = bids;
        Categories = categories;
        Reports = reports;
        Users = users;
        Watchlist = watchlist;
    }

    public IAuthLogic Auth { get; }
    public IAuctionLogic Auctions { get; }
    public IBidLogic Bids { get; }
    public ICategoryLogic Categories { get; }
    public IReportLogic Reports { get; }
    public IUserLogic Users { get; }
    public IWatchlistLogic Watchlist { get; }
}
