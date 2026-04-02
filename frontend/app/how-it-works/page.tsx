// How It Works - step-by-step guide to using BidZone
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds with your email or Google account. Complete your profile to unlock selling privileges and build trust with other users.",
    details: [
      "Verified identity builds buyer confidence",
      "Seller rating visible on every listing",
      "Secure, encrypted credentials",
    ],
  },
  {
    number: "02",
    title: "Browse or List",
    description:
      "Explore live auctions across dozens of categories, or list your own items with smart pricing guidance and instant category matching.",
    details: [
      "Set starting price, reserve, and duration",
      "Upload photos with drag-and-drop",
      "AI-suggested categories and tags",
    ],
  },
  {
    number: "03",
    title: "Bid in Real Time",
    description:
      "Place bids and watch the action unfold live. Anti-sniping extensions ensure fairness — if a bid lands in the final minute, the timer extends automatically.",
    details: [
      "Live bid feed with instant updates",
      "Anti-sniping countdown extensions",
      "Bid notifications via email and in-app",
    ],
  },
  {
    number: "04",
    title: "Win & Complete",
    description:
      "Winners are notified instantly and guided through secure checkout. Both parties receive shipment tracking and transaction status updates.",
    details: [
      "Secure payment processing",
      "Built-in shipment tracking",
      "Buyer protection on every transaction",
    ],
  },
];

const faqs = [
  {
    question: "Is there a fee to list items?",
    answer:
      "Basic listings are free. A small commission is charged only when your item sells successfully.",
  },
  {
    question: "How does anti-sniping work?",
    answer:
      "If a bid is placed in the final 60 seconds, the auction timer extends by one minute, giving all bidders a fair chance to respond.",
  },
  {
    question: "What happens if the reserve price isn't met?",
    answer:
      "The item won't sell. Sellers can choose to relist or reach out to the highest bidder with a second-chance offer.",
  },
  {
    question: "How are payments handled?",
    answer:
      "Payments are processed through our secure checkout system. Funds are held in escrow until the buyer confirms receipt of the item.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-gradient relative overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 pb-10 pt-10 sm:px-8">
        {/* Header */}
        <section className="animate-rise text-center">
          <span className="inline-flex items-center rounded-full border border-border-strong bg-card-bg px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
            How it works
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-text-heading sm:text-5xl">
            From listing to sold in four simple steps.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-text-body">
            Whether you&apos;re buying or selling, BidZone keeps every step
            transparent, fast, and secure.
          </p>
        </section>

        {/* Steps */}
        <section className="mt-16 space-y-6">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="animate-rise rounded-[2rem] border border-border bg-card-bg p-6 card-shadow-light sm:p-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-text-label">
                    Step {step.number}
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-heading sm:text-3xl">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-text-body sm:text-base">
                    {step.description}
                  </p>
                </div>
                <ul className="space-y-3 rounded-2xl border border-border/80 bg-accent-soft/70 p-5">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-3 text-sm text-text-body"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                        &#10003;
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
              Common questions
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-heading">
              Frequently asked questions
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-[1.7rem] border border-border bg-card-bg p-6 card-shadow-light"
              >
                <h3 className="text-base font-semibold text-text-heading">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-body">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-[2.3rem] border border-border-strong cta-gradient p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-heading">
            Ready to start bidding?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-text-body">
            Join thousands of buyers and sellers already using BidZone to
            discover, compete, and close deals in real time.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auctions"
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:brightness-110"
            >
              Explore live auctions
            </Link>
            <Link
              href="/auctions/create"
              className="rounded-2xl border border-border-strong bg-card-bg px-5 py-3 text-sm font-semibold text-text-label transition hover:border-accent/50 hover:bg-accent-soft"
            >
              Start selling
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
