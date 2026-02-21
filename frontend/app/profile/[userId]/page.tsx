// User profile page - displays user info, auction history, and ratings
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const profile = {
  name: "Alex Morgan",
  initials: "AM",
  joinDate: "Member since March 2024",
  bio: "Collector of rare watches, vintage cameras, and sports memorabilia. Passionate about finding unique items and connecting with fellow enthusiasts.",
  location: "San Francisco, CA",
};

const profileStats = [
  { label: "Auctions Created", value: "34" },
  { label: "Items Sold", value: "28" },
  { label: "Avg. Rating", value: "4.9" },
];

const auctionHistory = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", finalPrice: "$1,480", bids: 42, category: "Collectibles", imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)" },
  { id: "vintage-polaroid", title: "Vintage Polaroid SX-70", finalPrice: "$420", bids: 51, category: "Cameras", imageAccent: "linear-gradient(135deg,#2468d6,#7ec4ff)" },
  { id: "signed-first-edition", title: "Signed First Edition Novel", finalPrice: "$890", bids: 33, category: "Books", imageAccent: "linear-gradient(135deg,#105ed6,#8cbcff)" },
  { id: "herman-miller-aeron", title: "Herman Miller Aeron Chair", finalPrice: "$710", bids: 18, category: "Furniture", imageAccent: "linear-gradient(135deg,#1955c0,#63b3ff)" },
];

const reviews = [
  { reviewer: "Sarah K.", rating: 5, text: "Excellent seller — item was exactly as described and shipped quickly. Would buy from again!", time: "2 weeks ago" },
  { reviewer: "James R.", rating: 5, text: "Great communication throughout the auction. Packaging was top notch.", time: "1 month ago" },
  { reviewer: "Mia T.", rating: 4, text: "Good experience overall. Item arrived in perfect condition, shipping took a bit longer than expected.", time: "2 months ago" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 pb-10 pt-10 sm:px-6">
        {/* Profile header card */}
        <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(27,111,242,0.25)] sm:p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#0f5ddd,#4ea2ff)] text-2xl font-black tracking-[0.1em] text-white">
              {profile.initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
                {profile.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{profile.location}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{profile.joinDate}</span>
              </div>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
                {profile.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {profileStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-blue-100/80 bg-blue-50/70 p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-blue-700">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-blue-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Auction history */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-blue-950">
            Auction History
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {auctionHistory.map((auction) => (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="group relative overflow-hidden rounded-[1.7rem] border border-blue-100 bg-white p-5 shadow-[0_16px_50px_-30px_rgba(27,111,242,0.2)] transition hover:-translate-y-0.5 hover:border-blue-200"
              >
                <div
                  className="absolute right-0 top-0 h-16 w-16 rounded-bl-[2rem] opacity-80"
                  style={{ background: auction.imageAccent }}
                />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                    {auction.category}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold tracking-tight text-blue-950">
                    {auction.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="font-semibold text-blue-950">{auction.finalPrice}</span>
                    <span className="text-slate-500">{auction.bids} bids</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-blue-950">
            Reviews
          </h2>
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(27,111,242,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                      {review.reviewer.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-950">{review.reviewer}</p>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{review.time}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
