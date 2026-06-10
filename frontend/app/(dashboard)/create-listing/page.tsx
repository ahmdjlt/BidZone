"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { createAuction, getCategories } from "@/lib/api/auctions";
import { uploadAuctionImage } from "@/lib/api/uploads";
import type { Category } from "@/types/auction";

function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T;
  onChange: (val: T) => void;
  options: { label: string; value: T }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
      >
        <span>{selected?.label ?? "Select"}</span>
        <svg className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <ul className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border-strong bg-card-bg py-1 shadow-lg">
          {options.map((opt) => (
            <li
              key={String(opt.value)}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-accent-soft ${opt.value === value ? "font-medium text-accent" : "text-text-heading"}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const durations = [
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "5 days", days: 5 },
  { label: "7 days", days: 7 },
  { label: "10 days", days: 10 },
  { label: "14 days", days: 14 },
] as const;

type EndMode = "duration" | "custom";

const MAX_DESC = 2000;

function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
        {number}
      </span>
      <div>
        <h2 className="text-sm font-semibold text-text-heading">{title}</h2>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative ml-1 inline-block align-middle">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] font-bold text-text-muted transition-colors hover:border-accent hover:text-accent"
        aria-label="Help"
      >
        ?
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-border-strong bg-card-bg px-3 py-2 text-xs text-text-muted shadow-lg">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border-strong" />
        </div>
      )}
    </span>
  );
}

function formatEndDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

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

  // UI-only state
  const [showUrlField, setShowUrlField] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const selectedDurationDays = useMemo(() => {
    return durations.find((item) => item.label === duration)?.days ?? 7;
  }, [duration]);

  const computedEndDate = useMemo(() => {
    if (endMode === "duration") {
      return new Date(Date.now() + selectedDurationDays * 24 * 60 * 60 * 1000);
    }
    if (customEndTime) {
      const d = new Date(customEndTime);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  }, [endMode, selectedDurationDays, customEndTime]);

  function handleFilesSelected(files: File[]) {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    setImageFiles(valid);
    const previews = valid.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(Array.from(e.dataTransfer.files));
  }

  function removeFile(index: number) {
    const next = imageFiles.filter((_, i) => i !== index);
    const nextPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(next);
    setImagePreviews(nextPreviews);
  }

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
      router.push(`/auctions/${created.slug}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create listing.");
    } finally {
      setIsUploadingImage(false);
      setIsSubmitting(false);
    }
  }

  return (
    <RequireAuth>
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-text-heading">Create Listing</h1>
          <p className="mt-1 text-sm text-text-muted">Fill in the details below to publish your auction.</p>
        </div>

        <form className="space-y-10" onSubmit={handleSubmit}>

          {/* ── Section 1: Item details ── */}
          <section>
            <SectionHeader
              number={1}
              title="Item details"
              subtitle="Describe what you're selling so buyers know exactly what to expect."
            />
            <div className="space-y-4 rounded-2xl border border-border-strong bg-card-bg p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-heading">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rare Seiko Chronograph 1972"
                  className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  required
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-semibold text-text-heading">Description</label>
                  <span className={`text-xs tabular-nums ${description.length > MAX_DESC * 0.9 ? "text-amber-500" : "text-text-muted"}`}>
                    {description.length} / {MAX_DESC}
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Describe your item in detail — condition, history, what makes it special..."
                  className="w-full resize-none rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-heading">Category</label>
                <CustomSelect
                  value={categoryId ?? 0}
                  onChange={(val) => setCategoryId(val)}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  disabled={isLoadingCategories || categories.length === 0}
                />
              </div>
            </div>
          </section>

          {/* ── Section 2: Auction settings ── */}
          <section>
            <SectionHeader
              number={2}
              title="Auction settings"
              subtitle="Set your price, reserve, and how long the auction runs."
            />
            <div className="space-y-4 rounded-2xl border border-border-strong bg-card-bg p-5">
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
                      onChange={(e) => setStartingPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-8 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center text-sm font-semibold text-text-heading">
                    Reserve Price
                    <span className="ml-1 text-xs font-normal text-text-muted">(optional)</span>
                    <Tooltip text="Minimum price before the item can be sold. Bidders won't see it." />
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={reservePrice}
                      onChange={(e) => setReservePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-8 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-text-heading">Auction end</label>

                {/* Segmented toggle */}
                <div className="mb-3 inline-flex rounded-xl border border-border-strong bg-input-bg p-1">
                  {(["duration", "custom"] as EndMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEndMode(mode)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                        endMode === mode
                          ? "bg-accent text-white shadow-sm"
                          : "text-text-muted hover:text-text-heading"
                      }`}
                    >
                      {mode === "duration" ? "Duration" : "Custom date"}
                    </button>
                  ))}
                </div>

                {endMode === "duration" ? (
                  <CustomSelect
                    value={duration}
                    onChange={(val) => setDuration(val)}
                    options={durations.map((d) => ({ label: d.label, value: d.label }))}
                  />
                ) : (
                  <input
                    type="datetime-local"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    required={endMode === "custom"}
                  />
                )}

                {computedEndDate && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5H10.75V5z" clipRule="evenodd" />
                    </svg>
                    Ends {formatEndDate(computedEndDate)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── Section 3: Photos ── */}
          <section>
            <SectionHeader
              number={3}
              title="Photos"
              subtitle="Add photos to help buyers see your item clearly. Optional but recommended."
            />
            <div className="space-y-4 rounded-2xl border border-border-strong bg-card-bg p-5">

              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                  isDragging
                    ? "border-accent bg-accent/5"
                    : "border-border-strong bg-input-bg hover:border-accent/50 hover:bg-accent-soft/20"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border border-border-strong transition-colors ${isDragging ? "border-accent bg-accent/10" : "bg-card-bg"}`}>
                  <svg className={`h-5 w-5 ${isDragging ? "text-accent" : "text-text-muted"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text-heading">
                    {isDragging ? "Release to upload" : "Drop photos here or click to browse"}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">PNG, JPG, WEBP, GIF — multiple files supported</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(Array.from(e.target.files ?? []))}
                />
              </div>

              {/* Thumbnails */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={src} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border-strong">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                          <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" />
                        </svg>
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[9px] font-semibold text-white">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible URL field */}
              {!showUrlField ? (
                <button
                  type="button"
                  onClick={() => setShowUrlField(true)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  + Add by URL instead
                </button>
              ) : (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-semibold text-text-heading">Image URL</label>
                    <button
                      type="button"
                      onClick={() => { setShowUrlField(false); setImageUrl(""); }}
                      className="text-xs text-text-muted hover:text-text-heading"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Error */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="w-full rounded-2xl border border-border-strong bg-card-bg px-6 py-3 text-center text-sm font-semibold text-text-heading transition hover:border-accent/50 hover:bg-accent-soft sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage || isLoadingCategories}
              className="w-full rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isUploadingImage ? "Uploading photos…" : isSubmitting ? "Publishing…" : "Publish Listing"}
            </button>
          </div>
        </form>
      </>
    </RequireAuth>
  );
}
