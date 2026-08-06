"use client";

import {
  callsignExists,
  cancelCrewInvite,
  inviteToCrew,
  removeFromCrew,
} from "@/actions/members";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type Status = "idle" | "checking" | "exists" | "notFound";

export default function CrewList({
  userId,
  squadId,
  crew,
  invites,
  isCreator,
  myMemberId,
}: {
  userId: string;
  squadId: string;
  crew: { memberId: string; callsign: string }[];
  invites: { inviteId: string; callsign: string }[];
  isCreator: boolean;
  myMemberId: string;
}) {
  const router = useRouter();
  const t = useTranslations("CrewList");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isInviting, startInviteTransition] = useTransition();
  const [removing, setRemoving] = useState<{
    memberId: string;
    callsign: string;
  } | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isRemoving, startRemoveTransition] = useTransition();

  const trimmed = value.trim();

  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      const exists = await callsignExists(trimmed);
      if (cancelled) return;
      setStatus(exists ? "exists" : "notFound");
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed]);

  const onInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || status !== "exists" || isInviting) return;

    startInviteTransition(async () => {
      const res = await inviteToCrew(userId, squadId, trimmed);
      if (res?.error) {
        const errorKey =
          res.error === "required"
            ? "errorRequired"
            : res.error === "notFound"
              ? "errorNotFound"
              : res.error === "self"
                ? "errorSelf"
                : res.error === "alreadyCrew"
                  ? "errorAlreadyCrew"
                  : res.error === "alreadyInvited"
                    ? "errorAlreadyInvited"
                    : res.error === "forbidden"
                      ? "errorForbidden"
                      : "errorFailed";
        setError(t(errorKey));
      } else if (res?.success) {
        setValue("");
        setStatus("idle");
        setError(null);
        router.refresh();
      }
    });
  };

  const onCancelInvite = (inviteId: string) => {
    startInviteTransition(async () => {
      const res = await cancelCrewInvite(userId, squadId, inviteId);
      if (res?.success) {
        toast.success(t("cancelInviteSuccess"));
        router.refresh();
      } else {
        toast.error(t("errorFailed"));
      }
    });
  };

  const openRemove = (memberId: string, callsign: string) => {
    setRemoveError(null);
    setRemoving({ memberId, callsign });
  };

  const onRemove = () => {
    if (!removing) return;

    startRemoveTransition(async () => {
      const res = await removeFromCrew(userId, squadId, removing.memberId);
      if (res?.success) {
        setRemoving(null);
        router.refresh();
      } else {
        const errorKey =
          res.error === "forbidden"
            ? "errorRemoveForbidden"
            : res.error === "notCrew"
              ? "errorNotCrew"
              : "errorRemoveFailed";
        setRemoveError(t(errorKey));
      }
    });
  };

  return (
    <>
      <div className="bg-panel border-2 border-border-custom rounded-2xl overflow-hidden">
        <form
          onSubmit={onInvite}
          className="p-4.5 space-y-3 border-b border-border-custom"
        >
          <Input
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              setValue(next);
              setError(null);
              setStatus(next.trim() ? "checking" : "idle");
            }}
            placeholder={t("placeholder")}
            aria-invalid={status === "notFound" || !!error}
            className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none caret-amber focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all placeholder:text-panel2"
          />

          {status === "checking" && (
            <p className="text-sm text-sand">{t("checkingExists")}</p>
          )}
          {status === "exists" && (
            <p className="text-sm text-green">{t("exists")}</p>
          )}
          {status === "notFound" && (
            <p className="text-sm text-destructive">{t("notFound")}</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={
              !trimmed ||
              status !== "exists" ||
              isInviting ||
              isRemoving
            }
            className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-1 transition-colors hover:text-cream hover:border-cream"
          >
            {isInviting ? t("inviting") : t("invite")}
          </Button>
        </form>

        <div className="max-h-20 overflow-y-auto divide-y divide-border-custom">
          {invites.length === 0 && crew.length === 0 && (
            <div className="px-3.5 py-3.5 text-xs text-sand">
              {t("empty")}
            </div>
          )}

          {invites.map((invite) => (
            <div
              key={invite.inviteId}
              className="flex items-center justify-between gap-2 px-3.5 py-3.5"
            >
              <span className="font-bold tracking-wide text-xs text-cream truncate">
                {invite.callsign}
              </span>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-amber">
                  {t("invited")}
                </span>
                <button
                  type="button"
                  aria-label={t("cancelInvite")}
                  onClick={() => onCancelInvite(invite.inviteId)}
                  disabled={isInviting || isRemoving}
                  className="text-sand cursor-pointer transition-colors hover:text-red disabled:opacity-50"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {crew.map((member) => (
            <div
              key={member.memberId}
              className="flex items-center justify-between gap-2 px-3.5 py-3.5"
            >
              <span className="font-bold tracking-wide text-xs text-cream truncate">
                {member.callsign}
              </span>
              {isCreator && member.memberId !== myMemberId && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label={t("remove")}
                    onClick={() =>
                      openRemove(member.memberId, member.callsign)
                    }
                    disabled={isInviting || isRemoving}
                    className="text-red cursor-pointer transition-colors hover:text-cream disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomDrawer
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={t("removeTitle")}
      >
        <div className="space-y-4">
          <p className="text-sm text-sand">
            {t("removeConfirmation", { callsign: removing?.callsign ?? "" })}
          </p>
          {removeError && (
            <p className="text-sm text-destructive">{removeError}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setRemoving(null)}
              disabled={isRemoving}
              className="flex-1 bg-panel2 border-2 border-border-custom rounded-xl py-4 text-[13px] tracking-widest text-sand cursor-pointer transition-colors hover:text-cream hover:border-cream"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              className="flex-1 bg-red border-2 border-red/60 rounded-xl py-4 text-[13px] tracking-widest text-cream cursor-pointer transition-colors hover:bg-red hover:border-cream"
            >
              {isRemoving ? t("removing") : t("confirmRemove")}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}

