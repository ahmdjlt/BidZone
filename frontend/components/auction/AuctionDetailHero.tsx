import Image from "next/image";

export interface AuctionDetailHeroProps {
  image: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currentBid: number;
  totalBids: number;
  seller: {
    name: string;
    avatar?: string;
    rating: number;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "text-yellow-400" : "text-text-muted/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AuctionDetailHero({
  image,
  title,
  description,
  category,
  startingPrice,
  currentBid,
  totalBids,
  seller,
}: AuctionDetailHeroProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card-bg card-shadow">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-6">
        {/* Category Badge */}
        <div>
          <span className="inline-flex rounded-full border border-border-strong bg-accent-soft px-3 py-1 text-xs font-semibold text-text-label">
            {category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold tracking-tight text-text-heading lg:text-4xl">
          {title}
        </h1>

        {/* Description */}
        <p className="text-base leading-relaxed text-text-body">
          {description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-accent-soft p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-label">
              Current bid
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-text-heading">
              ${currentBid.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Total bids
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-text-heading">
              {totalBids}
            </p>
          </div>
        </div>

        {/* Starting Price */}
        <p className="text-sm text-text-muted">
          Starting price:{" "}
          <span className="font-semibold text-text-label">
            ${startingPrice.toLocaleString()}
          </span>
        </p>

        {/* Seller Info */}
        <div className="mt-auto rounded-2xl border border-border bg-card-bg p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Seller
          </p>
          <div className="flex items-center gap-3">
            {seller.avatar ? (
              <Image
                src={seller.avatar}
                alt={seller.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-text-label">
                {seller.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-text-heading">{seller.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <StarRating rating={seller.rating} />
                <span className="text-xs text-text-muted">
                  ({seller.rating.toFixed(1)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
