# BidZone

BidZone is a full-stack auction marketplace. Users can browse auctions, create listings, place bids, manage watchlists, and update account settings. The app has a Next.js frontend and an ASP.NET Core API backed by PostgreSQL.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: ASP.NET Core Web API, Entity Framework Core
- Database: PostgreSQL
- Auth: JWT access tokens with refresh cookies
- Realtime: auction bid updates over WebSockets
- Media: Cloudinary image uploads

## Project Structure

```text
BidZone/
  backend/    ASP.NET Core API, database access, business logic, tests
  frontend/   Next.js web app
```

## Local Setup

1. Copy environment files:

   ```powershell
   Copy-Item backend\BidZone.Api\.env.example backend\BidZone.Api\.env
   Copy-Item frontend\.env.example frontend\.env.local
   ```

2. Update the backend `.env` with your PostgreSQL, JWT, email, and Cloudinary values.

3. Apply database migrations:

   ```powershell
   cd backend
   dotnet ef database update --project BidZone.DataAccess --startup-project BidZone.Api
   ```

4. Run the backend:

   ```powershell
   dotnet run --project BidZone.Api
   ```

5. Run the frontend in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:3000`. The API Swagger page is available at `http://localhost:5171/swagger`.

## Useful Commands

```powershell
cd backend
dotnet test BidZone.Tests\BidZone.Tests.csproj

cd ..\frontend
npm run lint
npm run build
```

More details are in `backend/README.md` and `frontend/README.md`.
