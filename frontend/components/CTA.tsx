"use client";

export default function CTA() {
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* gradient */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,#6c47ff40,transparent_60%)]" />

      <div className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-8">
        <h2
          className="text-4xl md:text-5xl font-bold"
          style={{ fontFamily: "var(--font-science)" }}
        >
          Ready to Join the Future of Collaboration?
        </h2>

        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto">
          Write, code and brainstorm together. AI assistant, live editing,
          realtime video — everything in one place.
        </p>

        <button
          className="mt-6 px-8 py-4 rounded-xl bg-[#6c47ff] hover:bg-[#5636d4]
          text-white font-medium text-lg transition shadow-xl shadow-[#6c47ff30]"
        >
          Start for Free
        </button>

        <p className="text-sm text-neutral-500">
          No credit card required
        </p>
      </div>
    </section>
  );
}
