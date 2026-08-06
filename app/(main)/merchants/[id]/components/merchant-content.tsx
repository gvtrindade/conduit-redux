"use client";

import AisleList from "./aisle-list";
import AisleRuleList from "./aisle-rule-list";
import PageHeader from "@/components/page-header";
import ReceiptList from "./receipt-list";
import RenameMerchantForm from "./rename-merchant-form";
import Topic from "@/components/topic";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function MerchantContent({
  userId,
  squadId,
  merchantId,
  merchantName,
  aisles,
  rules,
  missionItems,
  receipts,
}: {
  userId: string;
  squadId: string;
  merchantId: string;
  merchantName: string;
  aisles: { id: string; name: string; order: number }[];
  rules: {
    id: string;
    order: number;
    missionItem: { id: string; title: string };
    merchantAisle: { id: string; name: string };
  }[];
  missionItems: { id: string; title: string }[];
  receipts: {
    id: string;
    date: string;
    status: string;
    nfce: string | null;
  }[];
}) {
  const t = useTranslations("MerchantPage");
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={merchantName}
        menu={[
          {
            label: t("editName"),
            onSelect: () => setRenameOpen(true),
          },
        ]}
      />

      <RenameMerchantForm
        key={String(renameOpen)}
        open={renameOpen}
        onOpenChange={setRenameOpen}
        userId={userId}
        squadId={squadId}
        merchantId={merchantId}
        merchantName={merchantName}
      />

      <Topic title={t("aislesTopic")}>
        <AisleList
          userId={userId}
          squadId={squadId}
          merchantId={merchantId}
          aisles={aisles}
        />
      </Topic>

      <Topic title={t("itemRulesTopic")}>
        <AisleRuleList
          userId={userId}
          squadId={squadId}
          merchantId={merchantId}
          rules={rules}
          missionItems={missionItems}
          aisles={aisles}
        />
      </Topic>

      <Topic title={t("receiptsTopic")}>
        <ReceiptList receipts={receipts} />
      </Topic>
    </>
  );
}