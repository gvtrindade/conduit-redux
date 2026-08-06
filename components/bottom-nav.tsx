"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/reports", icon: "$", key: "reports" },
  { href: "/items", icon: "#", key: "items" },
  { href: "/missions", icon: "=", key: "missions" },
  { href: "/profile", icon: "@", key: "profile" },
];

export default function BottomNav() {
  const pathName = usePathname();
  const t = useTranslations("BottomNav");

  return (
    <div className="bottom-0 w-full bg-panel border-t-2 border-border-custom px-0 pt-2.5 pb-6 flex justify-around z-50">
      {navItems.map(({ href, icon, key }) => {
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
              {t(key)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
