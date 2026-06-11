using System.Threading.RateLimiting;
using BidZone.Api.Extensions;
using BidZone.Api.Services;
using BidZone.BusinessLogic.Core;
using BidZone.BusinessLogic.Core.Auth;
using BidZone.BusinessLogic.Email;
using BidZone.BusinessLogic.Functions.Auth;
using BidZone.BusinessLogic.Interface;
using BidZone.BusinessLogic.Security;
using BidZone.BusinessLogic.Structure;
using BidZone.DataAccess;
using BidZone.DataAccess.Context;
using DotNetEnv;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

LoadEnvironmentFile();

// Connection string — expus via DbSession static (pattern eUShop/eBookStore)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
DbSession.ConnectionString = connectionString
    ?? throw new InvalidOperationException("A database connection string must be configured.");

// JWT — opțiuni stocate într-un holder static, nu DI
// TODO: prefer the IOptions<JwtOptions>/IOptions<EmailOptions> pattern bound from configuration
//       (builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"))).
//       JwtOptionsHolder/EmailOptionsHolder and their consumers (JwtTokenService,
//       EmailSenderFactory) live outside this change set, so the static-holder wiring is kept
//       here to preserve behavior. Migrate the holders to IOptions when those files can change.
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

// AppDbContext is now provided via DI (scoped). OnConfiguring still falls back to
// DbSession.ConnectionString when options are not supplied (e.g. design-time / factory path).
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (DbSession.IsSqliteConnectionString(DbSession.ConnectionString))
    {
        options.UseSqlite(DbSession.ConnectionString);
    }
    else
    {
        options.UseNpgsql(DbSession.ConnectionString);
    }
});

// Business-logic services receive the scoped AppDbContext + ILogger via constructor injection.
builder.Services.AddScoped<AuthActions>();
builder.Services.AddScoped<AuctionLogic>();
builder.Services.AddScoped<BidLogic>();

// Logic interfaces consumed by controllers.
// NOTE: AuthFlow/AuctionExecution/BidExecution (the IAuthLogic/IAuctionLogic/IBidLogic
// implementations) live outside this change set and only expose a parameterless constructor,
// so they currently self-create their AppDbContext via the fallback path. Once those classes
// can accept the injected AppDbContext/ILogger, register them with the scoped context instead.
builder.Services.AddScoped<IAuthLogic, AuthFlow>();
builder.Services.AddScoped<IAuctionLogic, AuctionExecution>();
builder.Services.AddScoped<IBidLogic, BidExecution>();

// Built-in fixed-window rate limiting for the auth endpoints (.NET 7+).
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
});

builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var migrationDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await migrationDb.Database.MigrateAsync();
}

app.UseMiddleware<BidZone.Api.Middleware.ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRateLimiter();
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
