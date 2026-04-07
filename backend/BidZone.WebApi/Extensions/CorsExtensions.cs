namespace BidZone.WebApi.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddBidZoneCors(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins(
                          Environment.GetEnvironmentVariable("FRONTEND_URL")
                          ?? configuration.GetValue<string>("FrontendUrl")
                          ?? "http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        return services;
    }
}
