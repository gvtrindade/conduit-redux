"use client";

import DeleteMissionItemForm from "./delete-mission-item-form";
import EditMissionItemForm from "./edit-mission-item-form";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function MissionItemsManager({
  userId,
  squadId,
  items,
  aisles,
}: {
  userId: string;
  squadId: string;
  items: {
    id: string;
    title: string;
    category: string;
    aisleId: string | null;
    inUse: boolean;
  }[];
  aisles: { id: string; name: string }[];
}) {
  const t = useTranslations("MissionItemsManager");
  const [editing, setEditing] = useState<(typeof items)[number] | null>(null);
  const [deleting, setDeleting] = useState<(typeof items)[number] | null>(null);

  return (
    <>
      {items.length === 0 ? (
        <div className="bg-panel border-2 border-border-custom rounded-2xl px-3.5 py-3.5 text-sm text-sand">
          {t("empty")}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex w-full bg-panel border-2 border-border-custom hover:border-amber rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                aria-label={t("edit", { title: item.title })}
                onClick={() => setEditing(item)}
                className="flex-1 flex flex-col items-start min-w-0 gap-0.5 px-3.5 py-3.5 text-left cursor-pointer transition-colors"
              >
                <span className="font-bold tracking-wide text-sm text-cream truncate w-full">
                  {item.title}
                </span>
                {item.category && (
                  <span className="text-[10px] tracking-wider text-sand truncate w-full">
                    {item.category}
                  </span>
                )}
              </button>

              <div className="my-2.5 w-px bg-border-custom shrink-0" />

              <button
                type="button"
                aria-label={
                  item.inUse ? t("deleteDisabled", { title: item.title }) : t("delete", { title: item.title })
                }
                title={item.inUse ? t("deleteDisabledHint") : undefined}
                onClick={() => setDeleting(item)}
                disabled={item.inUse}
                className="w-12 shrink-0 flex items-center justify-center text-red cursor-pointer transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-red"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <EditMissionItemForm
        key={editing?.id ?? "none"}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        userId={userId}
        squadId={squadId}
        item={editing}
        aisles={aisles}
      />

      <DeleteMissionItemForm
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        userId={userId}
        squadId={squadId}
        item={deleting}
      />
    </>
  );
}