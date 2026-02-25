# BidZone Backend

.NET 8 Web API for the BidZone real-time auction marketplace.

## Architecture

4-layer architecture:

```
BidZone.WebApi  →  BidZone.BLL  →  BidZone.DAL  →  BidZone.Models
(Controllers)      (Business)      (Repositories)   (Entities/DTOs/DbContext)
```

## Tech Stack

- **Framework**: ASP.NET Core Web API (.NET 8)
- **Database**: PostgreSQL (via Npgsql + EF Core)
- **Auth**: Session-based (cookie + bearer token), MD5 password hashing
- **Mapping**: AutoMapper
- **Docs**: Swagger / OpenAPI

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) (running on localhost:5432)

## Setup

1. **Update the connection string** in `BidZone.WebApi/appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=bidzone;Username=postgres;Password=postgres"
   }
   ```

2. **Create the database and apply migrations**:

   ```bash
   cd BidZone.WebApi
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

3. **Run the API**:

   ```bash
   dotnet run --project BidZone.WebApi
   ```

4. **Open Swagger UI** at `http://localhost:5000/swagger`

## Seed Data

The database is seeded with:

- **3 users**: admin (`admin@bidzone.com` / `admin123`), seller1 (`seller1@bidzone.com` / `123456`), buyer1 (`buyer1@bidzone.com` / `123456`)
- **8 categories**: Electronics, Vehicles, Fashion, Home & Garden, Sports, Art & Collectibles, Books & Media, Jewelry & Watches
- **5 sample auctions**

## API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/login` | Login with email/password |
| POST | `/register` | Register new user |
| POST | `/logout` | Logout (auth required) |
| GET | `/me` | Get current user (auth required) |

### Auctions (`/api/auctions`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | List auctions (query: search, category, sort, status) |
| GET | `/{id}` | Get auction by ID |
| POST | `/` | Create auction (Seller/Admin) |
| PUT | `/{id}` | Update auction (Seller/Admin) |
| DELETE | `/{id}` | Delete auction (Seller/Admin, no bids only) |
| GET | `/my` | Get seller's own auctions (Seller/Admin) |

### Bids (`/api/bids`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Place a bid (Buyer/Admin) |
| GET | `/auction/{id}` | Get bids for an auction |
| GET | `/my` | Get current user's bids (auth required) |
| GET | `/auction/{id}/highest` | Get highest bid for an auction |

### Categories (`/api/categories`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | List all categories |
| GET | `/{id}/auctions` | Get auctions by category |

### Watchlist (`/api/watchlist`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get user's watchlist (auth required) |
| POST | `/{auctionId}` | Add to watchlist (auth required) |
| DELETE | `/{auctionId}` | Remove from watchlist (auth required) |

### Users (`/api/users`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/{id}` | Get user by ID |
| PUT | `/{id}` | Update user (owner or Admin) |
| GET | `/` | List all users (Admin) |
| DELETE | `/{id}` | Deactivate user (Admin) |

### Reports (`/api/reports`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Dashboard stats (Admin) |
| GET | `/bid-activity` | Bid activity over time (Admin, query: days) |

## Project Structure

```
backend/
├── BidZone.sln
├── BidZone.Models/
│   ├── Entities/          # User, Auction, Bid, Category, WatchlistItem, Session
│   ├── DTOs/              # Request/response data transfer objects
│   └── AppDbContext.cs    # EF Core context with seed data
├── BidZone.DAL/
│   ├── Interfaces/        # Repository contracts
│   └── Repositories/      # EF Core implementations
├── BidZone.BLL/
│   ├── Interfaces/        # Business logic contracts
│   ├── Core/              # BaseLogic base class
│   ├── Logics/            # Business logic implementations
│   └── MappingProfile.cs  # AutoMapper configuration
└── BidZone.WebApi/
    ├── Controllers/       # 7 API controllers
    ├── Middleware/         # Auth middleware (cookie + bearer token)
    ├── Filters/           # AuthorizeRoles attribute
    ├── Program.cs         # DI, CORS, Swagger, pipeline
    └── appsettings.json   # Configuration
```
