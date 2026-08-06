"use client";

import ActivateMissionForm from "./activate-mission-form";
import DeleteMissionForm from "./delete-mission-form";
import FinishMissionForm from "./finish-mission-form";
import MissionItemsList from "./mission-items-list";
import PageHeader from "@/components/page-header";
import RenameMissionForm from "./rename-mission-form";
import Topic from "@/components/topic";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function MissionContent({
  userId,
  squadId,
  missionId,
  missionTitle,
  missionState,
  estimatedTotal,
  completion,
  merchant,
  itemEstimates,
  missionItems,
  aisles,
  missionItemIds,
  merchants,
}: {
  userId: string;
  squadId: string;
  missionId: string;
  missionTitle: string;
  missionState: string;
  estimatedTotal: string;
  completion: { completed: number; total: number };
  merchant: { id: string; name: string } | null;
  itemEstimates: {
    id: string;
    title: string;
    category: string;
    estValue: string;
    complete: boolean;
  }[];
  missionItems: { id: string; title: string }[];
  aisles: { id: string; name: string }[];
  missionItemIds: string[];
  merchants: { id: string; name: string }[];
}) {
  const t = useTranslations("MissionPage");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDraft = missionState === "draft";
  const isActive = missionState === "active";
  const isFinished = missionState === "finished";
  const completionPercent =
    completion.total === 0
      ? 0
      : Math.round((completion.completed / completion.total) * 100);

  return (
    <>
      <PageHeader
        title={missionTitle}
        menu={[
          {
            label: t("editName"),
            onSelect: () => setRenameOpen(true),
          },
          {
            label: t("deleteMission"),
            onSelect: () => setDeleteOpen(true),
          },
        ]}
      />

      <RenameMissionForm
        key={String(renameOpen)}
        open={renameOpen}
        onOpenChange={setRenameOpen}
        userId={userId}
        squadId={squadId}
        missionId={missionId}
        missionTitle={missionTitle}
      />

      <DeleteMissionForm
        key={String(deleteOpen)}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        userId={userId}
        squadId={squadId}
        missionId={missionId}
      />

      <div className="flex flex-col items-center gap-2 py-2">
        <div className="flex items-center gap-2.5 rounded-full bg-panel border-2 border-border-custom px-4 py-2">
          <span className="text-xs font-bold tracking-widest text-sand">
            {t("estimatedTotal")}
          </span>
          <span className="text-xs font-bold tracking-widest text-amber">
            {estimatedTotal}
          </span>
        </div>

        {merchant && (
          <div className="flex items-center gap-2.5 rounded-full bg-panel border-2 border-border-custom px-4 py-2">
            <span className="text-xs font-bold tracking-widest text-sand">
              {t("merchant")}
            </span>
            <span className="text-xs font-bold tracking-widest text-blue">
              {merchant.name}
            </span>
          </div>
        )}

        <div className="w-full max-w-sm rounded-2xl bg-panel border-2 border-border-custom px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-widest text-sand">
              {t("completion")}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-green">
              {t("completionValue", {
                completed: completion.completed,
                total: completion.total,
                percent: completionPercent,
              })}
            </span>
          </div>
          <div className="h-2 rounded-full bg-panel2 overflow-hidden">
            <div
              className="h-full rounded-full bg-green transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {isDraft && (
        <ActivateMissionForm
          userId={userId}
          squadId={squadId}
          missionId={missionId}
          canActivate={itemEstimates.length > 0}
          merchants={merchants}
        />
      )}

      {isActive && (
        <FinishMissionForm
          userId={userId}
          squadId={squadId}
          missionId={missionId}
        />
      )}

      <Topic title={t("itemsTopic")}>
        <MissionItemsList
          userId={userId}
          squadId={squadId}
          missionId={missionId}
          missionState={missionState}
          itemEstimates={itemEstimates}
          missionItems={missionItems}
          aisles={aisles}
          missionItemIds={missionItemIds}
        />
      </Topic>

      {isFinished && (
        <div className="mt-3 rounded-2xl bg-panel border-2 border-border-custom px-4 py-3 text-center">
          <span className="text-[10px] font-bold tracking-widest text-sand">
            {t("finished")}
          </span>
        </div>
      )}
    </>
  );
}
