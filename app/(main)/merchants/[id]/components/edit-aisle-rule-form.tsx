"use client";

import { updateAisleRule } from "@/actions/merchants";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function EditAisleRuleForm({
  userId,
  squadId,
  merchantId,
  ruleId,
  currentMissionItemId,
  currentAisleId,
  missionItems,
  aisles,
}: {
  userId: string;
  squadId: string;
  merchantId: string;
  ruleId: string;
  currentMissionItemId: string;
  currentAisleId: string;
  missionItems: { id: string; title: string }[];
  aisles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("EditAisleRuleForm");
  const [open, setOpen] = useState(false);
  const [missionItemId, setMissionItemId] = useState<string | null>(null);
  const [merchantAisleId, setMerchantAisleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDrawer = () => {
    setMissionItemId(currentMissionItemId);
    setMerchantAisleId(currentAisleId);
    setError(null);
    setOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionItemId || !merchantAisleId || isPending) return;

    startTransition(async () => {
      const res = await updateAisleRule(
        userId,
        squadId,
        merchantId,
        ruleId,
        missionItemId,
        merchantAisleId,
      );
      if (res?.error) {
        const errorKey =
          res.error === "required"
            ? "errorRequired"
            : res.error === "duplicate"
              ? "errorDuplicate"
              : res.error === "invalidAisle"
                ? "errorInvalidAisle"
                : res.error === "invalidMissionItem"
                  ? "errorInvalidMissionItem"
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
        aria-label={t("edit")}
        onClick={openDrawer}
        className="text-sand cursor-pointer transition-colors hover:text-amber"
      >
        <Pencil size={13} />
      </button>

      <BottomDrawer open={open} onOpenChange={setOpen} title={t("title")}>
        <form onSubmit={onSubmit} className="space-y-3">
          <Select
            value={missionItemId ?? undefined}
            onValueChange={(value) => {
              setMissionItemId(value);
              setError(null);
            }}
          >
            <SelectTrigger className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all data-placeholder:text-panel2 h-auto!">
              <SelectValue placeholder={t("itemPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="bg-panel border-2 border-border-custom text-cream">
              {missionItems.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id}
                  label={item.title}
                  className="text-xs font-bold tracking-wide"
                >
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={merchantAisleId ?? undefined}
            onValueChange={(value) => {
              setMerchantAisleId(value);
              setError(null);
            }}
          >
            <SelectTrigger className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all data-placeholder:text-panel2 h-auto!">
              <SelectValue placeholder={t("aislePlaceholder")} />
            </SelectTrigger>
            <SelectContent className="bg-panel border-2 border-border-custom text-cream">
              {aisles.map((aisle) => (
                <SelectItem
                  key={aisle.id}
                  value={aisle.id}
                  label={aisle.name}
                  className="text-xs font-bold tracking-wide"
                >
                  {aisle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={!missionItemId || !merchantAisleId || isPending}
            className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-1 transition-colors hover:text-cream hover:border-cream"
          >
            {isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </BottomDrawer>
    </>
  );
}