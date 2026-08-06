"use client";

import PageHeader from "@/components/page-header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function MissionsHeader() {
  const router = useRouter();
  const t = useTranslations("MissionsPage");

  return (
    <PageHeader
      title={t("title")}
      showBack={false}
      menu={[
        {
          label: t("manageItems"),
          onSelect: () => router.push("/missions/items"),
        },
      ]}
    />
  );
}
