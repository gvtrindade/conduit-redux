"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function getPageName(pathname: string): string {
  if (pathname === "/reports") return "reports";
  if (pathname === "/items") return "items";
  if (pathname === "/missions") return "missions";
  if (pathname === "/profile") return "profile";
  if (pathname.startsWith("/reports/")) return "reportDetail";
  if (pathname.startsWith("/items/")) return "itemDetail";
  if (pathname.startsWith("/mission/")) return "manifestDebrief";
  return "conduit";
}

export default function AppHeader({ squadName }: { squadName: string | null }) {
  const pathname = usePathname();
  const t = useTranslations("AppHeader");

  return (
    <div className="w-full z-[60] flex items-center justify-between gap-2 px-4 py-2 bg-hull border-b border-border-custom">
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full bg-green mb-[3px]`}
          style={{
            boxShadow: "0 0 6px #78A890",
            animation: "pulse-dot 2s infinite",
          }}
        />
        <span className="text-[9px] tracking-widest text-sand">
          {t("connected")} {'//'} {t(getPageName(pathname))}
        </span>
      </div>
      {squadName && (
        <span className="text-[9px] tracking-widest text-sand">
          {t("squad")} {squadName}
        </span>
      )}
    </div>
  );
}
