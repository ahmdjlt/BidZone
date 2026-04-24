// Settings page — standalone with Navbar/Footer, Catawiki-style row layout
"use client";

import { useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { useTheme } from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Tab = "account" | "addresses" | "payment" | "seller-profile" | "emails" | "verification" | "appearance";

const tabs: { id: Tab; label: string; badge?: boolean }[] = [
  { id: "account",        label: "Account" },
  { id: "addresses",      label: "Addresses" },
  { id: "payment",        label: "Payment" },
  { id: "seller-profile", label: "Seller Profile" },
  { id: "emails",         label: "Emails & Notifications" },
  { id: "verification",   label: "Verification" },
  { id: "appearance",     label: "Appearance" },
];

// ─── Shared components ───────────────────────────────────────────────────────

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        on ? "bg-accent" : "bg-border-strong"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function InfoRow({ label, value, action }: { label: string; value: string; action?: string }) {
  return (
    <div className="border-b border-border py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-heading">{value}</p>
      {action && (
        <button className="mt-1.5 text-sm font-medium text-accent hover:underline">{action}</button>
      )}
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-heading">{label}</p>
        {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
      </div>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold tracking-tight text-text-heading">{children}</h2>;
}

// ─── Tab panels ──────────────────────────────────────────────────────────────

function AccountTab() {
  return (
    <div>
      <SectionTitle>Account</SectionTitle>
      <div className="mt-2">
        <InfoRow label="Name" value="User" action="Change" />
        <InfoRow label="Username" value="ahmedjlt" />
        <InfoRow label="Email" value="user@bidzone.com" action="Change" />
        <InfoRow label="Phone" value="+213 555 000 000" action="Change" />
        <InfoRow label="Password" value="••••••••••" action="Change" />
        <InfoRow label="Location" value="Algiers, Algeria" action="Change" />
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold text-red-500">Delete account</p>
        <p className="mt-1 text-xs text-text-muted">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
          Delete account
        </button>
      </div>
    </div>
  );
}

function AddressesTab() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionTitle>Addresses</SectionTitle>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
          Add address
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {[
          { name: "User", line: "123 Main Street, Apt 4B", city: "Algiers, Algeria 16000", isDefault: true },
          { name: "User", line: "456 Business Ave, Suite 200", city: "Oran, Algeria 31000", isDefault: false },
        ].map((addr, i) => (
          <div key={i} className="border-b border-border py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-text-heading">{addr.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">{addr.line}</p>
                <p className="text-xs text-text-muted">{addr.city}</p>
                {addr.isDefault && (
                  <span className="mt-1.5 inline-block rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Default</span>
                )}
              </div>
              <div className="flex gap-3">
                <button className="text-sm font-medium text-accent hover:underline">Edit</button>
                <button className="text-sm font-medium text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentTab() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionTitle>Payment</SectionTitle>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
          Add card
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          { brand: "Visa", last4: "4242", exp: "12/27", isDefault: true, gradient: "from-[#1a1f71] to-[#2e5fd3]" },
          { brand: "Mastercard", last4: "8888", exp: "03/26", isDefault: false, gradient: "from-[#eb001b] to-[#f79e1b]" },
        ].map((card, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl border border-border-strong bg-card-bg p-4 transition-all hover:border-accent/30 hover:shadow-md">
            {card.isDefault && (
              <span className="absolute right-3 top-3 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                Default
              </span>
            )}
            <div className={`mb-4 flex h-8 w-12 items-center justify-center rounded-md bg-gradient-to-r ${card.gradient} text-[10px] font-bold tracking-wide text-white shadow-sm`}>
              {card.brand}
            </div>
            <p className="font-mono text-sm tracking-widest text-text-heading">
              •••• {card.last4}
            </p>
            <p className="mt-1 text-xs text-text-muted">Expires {card.exp}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              {!card.isDefault && (
                <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-accent-soft hover:text-accent">
                  Set as default
                </button>
              )}
              <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-text-heading">Payout preferences</h3>
        <div className="mt-2">
          <div className="flex items-center justify-between border-b border-border py-5">
            <div>
              <p className="text-sm font-medium text-text-heading">Bank transfer</p>
              <p className="mt-0.5 text-xs text-text-muted">Receive payouts directly to your bank account</p>
            </div>
            <button className="text-sm font-medium text-accent hover:underline">Configure</button>
          </div>
          <div className="flex items-center justify-between border-b border-border py-5">
            <div>
              <p className="text-sm font-medium text-text-heading">PayPal</p>
              <p className="mt-0.5 text-xs text-text-muted">Link your PayPal account for faster payouts</p>
            </div>
            <button className="text-sm font-medium text-accent hover:underline">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SellerProfileTab() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <SectionTitle>Seller Profile</SectionTitle>
        <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Incomplete
        </span>
      </div>
      <div className="mt-2">
        <InfoRow label="Store name" value="User's Collectibles" action="Change" />
        <InfoRow label="Display name" value="UserCollects" action="Change" />
        <InfoRow label="Store description" value="Rare watches, cameras, and memorabilia" action="Change" />
        <InfoRow label="Return policy" value="30-day returns accepted" action="Change" />
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-text-heading">Shipping settings</h3>
        <div className="mt-2">
          <ToggleRow label="Free shipping" description="Offer free shipping on all listings" />
          <ToggleRow label="International shipping" description="Ship to buyers outside your country" defaultChecked />
          <div className="flex items-center justify-between border-b border-border py-5">
            <div>
              <p className="text-sm font-medium text-text-heading">Handling time</p>
              <p className="mt-0.5 text-xs text-text-muted">Days to prepare and ship after sale</p>
            </div>
            <select defaultValue="3" className="rounded-lg border border-border-strong bg-input-bg px-3 py-1.5 text-sm text-text-heading focus:border-accent focus:outline-none">
              <option value="1">1 day</option>
              <option value="2">2 days</option>
              <option value="3">3 days</option>
              <option value="5">5 days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailsTab() {
  return (
    <div>
      <SectionTitle>Emails & Notifications</SectionTitle>

      <h3 className="mt-6 text-base font-semibold text-text-heading">Bidding activity</h3>
      <ToggleRow label="Outbid alerts" description="Get notified when someone outbids you" defaultChecked />
      <ToggleRow label="Auction ending soon" description="Reminder 1 hour before auctions you follow end" defaultChecked />
      <ToggleRow label="Auction won" description="Confirmation when you win an auction" defaultChecked />
      <ToggleRow label="Auction lost" description="Notification when an auction closes without your win" />

      <h3 className="mt-6 text-base font-semibold text-text-heading">Selling activity</h3>
      <ToggleRow label="New bids on your listings" description="When someone places a bid on your item" defaultChecked />
      <ToggleRow label="Item sold" description="When your auction ends with a winning bid" defaultChecked />
      <ToggleRow label="Payment received" description="When a buyer completes payment" defaultChecked />

      <h3 className="mt-6 text-base font-semibold text-text-heading">Messages & updates</h3>
      <ToggleRow label="New messages" description="Direct messages from buyers or sellers" defaultChecked />
      <ToggleRow label="Product updates" description="New features and improvements to BidZone" />
      <ToggleRow label="Marketing emails" description="Tips, deals and promotional content" />

      <h3 className="mt-6 text-base font-semibold text-text-heading">Delivery method</h3>
      <ToggleRow label="Email notifications" defaultChecked />
      <ToggleRow label="Push notifications" defaultChecked />
      <ToggleRow label="SMS notifications" />
    </div>
  );
}

function VerificationTab() {
  return (
    <div>
      <SectionTitle>Verification</SectionTitle>

      <div className="mt-4 space-y-0">
        {/* Email */}
        <div className="flex items-center gap-3 border-b border-border py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-text-heading">Email verified</p>
            <p className="text-xs text-text-muted">ahmed@bidzone.com</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 border-b border-border py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-text-heading">Phone verified</p>
            <p className="text-xs text-text-muted">+213 555 000 000</p>
          </div>
        </div>

        {/* Gov ID */}
        <div className="flex items-center gap-3 border-b border-border py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-heading">Government ID</p>
            <p className="text-xs text-text-muted">Not yet uploaded</p>
          </div>
          <button className="text-sm font-medium text-accent hover:underline">Upload</button>
        </div>
      </div>

      <h3 className="mt-8 text-base font-semibold text-text-heading">Two-factor authentication</h3>
      <ToggleRow label="Authenticator app" description="Use an app like Google Authenticator or Authy" />
      <ToggleRow label="SMS verification" description="Receive a code via SMS when signing in" defaultChecked />

      <h3 className="mt-8 text-base font-semibold text-text-heading">Active sessions</h3>
      <div className="mt-2 space-y-3">
        {[
          { device: "MacBook Pro · Chrome", location: "Algiers, Algeria", time: "Now", current: true },
          { device: "iPhone 15 · Safari",   location: "Algiers, Algeria", time: "2 hours ago", current: false },
        ].map((session) => (
          <div key={session.device} className="flex items-center justify-between border-b border-border py-4">
            <div>
              <p className="text-sm font-medium text-text-heading">
                {session.device}
                {session.current && (
                  <span className="ml-2 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">Current</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">{session.location} · {session.time}</p>
            </div>
            {!session.current && (
              <button className="text-sm font-medium text-red-500 hover:underline">Revoke</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <p className="mt-2 text-sm text-text-muted">Choose how BidZone looks for you.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { id: "light", label: "Light", icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          )},
          { id: "dark", label: "Dark", icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )},
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => { if (theme !== option.id) toggleTheme(); }}
            className={`flex flex-col items-center gap-3 rounded-lg border p-6 transition-all ${
              theme === option.id
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-text-muted hover:border-border-strong hover:text-text-heading"
            }`}
          >
            {option.icon}
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const panel = {
    "account":        <AccountTab />,
    "addresses":      <AddressesTab />,
    "payment":        <PaymentTab />,
    "seller-profile": <SellerProfileTab />,
    "emails":         <EmailsTab />,
    "verification":   <VerificationTab />,
    "appearance":     <AppearanceTab />,
  }[activeTab];

  return (
    <RequireAuth>
      <div className="page-gradient min-h-screen">
        <Navbar />

        <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar nav */}
          <nav className="shrink-0 lg:w-52">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-2 whitespace-nowrap py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-l-2 border-accent pl-4 text-text-heading"
                        : "pl-[18px] text-text-muted hover:text-text-heading"
                    }`}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content panel */}
          <div className="min-w-0 flex-1 border-l border-border pl-10">
            {panel}
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
}
