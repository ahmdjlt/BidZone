export interface Auction {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  startingPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  startTime: string;
  endTime: string;
  status: "Active" | "Closed" | "Cancelled" | "Draft";
  sellerId: number;
  sellerUsername: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  bidCount: number;
}

export interface AuctionSummary {
  id: number;
  title: string;
  imageUrl: string | null;
  currentPrice: number;
  endTime: string;
  status: string;
  categoryName: string;
  categorySlug: string;
  bidCount: number;
}

export interface CreateAuctionData {
  title: string;
  description: string;
  imageUrl?: string | null;
  startingPrice: number;
  reservePrice?: number | null;
  endTime: string;
  categoryId: number;
}

export interface UpdateAuctionData {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  reservePrice?: number | null;
  endTime?: string | null;
  categoryId?: number | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  auctionCount: number;
}

export interface AuctionContact {
  counterpartyUsername: string;
  counterpartyEmail: string;
  viewerRole: "Buyer" | "Seller";
}

export interface WatchlistItem {
  id: number;
  auctionId: number;
  auctionTitle: string;
  auctionImageUrl: string | null;
  currentPrice: number;
  endTime: string;
  status: string;
  addedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: number;
  recentBidActivity: BidActivity[];
}

export interface BidActivity {
  date: string;
  bidCount: number;
  totalAmount: number;
}
