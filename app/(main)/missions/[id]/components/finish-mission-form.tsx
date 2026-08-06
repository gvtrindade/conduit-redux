"use client";

import { finishMission } from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function FinishMissionForm({
  userId,
  squadId,
  missionId,
}: {
  userId: string;
  squadId: string;
  missionId: string;
}) {
  const router = useRouter();
  const t = useTranslations("FinishMissionForm");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    if (isPending) return;

    startTransition(async () => {
      const res = await finishMission(userId, squadId, missionId);
      if (res?.success) {
        setOpen(false);
        toast.success(t("finished"));
        router.refresh();
      } else {
        toast.error(t("errorFailed"));
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="w-full bg-green border-2 border-green/60 rounded-xl py-6 font-bold tracking-widest text-hull hover:text-cream hover:border-cream transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
      >
        {t("finish")}
      </Button>

      <BottomDrawer open={open} onOpenChange={setOpen} title={t("title")}>
        <div className="space-y-4">
          <p className="text-sm text-sand">{t("confirmation")}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="flex-1 bg-panel2 border-2 border-border-custom rounded-xl py-4 text-[13px] tracking-widest text-sand cursor-pointer transition-colors hover:text-cream hover:border-cream"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 bg-green border-2 border-green/60 rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer transition-colors hover:text-cream hover:border-cream"
            >
              {isPending ? t("finishing") : t("confirm")}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
