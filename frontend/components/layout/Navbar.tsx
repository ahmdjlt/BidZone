// Navbar - top navigation bar with logo, nav links, auth buttons, and user menu
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/auctions",        label: "Browse"       },
  { href: "/how-it-works",    label: "How It Works" },
  { href: "/create-listing",  label: "Sell"         },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY <= 0 || currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="navbar-glass border-b border-border bg-card-bg/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-10">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <span className="text-lg font-semibold tracking-tight text-text-heading">
              BidZone
            </span>
          </Link>

          {/* Right side: theme toggle, sign up, hamburger */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link href="/register"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:brightness-110">
              Sign Up
            </Link>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="ml-1 flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg transition hover:bg-accent-soft"
            >
              <span className={`block h-[2px] w-5 rounded-full bg-text-heading transition-transform duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-text-heading transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-text-heading transition-transform duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>

          </div>
        </div>

        {/* Dropdown nav menu */}
        <div
          className={`overflow-hidden border-b border-border bg-card-bg/95 backdrop-blur-xl transition-all duration-300 ${
            menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-5 py-3 sm:px-10">
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
      {/* Spacer to prevent content from hiding behind the fixed header */}
      <div className="h-[60px]" />
    </>
  );
}
