using BidZone.BusinessLogic;
using BidZone.Domains;
using BidZone.Api.Extensions;
using Microsoft.AspNetCore.Identity;
using BidZone.Api.Services;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
if (!string.IsNullOrWhiteSpace(jwtKey))
{
    builder.Configuration["Jwt:Key"] = jwtKey;
}

// DbContext
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Identity
builder.Services.AddIdentityCore<BidZone.Domains.Entities.User>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Auth, Swagger, CORS
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerDocumentation();
builder.Services.AddBidZoneCors(builder.Configuration);
builder.Services.AddHttpContextAccessor();

// DAL + BLL + AutoMapper
builder.Services.AddBidZoneServices();
builder.Services.AddHostedService<AuctionFinalizationHostedService>();

builder.Services.AddControllers();

var app = builder.Build();

BusinessLogic.Configure(app.Services.GetRequiredService<IHttpContextAccessor>());

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
