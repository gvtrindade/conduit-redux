import { getActiveSquad } from "@/actions/members";
import { getMerchants } from "@/actions/merchants";
import { getMission, getMissionItemBank } from "@/actions/missions";
import MissionContent from "@/components/mission-content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

function formatCurrency(value: number) {
    return `R$ ${value.toFixed(2)}`;
}

export default async function MissionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const { id } = await params;

    const activeSquad = await getActiveSquad(session.user.id);
    const squad = activeSquad?.activeSquad;
    if (!squad) redirect("/profile");

    const [mission, bank, merchantsRes] = await Promise.all([
        getMission(session.user.id, squad.id, id),
        getMissionItemBank(session.user.id, squad.id),
        getMerchants(session.user.id, squad.id),
    ]);
    if (!mission) notFound();

    return (
        <MissionContent
            userId={session.user.id}
            squadId={squad.id}
            missionId={mission.id}
            missionTitle={mission.title || mission.id}
            missionState={mission.state}
            estimatedTotal={formatCurrency(mission.estimatedTotal)}
            completion={mission.completion}
            merchant={mission.merchant}
            itemEstimates={mission.itemEstimates.map((estimate) => ({
                id: estimate.id,
                title: estimate.title,
                category: estimate.category,
                estValue: formatCurrency(estimate.estValue),
                complete: estimate.complete,
            }))}
            missionItems={bank?.error ? [] : bank.items}
            aisles={bank?.error ? [] : bank.aisles}
            missionItemIds={mission.itemEstimates.map(
                (estimate) => estimate.missionItemId,
            )}
            merchants={merchantsRes?.error ? [] : merchantsRes.merchants}
        />
    );
}