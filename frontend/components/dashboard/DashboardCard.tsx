export function DashboardCard({ children }:{
  children: React.ReactNode
}) {
  return (
    <div
      className="mt-6 p-6 rounded-xl bg-[#0B0B0B] border border-white/5"
      style={{ fontFamily: "var(--font-stack)" }}
    >
      {children}
    </div>
  )
}
