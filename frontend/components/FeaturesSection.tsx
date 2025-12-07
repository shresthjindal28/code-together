"use client";

import {
  Bot,
  Users,
  Video,
  Edit3,
  MonitorUp,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <Edit3 size={28} />,
    title: "Realtime Editor",
    text: "Instant collaboration powered by CRDT syncing. No merge conflicts.",
  },
  {
    icon: <Video size={28} />,
    title: "Built-in Calls",
    text: "Video + audio + screenshare. No extra meeting links required.",
  },
  {
    icon: <Users size={28} />,
    title: "Live cursors",
    text: "See what every teammate is typing — immediately.",
  },
  {
    icon: <MonitorUp size={28} />,
    title: "Screenshare",
    text: "Share your screen during writing or brainstorming sessions.",
  },
  {
    icon: <Sparkles size={28} />,
    title: "AI everywhere",
    text: "Generate, rewrite, summarize — without opening ChatGPT.",
  },
  {
    icon: <Bot size={28} />,
    title: "AI Suggestions",
    text: "Inline AI suggestions that don’t interrupt your typing flow.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto space-y-14">
        <h2
          className="text-4xl font-semibold text-center"
          style={{ fontFamily: "var(--font-science)" }}
        >
          Powerful <span className="bg-gradient-to-r from-[#8f68ff] via-[#ff5bff] to-[#ffc76f] bg-clip-text text-transparent">features</span>
          built for teams
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-8 bg-neutral-900/40 rounded-2xl border border-white/10 backdrop-blur-md hover:border-[#7e5eff] hover:shadow-[0_0_30px_#7e5eff44] transition-all"
            >
              <div className="p-3 rounded-xl bg-neutral-800 border border-white/10 inline-block mb-6 text-[#a37aff]">
                {f.icon}
              </div>

              <h3
                className="text-xl font-semibold mb-3"
                style={{ fontFamily: "var(--font-stack)" }}
              >
                {f.title}
              </h3>

              <p className="text-neutral-400 leading-relaxed text-sm">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
