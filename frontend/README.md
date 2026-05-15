# BidZone Frontend

Next.js frontend for BidZone auctions.

## Backend-Connected Flows

The following pages are now connected to the backend API:

- `/`:
  - Loads featured active auctions from `GET /api/auctions`
  - Footer bid ticker loads recent bids from `GET /api/bids/recent`
- `/auctions`:
  - Loads auctions from `GET /api/auctions`
  - Uses navbar `q` search params, category filters, price filters, and backend sort params
  - Shows loading/error/empty states from real API responses
- `/auctions/[id]`:
  - Loads auction details from `GET /api/auctions/{id}`
  - Loads bid history from `GET /api/bids/auction/{id}`
  - Places bids through `POST /api/bids`
  - Receives bid updates over `/ws/auctions/{id}` with polling as a fallback
- `/create-listing`:
  - Loads categories from `GET /api/categories`
  - Uploads selected images through `POST /api/uploads/image`
  - Creates listings with `POST /api/auctions`
  - Redirects to the created auction detail page
- `/profile`:
  - Loads watchlist, bids, seller auctions, and admin reports from the API
- `/settings`:
  - Loads the current user from session state
  - Saves account details through `PUT /api/users/{id}`

## Realtime Behavior

- Auction detail opens a native WebSocket at `/ws/auctions/{id}`.
- Successful bids are broadcast from the API and merged into the open auction page.
- Auction detail also polls every 5 seconds while an auction is `Active` as a fallback.

## Environment

Copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5171
NEXT_PUBLIC_SOCKET_URL=http://localhost:5171
```

## Local Run

From `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification Checklist

1. Open `/auctions` and confirm live backend auction data renders.
2. Open any `/auctions/{id}` and confirm:
   - detail data loads
   - bid history loads
   - placing a bid updates UI after success
3. Open `/create-listing` as `Seller` or `Admin` and confirm:
   - categories load
   - listing creation succeeds
   - redirect lands on the new auction detail page
4. Keep an active auction detail page open and confirm periodic refresh every 5 seconds.
