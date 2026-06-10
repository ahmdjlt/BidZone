"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAuctions, getMyAuctions, reopenAuction, updateAuction, deleteAuction, getCategories } from "@/lib/api/auctions";
import { getMyBids } from "@/lib/api/bids";
import { getDashboardStats, getWatchlist } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import type { Auction, AuctionSummary, Category, DashboardStats, RecentSale, UpdateAuctionData, WatchlistItem } from "@/types/auction";
import type { Bid } from "@/types/bid";
import type { User } from "@/types/user";

type Tab =
  | "favourites"
  | "bids"
  | "watchlist"
  | "sales"
  | "in-auction"
  | "sold"
  | "not-sold"
  | "payments";

interface ProfileViewModel {
  name: string;
  initials: string;
  avatarUrl: string | null;
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
  dashboardStats: DashboardStats | null;
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
  dashboardStats: null,
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
    avatarUrl: user?.avatarUrl ?? null,
    username: user?.username ?? "user",
    email: user?.email ?? "No email available",
    role: user?.role ?? "User",
    status: user?.isActive === false ? "Inactive" : "Active",
    joinDate: user ? formatJoinDate(user.createdAt) : "Recently",
  };
}

function getTabs(role: User["role"] | undefined): TabDefinition[] {
  const userTabs: TabDefinition[] = [
    { id: "favourites", label: "Favourite objects" },
    { id: "bids", label: "Bids" },
    { id: "watchlist", label: "Watchlist" },
    { id: "sales", label: "Sales overview" },
    { id: "in-auction", label: "In auction" },
    { id: "sold", label: "Sold" },
    { id: "not-sold", label: "Not sold" },
  ];

  if (role === "Admin") {
    return [
      { id: "favourites", label: "Favourite objects" },
      { id: "bids", label: "Bids" },
      { id: "watchlist", label: "Watchlist" },
      { id: "sales", label: "Marketplace summary" },
      { id: "in-auction", label: "Live auctions" },
      { id: "sold", label: "Closed auctions" },
      { id: "not-sold", label: "Not sold" },
      { id: "payments", label: "Revenue" },
    ];
  }

  return userTabs;
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

  const recentAuctions = role === "Admin"
    ? marketClosedAuctions
    : [...ownedAuctions].sort((left, right) => right.endTime.localeCompare(left.endTime)).slice(0, 8);

  if (recentAuctions.length === 0) {
    return (
      <EmptyStatePanel
        title="No auction history yet"
        description={role === "Admin"
          ? "As auctions close across the marketplace, they will appear here."
          : "Once you create or win auctions, your history will show up here."}
        actionHref={role === "Admin" ? "/auctions" : "/create-listing"}
        actionLabel={role === "Admin" ? "Browse marketplace" : "Create listing"}
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title="Auction History"
        description={role === "Admin"
          ? "Recent closed auctions pulled from the live marketplace catalog."
          : "Recent auctions from your account."}
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {recentAuctions.map((auction, index) => {
          const href = `/auctions/${auction.slug}`;
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
            href={`/auctions/${item.auctionSlug}`}
            className="group overflow-hidden rounded-xl border border-border-strong transition-all hover:border-accent/30 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-accent-soft/40">
              <Image
                src={item.auctionImageUrl || "/auction-images/abstract-oil-canvas.svg"}
                alt={item.auctionTitle}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
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
            href={`/auctions/${item.auctionSlug}`}
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
            href={`/auctions/${item.auctionSlug}`}
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
  auctions: Array<Auction | AuctionSummary | RecentSale>;
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
          : "Your selling performance connected to your real auction inventory."}
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
                href={`/auctions/${auction.slug}`}
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
  onEdit,
  onDelete,
}: {
  role: User["role"];
  auctions: Array<Auction | AuctionSummary>;
  isLoading: boolean;
  onEdit?: (auction: Auction) => void;
  onDelete?: (id: number) => Promise<void>;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (isLoading) {
    return <LoadingState />;
  }

  if (auctions.length === 0) {
    return (
      <EmptyStatePanel
        title="No live auctions yet"
        description="Create a listing and it will appear here while it is live."
        actionHref="/create-listing"
        actionLabel="Create listing"
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title="In auction"
        description="Your currently active auctions."
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {auctions.map((auction, index) => (
          <div
            key={auction.id}
            className={`flex items-center justify-between px-5 py-4 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <Link
              href={`/auctions/${auction.slug}`}
              className="min-w-0 flex-1 transition-colors hover:opacity-80"
            >
              <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {auction.categoryName} / {auction.bidCount} bids / Ends {formatDate(auction.endTime)}
              </p>
            </Link>
            <div className="ml-4 flex shrink-0 items-center gap-2">
              <span className="text-sm font-bold text-text-heading">{formatCurrency(auction.currentPrice)}</span>
              {!onEdit && !onDelete ? <StatusBadge status={auction.status} /> : null}
              {onEdit && "description" in auction ? (
                <button
                  onClick={() => onEdit(auction)}
                  className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-text-heading transition-colors hover:bg-accent-soft"
                >
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                confirmDeleteId === auction.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        setDeletingId(auction.id);
                        setConfirmDeleteId(null);
                        try { await onDelete(auction.id); } finally { setDeletingId(null); }
                      }}
                      disabled={deletingId === auction.id}
                      className="rounded-lg border border-red-400/50 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400"
                    >
                      {deletingId === auction.id ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-accent-soft"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(auction.id)}
                    className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-red-400/50 hover:text-red-500"
                  >
                    Delete
                  </button>
                )
              ) : null}
            </div>
          </div>
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
        title="Nothing sold yet"
        description="Auctions that close with a winning bid will show up here."
      />
    );
  }

  return (
    <div>
      <SectionHeading
        title="Sold"
        description="Your auctions that closed with a successful sale."
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {auctions.map((auction, index) => (
          <div
            key={auction.id}
            className={`flex items-center justify-between px-5 py-4 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <Link
              href={`/auctions/${auction.slug}`}
              className="min-w-0 flex-1 transition-colors hover:opacity-80"
            >
              <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
              <p className="text-xs text-text-muted">{auction.bidCount} bids / Closed {formatDate(auction.endTime)}</p>
            </Link>
            <div className="ml-4 flex shrink-0 items-center gap-3">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(auction.currentPrice)}</span>
              <StatusBadge status={auction.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotSoldTab({
  auctions,
  isLoading,
  isAdmin,
  onReopen,
}: {
  auctions: Auction[];
  isLoading: boolean;
  isAdmin: boolean;
  onReopen?: (id: number) => Promise<void>;
}) {
  const [reopeningId, setReopeningId] = useState<number | null>(null);

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
          : "Closed auctions without a successful sale. Reopen any of them to make them active again."}
      />
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {auctions.map((auction, index) => {
          const reason = auction.bidCount === 0
            ? "No bids"
            : auction.reservePrice != null && auction.currentPrice < auction.reservePrice
              ? "Reserve not met"
              : "Closed without a confirmed sale";

          return (
            <div
              key={auction.id}
              className={`flex items-center justify-between px-5 py-4 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <Link
                href={`/auctions/${auction.slug}`}
                className="min-w-0 flex-1 transition-colors hover:opacity-80"
              >
                <p className="text-sm font-semibold text-text-heading">{auction.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Closed {formatDate(auction.endTime)} / Highest {formatCurrency(auction.currentPrice)}
                  {auction.reservePrice != null ? ` / Reserve ${formatCurrency(auction.reservePrice)}` : ""}
                </p>
              </Link>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {reason}
                </span>
                {onReopen ? (
                  <button
                    onClick={async () => {
                      setReopeningId(auction.id);
                      try {
                        await onReopen(auction.id);
                      } finally {
                        setReopeningId(null);
                      }
                    }}
                    disabled={reopeningId === auction.id}
                    className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-text-heading transition-colors hover:bg-accent-soft disabled:opacity-50"
                  >
                    {reopeningId === auction.id ? "Reopening…" : "Reopen"}
                  </button>
                ) : null}
              </div>
            </div>
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
        title="Revenue data unavailable"
        description="Could not load revenue data. Please try again later."
      />
    );
  }

  const totalRevenue = role === "Admin"
    ? dashboardStats?.totalRevenue ?? 0
    : soldAuctions.reduce((sum, auction) => sum + auction.currentPrice, 0);
  const totalTransactions = role === "Admin"
    ? dashboardStats?.totalBids ?? 0
    : soldAuctions.length;
  const averageValue = totalRevenue / Math.max(soldAuctions.length, 1);

  return (
    <div>
      <SectionHeading
        title={role === "Admin" ? "Marketplace revenue" : "Payments"}
        description={role === "Admin"
          ? "Revenue from closed auctions with a winning bid."
          : "Your earnings from sold auctions."}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">{role === "Admin" ? "Closed revenue" : "Total earned"}</p>
          <p className="mt-1 text-xl font-bold text-text-heading">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border-strong p-4">
          <p className="text-xs text-text-muted">{role === "Admin" ? "Total bids" : "Sold auctions"}</p>
          <p className="mt-1 text-xl font-bold text-text-heading">{formatCount(totalTransactions)}</p>
        </div>
        {role !== "Admin" ? (
          <div className="rounded-xl border border-border-strong p-4">
            <p className="text-xs text-text-muted">Average sale</p>
            <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(averageValue)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EditAuctionModal({
  auction,
  onClose,
  onSave,
}: {
  auction: Auction;
  onClose: () => void;
  onSave: (id: number, data: UpdateAuctionData) => Promise<void>;
}) {
  const [title, setTitle] = useState(auction.title);
  const [description, setDescription] = useState(auction.description);
  const [reservePrice, setReservePrice] = useState<string>(
    auction.reservePrice != null ? String(auction.reservePrice) : "",
  );
  const [endTime, setEndTime] = useState(() => {
    const d = new Date(auction.endTime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [categoryId, setCategoryId] = useState(auction.categoryId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(auction.id, {
        title: title.trim() || null,
        description: description.trim() || null,
        reservePrice: reservePrice !== "" ? Number(reservePrice) : null,
        endTime: new Date(endTime).toISOString(),
        categoryId,
      });
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-card-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">Edit Auction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent-soft hover:text-text-heading"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Reserve Price ($)</label>
              <input
                type="number"
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
                placeholder="None"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">End Date & Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("in-auction");
  const [data, setData] = useState<ProfileDataState>(INITIAL_DATA);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const user = useAuthStore((state) => state.user);
  const profile = buildProfile(user);
  const availableTabs = getTabs(user?.role);
  const selectedTab = availableTabs.some((tab) => tab.id === activeTab) ? activeTab : "in-auction";

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    const currentUser = user;

    async function loadProfileData() {
      const canSell = true;
      const isAdmin = currentUser.role === "Admin";

      const [
        watchlistResult,
        bidsResult,
        myAuctionsResult,
        dashboardStatsResult,
        platformActiveAuctionsResult,
      ] = await Promise.allSettled([
        getWatchlist(),
        getMyBids(),
        canSell ? getMyAuctions() : Promise.resolve([]),
        isAdmin ? getDashboardStats() : Promise.resolve(null),
        isAdmin ? getAuctions({ status: "Active", sort: "ending_soon" }) : Promise.resolve([]),
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
        platformActiveAuctions: platformActiveAuctionsResult.status === "fulfilled" ? platformActiveAuctionsResult.value : [],
        isLoading: false,
        loadError: null,
      };

      if (watchlistResult.status === "rejected") failures.push("watchlist");
      if (bidsResult.status === "rejected") failures.push("bids");
      if (myAuctionsResult.status === "rejected" && canSell) failures.push("seller auctions");
      if (dashboardStatsResult.status === "rejected" && isAdmin) failures.push("admin reports");
      if (platformActiveAuctionsResult.status === "rejected" && isAdmin) failures.push("live marketplace auctions");

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
  const ownedAuctions = [...data.myAuctions].sort((left, right) => right.endTime.localeCompare(left.endTime));
  const activeOwnedAuctions = ownedAuctions.filter((auction) => auction.status === "Active");
  const closedOwnedAuctions = ownedAuctions.filter((auction) => auction.status === "Closed");
  const soldOwnedAuctions = closedOwnedAuctions.filter((auction) => auction.bidCount > 0 && (auction.reservePrice == null || auction.currentPrice >= auction.reservePrice));
  const unsoldOwnedAuctions = closedOwnedAuctions.filter((auction) => auction.bidCount === 0 || (auction.reservePrice != null && auction.currentPrice < auction.reservePrice));

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

  async function handleEditSave(id: number, updates: UpdateAuctionData) {
    const updated = await updateAuction(id, updates);
    setData((prev) => ({
      ...prev,
      myAuctions: prev.myAuctions.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    }));
  }

  async function handleDelete(id: number) {
    await deleteAuction(id);
    setData((prev) => ({
      ...prev,
      myAuctions: prev.myAuctions.filter((a) => a.id !== id),
    }));
  }

  const panel = {
    favourites: <FavouritesTab items={data.watchlist} isLoading={data.isLoading} />,
    bids: <BidsTab items={data.bids} isLoading={data.isLoading} />,
    watchlist: <WatchlistTab items={data.watchlist} isLoading={data.isLoading} />,
    sales: (
      <SalesOverviewTab
        role={profile.role}
        stats={salesStats}
        auctions={isAdmin ? (data.dashboardStats?.recentSales ?? []) : soldOwnedAuctions.slice(0, 6)}
        isLoading={data.isLoading}
      />
    ),
    "in-auction": (
      <InAuctionTab
        role={profile.role}
        auctions={activeOwnedAuctions.slice(0, 8)}
        isLoading={data.isLoading}
        onEdit={setEditingAuction}
        onDelete={handleDelete}
      />
    ),
    sold: (
      <SoldTab
        role={profile.role}
        auctions={soldOwnedAuctions.slice(0, 8)}
        isLoading={data.isLoading}
      />
    ),
    "not-sold": (
      <NotSoldTab
        auctions={unsoldOwnedAuctions.slice(0, 8)}
        isLoading={data.isLoading}
        isAdmin={isAdmin}
        onReopen={async (id) => {
          const newEndTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await reopenAuction(id, newEndTime);
          const refreshed = await getMyAuctions();
          setData((prev) => ({ ...prev, myAuctions: refreshed }));
        }}
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
  }[selectedTab];

  return (
    <RequireAuth>
      {editingAuction && (
        <EditAuctionModal
          auction={editingAuction}
          onClose={() => setEditingAuction(null)}
          onSave={handleEditSave}
        />
      )}
      <div className="page-gradient min-h-screen">
        <Navbar />

        <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1a4fa0,#3b7dd8)] text-xl font-black tracking-wide text-white">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile.initials
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-heading">{profile.name}</h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                  <span>@{profile.username}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.role !== "Admin" ? (
                <Link
                  href="/create-listing"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
                >
                  Create Auction
                </Link>
              ) : null}
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
