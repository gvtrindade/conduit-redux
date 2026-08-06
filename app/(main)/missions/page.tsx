import { getActiveSquad } from "@/actions/members";
import { getMissions } from "@/actions/missions";
import AddMissionButton from "./components/add-mission-button";
import MissionLink from "./components/mission-link";
import MissionsHeader from "./components/missions-header";
import Topic from "@/components/topic";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Missions() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const t = await getTranslations("MissionsPage");

  const activeSquad = await getActiveSquad(session.user.id);
  const squad = activeSquad?.activeSquad;
  if (!squad) redirect("/profile");

  const res = await getMissions(session.user.id, squad.id);
  const missions = res?.error ? [] : res.missions;

  const states = ["draft", "active", "finished"] as const;
  const byState = (state: string) => missions.filter((m) => m.state === state);

  return (
    <>
      <MissionsHeader />

      <div className="mt-5 flex flex-col gap-10">
        <AddMissionButton userId={session.user.id} squadId={squad.id} />

        {missions.length > 0 ? (
          states.map((state) => {
            const list = byState(state);
            if (list.length === 0) return null;

            return (
              <Topic key={state} title={t(`states.${state}`, { count: list.length })}>
                <div className="flex flex-col gap-3">
                  {list.map((mission) => (
                    <MissionLink
                      key={mission.id}
                      id={mission.id}
                      title={mission.title}
                      state={mission.state}
                      itemCount={mission._count.itemEstimates}
                    />
                  ))}
                </div>
              </Topic>
            );
          })
        ) : (
          <div className="bg-panel border-2 border-border-custom rounded-2xl px-3.5 py-3.5 text-sm text-sand">
            {t("empty")}
          </div>
        )}
      </div>
    </>
  );
}
