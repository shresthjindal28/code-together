export function StatCard({ label, value }:{
  label:string
  value:string | number
}) {
  return (
    <div
      className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5"
      style={{ fontFamily: "var(--font-stack)" }}
    >
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="text-3xl mt-1 font-semibold">{value}</div>
    </div>
  )
}
