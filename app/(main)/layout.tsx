import { getActiveSquad } from "@/actions/members";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import SquadRealtime from "@/components/squad-realtime";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReactNode } from "react";

export default async function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const activeSquad = session?.user
    ? await getActiveSquad(session.user.id)
    : null;

  return (
    <div className="flex h-full flex-col">
      <SquadRealtime squadId={activeSquad?.activeSquad?.id ?? null} />
      <AppHeader squadName={activeSquad?.activeSquad?.name ?? null} />
      <div className="flex-1 px-6 overflow-x-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
