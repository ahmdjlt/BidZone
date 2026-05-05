# BidZone Frontend

Next.js frontend for BidZone auctions.

## Backend-Connected Flows

The following pages are now connected to the backend API:

- `/auctions`:
  - Loads auctions from `GET /api/auctions`
  - Uses category + price filters and backend sort params
  - Shows loading/error/empty states from real API responses
- `/auctions/[id]`:
  - Loads auction details from `GET /api/auctions/{id}`
  - Loads bid history from `GET /api/bids/auction/{id}`
  - Places bids through `POST /api/bids`
- `/create-listing`:
  - Loads categories from `GET /api/categories`
  - Creates listings with `POST /api/auctions`
  - Redirects to the created auction detail page

## Realtime Behavior

- Auction detail uses polling every 5 seconds while an auction is `Active`.
- Polling refreshes both auction details and bid history.
- Websocket-based realtime is intentionally deferred in this pass.
- Existing socket utilities are currently not wired to backend realtime events.

## Environment

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5171
NEXT_PUBLIC_SOCKET_URL=http://localhost:5171
```

`NEXT_PUBLIC_SOCKET_URL` is kept for future websocket integration.

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
