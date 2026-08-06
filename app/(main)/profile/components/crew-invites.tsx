"use client";

import { acceptCrewInvite, declineCrewInvite } from "@/actions/members";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Action = {
  inviteId: string;
  squadName: string;
  kind: "accept" | "decline";
} | null;

export default function CrewInvites({
  userId,
  invites,
}: {
  userId: string;
  invites: { inviteId: string; squadName: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("CrewInvites");
  const [action, setAction] = useState<Action>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openAction = (inviteId: string, squadName: string, kind: "accept" | "decline") => {
    setError(null);
    setAction({ inviteId, squadName, kind });
  };

  const onConfirm = () => {
    if (!action) return;

    startTransition(async () => {
      const res =
        action.kind === "accept"
          ? await acceptCrewInvite(userId, action.inviteId)
          : await declineCrewInvite(userId, action.inviteId);
      if (res?.success) {
        setAction(null);
        router.refresh();
      } else {
        setError(t("errorFailed"));
      }
    });
  };

  return (
    <>
      <div className="bg-panel border-2 border-border-custom rounded-2xl divide-y divide-border-custom">
        {invites.map((invite) => (
          <div
            key={invite.inviteId}
            className="flex items-center justify-between gap-2 px-3.5 py-3.5"
          >
            <span className="font-bold tracking-wide text-xs text-cream truncate">
              {invite.squadName}
            </span>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                aria-label={t("accept")}
                onClick={() => openAction(invite.inviteId, invite.squadName, "accept")}
                className="text-green cursor-pointer transition-colors hover:text-cream"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                aria-label={t("decline")}
                onClick={() => openAction(invite.inviteId, invite.squadName, "decline")}
                className="text-red cursor-pointer transition-colors hover:text-cream"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomDrawer
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={
          action?.kind === "accept" ? t("acceptTitle") : t("declineTitle")
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-sand">
            {action?.kind === "accept"
              ? t("acceptConfirmation", { squad: action?.squadName ?? "" })
              : t("declineConfirmation", { squad: action?.squadName ?? "" })}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setAction(null)}
              disabled={isPending}
              className="flex-1 bg-panel2 border-2 border-border-custom rounded-xl py-4 text-[13px] tracking-widest text-sand cursor-pointer transition-colors hover:text-cream hover:border-cream"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`flex-1 rounded-xl py-4 text-[13px] tracking-widest text-cream cursor-pointer transition-colors hover:border-cream ${
                action?.kind === "accept"
                  ? "bg-green border-2 border-green/60"
                  : "bg-red border-2 border-red/60"
              }`}
            >
              {isPending
                ? action?.kind === "accept"
                  ? t("accepting")
                  : t("declining")
                : t("confirm")}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
