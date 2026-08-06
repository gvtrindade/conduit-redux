"use client";

import { activateMission } from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function ActivateMissionForm({
  userId,
  squadId,
  missionId,
  canActivate,
  merchants,
}: {
  userId: string;
  squadId: string;
  missionId: string;
  canActivate: boolean;
  merchants: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("ActivateMissionForm");
  const [open, setOpen] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    if (!merchantId || isPending) return;

    startTransition(async () => {
      const res = await activateMission(userId, squadId, missionId, merchantId);
      if (res?.success) {
        setOpen(false);
        setMerchantId(null);
        setError(null);
        toast.success(t("activated"));
        router.refresh();
      } else {
        setError(
          t(res?.error === "invalidMerchant" ? "errorInvalidMerchant" : "errorFailed"),
        );
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!canActivate || isPending}
        className="w-full bg-amber border-2 border-[#C07830] rounded-xl py-6 font-bold tracking-widest text-hull hover:text-cream hover:border-cream transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:hover:text-hull disabled:hover:border-[#C07830]"
      >
        {t("activate")}
      </Button>

      <BottomDrawer open={open} onOpenChange={setOpen} title={t("title")}>
        <div className="space-y-4">
          <p className="text-sm text-sand">{t("confirmation")}</p>

          <Select
            value={merchantId ?? undefined}
            onValueChange={(value) => {
              setMerchantId(value);
              setError(null);
            }}
          >
            <SelectTrigger className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all data-placeholder:text-panel2 h-auto!">
              <SelectValue placeholder={t("merchantPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="bg-panel border-2 border-border-custom text-cream">
              {merchants.length === 0 && (
                <div className="px-3 py-2 text-xs text-sand">
                  {t("noMerchants")}
                </div>
              )}
              {merchants.map((merchant) => (
                <SelectItem
                  key={merchant.id}
                  value={merchant.id}
                  label={merchant.name}
                  className="text-xs font-bold tracking-wide"
                >
                  {merchant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              disabled={!merchantId || isPending}
              className="flex-1 bg-amber border-2 border-[#C07830] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer transition-colors hover:text-cream hover:border-cream disabled:opacity-40 disabled:cursor-default disabled:hover:text-hull disabled:hover:border-[#C07830]"
            >
              {isPending ? t("activating") : t("confirm")}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
