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

1. **Configure environment values** (copy `BidZone.Api/.env.example` to `BidZone.Api/.env` for local development):

   ```env
   DATABASE_URL=Host=localhost;Port=5432;Database=bidzone;Username=postgres;Password=postgres
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGINS=http://localhost:3000
   JWT_ISSUER=BidZone.Api
   JWT_AUDIENCE=BidZone.Frontend
   JWT_KEY=replace-with-a-long-random-production-secret
   JWT_ACCESS_TOKEN_MINUTES=15
   JWT_REFRESH_TOKEN_DAYS=7
   JWT_REFRESH_COOKIE_NAME=bidzone.refresh
   ```

   The API also supports `ConnectionStrings:DefaultConnection` in `BidZone.Api/appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=bidzone;Username=postgres;Password=postgres"
   }
   ```

2. **Apply existing migrations**:

   ```bash
   cd backend
   dotnet ef database update --project BidZone.DataAccess --startup-project BidZone.Api
   ```

3. **Run the API**:

   ```bash
   dotnet run --project BidZone.Api
   ```

4. **Open Swagger UI** at `http://localhost:5171/swagger`

5. **Run tests**:

   ```bash
   dotnet test BidZone.Tests/BidZone.Tests.csproj
   ```

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
| POST | `/refresh` | Refresh session using HTTP-only cookie |
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
| GET | `/paged` | List auctions with pagination (`page`, `pageSize`) |
| GET | `/{id}` | Get auction by ID |
| POST | `/` | Create auction (Seller/Admin) |
| PUT | `/{id}` | Update auction (Seller/Admin) |
| DELETE | `/{id}` | Delete auction (Seller/Admin, no bids only) |
| GET | `/my` | Get seller's own auctions (Seller/Admin) |

### Bids (`/api/bids`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Place a bid (Buyer/Admin) |
| GET | `/recent` | Get recent bid activity |
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

### Health
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Liveness check |

## Production Notes

- Set `ASPNETCORE_ENVIRONMENT=Production`.
- Set `JWT_KEY` in the environment; the API refuses to start in non-development environments with the development signing key.
- Set `DATABASE_URL`, `FRONTEND_URL`, and `CORS_ORIGINS` for the deployed services.
- Run migrations before serving traffic.
- Keep real `.env` files out of git; commit only `.env.example` files.

## Project Structure

```
backend/
├── BidZone.slnx
├── BidZone.Domains/
│   ├── Entities/          # User, Auction, Bid, Category, WatchlistItem
│   ├── DTOs/              # Request/response data transfer objects
│   ├── Seeds/             # Seeded users/categories/auctions
│   └── Responses/         # Common API response models
├── BidZone.DataAccess/
│   ├── Context/           # AppDbContext
│   └── Migrations/        # EF Core migrations
├── BidZone.BusinessLogic/
│   ├── Interface/         # Business logic contracts
│   ├── Core/              # Business rules
│   ├── Structure/         # Concrete logic implementations
│   └── Security/          # JWT + refresh token services
└── BidZone.Api/
    ├── Controllers/       # 7 API controllers
    ├── Extensions/        # Auth/CORS/Swagger helpers
    ├── Services/          # Background services
    ├── Program.cs         # Startup, env loading, middleware pipeline
    └── appsettings.json   # Default configuration
```
