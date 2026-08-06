import { ReactNode } from "react";
import BarLabel from "./bar-label";

export default function Topic({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div className="text-sm mt-5 mb-10">
      <BarLabel
        className={`pb-1.5 mb-3 tracking-widest border-b ${
          tone === "danger"
            ? "text-red border-red/40"
            : "text-sand border-border-custom"
        }`}
      >
        {title}
      </BarLabel>
      {children}
    </div>
  );
}
