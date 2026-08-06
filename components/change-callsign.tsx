"use client";

import CallsignForm from "@/components/callsign-form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ListButton from "./list-button";

export default function ChangeCallsign({ userId }: { userId: string }) {
  const t = useTranslations("ChangeCallsign");
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListButton label={t("label")} onClick={() => setOpen(!open)} />

      {open && (
        <div className="px-3.5 py-3.5 border-b border-red/20 last:border-b-0">
          <CallsignForm userId={userId} onSaved={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
