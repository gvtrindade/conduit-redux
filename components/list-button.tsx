import { Button } from "@base-ui/react/button";
import { ButtonHTMLAttributes } from "react";

export default function ListButton({
  label,
  tone = "default",
  type = "button",
  ...props
}: {
  label: string;
  tone?: "default" | "danger";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type={type}
      className={`flex justify-between items-center text-xs px-3.5 py-3.5 bg-panel border-2 rounded-xl cursor-pointer transition-all ${
        tone === "danger"
          ? "border-red/40 hover:border-red"
          : "border-border-custom hover:border-amber"
      } ${props.className ?? ""}`}
      {...props}
    >
      <span
        className={`font-bold tracking-wide ${
          tone === "danger" ? "text-red" : "text-cream"
        }`}
      >
        {label}
      </span>
      <span className="text-sand">›</span>
    </Button>
  );
}
