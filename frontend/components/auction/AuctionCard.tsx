// AuctionCard - displays a single auction preview with image, title, current bid, and countdown
import Image from "next/image";
import Link from "next/link";

export interface AuctionPreview {
  id: string;
  title: string;
  category: string;
  currentBid: string;
  bids: number;
  endsIn: string;
  watchers: number;
  imageUrl: string;
  imageAccent: string;
}

interface AuctionCardProps {
  auction: AuctionPreview;
  priority?: boolean;
}

export default function AuctionCard({ auction, priority = false }: AuctionCardProps) {
  return (
    <Link
      href={`/auctions/${auction.id}`}
      aria-label={`View auction ${auction.title}`}
      className="group relative block overflow-hidden rounded-[2rem] border border-border bg-card-bg p-5 card-shadow transition duration-300 hover:-translate-y-1 hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-border-strong"
    >
      <div className="relative mb-5 overflow-hidden rounded-[1.5rem]">
        <Image
          src={auction.imageUrl}
          alt={auction.title}
          width={860}
          height={600}
          priority={priority}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-xs font-semibold text-blue-900 dark:border-border dark:bg-card-bg/90 dark:text-text-heading">
          {auction.category}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-blue-950/70 px-3 py-1 text-xs font-semibold text-blue-50 dark:bg-black/60 dark:text-slate-200">
          {auction.endsIn}
        </span>
      </div>

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-text-heading">
              {auction.title}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-accent-soft p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-label">
              Current bid
            </p>
            <p className="mt-1 text-lg font-semibold text-text-heading">{auction.currentBid}</p>
          </div>
          <div className="rounded-2xl border border-border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Activity
            </p>
            <p className="mt-1 text-lg font-semibold text-text-heading">{auction.bids} bids</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-text-body">{auction.watchers} watchers</p>
          <span className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition group-hover:brightness-110">
            Place bid
          </span>
        </div>
      </div>
    </Link>
  );
}
