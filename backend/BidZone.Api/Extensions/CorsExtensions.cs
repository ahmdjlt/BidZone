namespace BidZone.Api.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddBidZoneCors(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                var origins = (Environment.GetEnvironmentVariable("CORS_ORIGINS")
                              ?? configuration.GetValue<string>("CorsOrigins")
                              ?? Environment.GetEnvironmentVariable("FRONTEND_URL")
                              ?? configuration.GetValue<string>("FrontendUrl")
                              ?? "http://localhost:3000")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                policy.WithOrigins(origins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        return services;
    }
}
