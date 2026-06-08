import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide when registering, such as your name, email address, and payment details. We also automatically collect data about your activity on the platform, including bids placed, listings viewed, category views, searches, device information, IP address, and browser type.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to operate and improve the BidZone platform, process transactions, send important account notifications, personalise your experience, detect and prevent fraud, and comply with legal obligations. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Sharing of Information",
    content:
      "We share your information only with trusted partners necessary to operate our services, including payment processors, shipping providers, and fraud prevention services. All partners are contractually required to protect your data in accordance with applicable privacy laws. We may also disclose data when required by law or to protect the rights and safety of our users.",
  },
  {
    title: "4. Cookies & Tracking",
    content:
      "BidZone uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyse platform usage. You can control cookie settings through your browser. Disabling cookies may limit some functionality of the platform.",
  },
  {
    title: "5. Data Retention",
    content:
      "We retain your personal data for as long as your account is active or as needed to provide our services. Browsing events used for recommendations are kept in a limited rolling window. After account closure, we may retain certain data for up to 7 years to comply with legal, tax, and regulatory requirements. You may request deletion of your data subject to these obligations.",
  },
  {
    title: "6. Your Rights",
    content:
      "Depending on your location, you may have the right to access, correct, or delete your personal data, restrict or object to its processing, and request data portability. To exercise these rights, contact our support team. We will respond to all verified requests within 30 days.",
  },
  {
    title: "7. Data Security",
    content:
      "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "8. Third-Party Links",
    content:
      "Our platform may contain links to third-party websites. BidZone is not responsible for the privacy practices of those sites. We encourage you to review the privacy policies of any third-party sites you visit.",
  },
  {
    title: "9. Children's Privacy",
    content:
      "BidZone is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will delete it promptly.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the platform. Your continued use of BidZone after changes take effect constitutes acceptance of the updated policy.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-body">
            Last updated: June 2026. Your privacy matters to us - here is how we handle your data.
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
