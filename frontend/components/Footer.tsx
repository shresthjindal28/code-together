import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-black py-16 text-white border-t border-white/10">

      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#6c47ff30,#000)] opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 relative">

        {/* brand */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-science)" }}>
            CollabAI
          </h3>
          <p className="text-neutral-400 text-sm">
            Collaborate, create, connect — powered by realtime AI.
          </p>
        </div>

        {/* navigation */}
        <div className="grid gap-2 text-sm text-neutral-400">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition">Documentation</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>

        {/* socials */}
        <div className="flex gap-4 items-start">
          <Link href="https://github.com" target="_blank">
            <Github className="opacity-60 hover:opacity-100 transition" />
          </Link>
          <Link href="/">
            <Twitter className="opacity-60 hover:opacity-100 transition" />
          </Link>
          <Link href="/">
            <Mail className="opacity-60 hover:opacity-100 transition" />
          </Link>
        </div>

      </div>

      <div className="mt-12 text-center text-neutral-500 text-xs relative">
        © {new Date().getFullYear()} CollabAI – All rights reserved.
      </div>
    </footer>
  )
}
