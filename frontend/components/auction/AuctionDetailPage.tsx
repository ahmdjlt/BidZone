"use client";

import { useState } from "react";
import Image from "next/image";
import BidForm from "./BidForm";
import BidHistory, { type Bid } from "./BidHistory";

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
    shipping: {
      cost: string;
      location: string;
      pickup?: string;
      returnPolicy: string;
    };
    seller: {
      name: string;
      username: string;
      rating: number;
      totalSold: number;
      reviews: number;
      memberSince: string;
      verified: boolean;
    };
    details: {
      label: string;
      value: string;
    }[];
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
    shipping: {
      cost: "$15",
      location: "New York, United States",
      pickup: "You can pick up this item from the seller in: New York, NY",
      returnPolicy: "We recommend inspecting your item upon arrival. If it does not meet your expectations, please inform us within 3 calendar days of delivery and we'll help find a solution.",
    },
    seller: {
      name: "Luxury Timepieces",
      username: "@luxurytimepieces",
      rating: 96.8,
      totalSold: 488,
      reviews: 163,
      memberSince: "2021",
      verified: true,
    },
    details: [
      { label: "Brand", value: "Rolex" },
      { label: "Model", value: "Submariner" },
      { label: "Year", value: "1968" },
      { label: "Case Size", value: "40mm" },
      { label: "Movement", value: "Automatic" },
      { label: "Case Material", value: "Stainless Steel" },
      { label: "Dial Color", value: "Black" },
      { label: "Condition", value: "Excellent" },
      { label: "Box & Papers", value: "Yes" },
    ],
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
  { id: "b1", bidder: "Bidder 4821", amount: "$28,400", time: "2 min ago" },
  { id: "b2", bidder: "Bidder 1093", amount: "$27,900", time: "5 min ago" },
  { id: "b3", bidder: "Bidder 7742", amount: "$27,000", time: "12 min ago" },
  { id: "b4", bidder: "Bidder 3306", amount: "$26,500", time: "18 min ago" },
  { id: "b5", bidder: "Bidder 5519", amount: "$25,800", time: "25 min ago" },
  { id: "b6", bidder: "Bidder 1093", amount: "$24,500", time: "32 min ago" },
  { id: "b7", bidder: "Bidder 8874", amount: "$23,000", time: "45 min ago" },
  { id: "b8", bidder: "Bidder 4821", amount: "$21,500", time: "1h ago" },
];


export default function AuctionDetailPage(
  props: AuctionDetailPageProps
) {
  const auction = props.auction || defaultProps.auction!;
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen page-gradient">
      <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8">
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-card-bg card-shadow">
              <Image
                src={auction.images[selectedImage]}
                alt={auction.title}
                fill
                className="object-cover"
                priority
              />
              {auction.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + auction.images.length) % auction.images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/60 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % auction.images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/60 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                    {selectedImage + 1} / {auction.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {auction.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {auction.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm transition-all ${
                      selectedImage === index
                        ? "ring-2 ring-accent shadow-[0_4px_12px_-4px_rgba(16,84,209,0.5)]"
                        : "opacity-60 hover:opacity-100"
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
            <div className="mt-6 border-t border-border/40 pt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Description
              </p>
              <p className="text-sm leading-relaxed text-text-body">{auction.description}</p>
            </div>

            {/* Details */}
            <div className="mt-5 border-t border-border/40 pt-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Details
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {auction.details.map((detail) => (
                  <div key={detail.label}>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                      {detail.label}
                    </p>
                    <p className="mt-0.5 text-sm text-text-heading">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="mt-5 border-t border-border/40 pt-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Shipping
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-body">Shipping cost</span>
                  <span className="font-medium text-text-heading">{auction.shipping.cost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-body">Location</span>
                  <span className="font-medium text-text-heading">{auction.shipping.location}</span>
                </div>
                {auction.shipping.pickup && (
                  <p className="text-xs leading-relaxed text-text-muted">{auction.shipping.pickup}</p>
                )}
                <div className="pt-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Return policy</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-body">{auction.shipping.returnPolicy}</p>
                </div>
              </div>
            </div>

            {/* Seller */}
            <div className="mt-5 border-t border-border/40 pt-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Sold by
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-text-label">
                  {auction.seller.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-text-heading">{auction.seller.name}</p>
                    {auction.seller.verified && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-accent">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{auction.seller.username}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
                <span><span className="font-medium text-text-heading">{auction.seller.totalSold}</span> sold</span>
                <span><span className="font-medium text-text-heading">{auction.seller.rating}%</span> positive</span>
                <span><span className="font-medium text-text-heading">{auction.seller.reviews}</span> reviews</span>
              </div>
              <p className="mt-1 text-xs text-text-muted">Member since {auction.seller.memberSince}</p>
            </div>

          </div>

          {/* Right Column - Details & Bid */}
          <div className="lg:col-span-2">
            {/* Title */}
            <h1 className="text-xl font-semibold tracking-tight text-text-heading sm:text-2xl">
              {auction.title}
            </h1>

            {/* Bid Section */}
            <div className="mt-4">
              <BidForm
                currentBid={auction.currentBid}
                minIncrement={100}
                totalBids={auction.totalBids}
                estimatedValue={auction.estimatedValue}
                endTime={auction.endsAt}
                onPlaceBid={(amount) => console.log("Bid placed:", amount)}
              />
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
