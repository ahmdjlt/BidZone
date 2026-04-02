// Profile page — standalone with Navbar/Footer, Catawiki-style layout
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Tab = "overview" | "auction-history" | "reviews" | "favourites" | "bids" | "offers" | "orders" | "watchlist" | "sales" | "in-auction" | "submissions" | "sold" | "not-sold" | "payments" | "analytics";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview",        label: "Overview" },
  { id: "favourites",      label: "Favourite objects" },
  { id: "bids",            label: "Bids" },
  { id: "offers",          label: "Offers" },
  { id: "orders",          label: "Orders" },
  { id: "watchlist",       label: "Watchlist" },
  { id: "sales",           label: "Sales overview" },
  { id: "in-auction",      label: "In auction" },
  { id: "submissions",     label: "Submissions" },
  { id: "sold",            label: "Sold" },
  { id: "not-sold",        label: "Not sold" },
  { id: "payments",        label: "Payments" },
  { id: "analytics",       label: "Analytics" },
  { id: "auction-history", label: "Auction History" },
  { id: "reviews",         label: "Reviews" },
];

const profile = {
  name: "User",
  initials: "U",
  joinDate: "Member since March 2024",
  bio: "Collector of rare watches, vintage cameras, and sports memorabilia. Passionate about finding unique items and connecting with fellow enthusiasts.",
  location: "Algiers, Algeria",
  email: "user@bidzone.com",
};

const profileStats = [
  { label: "Auctions Created", value: "34" },
  { label: "Items Sold", value: "28" },
  { label: "Avg. Rating", value: "4.9" },
  { label: "Total Revenue", value: "$18,430" },
];

const auctionHistory = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", finalPrice: "$1,480", bids: 42, category: "Collectibles", status: "Sold" },
  { id: "vintage-polaroid", title: "Vintage Polaroid SX-70", finalPrice: "$420", bids: 51, category: "Cameras", status: "Sold" },
  { id: "signed-first-edition", title: "Signed First Edition Novel", finalPrice: "$890", bids: 33, category: "Books", status: "Sold" },
  { id: "herman-miller-aeron", title: "Herman Miller Aeron Chair", finalPrice: "$710", bids: 18, category: "Furniture", status: "Sold" },
  { id: "vintage-lens-bundle", title: "Vintage Lens Bundle", finalPrice: "$2,840", bids: 48, category: "Gear", status: "Live" },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", finalPrice: "$6,850", bids: 52, category: "Sports Cards", status: "Live" },
];

