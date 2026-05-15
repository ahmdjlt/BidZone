// AuctionCard - displays a single auction preview with image, title, current bid, and countdown
import Image from "next/image";
import Link from "next/link";

export interface AuctionPreview {
  id: number;
  slug: string;
  title: string;
  description: string;
  location: string;
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
      href={`/auctions/${auction.slug}`}
      aria-label={`View auction ${auction.title}`}
      className="group block overflow-hidden rounded-md border border-border bg-card-bg transition duration-300 hover:-translate-y-0.5 hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-border-strong card-shadow"
    >
      <div className="relative overflow-hidden">
        <Image
          src={auction.imageUrl}
          alt={auction.title}
          width={860}
          height={600}
          priority={priority}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-3 py-2 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/90">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
            </svg>
            {auction.endsIn}
          </span>
          <span className="text-xs font-semibold text-white">
            Bid <span className="text-green-400">{auction.currentBid}</span>
          </span>
        </div>
      </div>
      <div className="px-3.5 py-3">
        <h3 className="text-[14px] font-bold leading-snug text-text-heading">
          {auction.title}
        </h3>
        <p className="mt-1 text-[12px] font-medium leading-snug text-text-body line-clamp-2">
          {auction.description}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-text-muted">
          {auction.location}
        </p>
      </div>
    </Link>
  );
}
