import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | BidZone",
  description: "Manage your BidZone profile, bids, and watchlist.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
