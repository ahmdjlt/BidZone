"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { useTheme } from "@/components/ThemeProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { updateUserProfile } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/user";

type Tab = "account" | "appearance";

const tabs: { id: Tab; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
];

function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold tracking-tight text-text-heading">{children}</h2>;
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-heading">{value}</p>
    </div>
  );
}

function AccountTab({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(user.fullName);
    setUsername(user.username);
    setEmail(user.email);
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const nextFullName = fullName.trim();
    const nextUsername = username.trim();
    const nextEmail = email.trim();

    if (!nextFullName || !nextUsername || !nextEmail) {
      setError("Name, username, and email are required.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateUserProfile(user.id, {
        ...user,
        fullName: nextFullName,
        username: nextUsername,
        email: nextEmail,
      });
      onSaved(updated);
      setMessage("Account settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save account settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle>Account</SectionTitle>
      <p className="mt-2 text-sm text-text-muted">
        These details are loaded from your BidZone account and saved through the API.
      </p>

      <form className="mt-6 max-w-2xl space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-heading">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-heading">Username</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-heading">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-sm text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-8 max-w-2xl">
        <ReadOnlyRow label="Role" value={user.role} />
        <ReadOnlyRow label="Account status" value={user.isActive ? "Active" : "Inactive"} />
        <ReadOnlyRow label="Member since" value={formatJoinDate(user.createdAt)} />
      </div>
    </div>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <p className="mt-2 text-sm text-text-muted">Choose how BidZone looks on this device.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { id: "light", label: "Light" },
          { id: "dark", label: "Dark" },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (theme !== option.id) toggleTheme();
            }}
            className={`rounded-lg border px-5 py-4 text-left transition-colors ${
              theme === option.id
                ? "border-accent bg-accent-soft text-accent"
                : "border-border-strong text-text-muted hover:bg-accent-soft hover:text-text-heading"
            }`}
          >
            <span className="text-sm font-semibold">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const panel = user
    ? {
        account: <AccountTab user={user} onSaved={setUser} />,
        appearance: <AppearanceTab />,
      }[activeTab]
    : null;

  return (
    <RequireAuth>
      <div className="page-gradient min-h-screen">
        <Navbar />

        <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10">
          <div className="flex flex-col gap-10 lg:flex-row">
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
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

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
