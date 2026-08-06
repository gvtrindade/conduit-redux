"use client";

import { createAisle } from "@/actions/merchants";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function AddAisleForm({
  userId,
  squadId,
  merchantId,
}: {
  userId: string;
  squadId: string;
  merchantId: string;
}) {
  const router = useRouter();
  const t = useTranslations("AddAisleForm");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = value.trim();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      const res = await createAisle(userId, squadId, merchantId, trimmed);
      if (res?.error) {
        const errorKey =
          res.error === "required"
            ? "errorRequired"
            : res.error === "forbidden"
              ? "errorForbidden"
              : res.error === "duplicate"
                ? "errorDuplicate"
                : "errorFailed";
        setError(t(errorKey));
      } else if (res?.success) {
        setValue("");
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
        aria-label={t("addAisle")}
        onClick={() => setOpen(true)}
        className="w-full flex justify-center items-center text-xs px-3.5 py-3.5 cursor-pointer transition-all hover:border-amber"
      >
        <span className="font-bold tracking-wide text-sand">
          + {t("addAisle")}
        </span>
      </button>

      <BottomDrawer open={open} onOpenChange={setOpen} title={t("title")}>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={t("placeholder")}
            aria-invalid={!!error}
            className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none caret-amber focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all placeholder:text-panel2"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={!trimmed || isPending}
            className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-1 transition-colors hover:text-cream hover:border-cream"
          >
            {isPending ? t("creating") : t("createAisle")}
          </Button>
        </form>
      </BottomDrawer>
    </>
  );
}