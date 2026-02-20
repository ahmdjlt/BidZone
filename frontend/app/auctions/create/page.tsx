// Create auction page - form for sellers to create a new auction listing
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const categories = ["Collectibles", "Electronics", "Art", "Sports Cards", "Gear", "Books", "Home Design", "Other"];
const durations = ["1 day", "3 days", "5 days", "7 days", "10 days", "14 days"];

export default function CreateAuctionPage() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Sell on BidZone
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-blue-950">
            Create Listing
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Fill in the details below to list your item for auction.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(27,111,242,0.25)] sm:p-8">
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Rare Seiko Chronograph 1972"
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                Description
              </label>
              <textarea
                rows={5}
                placeholder="Describe your item in detail — condition, history, what makes it special..."
                className="w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Category + Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                  Category
                </label>
                <select className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-blue-950 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                  Duration
                </label>
                <select className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-blue-950 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  {durations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Starting Price + Reserve Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                  Starting Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pl-8 pr-4 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                  Reserve Price
                  <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pl-8 pr-4 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Image upload area */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-blue-950">
                Images
              </label>
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-blue-50/70">
                <svg className="mb-3 h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm font-medium text-blue-700">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG or WEBP (max. 5MB each)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:bg-blue-700"
              >
                Publish Listing
              </button>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
