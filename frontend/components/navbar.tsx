"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Menu } from "lucide-react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative text-xs sm:text-sm uppercase tracking-[0.18em] px-3 py-2 text-neutral-300 hover:text-white transition group"
      style={{ fontFamily: "var(--font-bitcount)" }}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-x-1 -bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-cyan-400 to-violet-500 shadow-[0_0_25px_rgba(56,189,248,0.6)]">
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-bitcount)" }}
            >
              AI
            </span>
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-sm sm:text-base"
              style={{ fontFamily: "var(--font-science)" }}
            >
              Collab<span className="text-sky-400">.ai</span>
            </span>
            <span
              className="hidden text-[10px] text-neutral-400 sm:block"
              style={{ fontFamily: "var(--font-stack)" }}
            >
              Realtime editor • Calls • AI
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>

          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button
                  className="relative overflow-hidden group rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs sm:text-sm text-neutral-100 transition hover:border-sky-400/60 hover:bg-white/5"
                  style={{ fontFamily: "var(--font-stack)" }}
                >
                  <span className="relative z-10">Sign in</span>
                  <span className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent)] opacity-0 transition group-hover:opacity-100" />
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  className="rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-4 py-2 text-xs sm:text-sm font-medium shadow-[0_0_25px_rgba(56,189,248,0.6)] transition hover:scale-[1.02]"
                  style={{ fontFamily: "var(--font-stack)" }}
                >
                  Get started
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-3 md:hidden">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4 text-neutral-200" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-black/90 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>

            <SignedOut>
              <div className="flex flex-col gap-2 pt-2">
                <SignInButton mode="modal">
                  <button
                    className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-neutral-100"
                    style={{ fontFamily: "var(--font-stack)" }}
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className="rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-4 py-2 text-xs font-medium"
                    style={{ fontFamily: "var(--font-stack)" }}
                  >
                    Get started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
