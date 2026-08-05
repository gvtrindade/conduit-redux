"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <Button
      onClick={handleSignOut}
    >
      Logout
    </Button>
  );
}
