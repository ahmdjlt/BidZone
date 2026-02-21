// Dashboard page - overview of user's auctions, active bids, and stats
import Link from "next/link";

const stats = [
  { label: "Active Listings", value: "8", accent: "bg-blue-50 border-blue-100/80" },
  { label: "Total Bids Received", value: "214", accent: "bg-blue-50 border-blue-100/80" },
  { label: "Revenue", value: "$18,430", accent: "bg-blue-50 border-blue-100/80" },
  { label: "Avg. Sell Uplift", value: "+31%", accent: "bg-blue-50 border-blue-100/80" },
];

const activeAuctions = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", currentBid: "$1,240", bids: 37, endsIn: "2h 11m", status: "Live" },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", currentBid: "$6,850", bids: 52, endsIn: "5h 44m", status: "Live" },
  { id: "mid-century-chair", title: "Mid-Century Lounge Chair", currentBid: "$2,100", bids: 19, endsIn: "1d 03h", status: "Live" },
  { id: "vintage-lens-bundle", title: "Vintage Lens Bundle", currentBid: "$2,840", bids: 48, endsIn: "49m", status: "Ending Soon" },
];

const recentBids = [
  { bidder: "Alex M.", amount: "$2,840", auction: "Vintage Lens Bundle", time: "2 min ago" },
  { bidder: "Sarah K.", amount: "$6,850", auction: "PSA 10 Jordan Rookie Card", time: "5 min ago" },
  { bidder: "James R.", amount: "$1,240", auction: "Rare Seiko Chronograph", time: "12 min ago" },
  { bidder: "Mia T.", amount: "$2,100", auction: "Mid-Century Lounge Chair", time: "18 min ago" },
  { bidder: "Noah P.", amount: "$6,700", auction: "PSA 10 Jordan Rookie Card", time: "24 min ago" },
];

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Ending Soon"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "Ended"
        ? "bg-slate-50 text-slate-500 border-slate-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Seller dashboard
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-blue-950">
          Welcome back, Alex
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Here&apos;s what&apos;s happening with your auctions today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${stat.accent}`}
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

      {/* Active Auctions */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-blue-950">
            My Active Auctions
          </h2>
          <Link
            href="/auctions/create"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:bg-blue-700"
          >
            + New listing
          </Link>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-[0_24px_60px_-40px_rgba(27,111,242,0.25)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Auction
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Current Bid
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Bids
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Time Left
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {activeAuctions.map((auction) => (
                  <tr key={auction.id} className="transition-colors hover:bg-blue-50/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/auctions/${auction.id}`} className="font-medium text-blue-950 hover:text-blue-700">
                        {auction.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-blue-950">{auction.currentBid}</td>
                    <td className="px-5 py-3.5 text-slate-600">{auction.bids}</td>
                    <td className="px-5 py-3.5 text-slate-600">{auction.endsIn}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={auction.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent Bids */}
      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-blue-950">
          Recent Bids
        </h2>
        <div className="space-y-3">
          {recentBids.map((bid, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-5 py-3.5 shadow-[0_8px_30px_-20px_rgba(27,111,242,0.15)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                  {bid.bidder.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-950">{bid.bidder}</p>
                  <p className="text-xs text-slate-500">on {bid.auction}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-950">{bid.amount}</p>
                <p className="text-xs text-slate-500">{bid.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
