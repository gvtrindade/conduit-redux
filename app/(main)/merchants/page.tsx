import { getActiveSquad } from "@/actions/members";
import { getMerchants } from "@/actions/merchants";
import AddMerchantForm from "./components/add-merchant-form";
import ListLink from "@/components/list-link";
import PageHeader from "@/components/page-header";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Merchants() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const t = await getTranslations("MerchantsPage");

  const activeSquad = await getActiveSquad(session.user.id);
  const squad = activeSquad?.activeSquad;
  if (!squad) redirect("/profile");

  const res = await getMerchants(session.user.id, squad.id);
  const merchants = res?.error ? [] : res.merchants;

  return (
    <>
      <PageHeader title={t("title")} />

      <div className="flex flex-col gap-3">
        {merchants.length > 0 ? (
          merchants.map((merchant) => (
            <ListLink
              key={merchant.id}
              href={`/merchants/${merchant.id}`}
              label={merchant.name}
            />
          ))
        ) : (
          <div className="bg-panel border-2 border-border-custom rounded-2xl px-3.5 py-3.5 text-sm text-sand">
            {t("empty")}
          </div>
        )}

        <AddMerchantForm userId={session.user.id} squadId={squad.id} />
      </div>
    </>
  );
}