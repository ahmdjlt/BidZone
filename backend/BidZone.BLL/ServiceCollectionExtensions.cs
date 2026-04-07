using BidZone.BLL.Interfaces;
using BidZone.BLL.Logics;
using BidZone.BLL.Security;
using BidZone.DAL.Interfaces;
using BidZone.DAL.Repositories;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace BidZone.BLL;

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

        // BLL – Agregator central
        services.AddScoped<IBusinessLogic, BusinessLogic>();

        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        // FluentValidation
        services.AddValidatorsFromAssemblyContaining<MappingProfile>();

        return services;
    }
}
