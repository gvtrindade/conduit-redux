"use client";

import { deleteMissionItem } from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteMissionItemForm({
  open,
  onOpenChange,
  userId,
  squadId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  squadId: string;
  item: { id: string; title: string } | null;
}) {
  const router = useRouter();
  const t = useTranslations("DeleteMissionItemForm");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    if (!item || isPending) return;

    startTransition(async () => {
      const res = await deleteMissionItem(userId, squadId, item.id);
      if (res?.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(
          t(res?.error === "inUse" ? "errorInUse" : "errorFailed"),
        );
      }
    });
  };

  return (
    <BottomDrawer open={open} onOpenChange={onOpenChange} title={t("title")}>
      <div className="space-y-4">
        <p className="text-sm text-sand">
          {t("confirmation", { title: item?.title ?? "" })}
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 bg-panel2 border-2 border-border-custom rounded-xl py-4 text-[13px] tracking-widest text-sand cursor-pointer transition-colors hover:text-cream hover:border-cream"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 bg-red border-2 border-red/60 rounded-xl py-4 text-[13px] tracking-widest text-cream cursor-pointer transition-colors hover:bg-red hover:border-cream"
          >
            {isPending ? t("deleting") : t("confirm")}
          </Button>
        </div>
      </div>
    </BottomDrawer>
  );
}