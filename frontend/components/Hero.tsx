// components/landing/Hero.tsx
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-20 pt-24 md:flex-row md:items-center md:pt-28">
        {/* LEFT: copy */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200/80 backdrop-blur">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span style={{ fontFamily: "var(--font-bitcount)" }}>
              realtime • ai powered • multi-cursor
            </span>
          </div>

          <h1
            className="text-4xl leading-tight sm:text-5xl md:text-6xl md:leading-[1.05]"
            style={{ fontFamily: "var(--font-science)" }}
          >
            Collaborate with{" "}
            <span className="bg-linear-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              AI in real&nbsp;time.
            </span>
          </h1>

          <p
            className="max-w-xl text-sm sm:text-base text-neutral-300/80"
            style={{ fontFamily: "var(--font-stack)" }}
          >
            Collab AI is your multiplayer editor with built-in video calls,
            live cursors, and an AI assistant that writes, refactors and
            explains alongside your team.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-indigo-500 to-violet-500 px-6 py-3 text-sm font-medium shadow-[0_0_25px_rgba(37,99,235,0.5)] transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(129,140,248,0.7)]"
              style={{ fontFamily: "var(--font-stack)" }}
            >
              Start collaborating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="#live-demo"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-black/40 px-6 py-3 text-sm text-neutral-200 backdrop-blur transition hover:border-white/40 hover:bg-white/5"
              style={{ fontFamily: "var(--font-stack)" }}
            >
              Watch live demo
            </Link>
          </div>

          {/* Trust / mini stats */}
          <div className="flex flex-wrap gap-6 pt-4 text-xs text-neutral-400">
            <div>
              <div className="font-semibold text-neutral-100">
                <span style={{ fontFamily: "var(--font-bitcount)" }}>
                  &gt;50ms
                </span>{" "}
                latency
              </div>
              <div>Optimised Socket.IO presence</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-100">
                AI by{" "}
                <span className="text-sky-300" style={{ fontFamily: "var(--font-bitcount)" }}>
                  OpenAI
                </span>
              </div>
              <div>Context-aware drafting & editing</div>
            </div>
          </div>
        </div>

        {/* RIGHT: mock preview card */}
        <div className="flex-1">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-black/60 p-4 shadow-[0_0_50px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span
                  className="text-[11px] uppercase tracking-[0.2em] text-neutral-400"
                  style={{ fontFamily: "var(--font-bitcount)" }}
                >
                  live session
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">3 people in room</span>
            </div>

            <div className="grid gap-3 rounded-2xl bg-[#050816] p-4">
              {/* fake editor */}
              <div className="rounded-xl border border-white/5 bg-black/60 p-3">
                <div className="mb-2 flex gap-1.5">
                  <span className="h-2 w-8 rounded-full bg-sky-500/60" />
                  <span className="h-2 w-6 rounded-full bg-purple-500/50" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 rounded bg-white/10" />
                  <div className="h-2 w-4/5 rounded bg-white/8" />
                  <div className="h-2 w-2/3 rounded bg-white/5" />
                </div>
              </div>

              {/* bottom row: mini video + AI bubble */}
              <div className="flex gap-3">
                <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-white/10 bg-black/70">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.5),transparent)]" />
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/70 px-2 py-[2px] text-[10px] text-neutral-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    You
                  </div>
                </div>

                <div className="flex-1 rounded-xl border border-sky-500/40 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100">
                  <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-sky-300/80">
                    AI suggestion
                  </div>
                  “Want me to turn this into a summary and share with the team?”
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
