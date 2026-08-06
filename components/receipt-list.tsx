import ListLink from "@/components/list-link";
import { useTranslations } from "next-intl";

export default function ReceiptList({
  receipts,
}: {
  receipts: { id: string; date: string; status: string; nfce: string | null }[];
}) {
  const t = useTranslations("ReceiptList");

  const formatDate = (date: string) => {
    const [y, m, d] = date.split("-");
    return `${m}/${d}/${y}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {receipts.length === 0 ? (
        <div className="bg-panel border-2 border-border-custom rounded-2xl px-3.5 py-3.5 text-xs text-sand">
          {t("empty")}
        </div>
      ) : (
        receipts.map((receipt) => (
          <ListLink
            key={receipt.id}
            href={`/reports/${receipt.id}`}
            label={receipt.nfce ?? formatDate(receipt.date)}
          />
        ))
      )}
    </div>
  );
}