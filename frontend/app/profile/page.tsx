"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAuctions, getMyAuctions } from "@/lib/api/auctions";
import { getMyBids } from "@/lib/api/bids";
import { getBidActivity, getDashboardStats, getWatchlist } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import type { Auction, AuctionSummary, BidActivity, DashboardStats, WatchlistItem } from "@/types/auction";
import type { Bid } from "@/types/bid";
import type { User } from "@/types/user";

type Tab =
  | "overview"
  | "auction-history"
  | "favourites"
  | "bids"
  | "watchlist"
  | "sales"
  | "in-auction"
  | "sold"
  | "not-sold"
  | "payments"
  | "analytics";

interface ProfileViewModel {
  name: string;
  initials: string;
  username: string;
  email: string;
  role: User["role"];
  status: string;
  joinDate: string;
}

interface ProfileDataState {
  watchlist: WatchlistItem[];
  bids: Bid[];
  myAuctions: Auction[];
  platformActiveAuctions: AuctionSummary[];
  platformClosedAuctions: AuctionSummary[];
  dashboardStats: DashboardStats | null;
  bidActivity: BidActivity[];
  isLoading: boolean;
  loadError: string | null;
}

interface StatCard {
  label: string;
  value: string;
  helper?: string;
  accentClassName?: string;
}

interface TabDefinition {
  id: Tab;
  label: string;
}

const INITIAL_DATA: ProfileDataState = {
  watchlist: [],
  bids: [],
  myAuctions: [],
  platformActiveAuctions: [],
  platformClosedAuctions: [],
  dashboardStats: null,
  bidActivity: [],
  isLoading: true,
  loadError: null,
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function buildProfile(user: User | null): ProfileViewModel {
  const fallbackName = user?.fullName?.trim() || user?.username?.trim() || "User";

  return {
    name: fallbackName,
    initials: getInitials(fallbackName),
    username: user?.username ?? "user",
    email: user?.email ?? "No email available",
    role: user?.role ?? "Buyer",
    status: user?.isActive === false ? "Inactive" : "Active",
    joinDate: user ? formatJoinDate(user.createdAt) : "Recently",
  };
}

function getTabs(role: User["role"] | undefined): TabDefinition[] {
  const commonTabs: TabDefinition[] = [
    { id: "overview", label: "Overview" },
    { id: "favourites", label: "Favourite objects" },
    { id: "bids", label: "Bids" },
    { id: "watchlist", label: "Watchlist" },
    { id: "auction-history", label: "Auction History" },
  ];

  if (role === "Admin") {
    return [
      ...commonTabs,
      { id: "sales", label: "Marketplace summary" },
      { id: "in-auction", label: "Live auctions" },
      { id: "sold", label: "Closed auctions" },
      { id: "not-sold", label: "Not sold" },
      { id: "payments", label: "Revenue" },
      { id: "analytics", label: "Analytics" },
    ];
  }

  if (role === "Seller") {
    return [
      ...commonTabs,
      { id: "sales", label: "Sales overview" },
      { id: "in-auction", label: "In auction" },
      { id: "sold", label: "Sold" },
      { id: "not-sold", label: "Not sold" },
      { id: "analytics", label: "Analytics" },
    ];
  }

  return commonTabs;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold tracking-tight text-text-heading">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  );
}

function LoadingState({ label = "Loading dashboard data..." }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong px-5 py-6 text-sm text-text-muted">
      {label}
    </div>
  );
}

function EmptyStatePanel({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface-alt/40 px-5 py-6">
      <p className="text-sm font-semibold text-text-heading">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-300/40 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
      {message}
    </div>
  );
}

