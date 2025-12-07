"use client";

export default function Pricing() {
  const tiers = [
    {
      title: "Free",
      price: "$0",
      desc: "For individuals & students",
      btn: "Start Free",
      features: [
        "1 Workspace",
        "5 AI responses / day",
        "Realtime editor",
        "Basic video call",
      ],
    },
    {
      title: "Pro",
      price: "$9/month",
      desc: "For teams and creators",
      btn: "Upgrade",
      highlight: true,
      features: [
        "Unlimited Workspaces",
        "Unlimited AI",
        "Advanced video",
        "Export + History",
      ],
    },
    {
      title: "Enterprise",
      price: "Custom",
      desc: "For companies",
      btn: "Contact Sales",
      features: [
        "Dedicated servers",
        "Custom AI models",
        "SSO / RBAC",
        "SLAs",
      ],
    },
  ];

  return (
    <section className="bg-black text-white py-28 px-6">
      <div className="max-w-6xl mx-auto space-y-20">
        <h2
          className="text-center font-bold text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-science)" }}
        >
          Simple Pricing For Everyone
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 border backdrop-blur-md ${
                tier.highlight
                  ? "bg-gradient-to-br from-[#1b1036] to-[#150a26] border-[#6c47ff]"
                  : "bg-black/40 border-white/5"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.title}</h3>
              <p className="text-4xl font-bold mb-2">{tier.price}</p>
              <p className="text-neutral-400 mb-8">{tier.desc}</p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="text-neutral-300">
                    • {f}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 rounded-xl bg-[#6c47ff] hover:bg-[#5535cc] transition"
                style={{ fontFamily: "var(--font-stack)" }}
              >
                {tier.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
