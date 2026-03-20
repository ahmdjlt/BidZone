// Create auction page - form for sellers to create a new auction listing
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const categories = ["Collectibles", "Electronics", "Art", "Sports Cards", "Gear", "Books", "Home Design", "Other"];
const durations = ["1 day", "3 days", "5 days", "7 days", "10 days", "14 days"];

function Dropdown({
  label,
  options,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-heading">
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-left text-sm font-medium text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <span className={value ? "" : "text-text-muted"}>{value || placeholder || "Select..."}</span>
          <svg
            className={`h-4 w-4 text-text-heading transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 z-20 mt-1 w-full overflow-hidden rounded-xl border border-border-strong bg-card-bg shadow-[0_12px_24px_-16px_var(--card-shadow)]">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm leading-tight ${
                  option === value
                    ? "bg-accent font-medium text-white"
                    : "text-text-heading hover:bg-accent-soft"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateAuctionPage() {
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("7 days");

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
          Sell on BidZone
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-heading">
          Create Listing
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-body">
          Fill in the details below to list your item for auction.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-[2rem] border border-border bg-card-bg p-6 card-shadow-light sm:p-8">
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-heading">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Rare Seiko Chronograph 1972"
              className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-heading">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Describe your item in detail — condition, history, what makes it special..."
              className="w-full resize-none rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Category + Duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Dropdown
              label="Category"
              options={categories}
              placeholder="Select category"
              value={category}
              onChange={setCategory}
            />
            <Dropdown
              label="Duration"
              options={durations}
              value={duration}
              onChange={setDuration}
            />
          </div>

          {/* Starting Price + Reserve Price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-heading">
                Starting Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-8 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-heading">
                Reserve Price
                <span className="ml-1 text-xs font-normal text-text-muted">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-8 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>

          {/* Image upload area */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-heading">
              Images
            </label>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-accent-soft/40 px-6 py-10 text-center transition hover:border-accent/50 hover:bg-accent-soft/70">
              <svg className="mb-3 h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-medium text-text-label">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-xs text-text-muted">
                PNG, JPG or WEBP (max. 5MB each)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:brightness-110"
            >
              Publish Listing
            </button>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-border-strong bg-card-bg px-6 py-3 text-sm font-semibold text-text-label transition hover:border-accent/50 hover:bg-accent-soft"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
