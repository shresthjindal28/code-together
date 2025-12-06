export function SectionHeading({ title }:{ title:string }) {
  return (
    <h2
      className="text-xl mt-10 mb-4 text-neutral-200"
      style={{ fontFamily: "var(--font-bitcount)" }}
    >
      {title}
    </h2>
  )
}
