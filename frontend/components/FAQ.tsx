"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is CollabAI?",
    a: "A realtime collaboration platform with AI assistance, shared editing, chat, video calling and more—built for teams."
  },
  {
    q: "Is it free to use?",
    a: "Yes. You can use the basic plan for free with unlimited documents and realtime editing."
  },
  {
    q: "Can I invite teammates?",
    a: "Absolutely. You can generate a link and invite anyone to edit with you."
  },
  {
    q: "Do I need to install anything?",
    a: "No installation required. Everything works in the browser."
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-28 bg-black text-white relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,#6c47ff20,#000)]" />

      <div className="max-w-4xl mx-auto px-6 relative">

        <h2
          className="text-4xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-science)" }}
        >
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((item, i) => {
            const active = open === i;

            return (
              <div
                key={i}
                className="bg-neutral-950 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(active ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-lg">{item.q}</span>
                  <ChevronDown
                    className={`transition-transform ${active ? "rotate-180" : ""}`}
                  />
                </button>

                {active && (
                  <div className="px-5 pb-4 text-neutral-400 animate-fadeIn">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
