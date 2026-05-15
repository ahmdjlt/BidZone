using BidZone.Api.Extensions;
using BidZone.Api.Services;
using BidZone.BusinessLogic.Email;
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

if (!builder.Environment.IsDevelopment()
    && string.Equals(
        JwtOptionsHolder.Key,
        "BidZone.Dev.Jwt.Key.2026.Change.This.To.A.Real.Secret",
        StringComparison.Ordinal))
{
    throw new InvalidOperationException("Configure JWT_KEY before running BidZone.Api outside Development.");
}

// Email — same static-holder pattern, allow env overrides for credentials
ApplyEnvironmentOverride(builder.Configuration, "Email:Username", "EMAIL_USERNAME");
ApplyEnvironmentOverride(builder.Configuration, "Email:Password", "EMAIL_PASSWORD");
ApplyEnvironmentOverride(builder.Configuration, "Email:FromAddress", "EMAIL_FROM_ADDRESS");
ApplyEnvironmentOverride(builder.Configuration, "Email:FromName", "EMAIL_FROM_NAME");
ApplyEnvironmentOverride(builder.Configuration, "Email:ResendApiKey", "RESEND_API_KEY");
ApplyEnvironmentOverride(builder.Configuration, "FrontendUrl", "FRONTEND_URL");

var emailSection = builder.Configuration.GetSection("Email");
EmailOptionsHolder.SmtpHost = emailSection["SmtpHost"] ?? EmailOptionsHolder.SmtpHost;
if (int.TryParse(emailSection["SmtpPort"], out var smtpPort))
{
    EmailOptionsHolder.SmtpPort = smtpPort;
}
EmailOptionsHolder.Username = emailSection["Username"] ?? string.Empty;
EmailOptionsHolder.Password = emailSection["Password"] ?? string.Empty;
EmailOptionsHolder.FromAddress = emailSection["FromAddress"] ?? string.Empty;
EmailOptionsHolder.FromName = emailSection["FromName"] ?? EmailOptionsHolder.FromName;
EmailOptionsHolder.ResendApiKey = emailSection["ResendApiKey"] ?? string.Empty;
if (int.TryParse(emailSection["ConfirmationTokenHours"], out var tokenHours))
{
    EmailOptionsHolder.ConfirmationTokenHours = tokenHours;
}
EmailOptionsHolder.FrontendUrl = builder.Configuration["FrontendUrl"] ?? EmailOptionsHolder.FrontendUrl;

// Middleware: auth + Swagger + CORS (DI obligatoriu pt. framework, nu pt. BLL/DAL)
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerDocumentation();
builder.Services.AddBidZoneCors(builder.Configuration);
builder.Services.AddSingleton<AuctionSocketManager>();
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
app.UseWebSockets();
app.Map("/ws/auctions/{auctionId:int}", async (HttpContext context, int auctionId, AuctionSocketManager socketManager) =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        return;
    }

    using var socket = await context.WebSockets.AcceptWebSocketAsync();
    await socketManager.HandleConnectionAsync(auctionId, socket, context.RequestAborted);
});
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", utc = DateTime.UtcNow }));
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
