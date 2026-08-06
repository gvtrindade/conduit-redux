"use client";

import { isSquadNameTaken, renameSquad } from "@/actions/members";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Pencil } from "lucide-react";

type Status = "idle" | "checking" | "available" | "taken";

export default function RenameSquadForm({
  userId,
  squadId,
  squadName,
}: {
  userId: string;
  squadId: string;
  squadName: string;
}) {
  const router = useRouter();
  const t = useTranslations("RenameSquadForm");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(squadName);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = value.trim();

  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      const taken = await isSquadNameTaken(userId, trimmed, squadId);
      if (cancelled) return;
      setStatus(taken ? "taken" : "available");
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed, userId, squadId]);

  const openDrawer = () => {
    setValue(squadName);
    setError(null);
    setStatus("idle");
    setOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || status === "taken" || status === "checking") return;

    startTransition(async () => {
      const res = await renameSquad(userId, squadId, trimmed);
      if (res?.error) {
        const errorKey =
          res.error === "required"
            ? "errorRequired"
            : res.error === "taken"
              ? "errorTaken"
              : "errorFailed";
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
        aria-label={t("rename")}
        onClick={openDrawer}
        className="text-sand cursor-pointer transition-colors hover:text-amber"
      >
        <Pencil size={13} />
      </button>

      <BottomDrawer open={open} onOpenChange={setOpen} title={t("title")}>
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
            {isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </BottomDrawer>
    </>
  );
}
