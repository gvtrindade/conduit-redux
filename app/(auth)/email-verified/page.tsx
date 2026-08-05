import Divider from "@/components/divider";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

export const metadata: Metadata = {
  title: "E-mail Verificado",
  description: "Seu e-mail foi verificado com sucesso",
  openGraph: {
    title: "E-mail Verificado",
    description: "Seu e-mail foi verificado com sucesso",
  },
};

export default function EmailVerifiedPage() {
  const t = useTranslations("EmailVerified");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <h1 className="text-2xl font-tight tracking-widest">
        {t("emailVerifiedTitle")}
      </h1>

      <Divider />

      <p className="text-center mb-6"> {t("emailVerifiedMessage")}</p>

      <Link
        href="/missions"
        className="text-blue hover:text-cream transition-colors"
      >
        {t("goToMissions")}
      </Link>
    </div>
  );
}
