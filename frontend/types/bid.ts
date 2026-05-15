export interface Bid {
  id: number;
  amount: number;
  placedAt: string;
  status: "Active" | "Winning" | "Outbid" | "Won" | "Lost";
  auctionId: number;
  auctionTitle: string;
  auctionSlug: string;
  bidderId: number;
  bidderUsername: string;
}

export interface PlaceBidData {
  auctionId: number;
  amount: number;
}
