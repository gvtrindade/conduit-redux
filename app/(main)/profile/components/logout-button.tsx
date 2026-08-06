"use client";

import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ListButton from "@/components/list-button";

export default function LogoutButton({
  label,
}: {
  label?: string;
}) {
  const t = useTranslations("LogoutButton");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.refresh();
      router.push("/login");
    });
  }

  return (
    <ListButton
      tone="danger"
      label={label ?? t("label")}
      disabled={isPending}
      onClick={handleSignOut}
    />
  );
}