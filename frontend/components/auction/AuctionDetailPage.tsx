"use client";

import { useState } from "react";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import BidForm from "./BidForm";
import BidHistory, { type Bid } from "./BidHistory";
import LiveBidFeed, { type LiveBid } from "./LiveBidFeed";

export interface AuctionDetailPageProps {
  auction?: {
    id: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    startingPrice: number;
    currentBid: number;
    totalBids: number;
    endsAt: string;
    estimatedValue: number;
    seller: {
      name: string;
      avatar?: string;
      rating: number;
      memberSince: string;
    };
    rules: {
      title: string;
      items: string[];
    }[];
  };
}

// Demo data generator for preview
function generateDemoData(): AuctionDetailPageProps["auction"] {
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString();

  return {
    id: "demo-123",
    title: "Vintage Rolex Submariner 1968 - Excellent Condition",
    description: "This is a rare vintage Rolex Submariner from 1968 in excellent condition. The watch features the original dial, hands, and crown. Service history available upon request. Comes with original box and papers. A true collector's item that will appreciate in value over time.",
    category: "Watches & Jewelry",
    images: [
      "https://picsum.photos/seed/rolex1/800/600",
      "https://picsum.photos/seed/rolex2/400/300",
      "https://picsum.photos/seed/rolex3/400/300",
      "https://picsum.photos/seed/rolex4/400/300",
    ],
    startingPrice: 15000,
    currentBid: 28400,
    totalBids: 23,
    endsAt: endTime,
    estimatedValue: 35000,
    seller: {
      name: "Luxury Timepieces",
      avatar: "https://picsum.photos/seed/seller/100/100",
      rating: 4.8,
      memberSince: "2021",
    },
    rules: [
      {
        title: "Bidding Rules",
        items: [
          "Minimum bid increment: $100",
          "All bids are binding",
          "Bidding starts at the current price",
        ],
      },
      {
        title: "Payment & Shipping",
        items: [
          "Payment due within 48 hours",
          "Insured shipping worldwide",
          "Buyer pays shipping costs",
        ],
      },
      {
        title: "Return Policy",
        items: [
          "No returns on auction items",
          "Authenticity guaranteed",
          "Dispute resolution available",
        ],
      },
    ],
  };
}

// Default demo props
const defaultProps: AuctionDetailPageProps = {
  auction: generateDemoData(),
};

// Demo bid history
const demoBids: Bid[] = [
  { id: "b1", bidder: "Alex M.", amount: "$28,400", time: "2 min ago" },
  { id: "b2", bidder: "Sarah K.", amount: "$27,900", time: "5 min ago" },
  { id: "b3", bidder: "Dan P.", amount: "$27,000", time: "12 min ago" },
  { id: "b4", bidder: "Ioana R.", amount: "$26,500", time: "18 min ago" },
  { id: "b5", bidder: "Mihai T.", amount: "$25,800", time: "25 min ago" },
  { id: "b6", bidder: "Elena V.", amount: "$24,500", time: "32 min ago" },
  { id: "b7", bidder: "Andrei S.", amount: "$23,000", time: "45 min ago" },
  { id: "b8", bidder: "Clara D.", amount: "$21,500", time: "1h ago" },
];

const initialLiveBids: LiveBid[] = [
  { id: "l1", bidder: "Alex M.", amount: "$28,400", timestamp: new Date(Date.now() - 2 * 60 * 1000) },
  { id: "l2", bidder: "Sarah K.", amount: "$27,900", timestamp: new Date(Date.now() - 5 * 60 * 1000) },
  { id: "l3", bidder: "Dan P.", amount: "$27,000", timestamp: new Date(Date.now() - 12 * 60 * 1000) },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "text-yellow-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function AuctionRulesSection({
  rules,
}: {
  rules: { title: string; items: string[] }[];
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white">
      <div className="border-b border-blue-100 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Auction Rules & Policies
        </p>
      </div>
      <div className="divide-y divide-blue-50 p-5">
        {rules.map((rule, index) => (
          <div key={index} className={index > 0 ? "pt-4" : ""}>
            <p className="mb-2 text-sm font-semibold text-blue-950">{rule.title}</p>
            <ul className="space-y-1">
              {rule.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuctionDetailPage(
  props: AuctionDetailPageProps
) {
  const auction = props.auction || defaultProps.auction;
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Left Column - Images */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_70px_-36px_rgba(27,111,242,0.6)]">
              <Image
                src={auction.images[selectedImage]}
                alt={auction.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            {auction.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {auction.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-500 shadow-[0_4px_12px_-4px_rgba(16,84,209,0.5)]"
                        : "border-blue-100 hover:border-blue-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${auction.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-blue-950">Description</h2>
              <p className="leading-relaxed text-slate-600">{auction.description}</p>
            </div>

            {/* Seller Info */}
            <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Seller Information
              </p>
              <div className="flex items-center gap-4">
                {auction.seller.avatar ? (
                  <Image
                    src={auction.seller.avatar}
                    alt={auction.seller.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                    {auction.seller.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-blue-950">
                    {auction.seller.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={Math.round(auction.seller.rating)} />
                    <span className="text-sm font-medium text-blue-700">
                      {auction.seller.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Member since {auction.seller.memberSince}
                  </p>
                </div>
              </div>
            </div>

            {/* Auction Rules */}
            <div className="mt-8">
              <AuctionRulesSection rules={auction.rules} />
            </div>
          </div>

          {/* Right Column - Details & Bid */}
          <div className="lg:col-span-2">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {auction.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl lg:text-[1.75rem]">
              {auction.title}
            </h1>

            {/* Estimated Value */}
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm text-slate-500">Estimated Value:</p>
              <p className="text-lg font-semibold text-blue-700">
                ${auction.estimatedValue.toLocaleString()}
              </p>
            </div>

            {/* Stats Badges */}
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  Current Bid
                </p>
                <p className="mt-0.5 text-lg font-semibold text-blue-950">
                  ${auction.currentBid.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Total Bids
                </p>
                <p className="mt-0.5 text-lg font-semibold text-blue-950">
                  {auction.totalBids}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Starting Price
                </p>
                <p className="mt-0.5 text-lg font-semibold text-blue-950">
                  ${auction.startingPrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="mt-6">
              <CountdownTimer endTime={auction.endsAt} />
            </div>

            {/* Bid Form */}
            <div className="mt-6">
              <BidForm
                currentBid={auction.currentBid}
                minIncrement={100}
                onPlaceBid={(amount) => console.log("Bid placed:", amount)}
              />
            </div>

            {/* Live Bid Feed */}
            <div className="mt-6">
              <LiveBidFeed initialBids={initialLiveBids} simulateRealTime={true} />
            </div>

            {/* Bid History */}
            <div className="mt-6">
              <BidHistory bids={demoBids} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
