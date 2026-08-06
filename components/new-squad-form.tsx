"use client";

import { createSquad, isSquadNameTaken } from "@/actions/members";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Status = "idle" | "checking" | "available" | "taken";

export default function NewSquadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const t = useTranslations("NewSquadForm");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = value.trim();

  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      const taken = await isSquadNameTaken(userId, trimmed);
      if (cancelled) return;
      setStatus(taken ? "taken" : "available");
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed, userId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || status === "taken" || status === "checking") return;

    startTransition(async () => {
      const res = await createSquad(userId, trimmed);
      if (res?.error) {
        const errorKey =
          res.error === "required"
            ? "errorRequired"
            : res.error === "taken"
              ? "errorTaken"
              : "errorFailed";
        setError(t(errorKey));
      } else if (res?.success) {
        setValue("");
        setStatus("idle");
        setError(null);
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label={t("addSquad")}
        onClick={() => setOpen(true)}
        className="w-full flex justify-center items-center text-xs px-3.5 py-3.5 cursor-pointer transition-all hover:border-amber"
      >
        <span className="font-bold tracking-wide text-sand">
          + {t("addSquad")}
        </span>
      </button>

      <BottomDrawer
        open={open}
        onOpenChange={setOpen}
        title={t("title")}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              setValue(next);
              setError(null);
              setStatus(next.trim() ? "checking" : "idle");
            }}
            placeholder={t("placeholder")}
            aria-invalid={status === "taken" || !!error}
            className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none caret-amber focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all placeholder:text-panel2"
          />

          {status === "checking" && (
            <p className="text-sm text-sand">{t("checkingAvailability")}</p>
          )}
          {status === "available" && (
            <p className="text-sm text-green">{t("available")}</p>
          )}
          {status === "taken" && (
            <p className="text-sm text-destructive">{t("taken")}</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={
              !trimmed || status === "taken" || status === "checking" || isPending
            }
            className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-1 transition-colors hover:text-cream hover:border-cream"
          >
            {isPending ? t("creating") : t("createSquad")}
          </Button>
        </form>
      </BottomDrawer>
    </>
  );
}
