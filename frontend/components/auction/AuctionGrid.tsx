// AuctionGrid - responsive grid layout that renders a collection of AuctionCards
import AuctionCard, { type AuctionPreview } from "./AuctionCard";

interface AuctionGridProps {
  auctions: AuctionPreview[];
  columns?: 2 | 3;
}

export default function AuctionGrid({ auctions, columns = 3 }: AuctionGridProps) {
  const gridCols =
    columns === 2
      ? "grid gap-5 sm:grid-cols-2"
      : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridCols}>
      {auctions.map((auction, index) => (
        <AuctionCard
          key={auction.id}
          auction={auction}
          priority={columns === 3 && index === 0}
        />
      ))}
    </div>
  );
}
