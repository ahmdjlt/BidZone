"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { useTheme } from "@/components/ThemeProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { deleteUserProfile, updateUserProfile } from "@/lib/api/users";
import { uploadAuctionImage } from "@/lib/api/uploads";
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AccountTab({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(user.fullName);
    setUsername(user.username);
    setEmail(user.email);
    setAvatarUrl(user.avatarUrl ?? null);
  }, [user]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setMessage(null);
    setIsUploading(true);
    try {
      const url = await uploadAuctionImage(file);
      const updated = await updateUserProfile(user.id, { ...user, avatarUrl: url });
      setAvatarUrl(updated.avatarUrl ?? null);
      onSaved(updated);
      setMessage("Profile photo updated.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload the photo.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setError(null);
    setMessage(null);
    setIsUploading(true);
    try {
      const updated = await updateUserProfile(user.id, { ...user, avatarUrl: null });
      setAvatarUrl(updated.avatarUrl ?? null);
      onSaved(updated);
      setMessage("Profile photo removed.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove the photo.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteUserProfile(user.id);
      await logout();
      router.replace("/");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete your account.");
      setIsDeleting(false);
    }
  }

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
        avatarUrl,
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

      <div className="mt-6 flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#1a4fa0,#3b7dd8)] text-xl font-black tracking-wide text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Profile photo" className="h-full w-full object-cover" />
          ) : (
            getInitials(fullName || username)
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-xs text-text-muted">JPG, PNG, WEBP or GIF, up to 5MB.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

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

      <div className="mt-10 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <h3 className="text-sm font-semibold text-text-heading">Delete account</h3>
        <p className="mt-1 text-sm text-text-muted">
          Permanently deactivate your account and sign out. This cannot be undone.
        </p>
        {confirmingDelete ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-text-heading">Are you sure?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "Deleting..." : "Yes, delete my account"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={isDeleting}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-heading"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          >
            Delete account
          </button>
        )}
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
