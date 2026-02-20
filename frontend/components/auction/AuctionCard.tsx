// AuctionCard - displays a single auction preview with image, title, current bid, and countdown
import Link from "next/link";

export interface AuctionPreview {
  id: string;
  title: string;
  category: string;
  currentBid: string;
  bids: number;
  endsIn: string;
  watchers: number;
  imageAccent: string;
}

interface AuctionCardProps {
  auction: AuctionPreview;
  priority?: boolean;
}

export default function AuctionCard({ auction, priority = false }: AuctionCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-5 shadow-[0_24px_70px_-36px_rgba(27,111,242,0.6)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 ${
        priority ? "lg:col-span-2" : ""
      }`}
    >
      <div
        className="absolute right-0 top-0 h-24 w-24 rounded-bl-[2.5rem] opacity-90"
        style={{ background: auction.imageAccent }}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              {auction.category}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-blue-950">
              {auction.title}
            </h3>
          </div>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {auction.endsIn}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-blue-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
              Current bid
            </p>
            <p className="mt-1 text-lg font-semibold text-blue-950">{auction.currentBid}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Activity
            </p>
            <p className="mt-1 text-lg font-semibold text-blue-950">{auction.bids} bids</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">{auction.watchers} watchers</p>
          <Link
            href={`/auctions/${auction.id}`}
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Place bid
          </Link>
        </div>
      </div>
    </article>
  );
}
