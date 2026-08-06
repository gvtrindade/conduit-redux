"use client";

import { renameAisle } from "@/actions/merchants";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function RenameAisleForm({
  userId,
  squadId,
  merchantId,
  aisleId,
  aisleName,
}: {
  userId: string;
  squadId: string;
  merchantId: string;
  aisleId: string;
  aisleName: string;
}) {
  const router = useRouter();
  const t = useTranslations("RenameAisleForm");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(aisleName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = value.trim();

  const openDrawer = () => {
    setValue(aisleName);
    setError(null);
    setOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      const res = await renameAisle(
        userId,
        squadId,
        merchantId,
        aisleId,
        trimmed,
      );
      if (res?.error) {
        const errorKey =
          res.error === "required"
            ? "errorRequired"
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
            {isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </BottomDrawer>
    </>
  );
}