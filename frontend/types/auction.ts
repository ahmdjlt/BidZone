export interface Auction {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  images: AuctionImage[];
  startingPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  startTime: string;
  endTime: string;
  status: "Active" | "Closed" | "Cancelled" | "Draft";
  slug: string;
  sellerId: number;
  sellerUsername: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  bidCount: number;
}

export interface AuctionImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface AuctionSummary {
  id: number;
  title: string;
  imageUrl: string | null;
  currentPrice: number;
  endTime: string;
  status: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  bidCount: number;
}

export interface CreateAuctionData {
  title: string;
  description: string;
  imageUrl?: string | null;
  imageUrls?: string[];
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
  auctionSlug: string;
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
  recentSales: RecentSale[];
}

export interface RecentSale {
  id: number;
  title: string;
  slug: string;
  currentPrice: number;
  endTime: string;
  sellerUsername: string;
}

export interface BidActivity {
  date: string;
  bidCount: number;
  totalAmount: number;
}
