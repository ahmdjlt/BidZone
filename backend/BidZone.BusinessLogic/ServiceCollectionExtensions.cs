using BidZone.BusinessLogic.Interface;
using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Security;
using BidZone.DataAccess.Interfaces;
using BidZone.DataAccess.Repositories;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace BidZone.BusinessLogic;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Înregistrează toate serviciile DAL (Repositories) și BLL (Logics + Agregator)
    /// astfel încât stratul UI (WebApi) să nu mai depindă direct de DAL.
    /// </summary>
    public static IServiceCollection AddBidZoneServices(this IServiceCollection services)
    {
        // DAL – Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuctionRepository, AuctionRepository>();
        services.AddScoped<IBidRepository, BidRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IWatchlistRepository, WatchlistRepository>();

        // BLL – Logics
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthLogic, AuthLogic>();
        services.AddScoped<IAuctionLogic, AuctionLogic>();
        services.AddScoped<IAuctionFinalizationService, AuctionFinalizationService>();
        services.AddScoped<IBidLogic, BidLogic>();
        services.AddScoped<ICategoryLogic, CategoryLogic>();
        services.AddScoped<IWatchlistLogic, WatchlistLogic>();
        services.AddScoped<IUserLogic, UserLogic>();
        services.AddScoped<IReportLogic, ReportLogic>();

        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        // FluentValidation
        services.AddValidatorsFromAssemblyContaining<MappingProfile>();

        return services;
    }
}
