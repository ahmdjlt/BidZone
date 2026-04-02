"use client";

const bids = [
  { user: "Alex M.", item: "Rare Seiko Chronograph", amount: "$1,280", time: "4s ago" },
  { user: "Sarah K.", item: "PSA 10 Jordan Rookie Card", amount: "$6,900", time: "8s ago" },
  { user: "James R.", item: "Mid-Century Lounge Chair", amount: "$2,150", time: "12s ago" },
  { user: "Maria L.", item: "Signed First Edition Novel", amount: "$780", time: "15s ago" },
  { user: "David C.", item: "Cinema Lens Master Kit", amount: "$5,050", time: "19s ago" },
  { user: "Emily W.", item: "Vintage Polaroid SX-70", amount: "$410", time: "23s ago" },
  { user: "Chris T.", item: "Abstract Oil on Canvas", amount: "$3,350", time: "26s ago" },
  { user: "Nina P.", item: "Limited Edition Air Max 1", amount: "$920", time: "30s ago" },
  { user: "Tom B.", item: "OEM Front Bumper Kit", amount: "$5,100", time: "34s ago" },
  { user: "Lisa H.", item: "Rolex Submariner Date", amount: "$12,400", time: "38s ago" },
  { user: "Jake F.", item: "1st Edition Charizard", amount: "$8,200", time: "41s ago" },
  { user: "Olivia D.", item: "Herman Miller Eames Chair", amount: "$3,800", time: "45s ago" },
  { user: "Ryan S.", item: "Canon EF 85mm f/1.2L", amount: "$1,650", time: "48s ago" },
  { user: "Mia G.", item: "Banksy Print - Girl with Balloon", amount: "$14,500", time: "52s ago" },
  { user: "Ethan J.", item: "Vintage Gibson Les Paul", amount: "$7,300", time: "56s ago" },
];

function BidCard({ user, item, amount, time }: typeof bids[number]) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-card-bg/60 px-4 py-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-500">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </span>
      <span className="text-xs text-text-muted whitespace-nowrap">
        <span className="font-semibold text-text-heading">{user}</span>
        {" bid "}
        <span className="font-semibold text-green-500">{amount}</span>
        {" on "}
        <span className="text-text-heading">{item}</span>
      </span>
      <span className="text-[10px] text-text-muted whitespace-nowrap">{time}</span>
    </div>
  );
}

export default function LiveBidTicker() {
  return (
    <div className="relative overflow-hidden py-3">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[var(--page-gradient)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[var(--page-gradient)] to-transparent" />

      <div className="flex w-max animate-marquee gap-4">
        {/* First copy */}
        {bids.map((bid, i) => (
          <BidCard key={i} {...bid} />
        ))}
        {/* Duplicate for seamless loop */}
        {bids.map((bid, i) => (
          <BidCard key={`dup-${i}`} {...bid} />
        ))}
      </div>
    </div>
  );
}
