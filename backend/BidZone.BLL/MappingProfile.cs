using AutoMapper;
using BidZone.Models.DTOs;
using BidZone.Models.Entities;

namespace BidZone.BLL;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(d => d.Username, o => o.MapFrom(s => s.UserName ?? string.Empty));

        CreateMap<Auction, AuctionDto>()
            .ForMember(d => d.SellerUsername, o => o.MapFrom(s => s.Seller != null ? s.Seller.UserName : string.Empty))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.CategorySlug, o => o.MapFrom(s => s.Category != null ? s.Category.Slug : string.Empty))
            .ForMember(d => d.BidCount, o => o.MapFrom(s => s.Bids != null ? s.Bids.Count : 0));

        CreateMap<Auction, AuctionSummaryDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.CategorySlug, o => o.MapFrom(s => s.Category != null ? s.Category.Slug : string.Empty))
            .ForMember(d => d.BidCount, o => o.MapFrom(s => s.Bids != null ? s.Bids.Count : 0));

        CreateMap<Bid, BidDto>()
            .ForMember(d => d.BidderUsername, o => o.MapFrom(s => s.Bidder != null ? s.Bidder.UserName : string.Empty))
            .ForMember(d => d.AuctionTitle, o => o.MapFrom(s => s.Auction != null ? s.Auction.Title : string.Empty));

        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.AuctionCount, o => o.MapFrom(s => s.Auctions != null ? s.Auctions.Count : 0));

        CreateMap<WatchlistItem, WatchlistDto>()
            .ForMember(d => d.AuctionTitle, o => o.MapFrom(s => s.Auction != null ? s.Auction.Title : string.Empty))
            .ForMember(d => d.AuctionImageUrl, o => o.MapFrom(s => s.Auction != null ? s.Auction.ImageUrl : null))
            .ForMember(d => d.CurrentPrice, o => o.MapFrom(s => s.Auction != null ? s.Auction.CurrentPrice : 0))
            .ForMember(d => d.EndTime, o => o.MapFrom(s => s.Auction != null ? s.Auction.EndTime : DateTime.MinValue))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Auction != null ? s.Auction.Status : string.Empty));
    }
}
