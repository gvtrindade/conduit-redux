"use client";

import { createMission } from "@/actions/missions";
import ListButton from "@/components/list-button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function AddMissionButton({
  userId,
  squadId,
}: {
  userId: string;
  squadId: string;
}) {
  const router = useRouter();
  const t = useTranslations("AddMissionButton");
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (isPending) return;

    startTransition(async () => {
      const res = await createMission(userId, squadId);
      if (res?.id) {
        router.push(`/missions/${res.id}`);
      } else {
        toast.error(t("errorFailed"));
      }
    });
  };

  return (
    <ListButton
      label={isPending ? t("creating") : t("add")}
      onClick={onClick}
      disabled={isPending}
    />
  );
}