const reviews = [
  { reviewer: "Sarah K.", rating: 5, text: "Excellent seller — item was exactly as described and shipped quickly. Would buy from again!", time: "2 weeks ago" },
  { reviewer: "James R.", rating: 5, text: "Great communication throughout the auction. Packaging was top notch.", time: "1 month ago" },
  { reviewer: "Mia T.", rating: 4, text: "Good experience overall. Item arrived in perfect condition, shipping took a bit longer than expected.", time: "2 months ago" },
  { reviewer: "Noah P.", rating: 5, text: "Fast shipping, great item. Very trustworthy seller.", time: "3 months ago" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "text-amber-400" : "text-text-muted/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Tab panels ──────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-text-heading">Overview</h2>

      <div className="mt-4">
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Name</p>
          <p className="mt-1 text-sm text-text-heading">{profile.name}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Location</p>
          <p className="mt-1 text-sm text-text-heading">{profile.location}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Member since</p>
          <p className="mt-1 text-sm text-text-heading">March 2024</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Bio</p>
          <p className="mt-1 text-sm leading-relaxed text-text-heading">{profile.bio}</p>
        </div>
      </div>

      <h3 className="mt-8 text-base font-semibold text-text-heading">Stats</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {profileStats.map((stat) => (
          <div key={stat.label} className="border-b border-border py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-text-heading">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuctionHistoryTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-text-heading">Auction History</h2>
      <div className="mt-4">
        {auctionHistory.map((auction) => (
          <Link
            key={auction.id}
            href={`/auctions/${auction.id}`}
            className="flex items-center justify-between border-b border-border py-5 transition-colors hover:bg-accent-soft/30"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{auction.category}</p>
              <p className="mt-1 text-sm font-medium text-text-heading">{auction.title}</p>
              <p className="mt-1 text-xs text-text-muted">{auction.bids} bids</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-text-heading">{auction.finalPrice}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                auction.status === "Live"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-accent-soft text-text-muted"
              }`}>
                {auction.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-text-heading">Reviews</h2>
      <div className="mt-4">
        {reviews.map((review, i) => (
          <div key={i} className="border-b border-border py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-text-label">
                  {review.reviewer.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-heading">{review.reviewer}</p>
                  <StarRating rating={review.rating} />
                </div>
              </div>
              <span className="text-xs text-text-muted">{review.time}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-body">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const favouriteItems = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", currentBid: "$1,240", endsIn: "2h 11m", bids: 37 },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", currentBid: "$6,850", endsIn: "5h 44m", bids: 52 },
  { id: "vintage-polaroid", title: "Vintage Polaroid SX-70", currentBid: "$380", endsIn: "1d 03h", bids: 24 },
  { id: "herman-miller-aeron", title: "Herman Miller Aeron Chair", currentBid: "$710", endsIn: "8h 30m", bids: 18 },
];

const bidItems = [
  { id: "vintage-lens-bundle", title: "Vintage Lens Bundle", yourBid: "$2,840", currentBid: "$2,840", status: "Winning", endsIn: "49m" },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", yourBid: "$6,500", currentBid: "$6,850", status: "Outbid", endsIn: "5h 44m" },
  { id: "mid-century-chair", title: "Mid-Century Lounge Chair", yourBid: "$2,100", currentBid: "$2,100", status: "Winning", endsIn: "1d 03h" },
  { id: "antique-desk-lamp", title: "Antique Desk Lamp", yourBid: "$210", currentBid: "$210", status: "Won", endsIn: "Ended" },
];

const offerItems = [
  { id: 1, item: "Vintage Rolex Submariner", from: "Alex M.", amount: "$4,200", status: "Pending", date: "2 hours ago", type: "received" },
  { id: 2, item: "Signed First Edition Novel", from: "You", amount: "$750", status: "Accepted", date: "1 day ago", type: "sent" },
  { id: 3, item: "Rare Vinyl Collection", from: "Sarah K.", amount: "$320", status: "Declined", date: "3 days ago", type: "received" },
];

const orderItems = [
  { id: "ORD-1042", item: "Vintage Polaroid SX-70", price: "$420", date: "Mar 28, 2026", status: "Shipped" },
  { id: "ORD-1038", item: "Signed First Edition Novel", price: "$890", date: "Mar 22, 2026", status: "Delivered" },
  { id: "ORD-1031", item: "Rare Seiko Chronograph", price: "$1,480", date: "Mar 15, 2026", status: "Delivered" },
];

const watchlistItems = [
  { id: "vintage-lens-bundle", title: "Vintage Lens Bundle", currentBid: "$2,840", yourMax: "$3,000", endsIn: "49m", bids: 48 },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", currentBid: "$6,850", yourMax: "$7,500", endsIn: "5h 44m", bids: 52 },
  { id: "mid-century-chair", title: "Mid-Century Lounge Chair", currentBid: "$2,100", yourMax: "$2,500", endsIn: "1d 03h", bids: 19 },
];

const inAuctionItems = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", currentBid: "$1,240", bids: 37, endsIn: "2h 11m", watchers: 14 },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", currentBid: "$6,850", bids: 52, endsIn: "5h 44m", watchers: 38 },
  { id: "vintage-lens-bundle", title: "Vintage Lens Bundle", currentBid: "$2,840", bids: 48, endsIn: "49m", watchers: 22 },
];

const submissionItems = [
  { id: 1, title: "Vintage Omega Seamaster", submitted: "Apr 1, 2026", status: "Under review", note: "Typically reviewed within 24 hours" },
  { id: 2, title: "Rare Stamp Collection (1920s)", submitted: "Mar 30, 2026", status: "Approved", note: "Ready to go live" },
  { id: 3, title: "Antique Brass Telescope", submitted: "Mar 28, 2026", status: "Changes requested", note: "Please add clearer photos of the lens" },
];

const soldItems = [
  { id: "vintage-polaroid", title: "Vintage Polaroid SX-70", soldFor: "$420", buyer: "Sarah K.", date: "Mar 28, 2026", bids: 51 },
  { id: "signed-first-edition", title: "Signed First Edition Novel", soldFor: "$890", buyer: "James R.", date: "Mar 22, 2026", bids: 33 },
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", soldFor: "$1,480", buyer: "Alex M.", date: "Mar 15, 2026", bids: 42 },
];

const unsoldItems = [
  { id: "art-deco-vase", title: "Art Deco Glass Vase", reservePrice: "$500", highestBid: "$380", endedOn: "Mar 25, 2026", reason: "Reserve not met" },
  { id: "vintage-typewriter", title: "Vintage Olympia Typewriter", reservePrice: "$300", highestBid: "$0", endedOn: "Mar 20, 2026", reason: "No bids" },
];

const paymentItems = [
  { id: "TXN-2041", item: "Vintage Polaroid SX-70", amount: "$399.00", fee: "$21.00", net: "$378.00", date: "Mar 29, 2026", status: "Completed" },
  { id: "TXN-2038", item: "Signed First Edition Novel", amount: "$845.50", fee: "$44.50", net: "$801.00", date: "Mar 23, 2026", status: "Completed" },
  { id: "TXN-2035", item: "Rare Seiko Chronograph", amount: "$1,406.00", fee: "$74.00", net: "$1,332.00", date: "Mar 16, 2026", status: "Completed" },
];

const monthlyStats = [
  { month: "Oct", revenue: 1420 },
  { month: "Nov", revenue: 2890 },
  { month: "Dec", revenue: 4210 },
  { month: "Jan", revenue: 2100 },
  { month: "Feb", revenue: 3650 },
  { month: "Mar", revenue: 2790 },
];

const statusColor: Record<string, string> = {
  Winning: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  Outbid: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  Won: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  Accepted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  Declined: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  Shipped: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  Processing: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  "Under review": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  Approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  "Changes requested": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor[status] || "bg-accent-soft text-text-muted"}`}>{status}</span>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold tracking-tight text-text-heading">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  );
}

function FavouritesTab() {
  return (
    <div>
      <SectionHeading title="Favourite objects" description="Items you've saved. Keep track of auctions you love." />
      <div className="grid gap-4 sm:grid-cols-2">
        {favouriteItems.map((item) => (
          <Link key={item.id} href={`/auctions/${item.id}`} className="group overflow-hidden rounded-xl border border-border-strong transition-all hover:border-accent/30 hover:shadow-md">
            <div className="aspect-[4/3] bg-accent-soft/40" />
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text-heading group-hover:text-accent">{item.title}</h3>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Current bid</p>
                  <p className="text-sm font-bold text-text-heading">{item.currentBid}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Ends in</p>
                  <p className="text-sm font-medium text-text-heading">{item.endsIn}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-text-muted">{item.bids} bids</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BidsTab() {
  return (
    <div>
      <SectionHeading title="Bids" description="Auctions you've placed bids on. Track your position." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {bidItems.map((item, i) => (
          <Link key={item.id} href={`/auctions/${item.id}`} className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">Your bid: {item.yourBid} &middot; {item.endsIn}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-heading">{item.currentBid}</span>
              <StatusBadge status={item.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function OffersTab() {
  return (
    <div>
      <SectionHeading title="Offers" description="Buy-now offers you've sent or received from buyers." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {offerItems.map((offer, i) => (
          <div key={offer.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{offer.item}</p>
              <p className="mt-0.5 text-xs text-text-muted">{offer.type === "sent" ? "You offered" : `From ${offer.from}`} &middot; {offer.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-heading">{offer.amount}</span>
              <StatusBadge status={offer.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div>
      <SectionHeading title="Orders" description="Items you've won or purchased. Track shipping and delivery." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {orderItems.map((order, i) => (
          <div key={order.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{order.item}</p>
              <p className="text-xs text-text-muted">{order.id} &middot; {order.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-heading">{order.price}</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchlistTab() {
  return (
    <div>
      <SectionHeading title="Watchlist" description="Auctions you're monitoring. Get notified on price changes." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {watchlistItems.map((item, i) => (
          <Link key={item.id} href={`/auctions/${item.id}`} className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">{item.bids} bids &middot; Ends in {item.endsIn}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-heading">{item.currentBid}</p>
              <p className="text-xs text-text-muted">Your max: {item.yourMax}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SalesOverviewTab() {
  return (
    <div>
      <SectionHeading title="Sales overview" description="Summary of your selling activity and performance." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {profileStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border-strong p-4">
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-text-heading">{stat.value}</p>
          </div>
        ))}
      </div>
      <h3 className="mt-6 text-sm font-semibold text-text-heading">Recent sales</h3>
      <div className="mt-2 overflow-hidden rounded-xl border border-border-strong">
        {soldItems.map((item, i) => (
          <div key={item.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.title}</p>
              <p className="text-xs text-text-muted">Bought by {item.buyer} &middot; {item.date}</p>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.soldFor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InAuctionTab() {
  return (
    <div>
      <SectionHeading title="In auction" description="Your items currently live. Monitor bids and time remaining." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {inAuctionItems.map((item, i) => (
          <Link key={item.id} href={`/auctions/${item.id}`} className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">{item.bids} bids &middot; {item.watchers} watchers</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-heading">{item.currentBid}</p>
              <p className="text-xs text-text-muted">Ends in {item.endsIn}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SubmissionsTab() {
  return (
    <div>
      <SectionHeading title="Submissions" description="Items submitted for review before going live." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {submissionItems.map((sub, i) => (
          <div key={sub.id} className={`px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-text-heading">{sub.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">Submitted {sub.submitted}</p>
              </div>
              <StatusBadge status={sub.status} />
            </div>
            {sub.note && <p className="mt-2 text-xs text-text-muted">{sub.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SoldTab() {
  return (
    <div>
      <SectionHeading title="Sold" description="Items successfully sold. View final prices and buyers." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {soldItems.map((item, i) => (
          <div key={item.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.title}</p>
              <p className="text-xs text-text-muted">Bought by {item.buyer} &middot; {item.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.soldFor}</span>
              <span className="text-xs text-text-muted">{item.bids} bids</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotSoldTab() {
  return (
    <div>
      <SectionHeading title="Not sold" description="Auctions that ended without a sale. Relist or adjust pricing." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {unsoldItems.map((item, i) => (
          <div key={item.id} className={`px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-text-heading">{item.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">Ended {item.endedOn} &middot; Highest: {item.highestBid} &middot; Reserve: {item.reservePrice}</p>
              </div>
              <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">{item.reason}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div>
      <SectionHeading title="Payments" description="Transaction history, fees, and net payouts." />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Total earned</p>
          <p className="mt-1 text-xl font-bold text-text-heading">$2,650.50</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Total fees</p>
          <p className="mt-1 text-xl font-bold text-text-heading">$139.50</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Net payout</p>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">$2,511.00</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {paymentItems.map((txn, i) => (
          <div key={txn.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-text-heading">{txn.item}</p>
              <p className="text-xs text-text-muted">{txn.id} &middot; {txn.date}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-text-muted">{txn.fee}</span>
              <span className="font-bold text-text-heading">{txn.net}</span>
              <StatusBadge status={txn.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const maxRevenue = Math.max(...monthlyStats.map((s) => s.revenue));
  return (
    <div>
      <SectionHeading title="Analytics" description="Selling performance, revenue trends, and engagement." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Total views</p>
          <p className="mt-1 text-xl font-bold text-text-heading">2,871</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Total bids</p>
          <p className="mt-1 text-xl font-bold text-text-heading">156</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Conversion</p>
          <p className="mt-1 text-xl font-bold text-text-heading">5.4%</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">Avg. time to sell</p>
          <p className="mt-1 text-xl font-bold text-text-heading">3.2 days</p>
        </div>
      </div>
      <div className="rounded-xl border border-border-strong p-5">
        <h3 className="text-sm font-semibold text-text-heading">Monthly revenue</h3>
        <div className="mt-4 flex items-end gap-3" style={{ height: 140 }}>
          {monthlyStats.map((s) => (
            <div key={s.month} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-text-muted">${(s.revenue / 1000).toFixed(1)}k</span>
              <div className="w-full rounded-t-md bg-accent/80" style={{ height: `${(s.revenue / maxRevenue) * 110}px` }} />
              <span className="text-[10px] text-text-muted">{s.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const panel = {
    "overview":        <OverviewTab />,
    "favourites":      <FavouritesTab />,
    "bids":            <BidsTab />,
    "offers":          <OffersTab />,
    "orders":          <OrdersTab />,
    "watchlist":       <WatchlistTab />,
    "sales":           <SalesOverviewTab />,
    "in-auction":      <InAuctionTab />,
    "submissions":     <SubmissionsTab />,
    "sold":            <SoldTab />,
    "not-sold":        <NotSoldTab />,
    "payments":        <PaymentsTab />,
    "analytics":       <AnalyticsTab />,
    "auction-history": <AuctionHistoryTab />,
    "reviews":         <ReviewsTab />,
  }[activeTab];

  return (
    <div className="page-gradient min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10">
        {/* Profile header */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#1a4fa0,#3b7dd8)] text-xl font-black tracking-wide text-white">
              {profile.initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-heading">{profile.name}</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                <span>{profile.location}</span>
                <span className="h-1 w-1 rounded-full bg-text-muted/50" />
                <span>{profile.joinDate}</span>
              </div>
            </div>
          </div>
          <Link
            href="/settings"
            className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft"
          >
            Edit Profile
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          {/* Sidebar nav */}
          <nav className="shrink-0 lg:w-52">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center whitespace-nowrap py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-l-2 border-accent pl-4 text-text-heading"
                        : "pl-[18px] text-text-muted hover:text-text-heading"
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content panel */}
          <div className="min-w-0 flex-1 border-l border-border pl-10">
            {panel}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
