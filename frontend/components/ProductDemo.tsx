"use client";

import Image from "next/image";

export default function ProductDemo() {
  return (
    <section className="py-24 px-6 bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "var(--font-science)" }}
          >
            Collaborate visually, not through chaos.
          </h2>

          <p className="text-neutral-300 max-w-2xl mx-auto text-lg">
            Realtime editor, AI-powered rewrites, voice calls and live cursors— 
            all in one place. No more tool switching.
          </p>
        </div>

        <div className="relative w-full h-[550px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_#7e5eff30] bg-gradient-to-br from-[#111] via-[#151115] to-[#000]">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#7e5eff33] via-transparent to-[#ff5bff33] blur-2xl"></div>

          <Image
            src="/demo.png"
            alt="collaboration demo"
            fill
            className="object-cover opacity-95"
          />
        </div>
      </div>
    </section>
  );
}
