"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { createAuction, getCategories } from "@/lib/api/auctions";
import { uploadAuctionImage } from "@/lib/api/uploads";
import type { Category } from "@/types/auction";

const durations = [
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "5 days", days: 5 },
  { label: "7 days", days: 7 },
  { label: "10 days", days: 10 },
  { label: "14 days", days: 14 },
] as const;

type EndMode = "duration" | "custom";

export default function CreateAuctionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [duration, setDuration] = useState<(typeof durations)[number]["label"]>("7 days");
  const [endMode, setEndMode] = useState<EndMode>("duration");
  const [customEndTime, setCustomEndTime] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setIsLoadingCategories(true);
      setErrorMessage(null);
      try {
        const data = await getCategories();
        if (!cancelled) {
          setCategories(data);
          setCategoryId(data[0]?.id ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load categories.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDurationDays = useMemo(() => {
    return durations.find((item) => item.label === duration)?.days ?? 7;
  }, [duration]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const starting = Number(startingPrice);
    const reserve = reservePrice.trim().length > 0 ? Number(reservePrice) : null;

    if (!normalizedTitle) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!normalizedDescription) {
      setErrorMessage("Description is required.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    if (!Number.isFinite(starting) || starting <= 0) {
      setErrorMessage("Starting price must be greater than 0.");
      return;
    }

    if (reserve != null && (!Number.isFinite(reserve) || reserve < starting)) {
      setErrorMessage("Reserve price must be empty or greater than/equal to starting price.");
      return;
    }

    let endTime: string;
    if (endMode === "custom") {
      if (!customEndTime) {
        setErrorMessage("Please choose a custom end time.");
        return;
      }

      const parsedCustomEndTime = new Date(customEndTime);
      if (Number.isNaN(parsedCustomEndTime.getTime()) || parsedCustomEndTime <= new Date()) {
        setErrorMessage("Custom end time must be in the future.");
        return;
      }

      endTime = parsedCustomEndTime.toISOString();
    } else {
      endTime = new Date(Date.now() + selectedDurationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    setIsSubmitting(true);
    try {
      const manualImageUrl = imageUrl.trim();
      const finalImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        setIsUploadingImage(true);
        const uploadedUrls = await Promise.all(imageFiles.map((file) => uploadAuctionImage(file)));
        finalImageUrls.push(...uploadedUrls);
      }

      if (manualImageUrl) {
        finalImageUrls.push(manualImageUrl);
      }

      const created = await createAuction({
        title: normalizedTitle,
        description: normalizedDescription,
        imageUrl: finalImageUrls[0] ?? null,
        imageUrls: finalImageUrls,
        startingPrice: starting,
        reservePrice: reserve,
        endTime,
        categoryId,
      });
      router.push(`/auctions/${created.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create listing.");
    } finally {
      setIsUploadingImage(false);
      setIsSubmitting(false);
    }
  }

  return (
    <RequireAuth allowedRoles={["Seller", "Admin"]} fallbackPath="/dashboard">
      <>
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

        <div className="rounded-[2rem] border border-border bg-card-bg p-6 card-shadow-light sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-heading">Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Rare Seiko Chronograph 1972"
                className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-heading">Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe your item in detail — condition, history, what makes it special..."
                className="w-full resize-none rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-heading">Category</label>
                <div className="relative">
                  <select
                    value={categoryId ?? ""}
                    onChange={(event) => setCategoryId(Number(event.target.value))}
                    disabled={isLoadingCategories || categories.length === 0}
                    className="w-full appearance-none rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 pr-10 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">▼</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-heading">Auction end</label>
                <div className="mb-2 flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 text-text-heading">
                    <input
                      type="radio"
                      name="endMode"
                      checked={endMode === "duration"}
                      onChange={() => setEndMode("duration")}
                    />
                    Duration
                  </label>
                  <label className="inline-flex items-center gap-2 text-text-heading">
                    <input
                      type="radio"
                      name="endMode"
                      checked={endMode === "custom"}
                      onChange={() => setEndMode("custom")}
                    />
                    Custom date/time
                  </label>
                </div>
                {endMode === "duration" ? (
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(event) => setDuration(event.target.value as (typeof durations)[number]["label"])}
                    className="w-full appearance-none rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 pr-10 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {durations.map((option) => (
                      <option key={option.label} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">▼</span>
                </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={customEndTime}
                    onChange={(event) => setCustomEndTime(event.target.value)}
                    className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    required={endMode === "custom"}
                  />
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-heading">Starting Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={startingPrice}
                    onChange={(event) => setStartingPrice(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-8 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    required
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
                    type="number"
                    min={0}
                    step="0.01"
                    value={reservePrice}
                    onChange={(event) => setReservePrice(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-8 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-heading">Auction image (optional)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
                className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <p className="mt-1 text-xs text-text-muted">You can select multiple files. They will be uploaded to Cloudinary automatically.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-heading">Or image URL (optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || isLoadingCategories}
                className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploadingImage ? "Uploading image..." : isSubmitting ? "Publishing..." : "Publish Listing"}
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
    </RequireAuth>
  );
}
