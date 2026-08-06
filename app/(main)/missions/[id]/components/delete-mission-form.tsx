"use client";

import { deleteMission } from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteMissionForm({
  open,
  onOpenChange,
  userId,
  squadId,
  missionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  squadId: string;
  missionId: string;
}) {
  const router = useRouter();
  const t = useTranslations("DeleteMissionForm");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    if (isPending) return;

    startTransition(async () => {
      const res = await deleteMission(userId, squadId, missionId);
      if (res?.success) {
        onOpenChange(false);
        router.push("/missions");
      } else {
        setError(t("errorFailed"));
      }
    });
  };

  return (
    <BottomDrawer open={open} onOpenChange={onOpenChange} title={t("title")}>
      <div className="space-y-4">
        <p className="text-sm text-sand">{t("confirmation")}</p>
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