using BidZone.Api.Extensions;
using BidZone.Api.Services;
using BidZone.BusinessLogic.Security;
using BidZone.DataAccess;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

LoadEnvironmentFile();

// Connection string — expus via DbSession static (pattern eUShop/eBookStore)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
DbSession.ConnectionString = connectionString
    ?? throw new InvalidOperationException("A database connection string must be configured.");

// JWT — opțiuni stocate într-un holder static, nu DI
ApplyEnvironmentOverride(builder.Configuration, "Jwt:Issuer", "JWT_ISSUER");
ApplyEnvironmentOverride(builder.Configuration, "Jwt:Audience", "JWT_AUDIENCE");
ApplyEnvironmentOverride(builder.Configuration, "Jwt:Key", "JWT_KEY");
ApplyEnvironmentOverride(builder.Configuration, "Jwt:AccessTokenMinutes", "JWT_ACCESS_TOKEN_MINUTES");
ApplyEnvironmentOverride(builder.Configuration, "Jwt:RefreshTokenDays", "JWT_REFRESH_TOKEN_DAYS");
ApplyEnvironmentOverride(builder.Configuration, "Jwt:RefreshCookieName", "JWT_REFRESH_COOKIE_NAME");

var jwtSection = builder.Configuration.GetSection("Jwt");
JwtOptionsHolder.Issuer = jwtSection["Issuer"] ?? string.Empty;
JwtOptionsHolder.Audience = jwtSection["Audience"] ?? string.Empty;
JwtOptionsHolder.Key = jwtSection["Key"] ?? string.Empty;
if (int.TryParse(jwtSection["AccessTokenMinutes"], out var accessMinutes))
{
    JwtOptionsHolder.AccessTokenMinutes = accessMinutes;
}
if (int.TryParse(jwtSection["RefreshTokenDays"], out var refreshDays))
{
    JwtOptionsHolder.RefreshTokenDays = refreshDays;
}
JwtOptionsHolder.RefreshCookieName = jwtSection["RefreshCookieName"] ?? JwtOptionsHolder.RefreshCookieName;

// Middleware: auth + Swagger + CORS (DI obligatoriu pt. framework, nu pt. BLL/DAL)
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerDocumentation();
builder.Services.AddBidZoneCors(builder.Configuration);
builder.Services.AddHostedService<AuctionFinalizationHostedService>();
builder.Services.AddControllers();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static void ApplyEnvironmentOverride(IConfiguration configuration, string configKey, string environmentKey)
{
    var value = Environment.GetEnvironmentVariable(environmentKey);
    if (!string.IsNullOrWhiteSpace(value))
    {
        configuration[configKey] = value;
    }
}

static void LoadEnvironmentFile()
{
    var currentDirectory = Directory.GetCurrentDirectory();
    var candidates = new[]
    {
        Path.Combine(currentDirectory, ".env"),
        Path.Combine(currentDirectory, "BidZone.Api", ".env")
    };

    foreach (var candidate in candidates)
    {
        if (File.Exists(candidate))
        {
            Env.Load(candidate);
            break;
        }
    }
}

public partial class Program;
