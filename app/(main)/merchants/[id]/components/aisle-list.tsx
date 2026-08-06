"use client";

import { moveAisle } from "@/actions/merchants";
import AddAisleForm from "./add-aisle-form";
import DeleteAisleForm from "./delete-aisle-form";
import RenameAisleForm from "./rename-aisle-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function AisleList({
  userId,
  squadId,
  merchantId,
  aisles,
}: {
  userId: string;
  squadId: string;
  merchantId: string;
  aisles: { id: string; name: string; order: number }[];
}) {
  const router = useRouter();
  const t = useTranslations("AisleList");
  const [isPending, startTransition] = useTransition();

  const onMove = (aisleId: string, direction: "up" | "down") => {
    startTransition(async () => {
      const res = await moveAisle(userId, squadId, merchantId, aisleId, direction);
      if (res?.success) router.refresh();
    });
  };

  return (
    <div className="bg-panel border-2 border-border-custom rounded-2xl divide-y divide-border-custom overflow-hidden">
      {aisles.length === 0 && (
        <div className="px-3.5 py-3.5 text-xs text-sand">{t("empty")}</div>
      )}

      {aisles.map((aisle, index) => (
        <div
          key={aisle.id}
          className="flex items-center justify-between gap-2 px-3.5 py-3.5"
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label={t("moveUp")}
                onClick={() => onMove(aisle.id, "up")}
                disabled={isPending || index === 0}
                className="text-sand cursor-pointer transition-colors hover:text-amber disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label={t("moveDown")}
                onClick={() => onMove(aisle.id, "down")}
                disabled={isPending || index === aisles.length - 1}
                className="text-sand cursor-pointer transition-colors hover:text-amber disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <span className="flex-1 min-w-0 font-bold tracking-wide text-xs text-cream truncate">
            {aisle.name}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <RenameAisleForm
              userId={userId}
              squadId={squadId}
              merchantId={merchantId}
              aisleId={aisle.id}
              aisleName={aisle.name}
            />
            <DeleteAisleForm
              userId={userId}
              squadId={squadId}
              merchantId={merchantId}
              aisleId={aisle.id}
              aisleName={aisle.name}
            />
          </div>
        </div>
      ))}

      <AddAisleForm userId={userId} squadId={squadId} merchantId={merchantId} />
    </div>
  );
}