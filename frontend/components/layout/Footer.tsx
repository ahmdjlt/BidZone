// Footer - site footer with links, copyright, and social media icons
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-blue-100 bg-white/95">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="text-lg font-semibold tracking-tight text-blue-950">BidZone</p>
          <p className="text-sm leading-relaxed text-slate-600">
            A live marketplace where buyers compete and sellers maximize item
            value in real time.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            Marketplace
          </p>
          <Link href="/auctions" className="block text-sm text-slate-600 hover:text-blue-700">
            All auctions
          </Link>
          <Link
            href="/auctions/create"
            className="block text-sm text-slate-600 hover:text-blue-700"
          >
            Start selling
          </Link>
          <Link href="/my-bids" className="block text-sm text-slate-600 hover:text-blue-700">
            My bids
          </Link>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            Account
          </p>
          <Link href="/login" className="block text-sm text-slate-600 hover:text-blue-700">
            Sign in
          </Link>
          <Link
            href="/register"
            className="block text-sm text-slate-600 hover:text-blue-700"
          >
            Create account
          </Link>
          <Link
            href="/dashboard"
            className="block text-sm text-slate-600 hover:text-blue-700"
          >
            Seller dashboard
          </Link>
        </div>

        <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/65 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            Live pulse
          </p>
          <p className="text-sm text-slate-700">
            New bids arrive every few seconds on active premium listings.
          </p>
          <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Real-time updates
          </span>
        </div>
      </div>
      <div className="border-t border-blue-100/80 px-4 py-4 text-center text-xs text-slate-500">
        Copyright {year} BidZone. All rights reserved.
      </div>
    </footer>
  );
}
