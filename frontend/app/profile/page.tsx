// Profile page — standalone with Navbar/Footer, Catawiki-style layout
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Tab = "overview" | "auction-history" | "reviews";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview",        label: "Overview" },
  { id: "auction-history", label: "Auction History" },
  { id: "reviews",         label: "Reviews" },
];

const profile = {
  name: "Ahmed Jalilati",
  initials: "AH",
  joinDate: "Member since March 2024",
  bio: "Collector of rare watches, vintage cameras, and sports memorabilia. Passionate about finding unique items and connecting with fellow enthusiasts.",
  location: "Algiers, Algeria",
  email: "ahmed@bidzone.com",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const panel = {
    "overview":        <OverviewTab />,
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
