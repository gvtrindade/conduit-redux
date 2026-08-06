import { getTranslations } from "next-intl/server";

export default async function Missions() {
    const t = await getTranslations("MissionsPage");
    return (
        <div>{t("title")}</div>
    )
}