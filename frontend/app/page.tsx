// Landing page - hero section, featured auctions, call-to-action
import Link from "next/link";
import AuctionGrid from "@/components/auction/AuctionGrid";
import type { AuctionPreview } from "@/components/auction/AuctionCard";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/ui/CategoryBar";
import HeroHeading from "@/components/ui/HeroHeading";
import Navbar from "@/components/layout/Navbar";

const featuredAuctions: AuctionPreview[] = [
  {
    id: "rare-seiko-chrono",
    title: "Rare Seiko Chronograph",
    description: "Automatic Movement, 42mm Case, Stainless Steel Bracelet, Sapphire Crystal",
    location: "Tokyo, Japan",
    category: "Collectibles",
    currentBid: "$1,240",
    bids: 37,
    endsIn: "2h 11m",
    watchers: 91,
    imageUrl: "/auction-images/ceas.jpg",
    imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)",
  },
  {
    id: "psa10-jordan-rookie",
    title: "PSA 10 Jordan Rookie Card",
    description: "1986 Fleer #57, Gem Mint Condition, Authenticated & Graded",
    location: "Chicago, IL 60601",
    category: "Sports Cards",
    currentBid: "$6,850",
    bids: 52,
    endsIn: "5h 44m",
    watchers: 138,
    imageUrl: "/auction-images/card.jpg",
    imageAccent: "linear-gradient(135deg,#3d9bff,#d5ebff)",
  },
  {
    id: "mid-century-lounge-chair",
    title: "Mid-Century Lounge Chair",
    description: "Walnut Frame, Italian Leather Cushions, Original 1960s Design",
    location: "Portland, OR 97201",
    category: "Home Design",
    currentBid: "$2,100",
    bids: 19,
    endsIn: "1d 03h",
    watchers: 64,
    imageUrl: "/auction-images/scaun.jpg",
    imageAccent: "linear-gradient(135deg,#2c6ce8,#5fc7ff)",
  },
  {
    id: "signed-first-edition",
    title: "Signed First Edition Novel",
    description: "Hardcover, Dust Jacket Intact, Author-Signed, Near Fine Condition",
    location: "New York, NY 10001",
    category: "Books",
    currentBid: "$740",
    bids: 26,
    endsIn: "8h 14m",
    watchers: 58,
    imageUrl: "/auction-images/premiu.jpg",
    imageAccent: "linear-gradient(135deg,#105ed6,#8cbcff)",
  },
  {
    id: "lens-master-kit",
    title: "Cinema Lens Master Kit",
    description: "3-Lens Set, PL Mount, T1.5 Aperture, Hard Carrying Case Included",
    location: "Los Angeles, CA 90028",
    category: "Gear",
    currentBid: "$4,920",
    bids: 14,
    endsIn: "3d 06h",
    watchers: 72,
    imageUrl: "/auction-images/obiectiv_foto.jpg",
    imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)",
  },
  {
    id: "kit_auto",
    title: "OEM Front Bumper Kit",
    description: "Complete Assembly, Primer Finish, Fog Light Brackets, Hardware Included",
    location: "Detroit, MI 48201",
    category: "Auto Parts",
    currentBid: "$4,920",
    bids: 14,
    endsIn: "3d 06h",
    watchers: 72,
    imageUrl: "/auction-images/bumper.png",
    imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)",
  },
];

const categories = [
  { label: "This Week", icon: "M9.56 4.44a1.5 1.5 0 0 0-2.12 0L2.38 9.5a1.5 1.5 0 0 0 0 2.12l5.06 5.06a1.5 1.5 0 0 0 2.12 0l5.06-5.06a1.5 1.5 0 0 0 0-2.12L9.56 4.44Z" },
  { label: "Trending", icon: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" },
  { label: "Art", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm12.75-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
  { label: "Interiors", icon: "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5M10.5 21H3m1.5 0h1.5m-1.5 0v-3.675M3 7.5h6.75M3 12h6.75m-6.75 4.5h6.75M21 3.545L18 3m3 .545V21" },
  { label: "Jewellery", icon: "M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V15m0 0l-2.25 1.313M3 16.5v-2.25m0 0l2.25 1.313M3 14.25l2.25-1.313m0 0L7.5 11.25m13.5 5.25v-2.25m0 0l-2.25 1.313m2.25-1.313l-2.25-1.313M16.5 11.25L18.75 13" },
  { label: "Watches", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Fashion", icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" },
  { label: "Coins & Stamps", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" },
  { label: "Comics", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
  { label: "Cars & Bikes", icon: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { label: "Wine & Spirits", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M5 14.5l-1.43 1.43a2.25 2.25 0 0 0-.233 2.927l.417.627c.676 1.014 2.158 1.014 2.834 0L8 17.863a1.687 1.687 0 0 1 2.806 0l1.389 2.084c.676 1.014 2.158 1.014 2.834 0l1.389-2.084a1.687 1.687 0 0 1 2.806 0l1.42 2.13" },
  { label: "Electronics", icon: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
  { label: "Collectibles", icon: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" },
  { label: "Sports", icon: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3.75a2.25 2.25 0 0 0 2.25 2.25A2.25 2.25 0 0 0 12 8.25a2.25 2.25 0 0 0-2.25-2.25A2.25 2.25 0 0 0 12 3.75Z" },
  { label: "Books", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
  { label: "Toys", icon: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.834 48.834 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" },
  { label: "Photography", icon: "M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316ZM16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" },
  { label: "Musical", icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.846a2.25 2.25 0 0 0-1.632-2.163l-5.25-1.5A2.25 2.25 0 0 0 6 3.346v9.057" },
];


export default function HomePage() {
  return (
    <div className="page-gradient relative overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-10 pt-10 sm:px-8">
        <section className="relative">
          <div className="animate-rise max-w-2xl mx-auto text-center">
            <HeroHeading />
            <form action="/auctions" method="get" className="mt-7 flex w-full max-w-2xl mx-auto overflow-hidden rounded-full border border-border-strong bg-card-bg shadow-md">
              <svg className="ml-4 shrink-0 self-center size-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search for brands, models, or keywords..."
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-text-heading placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="submit"
                className="my-1.5 mr-1.5 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <CategoryBar categories={categories} />

        <section className="mt-16">
          <AuctionGrid auctions={featuredAuctions} />
          <div className="mt-8 flex justify-center">
            <Link
              href="/auctions"
              className="rounded-2xl border border-border-strong bg-card-bg px-8 py-3.5 text-base font-semibold text-text-label transition hover:border-accent/50 hover:bg-accent-soft"
            >
              View all auctions
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
