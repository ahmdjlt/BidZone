// Navbar - top navigation bar with logo, nav links, auth buttons, and user menu
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/store/authStore";

const navLinks = [
  { href: "/auctions",       label: "Browse"       },
  { href: "/how-it-works",   label: "How It Works" },
];

interface MenuLinkProps {
  href: string;
  label: string;
  badge?: number | null;
  icon: React.ReactNode;
  onClick: () => void;
}

function MenuLink({ href, label, badge, icon, onClick }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-body transition-colors hover:bg-accent-soft hover:text-text-heading"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft/60 text-text-muted transition-colors group-hover:bg-accent/10 group-hover:text-accent">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          {icon}
        </svg>
      </span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [visible, setVisible]       = useState(true);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [authModal, setAuthModal]   = useState<"login" | "register" | null>(null);
  const lastScrollY                 = useRef(0);
  const personDropdownRef           = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, hasBootstrapped, isLoading, logout } = useAuthStore();

  const displayName = user?.fullName || user?.username || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  const email = user?.email || "user@bidzone.com";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y <= 0 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (personDropdownRef.current && !personDropdownRef.current.contains(e.target as Node)) {
        setPersonOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const closeAll = () => { setMenuOpen(false); setPersonOpen(false); };
  const authReady = hasBootstrapped && !isLoading;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="navbar-glass border-b border-border bg-card-bg/95 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-6 py-2.5 sm:px-10">

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center">
              <span className="text-base font-semibold tracking-tight text-text-heading">
                BidZone
              </span>
            </Link>

            {/* Search bar */}
            <form action="/auctions" method="get" className="hidden sm:flex flex-1 max-w-md items-center rounded-xl border border-border-strong bg-surface-alt transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
              <svg className="ml-3 shrink-0 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search auctions..."
                className="flex-1 bg-transparent px-3 py-2 text-sm text-text-heading placeholder:text-text-muted focus:outline-none"
              />
            </form>

            {/* Right side */}
            <div className="flex shrink-0 items-center gap-1.5 ml-auto">

              {!authReady ? (
                <div className="h-9 w-24 rounded-xl bg-accent-soft/60" />
              ) : isAuthenticated ? (
                <>
                  {/* Language */}
                  <button
                    aria-label="Language"
                    className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-text-muted transition-colors hover:bg-accent-soft hover:text-text-heading"
                  >
                    <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold">EN</span>
                  </button>

                  {/* Person menu */}
                  <div ref={personDropdownRef} className="relative">
                    <button
                      onClick={() => setPersonOpen((v) => !v)}
                      aria-label="Account menu"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-text-heading transition hover:bg-accent-soft"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="8" r="4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" />
                      </svg>
                    </button>

                    {personOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border-strong bg-card-bg shadow-[0_20px_60px_-20px_var(--card-shadow)]">
                        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#1a4fa0,#3b7dd8)] text-xs font-black tracking-wide text-white">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-heading">{displayName}</p>
                            <p className="truncate text-xs text-text-muted">{email}</p>
                          </div>
                        </div>
                        <div className="px-2 py-2">
                          <MenuLink
                            href="/profile"
                            label="My account"
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                            onClick={closeAll}
                          />
                          <MenuLink
                            href="/dashboard/settings"
                            label="Settings"
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                            onClick={closeAll}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              closeAll();
                              await logout();
                            }}
                            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                              </svg>
                            </span>
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal("login")}
                    className="rounded-xl border border-border-strong bg-card-bg px-4 py-2 text-sm font-semibold text-text-heading transition hover:bg-accent-soft"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal("register")}
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:brightness-110"
                  >
                    Sign Up
                  </button>
                  {/* Person icon → settings */}
                  <Link
                    href="/dashboard/settings"
                    aria-label="Settings"
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-text-heading transition hover:bg-accent-soft"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="8" r="4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav menu */}
        <div
          className={`overflow-hidden border-b border-border bg-card-bg/95 backdrop-blur-xl transition-all duration-300 sm:hidden ${
            menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-6 py-3 sm:px-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-accent-soft hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[64px]" />

      {/* Auth modal */}
      {authModal && (
        <AuthModal
          initialView={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
