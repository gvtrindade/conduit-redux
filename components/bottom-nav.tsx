"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/reports", icon: "$", label: "RPRT" },
  { href: "/items", icon: "#", label: "ITMS" },
  { href: "/missions", icon: "=", label: "MISN" },
  { href: "/profile", icon: "@", label: "PRFL" },
];

export default function BottomNav() {
  const pathName = usePathname();

  return (
    <div className="fixed bottom-0 w-full bg-panel border-t-2 border-border-custom px-0 pt-2.5 pb-6 flex justify-around z-50">
      {navItems.map(({ href, icon, label }) => {
        const isActive = pathName.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 cursor-pointer no-underline font-mono"
          >
            <span
              className={`text-2xl font-bold ${isActive ? "text-amber" : "text-sand"}`}
              style={
                isActive
                  ? { textShadow: "0 0 12px rgba(217, 140, 69, 0.6)" }
                  : undefined
              }
            >
              {icon}
            </span>
            <span
              className={`text-sm ${isActive ? "text-amber" : "text-sand"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
