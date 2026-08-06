import { getActiveSquad } from "@/actions/members";
import { getMissionItemBank } from "@/actions/missions";
import MissionItemsManager from "@/components/mission-items-manager";
import PageHeader from "@/components/page-header";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MissionItemsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const t = await getTranslations("MissionItemsPage");

  const activeSquad = await getActiveSquad(session.user.id);
  const squad = activeSquad?.activeSquad;
  if (!squad) redirect("/profile");

  const res = await getMissionItemBank(session.user.id, squad.id);
  const items = res?.error ? [] : res.items;
  const aisles = res?.error ? [] : res.aisles;

  return (
    <>
      <PageHeader title={t("title")} />
      <MissionItemsManager
        userId={session.user.id}
        squadId={squad.id}
        items={items}
        aisles={aisles}
      />
    </>
  );
}