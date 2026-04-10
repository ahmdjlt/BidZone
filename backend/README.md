# BidZone Backend

.NET 10 Web API for the BidZone real-time auction marketplace.

## Architecture

4-layer architecture:

```
BidZone.Api  →  BidZone.BusinessLogic  →  BidZone.DataAccess  →  BidZone.Domains
(Controllers)      (Business)      (Repositories)   (Entities/DTOs/DbContext)
```

## Tech Stack

- **Framework**: ASP.NET Core Web API (.NET 10)
- **Database**: PostgreSQL (via Npgsql + EF Core)
- **Auth**: ASP.NET Core Identity + JWT bearer tokens
- **Mapping**: AutoMapper
- **Docs**: Swagger / OpenAPI

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [PostgreSQL](https://www.postgresql.org/download/) (running on localhost:5432)

## Setup

1. **Update the connection string** in `BidZone.Api/appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=bidzone;Username=postgres;Password=postgres"
   }
   ```

2. **Create the database and apply migrations**:

   ```bash
   cd BidZone.Api
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

3. **Run the API**:

   ```bash
   dotnet run --project BidZone.Api
   ```

4. **Open Swagger UI** at `http://localhost:5171/swagger`

## Seed Data

The database is seeded with:

- **3 users**: admin (`admin@bidzone.com` / `Admin123A`), seller1 (`seller1@bidzone.com` / `Seller123A`), buyer1 (`buyer1@bidzone.com` / `Buyer123A`)
- **16 categories** synced with the frontend category bar
- **5 sample auctions**

## API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/login` | Login with email/password |
| POST | `/register` | Register new user |
| POST | `/logout` | Logout (auth required) |
| GET | `/me` | Get current user (auth required) |

Use the returned bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt>
```

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
├── BidZone.Domains/
│   ├── Entities/          # User, Auction, Bid, Category, WatchlistItem
│   ├── DTOs/              # Request/response data transfer objects
│   └── AppDbContext.cs    # EF Core context with seed data
├── BidZone.DataAccess/
│   ├── Interfaces/        # Repository contracts
│   └── Repositories/      # EF Core implementations
├── BidZone.BusinessLogic/
│   ├── Interfaces/        # Business logic contracts
│   ├── Core/              # BaseLogic base class
│   ├── Logics/            # Business logic implementations
│   └── MappingProfile.cs  # AutoMapper configuration
└── BidZone.Api/
    ├── Controllers/       # 7 API controllers
    ├── Extensions/        # ClaimsPrincipal helpers
    ├── Program.cs         # DI, Identity, JWT, CORS, Swagger, pipeline
    └── appsettings.json   # Configuration
```
