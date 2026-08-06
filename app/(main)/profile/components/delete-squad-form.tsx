"use client";

import { deleteSquad } from "@/actions/members";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteSquadForm({
  userId,
  squadId,
  squadName,
}: {
  userId: string;
  squadId: string;
  squadName: string;
}) {
  const router = useRouter();
  const t = useTranslations("DeleteSquadForm");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const res = await deleteSquad(userId, squadId);
      if (res?.error) {
        const errorKey =
          res.error === "onlySquad" ? "errorOnlySquad" : "errorFailed";
        setError(t(errorKey));
      } else if (res?.success) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label={t("delete")}
        onClick={() => setOpen(true)}
        className="text-red cursor-pointer transition-colors hover:text-cream"
      >
        <Trash2 size={13} />
      </button>

      <BottomDrawer open={open} onOpenChange={setOpen} title={t("title")}>
        <div className="space-y-4">
          <p className="text-sm text-sand">
            {t("confirmation", { squad: squadName })}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
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
              className="flex-1 bg-red border-2 border-red/60 rounded-xl py-4 text-[13px] tracking-widest text-cream cursor-pointer transition-colors hover:bg-red hover:border-cream"
            >
              {isPending ? t("deleting") : t("confirm")}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}