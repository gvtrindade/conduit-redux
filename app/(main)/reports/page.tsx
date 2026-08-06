import { getTranslations } from "next-intl/server";

export default async function Reports() {
  const t = await getTranslations("ReportsPage");
  return <div>{t("title")}</div>;
}
