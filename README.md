# BidZone

BidZone is a full-stack auction marketplace with a Next.js frontend and an ASP.NET Core API.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: ASP.NET Core Web API, EF Core, PostgreSQL
- Auth: JWT access tokens with HTTP-only refresh cookies
- Realtime: native WebSockets for auction bid updates
- Media: Cloudinary uploads

## Local Setup

1. Configure the backend:

   ```powershell
   Copy-Item backend\BidZone.Api\.env.example backend\BidZone.Api\.env
   ```

   Update `DATABASE_URL`, `JWT_KEY`, email, and Cloudinary values as needed.

2. Configure the frontend:

   ```powershell
   Copy-Item frontend\.env.example frontend\.env.local
   ```

3. Apply migrations:

   ```powershell
   cd backend
   dotnet ef database update --project BidZone.DataAccess --startup-project BidZone.Api
   ```

4. Run the API:

   ```powershell
   dotnet run --project BidZone.Api
   ```

5. Run the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## Verification

```powershell
cd backend
dotnet test BidZone.Tests\BidZone.Tests.csproj

cd ..\frontend
npm run lint
npm run build
```

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for endpoint details and connected flows.
