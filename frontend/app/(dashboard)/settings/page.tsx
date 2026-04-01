// Account settings page — profile, notifications, privacy, security tabs
"use client";

import { useState } from "react";

type Tab = "profile" | "notifications" | "privacy" | "security";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

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

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-heading">{label}</p>
        {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-[0_4px_20px_-10px_var(--card-shadow-light)]">
      <h3 className="mb-1 text-sm font-semibold text-text-heading">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

// ─── Tab panels ──────────────────────────────────────────────────────────────

function ProfileTab() {
  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-[0_4px_20px_-10px_var(--card-shadow-light)]">
        <h3 className="mb-4 text-sm font-semibold text-text-heading">Profile photo</h3>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f5ddd,#4ea2ff)] text-xl font-black tracking-wide text-white shadow-[0_8px_20px_-8px_rgba(15,93,221,0.5)]">
            AH
          </span>
          <div className="space-y-2">
            <button className="rounded-xl border border-border-strong bg-card-bg px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft">
              Upload photo
            </button>
            <p className="text-xs text-text-muted">JPG, PNG or GIF · max 5 MB</p>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-[0_4px_20px_-10px_var(--card-shadow-light)]">
        <h3 className="mb-4 text-sm font-semibold text-text-heading">Personal information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "First name",    placeholder: "Ahmed",           half: true  },
            { label: "Last name",     placeholder: "Jalilati",         half: true  },
            { label: "Email address", placeholder: "ahmed@bidzone.com", half: false, type: "email" },
            { label: "Phone number",  placeholder: "+1 (555) 000-0000", half: true, type: "tel" },
            { label: "Location",      placeholder: "City, Country",    half: true  },
          ].map((field) => (
            <div key={field.label} className={field.half ? "" : "sm:col-span-2"}>
              <label className="mb-1.5 block text-xs font-medium text-text-label">{field.label}</label>
              <input
                type={field.type ?? "text"}
                defaultValue={field.placeholder}
                className="w-full rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-label">Bio</label>
            <textarea
              rows={3}
              defaultValue="Collector of rare watches, vintage cameras, and sports memorabilia."
              className="w-full resize-none rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(8,72,184,0.8)] transition hover:brightness-110">
            Save changes
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-200 bg-card-bg p-5 dark:border-red-900/40">
        <h3 className="mb-1 text-sm font-semibold text-red-600">Danger zone</h3>
        <p className="mb-4 text-xs text-text-muted">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
          Delete account
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Bidding activity">
        <SettingRow label="Outbid alerts" description="Get notified when someone outbids you">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Auction ending soon" description="Reminder 1 hour before auctions you follow end">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Auction won" description="Confirmation when you win an auction">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Auction lost" description="Notification when an auction closes without your win">
          <Toggle />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Selling activity">
        <SettingRow label="New bids on your listings" description="When someone places a bid on your item">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Item sold" description="When your auction ends with a winning bid">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Item not sold" description="When your auction closes with no bids">
          <Toggle />
        </SettingRow>
        <SettingRow label="Payment received" description="When a buyer completes payment">
          <Toggle defaultChecked />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Messages & updates">
        <SettingRow label="New messages" description="Direct messages from buyers or sellers">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Offers" description="When someone makes an offer on your item">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Product updates" description="New features and improvements to BidZone">
          <Toggle />
        </SettingRow>
        <SettingRow label="Marketing emails" description="Tips, deals and promotional content">
          <Toggle />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Delivery method">
        <SettingRow label="Email notifications">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Push notifications">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="SMS notifications">
          <Toggle />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Profile visibility">
        <SettingRow label="Public profile" description="Anyone can view your profile and auction history">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Show location" description="Display your city/region on your public profile">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Show bid history" description="Let others see items you have bid on">
          <Toggle />
        </SettingRow>
        <SettingRow label="Show ratings" description="Display your seller/buyer ratings publicly">
          <Toggle defaultChecked />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Data & analytics">
        <SettingRow label="Activity tracking" description="Allow BidZone to use your activity to improve recommendations">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Personalised ads" description="See ads based on your browsing and bidding history">
          <Toggle />
        </SettingRow>
        <SettingRow label="Share data with partners" description="Allow selected partners to use anonymised data">
          <Toggle />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Blocked users">
        <div className="py-4">
          <p className="text-sm text-text-muted">You have not blocked any users.</p>
          <button className="mt-3 rounded-xl border border-border-strong px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft">
            Manage blocked users
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      {/* Password */}
      <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-[0_4px_20px_-10px_var(--card-shadow-light)]">
        <h3 className="mb-4 text-sm font-semibold text-text-heading">Change password</h3>
        <div className="space-y-4">
          {["Current password", "New password", "Confirm new password"].map((label) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-medium text-text-label">{label}</label>
              <input
                type="password"
                placeholder="••••••••••"
                className="w-full rounded-xl border border-border-strong bg-input-bg px-3.5 py-2.5 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(8,72,184,0.8)] transition hover:brightness-110">
            Update password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <SectionCard title="Two-factor authentication">
        <SettingRow
          label="Authenticator app"
          description="Use an app like Google Authenticator or Authy"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="SMS verification"
          description="Receive a code via SMS when signing in"
        >
          <Toggle defaultChecked />
        </SettingRow>
      </SectionCard>

      {/* Sessions */}
      <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-[0_4px_20px_-10px_var(--card-shadow-light)]">
        <h3 className="mb-4 text-sm font-semibold text-text-heading">Active sessions</h3>
        <div className="space-y-3">
          {[
            { device: "MacBook Pro · Chrome", location: "Algiers, Algeria", time: "Now", current: true },
            { device: "iPhone 15 · Safari",   location: "Algiers, Algeria", time: "2 hours ago", current: false },
          ].map((session) => (
            <div key={session.device} className="flex items-center justify-between gap-3 rounded-xl bg-accent-soft/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-heading">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                      Current
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{session.location} · {session.time}</p>
              </div>
              {!session.current && (
                <button className="text-xs font-medium text-red-500 transition-colors hover:text-red-600">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 text-xs font-medium text-red-500 transition-colors hover:text-red-600">
          Sign out all other sessions
        </button>
      </div>

      {/* Login history */}
      <SectionCard title="Login alerts">
        <SettingRow
          label="Email me on new sign-in"
          description="Get an email whenever a new device signs in to your account"
        >
          <Toggle defaultChecked />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const panel = {
    profile:       <ProfileTab />,
    notifications: <NotificationsTab />,
    privacy:       <PrivacyTab />,
    security:      <SecurityTab />,
  }[activeTab];

  return (
    <>
      {/* Page header */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-heading sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-text-body">
          Manage your profile, notifications, privacy and security preferences.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-border bg-card-bg p-1.5 sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-accent text-white shadow-[0_4px_14px_-6px_rgba(8,72,184,0.7)]"
                : "text-text-muted hover:bg-accent-soft hover:text-text-heading"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active panel */}
      {panel}
    </>
  );
}
