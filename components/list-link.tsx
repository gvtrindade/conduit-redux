import Link from "next/link";

export default function ListLink({
  href,
  label,
  tone = "default",
}: {
  href: string;
  label: string;
  tone?: "default" | "danger";
}) {
  return (
    <Link
      href={href}
      className={`flex justify-between items-center text-xs px-3.5 py-3.5 bg-panel border-2 rounded-xl cursor-pointer transition-all ${
        tone === "danger"
          ? "border-red/40 hover:border-red"
          : "border-border-custom hover:border-amber"
      }`}
    >
      <span
        className={`font-bold tracking-wide ${
          tone === "danger" ? "text-red" : "text-cream"
        }`}
      >
        {label}
      </span>
      <span className="text-sand">›</span>
    </Link>
  );
}