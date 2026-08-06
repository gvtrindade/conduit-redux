"use client";

import { removeMissionItem, setMissionItemComplete } from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import MissionItemPicker from "./mission-item-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function MissionItemsList({
  userId,
  squadId,
  missionId,
  missionState,
  itemEstimates,
  missionItems,
  aisles,
  missionItemIds,
}: {
  userId: string;
  squadId: string;
  missionId: string;
  missionState: string;
  itemEstimates: {
    id: string;
    title: string;
    category: string;
    estValue: string;
    complete: boolean;
  }[];
  missionItems: { id: string; title: string }[];
  aisles: { id: string; name: string }[];
  missionItemIds: string[];
}) {
  const router = useRouter();
  const t = useTranslations("MissionItemsList");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removing, setRemoving] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canComplete = missionState === "active";

  const onToggle = (estimate: (typeof itemEstimates)[number]) => {
    if (!canComplete || isPending) return;

    startTransition(async () => {
      const res = await setMissionItemComplete(
        userId,
        squadId,
        missionId,
        estimate.id,
        !estimate.complete,
      );
      if (res?.success) {
        router.refresh();
      } else {
        setError(t("errorFailed"));
      }
    });
  };

  const onRemove = () => {
    if (!removing) return;

    startTransition(async () => {
      const res = await removeMissionItem(
        userId,
        squadId,
        missionId,
        removing.id,
      );
      if (res?.success) {
        setRemoving(null);
        router.refresh();
      } else {
        setError(t("errorFailed"));
      }
    });
  };

  return (
    <>
      <div className="my-2">
        <button
          type="button"
          aria-label={t("addItem")}
          onClick={() => setPickerOpen(true)}
          className="w-full flex justify-center items-center text-xs px-3.5 py-3 rounded-2xl bg-panel border-2 border-border-custom cursor-pointer transition-all hover:text-amber"
        >
          <span className="font-bold tracking-wide text-sand">
            + {t("addItem")}
          </span>
        </button>
      </div>

      <div className="bg-panel border-2 border-border-custom rounded-2xl overflow-hidden">
        {!itemEstimates.length && (
          <div className="px-3.5 py-3.5 text-xs text-sand">{t("empty")}</div>
        )}

        <div className="max-h-96 overflow-y-auto divide-y divide-border-custom scrollbar-none">
          {itemEstimates.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3.5 py-3">
              {canComplete && (
                <Checkbox
                  checked={item.complete}
                  onCheckedChange={() => onToggle(item)}
                  aria-label={item.title}
                  className="size-5 shrink-0 rounded-md border-[1.5px] border-border-custom bg-hull text-hull cursor-pointer data-checked:bg-green data-checked:border-green transition-colors hover:border-amber"
                />
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={`font-bold tracking-wide text-xs text-cream truncate ${
                    item.complete ? "line-through opacity-50" : ""
                  }`}
                >
                  {item.title}
                </span>
                <span className="text-[10px] tracking-wider text-sand truncate">
                  {item.category}
                </span>
              </div>

              <span className="font-mono text-xs font-bold tracking-widest text-sand shrink-0">
                {item.estValue}
              </span>

              {canComplete && (
                <button
                  type="button"
                  aria-label={t("remove")}
                  onClick={() => {
                    setError(null);
                    setRemoving({ id: item.id, title: item.title });
                  }}
                  disabled={isPending}
                  className="text-red cursor-pointer transition-colors hover:text-cream disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {isPending && (
          <div className="h-0.5 bg-panel2">
            <div className="h-full w-1/3 bg-amber animate-pulse" />
          </div>
        )}
      </div>

      <MissionItemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        userId={userId}
        squadId={squadId}
        missionId={missionId}
        items={missionItems}
        aisles={aisles}
        missionItemIds={missionItemIds}
      />

      <BottomDrawer
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={t("removeTitle")}
      >
        <div className="space-y-4">
          <p className="text-sm text-sand">
            {t("removeConfirmation", { title: removing?.title ?? "" })}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setRemoving(null)}
              disabled={isPending}
              className="flex-1 bg-panel2 border-2 border-border-custom rounded-xl py-4 text-[13px] tracking-widest text-sand cursor-pointer transition-colors hover:text-cream hover:border-cream"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={onRemove}
              disabled={isPending}
              className="flex-1 bg-red border-2 border-red/60 rounded-xl py-4 text-[13px] tracking-widest text-cream cursor-pointer transition-colors hover:bg-red hover:border-cream"
            >
              {isPending ? t("removing") : t("confirmRemove")}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
