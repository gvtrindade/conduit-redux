"use client";

import { updateMissionItem } from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function EditMissionItemForm({
  open,
  onOpenChange,
  userId,
  squadId,
  item,
  aisles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  squadId: string;
  item: {
    id: string;
    title: string;
    aisleId: string | null;
  } | null;
  aisles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("EditMissionItemForm");
  const [title, setTitle] = useState(item?.title ?? "");
  const [aisleId, setAisleId] = useState<string | null>(item?.aisleId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = title.trim();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || !aisleId || isPending || !item) return;

    startTransition(async () => {
      const res = await updateMissionItem(
        userId,
        squadId,
        item.id,
        trimmed,
        aisleId,
      );
      if (res?.error) {
        setError(
          t(
            res.error === "required"
              ? "errorRequired"
              : res.error === "invalidAisle"
                ? "errorInvalidAisle"
                : "errorFailed",
          ),
        );
      } else if (res?.success) {
        onOpenChange(false);
        router.refresh();
      }
    });
  };

  return (
    <BottomDrawer open={open} onOpenChange={onOpenChange} title={t("title")}>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          placeholder={t("namePlaceholder")}
          aria-invalid={!!error}
          className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-[13px] font-medium text-cream tracking-wider outline-none caret-amber focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all placeholder:text-panel2"
        />

        <Select
          value={aisleId ?? undefined}
          onValueChange={(value) => {
            setAisleId(value);
            setError(null);
          }}
        >
          <SelectTrigger className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 px-4 text-xs font-bold text-cream tracking-wider outline-none focus:border-amber transition-all data-placeholder:text-panel2 h-auto!">
            <SelectValue placeholder={t("aislePlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-panel border-2 border-border-custom text-cream">
            {aisles.length === 0 && (
              <div className="px-3 py-2 text-xs text-sand">{t("noAisles")}</div>
            )}
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
          disabled={!trimmed || !aisleId || isPending}
          className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-1 transition-colors hover:text-cream hover:border-cream disabled:opacity-40"
        >
          {isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </BottomDrawer>
  );
}