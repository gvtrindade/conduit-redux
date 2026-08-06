"use client";

import { setActiveSquad } from "@/actions/members";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function SelectActiveSquad({
  userId,
  squadId,
  squadName,
  isActive,
}: {
  userId: string;
  squadId: string;
  squadName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("SelectActiveSquad");
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (isActive || isPending) return;

    startTransition(async () => {
      const res = await setActiveSquad(userId, squadId);
      if (res?.success) {
        toast.success(t("changed", { squad: squadName }));
        router.refresh();
      } else {
        toast.error(res?.error === "forbidden" ? t("errorForbidden") : t("errorFailed"));
      }
    });
  };

  return (
    <button
      type="button"
      aria-label={t("setActive", { squad: squadName })}
      onClick={onClick}
      disabled={isActive}
      className={`cursor-pointer text-left font-bold tracking-wide transition-colors hover:text-amber disabled:cursor-default ${
        isActive ? "text-amber disabled:hover:text-amber" : "text-cream"
      }`}
    >
      {squadName}
    </button>
  );
}