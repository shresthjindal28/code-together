"use client";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "CollabAI replaced Google Docs + Meet + Chat for our entire remote team. Insane.",
      user: "Rohan Sharma",
      role: "Startup Founder",
    },
    {
      quote:
        "Finally a realtime tool where code, text editor and voice work in one space.",
      user: "Alisha Singh",
      role: "Full Stack Developer",
    },
    {
      quote:
        "Our tutoring sessions are smoother than Zoom or Meet. Love the AI rewrite feature.",
      user: "Karan Patel",
      role: "English Tutor",
    },
  ];

  return (
    <section className="py-24 px-6 bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-16">
        <h2
          className="text-center text-4xl md:text-5xl font-bold"
          style={{ fontFamily: "var(--font-science)" }}
        >
          Trusted by early adopters
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md hover:scale-[1.02] transition"
            >
              <p className="text-neutral-300 leading-relaxed mb-6">
                “{t.quote}”
              </p>

              <div className="text-sm">
                <div className="font-semibold">{t.user}</div>
                <div className="text-neutral-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
