// AuctionGrid - responsive grid layout that renders a collection of AuctionCards
import AuctionCard, { type AuctionPreview } from "./AuctionCard";

interface AuctionGridProps {
  auctions: AuctionPreview[];
}

export default function AuctionGrid({ auctions }: AuctionGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {auctions.map((auction, index) => (
        <AuctionCard
          key={auction.id}
          auction={auction}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
