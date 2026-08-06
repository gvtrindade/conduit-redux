"use client";

import { moveAisleRule } from "@/actions/merchants";
import AddAisleRuleForm from "@/components/add-aisle-rule-form";
import DeleteAisleRuleForm from "@/components/delete-aisle-rule-form";
import EditAisleRuleForm from "@/components/edit-aisle-rule-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function AisleRuleList({
  userId,
  squadId,
  merchantId,
  rules,
  missionItems,
  aisles,
}: {
  userId: string;
  squadId: string;
  merchantId: string;
  rules: {
    id: string;
    order: number;
    missionItem: { id: string; title: string };
    merchantAisle: { id: string; name: string };
  }[];
  missionItems: { id: string; title: string }[];
  aisles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("AisleRuleList");
  const [isPending, startTransition] = useTransition();

  const onMove = (ruleId: string, direction: "up" | "down") => {
    startTransition(async () => {
      const res = await moveAisleRule(
        userId,
        squadId,
        merchantId,
        ruleId,
        direction,
      );
      if (res?.success) router.refresh();
    });
  };

  return (
    <div className="bg-panel border-2 border-border-custom rounded-2xl divide-y divide-border-custom overflow-hidden">
      {rules.length === 0 && (
        <div className="px-3.5 py-3.5 text-xs text-sand">{t("empty")}</div>
      )}

      {rules.map((rule, index) => (
        <div
          key={rule.id}
          className="flex items-center justify-between gap-2 px-3.5 py-3.5"
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label={t("moveUp")}
                onClick={() => onMove(rule.id, "up")}
                disabled={isPending || index === 0}
                className="text-sand cursor-pointer transition-colors hover:text-amber disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label={t("moveDown")}
                onClick={() => onMove(rule.id, "down")}
                disabled={isPending || index === rules.length - 1}
                className="text-sand cursor-pointer transition-colors hover:text-amber disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold tracking-wide text-xs text-cream truncate">
              {rule.missionItem.title}
            </p>
            <p className="text-xs text-sand truncate">
              {rule.merchantAisle.name}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EditAisleRuleForm
              userId={userId}
              squadId={squadId}
              merchantId={merchantId}
              ruleId={rule.id}
              currentMissionItemId={rule.missionItem.id}
              currentAisleId={rule.merchantAisle.id}
              missionItems={missionItems}
              aisles={aisles}
            />
            <DeleteAisleRuleForm
              userId={userId}
              squadId={squadId}
              merchantId={merchantId}
              ruleId={rule.id}
              ruleLabel={rule.missionItem.title}
            />
          </div>
        </div>
      ))}

      <AddAisleRuleForm
        userId={userId}
        squadId={squadId}
        merchantId={merchantId}
        missionItems={missionItems}
        aisles={aisles}
      />
    </div>
  );
}