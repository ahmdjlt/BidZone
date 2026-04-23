using BidZone.Api.Extensions;
using BidZone.Api.Services;
using BidZone.BusinessLogic.Security;
using BidZone.Domains;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Connection string — expus via DbSession static (pattern eBookStore)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
DbSession.ConnectionString = connectionString;

// JWT — opțiuni stocate într-un holder static, nu DI
var envJwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
if (!string.IsNullOrWhiteSpace(envJwtKey))
{
    builder.Configuration["Jwt:Key"] = envJwtKey;
}
var jwtSection = builder.Configuration.GetSection("Jwt");
JwtOptionsHolder.Issuer = jwtSection["Issuer"] ?? string.Empty;
JwtOptionsHolder.Audience = jwtSection["Audience"] ?? string.Empty;
JwtOptionsHolder.Key = jwtSection["Key"] ?? string.Empty;
if (int.TryParse(jwtSection["ExpirationMinutes"], out var expMinutes))
{
    JwtOptionsHolder.ExpirationMinutes = expMinutes;
}

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
