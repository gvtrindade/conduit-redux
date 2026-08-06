import { getActiveSquad } from "@/actions/members";
import {
  getAisleRules,
  getAisles,
  getMerchant,
  getMerchantReceipts,
  getMissionItems,
} from "@/actions/merchants";
import MerchantContent from "./components/merchant-content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function MerchantPage({
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

  const merchant = await getMerchant(session.user.id, squad.id, id);
  if (!merchant) notFound();

  const [aislesRes, rulesRes, missionItemsRes, receiptsRes] =
    await Promise.all([
      getAisles(session.user.id, squad.id, merchant.id),
      getAisleRules(session.user.id, squad.id, merchant.id),
      getMissionItems(session.user.id, squad.id),
      getMerchantReceipts(session.user.id, squad.id, merchant.id),
    ]);

  return (
    <MerchantContent
      userId={session.user.id}
      squadId={squad.id}
      merchantId={merchant.id}
      merchantName={merchant.name}
      aisles={aislesRes?.error ? [] : aislesRes.aisles}
      rules={rulesRes?.error ? [] : rulesRes.rules}
      missionItems={missionItemsRes.items}
      receipts={
        receiptsRes?.error
          ? []
          : receiptsRes.receipts.map((receipt) => ({
              ...receipt,
              date: receipt.date.toISOString().slice(0, 10),
            }))
      }
    />
  );
}