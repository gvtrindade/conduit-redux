import {
  getActiveSquad,
  getCallsign,
  getCrew,
  getCrewInvites,
  getMemberPreferences,
  getSquads,
} from "@/actions/members";
import CallsignForm from "@/components/callsign-form";
import ChangeCallsign from "@/components/change-callsign";
import CrewInvites from "@/components/crew-invites";
import CrewList from "@/components/crew-list";
import ListLink from "@/components/list-link";
import LogoutButton from "@/components/logout-button";
import SquadManager from "@/components/squad-manager";
import Topic from "@/components/topic";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const t = await getTranslations("Profile");

  const profile = {
    email: session.user.email,
    missions: "0",
    itemsTracked: "0",
    variance: "0",
  };
  const callsign = await getCallsign(session.user.id);
  const preferences = await getMemberPreferences(session.user.id);
  const hasCallsign = !!callsign?.callsign;
  const squads = hasCallsign ? await getSquads(session.user.id) : [];
  const activeSquad = hasCallsign
    ? await getActiveSquad(session.user.id)
    : null;
  const crew = activeSquad?.activeSquad
    ? await getCrew(session.user.id, activeSquad.activeSquad.id)
    : null;
  const invites = hasCallsign ? await getCrewInvites(session.user.id) : [];

  return (
    <>
      {/* Hero Card */}
      <div className="mt-4 bg-panel border-2 border-border-custom rounded-2xl">
        <div className="p-4.5 flex gap-4 items-start relative z-10">
          <div>
            <div className="font-tight text-md font-bold text-cream uppercase tracking-[0.04em] leading-none mb-1">
              {profile.email}
            </div>
            {hasCallsign && (
              <div className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-amber mb-1">
                {t("callsignLabel", {
                  callsign: String(callsign!.callsign),
                })}{" "}
              </div>
            )}
            <div className="text-xs text-sand mb-2">{profile.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-border-custom">
          <div className="py-2.5 px-3 text-center border-r border-border-custom">
            <span className="font-heading text-lg font-bold text-cream block leading-none">
              {profile.missions}
            </span>
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-sand block mt-1">
              {t("missions")}
            </span>
          </div>
          <div className="py-2.5 px-3 text-center border-r border-border-custom">
            <span className="font-heading text-lg font-bold text-cream block leading-none">
              {profile.itemsTracked}
            </span>
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-sand block mt-1">
              {t("itemsTracked")}
            </span>
          </div>
          <div className="py-2.5 px-3 text-center">
            <span className="font-heading text-lg font-bold text-green block leading-none">
              {profile.variance}
            </span>
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-sand block mt-1">
              {t("variance")}
            </span>
          </div>
        </div>
      </div>

      {!hasCallsign && (
        <Topic title={t("callsign")}>
          <CallsignForm userId={session.user.id} />
        </Topic>
      )}

      {invites.length > 0 && (
        <Topic title={t("invites")}>
          <CrewInvites
            userId={session.user.id}
            invites={invites.map((invite) => ({
              inviteId: invite.id,
              squadName: invite.squad.name ?? "",
            }))}
          />
        </Topic>
      )}

      <Topic title={t("merchants")}>
        <ListLink href="/merchants" label={t("manageMerchants")} />
      </Topic>

      <Topic title={t("systemPreferences")}>
        <div className="bg-panel border-2 border-border-custom rounded-2xl">
          {preferences?.customConfig ? (
            <div className="divide-y divide-border-custom">
              {Object.entries(
                preferences.customConfig as Record<string, unknown>,
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3.5 py-3.5"
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-sand">
                    {key}
                  </span>
                  <span className="font-mono text-sm text-cream">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3.5 py-3.5 text-sm text-sand">
              {t("noPreferencesSet")}
            </div>
          )}
        </div>
      </Topic>

      {hasCallsign && (
        <>
          <Topic title={t("squads")}>
            <SquadManager
              squads={squads}
              squadCount={squads.length}
              activeSquadId={activeSquad?.activeSquad?.id ?? null}
              userId={session.user.id}
            />
          </Topic>
          <Topic title={t("crew")}>
            {crew && activeSquad?.activeSquad ? (
              <CrewList
                userId={session.user.id}
                squadId={activeSquad.activeSquad.id}
                crew={crew.crew}
                invites={crew.invites}
                isCreator={crew.isCreator}
                myMemberId={preferences?.id ?? ""}
              />
            ) : (
              <div className="bg-panel border-2 border-border-custom rounded-2xl px-3.5 py-3.5 text-sm text-sand">
                {t("noActiveSquad")}
              </div>
            )}
          </Topic>
        </>
      )}

      <Topic title={t("dangerZone")} tone="danger">
        <div className="flex flex-col gap-4 text-left">
          {hasCallsign && <ChangeCallsign userId={session.user.id} />}
          <LogoutButton />
        </div>
      </Topic>
    </>
  );
}