function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <div key={stat.label} className="border-b border-border py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{stat.label}</p>
          <p className={`mt-1 text-2xl font-semibold tracking-tight ${stat.accentClassName ?? "text-text-heading"}`}>
            {stat.value}
          </p>
          {stat.helper ? <p className="mt-1 text-xs text-text-muted">{stat.helper}</p> : null}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColor: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    Closed: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
    Cancelled: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    Draft: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    Winning: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    Outbid: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    Won: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    Lost: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor[status] || "bg-accent-soft text-text-muted"}`}>
      {status}
    </span>
  );
}

function OverviewTab({
  profile,
  stats,
  isLoading,
}: {
  profile: ProfileViewModel;
  stats: StatCard[];
  isLoading: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-text-heading">Overview</h2>

      <div className="mt-4">
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Name</p>
          <p className="mt-1 text-sm text-text-heading">{profile.name}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Username</p>
          <p className="mt-1 text-sm text-text-heading">@{profile.username}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Email</p>
          <p className="mt-1 text-sm text-text-heading">{profile.email}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Role</p>
          <p className="mt-1 text-sm text-text-heading">{profile.role}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Status</p>
          <p className="mt-1 text-sm text-text-heading">{profile.status}</p>
        </div>
        <div className="border-b border-border py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Member since</p>
          <p className="mt-1 text-sm text-text-heading">{profile.joinDate}</p>
        </div>
      </div>

      <h3 className="mt-8 text-base font-semibold text-text-heading">Stats</h3>
      <div className="mt-3">
        {isLoading ? <LoadingState /> : <StatsGrid stats={stats} />}
      </div>
    </div>
  );
}

function AuctionHistoryTab({
  role,
  bids,
  ownedAuctions,
  marketClosedAuctions,
  isLoading,
}: {
  role: User["role"];
  bids: Bid[];
  ownedAuctions: Auction[];
  marketClosedAuctions: AuctionSummary[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (role === "Buyer") {
    const recentBids = [...bids].sort((left, right) => right.placedAt.localeCompare(left.placedAt)).slice(0, 8);
    if (recentBids.length === 0) {
      return (
        <EmptyStatePanel
          title="No bids yet"
          description="Once you place bids, your bidding history will appear here."
          actionHref="/auctions"
          actionLabel="Browse auctions"
        />
      );
    }

    return (
      <div>
        <SectionHeading title="Auction History" description="Recent bidding activity tied to your real account history." />
        <div className="overflow-hidden rounded-xl border border-border-strong">
          {recentBids.map((bid, index) => (
            <Link
              key={bid.id}
              href={`/auctions/${bid.auctionId}`}
              className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <div>
                <p className="text-sm font-semibold text-text-heading">{bid.auctionTitle}</p>
                <p className="mt-0.5 text-xs text-text-muted">Placed on {formatDate(bid.placedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-text-heading">{formatCurrency(bid.amount)}</span>
                <StatusBadge status={bid.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const recentAuctions = role === "Admin"
    ? marketClosedAuctions
    : [...ownedAuctions].sort((left, right) => right.endTime.localeCompare(left.endTime)).slice(0, 8);

  if (recentAuctions.length === 0) {
    return (
      <EmptyStatePanel
        title="No auction history yet"
        description={role === "Admin"
          ? "As auctions close across the marketplace, they will appear here."
          : "Once you create auctions, their history will show up here."}
        actionHref={role === "Admin" ? "/auctions" : "/auctions/create"}
        actionLabel={role === "Admin" ? "Browse marketplace" : "Create auction"}
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title="Auction History"
        description={role === "Admin"
          ? "Recent closed auctions pulled from the live marketplace catalog."
          : "Recent auctions connected to your seller account."}
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {recentAuctions.map((auction, index) => {
          const href = `/auctions/${auction.id}`;
          const categoryName = auction.categoryName;
          const price = auction.currentPrice;
          const date = auction.endTime;
          const bidsCount = auction.bidCount;
          const status = auction.status;

          return (
            <Link
              key={auction.id}
              href={href}
              className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{categoryName}</p>
                <p className="mt-1 text-sm font-medium text-text-heading">{auction.title}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {bidsCount} bids / Closed on {formatDate(date)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-heading">{formatCurrency(price)}</span>
                <StatusBadge status={status} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FavouritesTab({ items, isLoading }: { items: WatchlistItem[]; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (items.length === 0) {
    return (
      <EmptyStatePanel
        title="No favourites yet"
        description="Your favourites currently map to the watchlist. Save auctions there and they will appear here."
        actionHref="/auctions"
        actionLabel="Browse auctions"
      />
    );
  }

  return (
    <div>
      <SectionHeading title="Favourite objects" description="Saved auctions backed by your real watchlist data." />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/auctions/${item.auctionId}`}
            className="group overflow-hidden rounded-xl border border-border-strong transition-all hover:border-accent/30 hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-accent-soft/40" />
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text-heading group-hover:text-accent">{item.auctionTitle}</h3>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Current price</p>
                  <p className="text-sm font-bold text-text-heading">{formatCurrency(item.currentPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Ends</p>
                  <p className="text-sm font-medium text-text-heading">{formatDate(item.endTime)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-text-muted">Saved {formatDate(item.addedAt)}</p>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BidsTab({ items, isLoading }: { items: Bid[]; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (items.length === 0) {
    return (
      <EmptyStatePanel
        title="No bids yet"
        description="Place a bid on a live auction to start tracking it here."
        actionHref="/auctions"
        actionLabel="Browse auctions"
      />
    );
  }

  const sortedItems = [...items].sort((left, right) => right.placedAt.localeCompare(left.placedAt));

  return (
    <div>
      <SectionHeading title="Bids" description="Live data from your bidding history." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {sortedItems.map((item, index) => (
          <Link
            key={item.id}
            href={`/auctions/${item.auctionId}`}
            className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.auctionTitle}</p>
              <p className="mt-0.5 text-xs text-text-muted">Placed on {formatDate(item.placedAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-heading">{formatCurrency(item.amount)}</span>
              <StatusBadge status={item.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WatchlistTab({ items, isLoading }: { items: WatchlistItem[]; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (items.length === 0) {
    return (
      <EmptyStatePanel
        title="Watchlist is empty"
        description="Save auctions from the catalogue to monitor price changes and closing dates here."
        actionHref="/auctions"
        actionLabel="Browse auctions"
      />
    );
  }

  return (
    <div>
      <SectionHeading title="Watchlist" description="Auctions you are actively monitoring." />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={`/auctions/${item.auctionId}`}
            className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <div>
              <p className="text-sm font-semibold text-text-heading">{item.auctionTitle}</p>
              <p className="mt-0.5 text-xs text-text-muted">Added on {formatDate(item.addedAt)} / Ends {formatDate(item.endTime)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-heading">{formatCurrency(item.currentPrice)}</span>
              <StatusBadge status={item.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SalesOverviewTab({
  role,
  stats,
  auctions,
  isLoading,
}: {
  role: User["role"];
  stats: StatCard[];
  auctions: Array<Auction | AuctionSummary>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      <SectionHeading
        title={role === "Admin" ? "Marketplace summary" : "Sales overview"}
        description={role === "Admin"
          ? "Admin metrics are now driven by report endpoints and the live auction catalogue."
          : "Selling performance connected to your real auction inventory."}
      />

      <StatsGrid stats={stats} />

      <h3 className="mt-6 text-sm font-semibold text-text-heading">
        {role === "Admin" ? "Recent closed auctions" : "Recent sales"}
      </h3>

      {auctions.length === 0 ? (
        <div className="mt-2">
          <EmptyStatePanel
            title={role === "Admin" ? "No closed auctions yet" : "No completed sales yet"}
            description={role === "Admin"
              ? "Closed auctions from the marketplace will appear here automatically."
              : "Once your auctions close with winning bids, they will show up here."}
          />
        </div>
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border border-border-strong">
          {auctions.map((auction, index) => {
            const sellerLabel = "sellerUsername" in auction ? auction.sellerUsername : "";
            const price = auction.currentPrice;
            const date = auction.endTime;

            return (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
              >
                <div>
                <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
                <p className="text-xs text-text-muted">
                    {role === "Admin" && sellerLabel ? `Seller ${sellerLabel} / ` : ""}
                    Closed {formatDate(date)}
                </p>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(price)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InAuctionTab({
  role,
  auctions,
  isLoading,
}: {
  role: User["role"];
  auctions: Array<Auction | AuctionSummary>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (auctions.length === 0) {
    return (
      <EmptyStatePanel
        title={role === "Admin" ? "No live auctions found" : "No live auctions yet"}
        description={role === "Admin"
          ? "When auctions are active on the site, they will surface here for monitoring."
          : "Create a listing and it will appear here while it is live."}
        actionHref={role === "Admin" ? "/auctions" : "/auctions/create"}
        actionLabel={role === "Admin" ? "Open catalogue" : "Create auction"}
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title={role === "Admin" ? "Live auctions" : "In auction"}
        description={role === "Admin"
          ? "Real-time live auctions from across the marketplace."
          : "Your currently active auctions."}
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {auctions.map((auction, index) => (
          <Link
            key={auction.id}
            href={`/auctions/${auction.id}`}
            className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <div>
              <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {auction.categoryName} / {auction.bidCount} bids / Ends {formatDate(auction.endTime)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-heading">{formatCurrency(auction.currentPrice)}</span>
              <StatusBadge status={auction.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SoldTab({
  role,
  auctions,
  isLoading,
}: {
  role: User["role"];
  auctions: Array<Auction | AuctionSummary>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (auctions.length === 0) {
    return (
      <EmptyStatePanel
        title={role === "Admin" ? "No closed auctions yet" : "Nothing sold yet"}
        description={role === "Admin"
          ? "This tab reflects closed auctions from the marketplace."
          : "Your completed sales will show up here once bids close successfully."}
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title={role === "Admin" ? "Closed auctions" : "Sold"}
        description={role === "Admin"
          ? "Marketplace auction outcomes linked to the live catalogue."
          : "Real closed auctions from your seller inventory."}
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {auctions.map((auction, index) => (
          <Link
            key={auction.id}
            href={`/auctions/${auction.id}`}
            className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <div>
              <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
              <p className="text-xs text-text-muted">{auction.bidCount} bids / Closed {formatDate(auction.endTime)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(auction.currentPrice)}</span>
              <StatusBadge status={auction.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NotSoldTab({
  auctions,
  isLoading,
  isAdmin,
}: {
  auctions: Auction[];
  isLoading: boolean;
  isAdmin: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (auctions.length === 0) {
    return (
      <EmptyStatePanel
        title="No unsold auctions detected"
        description={isAdmin
          ? "Platform-wide unsold tracking still needs dedicated backend support. For now this view reflects only auctions you directly own."
          : "Closed auctions that miss reserve or receive no bids will show up here."}
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title="Not sold"
        description={isAdmin
          ? "Unsold results derived from your own closed auctions until a marketplace-wide unsold endpoint exists."
          : "Closed auctions without a successful sale."}
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {auctions.map((auction, index) => {
          const reason = auction.bidCount === 0
            ? "No bids"
            : auction.reservePrice != null && auction.currentPrice < auction.reservePrice
              ? "Reserve not met"
              : "Closed without a confirmed sale";

          return (
            <Link
              key={auction.id}
              href={`/auctions/${auction.id}`}
              className={`flex items-start justify-between px-5 py-4 transition-colors hover:bg-accent-soft/40 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <div>
                <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Closed {formatDate(auction.endTime)} / Highest {formatCurrency(auction.currentPrice)}
                  {auction.reservePrice != null ? ` / Reserve ${formatCurrency(auction.reservePrice)}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {reason}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PaymentsTab({
  role,
  dashboardStats,
  soldAuctions,
  isLoading,
}: {
  role: User["role"];
  dashboardStats: DashboardStats | null;
  soldAuctions: Auction[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (role !== "Admin" && soldAuctions.length === 0) {
    return (
      <EmptyStatePanel
        title="No payment data yet"
        description="Once your sold auctions accumulate, payment summaries will appear here."
      />
    );
  }

  if (role === "Admin" && !dashboardStats) {
    return (
      <EmptyStatePanel
        title="Revenue summary unavailable"
        description="The admin revenue view depends on the reports endpoint. If it fails, this tab stays empty instead of showing mock totals."
      />
    );
  }

  const totalRevenue = role === "Admin"
    ? dashboardStats?.totalRevenue ?? 0
    : soldAuctions.reduce((sum, auction) => sum + auction.currentPrice, 0);
  const totalTransactions = role === "Admin"
    ? dashboardStats?.totalBids ?? 0
    : soldAuctions.length;
  const averageValue = role === "Admin"
    ? totalRevenue / Math.max((dashboardStats?.activeAuctions ?? 1), 1)
    : totalRevenue / Math.max(soldAuctions.length, 1);

  return (
    <div>
      <SectionHeading
        title={role === "Admin" ? "Marketplace revenue" : "Payments"}
        description={role === "Admin"
          ? "Revenue metrics are now pulled from the real admin reports endpoint. A dedicated payout ledger is still the next backend step."
          : "Seller earnings derived from closed auctions."}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">{role === "Admin" ? "Closed revenue" : "Total earned"}</p>
          <p className="mt-1 text-xl font-bold text-text-heading">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">{role === "Admin" ? "Bid volume" : "Sold auctions"}</p>
          <p className="mt-1 text-xl font-bold text-text-heading">{formatCount(totalTransactions)}</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">{role === "Admin" ? "Revenue per active auction" : "Average sale"}</p>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(averageValue)}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-border-strong px-4 py-4 text-sm text-text-muted">
        {role === "Admin"
          ? "Next step: add an orders or payouts endpoint so this tab can show transaction-level settlement records instead of summary metrics only."
          : "Next step: add an orders or payouts endpoint if you want per-transaction fee and settlement details here."}
      </div>
    </div>
  );
}

function AnalyticsTab({
  role,
  dashboardStats,
  bidActivity,
  ownedAuctions,
  isLoading,
}: {
  role: User["role"];
  dashboardStats: DashboardStats | null;
  bidActivity: BidActivity[];
  ownedAuctions: Auction[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  const sellerClosedAuctions = ownedAuctions.filter((auction) => auction.status === "Closed");
  const sellerSoldAuctions = sellerClosedAuctions.filter((auction) => auction.bidCount > 0 && (auction.reservePrice == null || auction.currentPrice >= auction.reservePrice));

  const cards: StatCard[] = role === "Admin"
    ? [
        { label: "Registered users", value: formatCount(dashboardStats?.totalUsers ?? 0) },
        { label: "Total bids", value: formatCount(dashboardStats?.totalBids ?? 0) },
        { label: "Active auctions", value: formatCount(dashboardStats?.activeAuctions ?? 0) },
        { label: "Closed revenue", value: formatCurrency(dashboardStats?.totalRevenue ?? 0) },
      ]
    : [
        { label: "Auctions created", value: formatCount(ownedAuctions.length) },
        { label: "Closed auctions", value: formatCount(sellerClosedAuctions.length) },
        { label: "Sold rate", value: `${Math.round((sellerSoldAuctions.length / Math.max(sellerClosedAuctions.length, 1)) * 100)}%` },
        { label: "Gross sales", value: formatCurrency(sellerSoldAuctions.reduce((sum, auction) => sum + auction.currentPrice, 0)) },
      ];

  const chartPoints = role === "Admin"
    ? bidActivity.map((point) => ({ label: formatDate(point.date), value: point.totalAmount }))
    : sellerSoldAuctions.reduce<Array<{ label: string; value: number }>>((acc, auction) => {
        const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(auction.endTime));
        const existing = acc.find((entry) => entry.label === label);
        if (existing) {
          existing.value += auction.currentPrice;
        } else {
          acc.push({ label, value: auction.currentPrice });
        }
        return acc;
      }, []);

  const maxValue = Math.max(...chartPoints.map((point) => point.value), 1);

  return (
    <div>
      <SectionHeading
        title="Analytics"
        description={role === "Admin"
          ? "Report-backed marketplace analytics tied to current site activity."
          : "Seller performance analytics derived from your real auctions."}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border-strong p-4">
            <p className="text-xs text-text-muted">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-text-heading">{card.value}</p>
          </div>
        ))}
      </div>

      {chartPoints.length === 0 ? (
        <EmptyStatePanel
          title="No analytics points yet"
          description={role === "Admin"
            ? "Recent bid activity will chart itself here as the marketplace is used."
            : "Sales will chart here once your auctions begin closing."}
        />
      ) : (
        <div className="rounded-xl border border-border-strong p-5">
          <h3 className="text-sm font-semibold text-text-heading">
            {role === "Admin" ? "Bid value over time" : "Sales over time"}
          </h3>
          <div className="mt-4 flex items-end gap-3" style={{ height: 140 }}>
            {chartPoints.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-text-muted">{formatCurrency(point.value)}</span>
                <div className="w-full rounded-t-md bg-accent/80" style={{ height: `${(point.value / maxValue) * 110}px` }} />
                <span className="text-[10px] text-text-muted">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [data, setData] = useState<ProfileDataState>(INITIAL_DATA);
  const user = useAuthStore((state) => state.user);
  const profile = buildProfile(user);
  const availableTabs = getTabs(user?.role);
  const selectedTab = availableTabs.some((tab) => tab.id === activeTab) ? activeTab : "overview";

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    const currentUser = user;

    async function loadProfileData() {
      const canSell = currentUser.role === "Seller" || currentUser.role === "Admin";
      const isAdmin = currentUser.role === "Admin";

      const [
        watchlistResult,
        bidsResult,
        myAuctionsResult,
        dashboardStatsResult,
        bidActivityResult,
        platformActiveAuctionsResult,
        platformClosedAuctionsResult,
      ] = await Promise.allSettled([
        getWatchlist(),
        getMyBids(),
        canSell ? getMyAuctions() : Promise.resolve([]),
        isAdmin ? getDashboardStats() : Promise.resolve(null),
        isAdmin ? getBidActivity(30) : Promise.resolve([]),
        isAdmin ? getAuctions({ status: "Active", sort: "ending_soon" }) : Promise.resolve([]),
        isAdmin ? getAuctions({ status: "Closed", sort: "newest" }) : Promise.resolve([]),
      ]);

      if (cancelled) {
        return;
      }

      const failures: string[] = [];
      const nextState: ProfileDataState = {
        watchlist: watchlistResult.status === "fulfilled" ? watchlistResult.value : [],
        bids: bidsResult.status === "fulfilled" ? bidsResult.value : [],
        myAuctions: myAuctionsResult.status === "fulfilled" ? myAuctionsResult.value : [],
        dashboardStats: dashboardStatsResult.status === "fulfilled" ? dashboardStatsResult.value : null,
        bidActivity: bidActivityResult.status === "fulfilled" ? bidActivityResult.value : [],
        platformActiveAuctions: platformActiveAuctionsResult.status === "fulfilled" ? platformActiveAuctionsResult.value : [],
        platformClosedAuctions: platformClosedAuctionsResult.status === "fulfilled" ? platformClosedAuctionsResult.value : [],
        isLoading: false,
        loadError: null,
      };

      if (watchlistResult.status === "rejected") failures.push("watchlist");
      if (bidsResult.status === "rejected") failures.push("bids");
      if (myAuctionsResult.status === "rejected" && canSell) failures.push("seller auctions");
      if (dashboardStatsResult.status === "rejected" && isAdmin) failures.push("admin reports");
      if (bidActivityResult.status === "rejected" && isAdmin) failures.push("bid activity");
      if (platformActiveAuctionsResult.status === "rejected" && isAdmin) failures.push("live marketplace auctions");
      if (platformClosedAuctionsResult.status === "rejected" && isAdmin) failures.push("closed marketplace auctions");

      if (failures.length > 0) {
        nextState.loadError = `Some dashboard sections could not be loaded: ${failures.join(", ")}.`;
      }

      setData(nextState);
    }

    void loadProfileData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = profile.role === "Admin";
  const isSeller = profile.role === "Seller";
  const ownedAuctions = [...data.myAuctions].sort((left, right) => right.endTime.localeCompare(left.endTime));
  const activeOwnedAuctions = ownedAuctions.filter((auction) => auction.status === "Active");
  const closedOwnedAuctions = ownedAuctions.filter((auction) => auction.status === "Closed");
  const soldOwnedAuctions = closedOwnedAuctions.filter((auction) => auction.bidCount > 0 && (auction.reservePrice == null || auction.currentPrice >= auction.reservePrice));
  const unsoldOwnedAuctions = closedOwnedAuctions.filter((auction) => auction.bidCount === 0 || (auction.reservePrice != null && auction.currentPrice < auction.reservePrice));

  const overviewStats: StatCard[] = isAdmin
    ? [
        {
          label: "Platform users",
          value: formatCount(data.dashboardStats?.totalUsers ?? 0),
          helper: "Registered accounts",
        },
        {
          label: "Total auctions",
          value: formatCount(data.dashboardStats?.totalAuctions ?? 0),
          helper: "Across the marketplace",
        },
        {
          label: "Active auctions",
          value: formatCount(data.dashboardStats?.activeAuctions ?? 0),
          helper: "Live right now",
        },
        {
          label: "Closed revenue",
          value: formatCurrency(data.dashboardStats?.totalRevenue ?? 0),
          helper: "Report endpoint total",
          accentClassName: "text-emerald-600 dark:text-emerald-400",
        },
      ]
    : isSeller
      ? [
          {
            label: "Auctions created",
            value: formatCount(ownedAuctions.length),
            helper: "Listings tied to your account",
          },
          {
            label: "Live auctions",
            value: formatCount(activeOwnedAuctions.length),
            helper: "Currently active listings",
          },
          {
            label: "Closed auctions",
            value: formatCount(closedOwnedAuctions.length),
            helper: "Finished listing lifecycle",
          },
          {
            label: "Gross sales",
            value: formatCurrency(soldOwnedAuctions.reduce((sum, auction) => sum + auction.currentPrice, 0)),
            helper: "Closed auctions that met reserve",
            accentClassName: "text-emerald-600 dark:text-emerald-400",
          },
        ]
      : [
          {
            label: "Watchlist items",
            value: formatCount(data.watchlist.length),
            helper: "Saved auctions",
          },
          {
            label: "Bids placed",
            value: formatCount(data.bids.length),
            helper: "Total bids in your account history",
          },
          {
            label: "Winning bids",
            value: formatCount(data.bids.filter((bid) => bid.status === "Winning" || bid.status === "Won").length),
            helper: "Leading or completed bids",
          },
          {
            label: "Active interests",
            value: formatCount(data.watchlist.filter((item) => item.status === "Active").length),
            helper: "Live auctions on your watchlist",
          },
        ];

  const salesStats: StatCard[] = isAdmin
    ? [
        {
          label: "Marketplace users",
          value: formatCount(data.dashboardStats?.totalUsers ?? 0),
        },
        {
          label: "Marketplace bids",
          value: formatCount(data.dashboardStats?.totalBids ?? 0),
        },
        {
          label: "Live auctions",
          value: formatCount(data.platformActiveAuctions.length || (data.dashboardStats?.activeAuctions ?? 0)),
        },
        {
          label: "Revenue closed",
          value: formatCurrency(data.dashboardStats?.totalRevenue ?? 0),
          accentClassName: "text-emerald-600 dark:text-emerald-400",
        },
      ]
    : [
        {
          label: "Sold auctions",
          value: formatCount(soldOwnedAuctions.length),
        },
        {
          label: "Unsold auctions",
          value: formatCount(unsoldOwnedAuctions.length),
        },
        {
          label: "Live auctions",
          value: formatCount(activeOwnedAuctions.length),
        },
        {
          label: "Gross sales",
          value: formatCurrency(soldOwnedAuctions.reduce((sum, auction) => sum + auction.currentPrice, 0)),
          accentClassName: "text-emerald-600 dark:text-emerald-400",
        },
      ];

  const panel = {
    overview: (
      <OverviewTab
        profile={profile}
        stats={overviewStats}
        isLoading={data.isLoading}
      />
    ),
    "auction-history": (
      <AuctionHistoryTab
        role={profile.role}
        bids={data.bids}
        ownedAuctions={ownedAuctions}
        marketClosedAuctions={data.platformClosedAuctions.slice(0, 8)}
        isLoading={data.isLoading}
      />
    ),
    favourites: <FavouritesTab items={data.watchlist} isLoading={data.isLoading} />,
    bids: <BidsTab items={data.bids} isLoading={data.isLoading} />,
    watchlist: <WatchlistTab items={data.watchlist} isLoading={data.isLoading} />,
    sales: (
      <SalesOverviewTab
        role={profile.role}
        stats={salesStats}
        auctions={(isAdmin ? data.platformClosedAuctions : soldOwnedAuctions).slice(0, 6)}
        isLoading={data.isLoading}
      />
    ),
    "in-auction": (
      <InAuctionTab
        role={profile.role}
        auctions={(isAdmin ? data.platformActiveAuctions : activeOwnedAuctions).slice(0, 8)}
        isLoading={data.isLoading}
      />
    ),
    sold: (
      <SoldTab
        role={profile.role}
        auctions={(isAdmin ? data.platformClosedAuctions : soldOwnedAuctions).slice(0, 8)}
        isLoading={data.isLoading}
      />
    ),
    "not-sold": (
      <NotSoldTab
        auctions={unsoldOwnedAuctions.slice(0, 8)}
        isLoading={data.isLoading}
        isAdmin={isAdmin}
      />
    ),
    payments: (
      <PaymentsTab
        role={profile.role}
        dashboardStats={data.dashboardStats}
        soldAuctions={soldOwnedAuctions}
        isLoading={data.isLoading}
      />
    ),
    analytics: (
      <AnalyticsTab
        role={profile.role}
        dashboardStats={data.dashboardStats}
        bidActivity={data.bidActivity.length > 0 ? data.bidActivity : data.dashboardStats?.recentBidActivity ?? []}
        ownedAuctions={ownedAuctions}
        isLoading={data.isLoading}
      />
    ),
  }[selectedTab];

  return (
    <RequireAuth>
      <div className="page-gradient min-h-screen">
        <Navbar />

        <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#1a4fa0,#3b7dd8)] text-xl font-black tracking-wide text-white">
                {profile.initials}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-heading">{profile.name}</h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                  <span>@{profile.username}</span>
                  <span className="h-1 w-1 rounded-full bg-text-muted/50" />
                  <span>{profile.role}</span>
                  <span className="h-1 w-1 rounded-full bg-text-muted/50" />
                  <span>Member since {profile.joinDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(profile.role === "Seller" || profile.role === "Admin") ? (
                <Link
                  href="/create-listing"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
                >
                  Create Auction
                </Link>
              ) : null}
              <Link
                href="/settings"
                className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {data.loadError ? (
            <div className="mt-6">
              <ErrorBanner message={data.loadError} />
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            <nav className="shrink-0 lg:w-56">
              <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {availableTabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center whitespace-nowrap py-2.5 text-sm font-medium transition-colors ${
                        selectedTab === tab.id
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

            <div className="min-w-0 flex-1 border-l border-border pl-10">
              {panel}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
}
