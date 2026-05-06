// AuctionGrid - responsive grid layout that renders a collection of AuctionCards
import AuctionCard, { type AuctionPreview } from "./AuctionCard";

interface AuctionGridProps {
  auctions: AuctionPreview[];
  columns?: 2 | 3 | 4;
}

export default function AuctionGrid({ auctions, columns = 4 }: AuctionGridProps) {
  const gridCols =
    columns === 2
      ? "grid gap-3 sm:grid-cols-2"
      : columns === 3
      ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={gridCols}>
      {auctions.map((auction, index) => (
        <AuctionCard
          key={`${auction.id}-${index}`}
          auction={auction}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
