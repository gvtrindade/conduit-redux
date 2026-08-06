import { getTranslations } from "next-intl/server";

export default async function Items() {
  const t = await getTranslations("ItemsPage");
  return <>{t("title")}</>;
}
