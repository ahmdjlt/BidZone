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
        <div className="navbar-glass flex w-full items-center justify-between border-b border-border bg-card-bg/85 px-5 py-3 backdrop-blur-xl sm:px-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f5ddd,#4ea2ff)] text-sm font-black tracking-[0.12em] text-white">
              BZ
            </span>
            <span className="text-lg font-semibold tracking-tight text-text-heading">
              BidZone
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-text-heading md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons + theme toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-text-label transition-colors hover:bg-accent-soft">
              Sign in
            </Link>
            <Link href="/register"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:brightness-110">
              Join now
            </Link>
          </div>

        </div>
      </header>
      {/* Spacer to prevent content from hiding behind the fixed header */}
      <div className="h-[60px]" />
    </>
  );
}
