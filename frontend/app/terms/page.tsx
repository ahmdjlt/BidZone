import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using BidZone, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you may not use our platform. BidZone reserves the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.",
  },
  {
    title: "2. Eligibility",
    content:
      "You must be at least 18 years of age to use BidZone. By registering, you confirm that all information you provide is accurate, current, and complete. BidZone reserves the right to suspend or terminate accounts that provide false information.",
  },
  {
    title: "3. Bidding & Purchases",
    content:
      "All bids placed on BidZone are legally binding offers to purchase. Once you place a bid and win an auction, you are obligated to complete the transaction at the winning bid amount. Failure to pay may result in account suspension and reporting to relevant authorities.",
  },
  {
    title: "4. Seller Responsibilities",
    content:
      "Sellers are responsible for accurately describing their items, including condition, provenance, and any defects. Misrepresentation of goods is strictly prohibited and may result in permanent account termination and legal action. Sellers must fulfill orders within the agreed timeframe.",
  },
  {
    title: "5. Fees & Payments",
    content:
      "BidZone charges a platform fee on completed transactions. Fees are displayed before listing and are subject to change with prior notice. All payments are processed securely through our payment partners. BidZone is not responsible for disputes arising from payment processor errors.",
  },
  {
    title: "6. Prohibited Items",
    content:
      "The following items may not be listed on BidZone: stolen goods, counterfeit items, regulated firearms or explosives, illegal substances, or any items prohibited by applicable law. Violation of this policy will result in immediate account termination and may be reported to law enforcement.",
  },
  {
    title: "7. Dispute Resolution",
    content:
      "In the event of a dispute between buyers and sellers, BidZone offers a mediation service. Both parties agree to cooperate in good faith during the mediation process. BidZone's decision in mediated disputes is final and binding. Legal action should be pursued only after exhausting BidZone's dispute resolution process.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "BidZone is a marketplace platform and is not a party to transactions between buyers and sellers. We are not liable for the quality, safety, or legality of items listed. To the maximum extent permitted by law, BidZone's total liability for any claim arising from use of the platform shall not exceed the fees paid by you in the three months prior to the claim.",
  },
  {
    title: "9. Termination",
    content:
      "BidZone reserves the right to suspend or terminate your account at any time for violations of these terms, fraudulent activity, or behaviour that harms the community. You may close your account at any time by contacting support, subject to any outstanding obligations.",
  },
  {
    title: "10. Governing Law",
    content:
      "These Terms and Conditions are governed by and construed in accordance with applicable law. Any disputes that cannot be resolved through our internal process shall be submitted to the jurisdiction of the competent courts.",
  },
];

export default function TermsPage() {
  return (
    <div className="page-gradient relative min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-10 sm:px-8">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-heading sm:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-body">
            Last updated: March 2026. Please read these terms carefully before using BidZone.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-border bg-card-bg p-6"
            >
              <h2 className="mb-2 text-base font-semibold tracking-tight text-text-heading">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-text-body">{section.content}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
