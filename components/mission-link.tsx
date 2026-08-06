import { getTranslations } from "next-intl/server";
import Link from "next/link";

const STATUS_BAR: Record<string, string> = {
  draft: "bg-blue",
  active: "bg-green",
  finished: "bg-darkgray",
};

const PULSING = new Set(["draft", "active"]);

export default async function MissionLink({
  id,
  title,
  state,
  itemCount,
}: {
  id: string;
  title: string;
  state: string;
  itemCount: number;
}) {
  const t = await getTranslations("MissionLink");

  return (
    <Link
      href={`/missions/${id}`}
      className="relative flex items-center gap-3 bg-panel border-2 border-border-custom hover:border-amber rounded-xl px-3.5 py-3.5 transition-all cursor-pointer overflow-hidden"
    >
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_BAR[state] ?? "bg-darkgray"}`}
        style={PULSING.has(state) ? { boxShadow: `0 0 6px ${state === "draft" ? "#5B8A9E" : "#78A890"}`, animation: "pulse-dot 2s infinite" } : undefined}
      />
      <div className="flex flex-col min-w-0 pl-2.5">
        <span className="text-xs text-sand tracking-wide truncate">
          {t("protocol", { id })}
        </span>
        {title && (
          <span className="font-bold tracking-wide text-sm text-cream truncate">
            {title}
          </span>
        )}
      </div>
      <span className="ml-auto text-xs font-bold tracking-widest text-sand">
        {itemCount}
      </span>
    </Link>
  );
}
