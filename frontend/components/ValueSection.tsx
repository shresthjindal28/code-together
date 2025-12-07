"use client";

import { Sparkles, Zap, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ValueSection() {
  return (
    <section className="py-28 px-6 bg-linear-to-b from-[#05040e] to-black text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT TEXT */}
        <div>
          <h2
            className="text-4xl font-semibold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-science)" }}
          >
            Work together{" "}
            <span className="bg-linear-to-r from-[#8f68ff] to-[#ff5bff] text-transparent bg-clip-text">
              without switching tools
            </span>
          </h2>

          <p className="text-neutral-400 text-lg leading-relaxed mb-8">
            Real-time editor, voice & video, screenshare, and AI — all in one
            workspace. No Chrome tabs, no context switching.
          </p>

          <div className="space-y-4 mb-10">
            <Feature icon={<Zap />} text="Live editors with instant sync" />
            <Feature icon={<MessageCircle />} text="Built-in video & chat" />
            <Feature icon={<Sparkles />} text="AI everywhere you write" />
          </div>

          <Link href="/dashboard">
            <button className="mt-6 px-8 py-4 rounded-xl bg-[#6c47ff] hover:bg-[#5734d4] transition-all text-white font-semibold shadow-xl shadow-[#6c47ff]/20">
              Start collaborating →
            </button>
          </Link>
        </div>

        {/* RIGHT MOCKUP */}
        <div className="bg-neutral-900/40 rounded-3xl border border-white/10 backdrop-blur-lg p-2 shadow-2xl shadow-lime-400/10">
          <div className="aspect-video rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center">
            <span className="opacity-40 text-sm overflow-hidden ">
              <Image
                src="/demo.png"
                alt="collaboration demo"
                fill
                className="object-contain opacity-95"
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex gap-3 items-center text-base">
      <span className="p-2 rounded-lg bg-white/5 border border-white/10">
        {icon}
      </span>
      <span className="opacity-90">{text}</span>
    </p>
  );
}
