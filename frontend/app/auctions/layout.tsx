import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Auctions | BidZone",
  description: "Browse all live auctions on BidZone. Filter by category, price, and more.",
};

export default function AuctionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
