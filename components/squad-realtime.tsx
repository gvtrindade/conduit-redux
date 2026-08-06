"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SquadRealtime({
  squadId,
}: {
  squadId: string | null;
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!squadId) return;

    const events = new EventSource("/api/realtime");

    const onMessage = () => {
      if (timer.current) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        router.refresh();
      }, 100);
    };

    events.onmessage = onMessage;

    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      events.close();
    };
  }, [squadId, router]);

  return null;
}