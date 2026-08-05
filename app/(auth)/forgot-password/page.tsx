"use client";

import { forgotPasswordAction } from "@/actions/auth";
import BarLabel from "@/components/bar-label";
import Divider from "@/components/divider";
import FormTextInput from "@/components/form-text-input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const t = useTranslations("ForgotPassword");

  const onSubmit = (data: { email: string }) => {
    setError(null);
    startTransition(async () => {
      await forgotPasswordAction(data);
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="mb-6 text-2xl font-tight tracking-widest">
          {t("sentTitle")}
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          {t("sentBody")}
        </p>
        <Divider />
        <Link
          href="/login"
          className="text-blue hover:text-cream transition-colors"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <h1 className="font-tight font-bold text-2xl text-cream">CONDUIT</h1>
        <BarLabel className="text-sm tracking-wide text-sand">
          {t("subtitle")}
        </BarLabel>
      </div>

      <Divider />

      <div className="w-full px-6">
        <p className="mb-4 text-sm text-muted-foreground text-center">
          {t("description")}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormTextInput
            id="email"
            label={t("emailLabel")}
            type="email"
            field="email"
            register={register}
            errors={errors}
            validationOpts={{
              required: t("emailRequired"),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t("emailInvalidAddress"),
              },
            }}
            placeholder={t("emailPlaceholder")}
            symbol="@"
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-5 transition-colors hover:text-cream hover:border-cream"
            disabled={isPending}
          >
            {isPending ? t("forgotButtonLoading") : t("forgotButtonSubmit")}
          </Button>
        </form>
      </div>

      <Divider />

      <Link
        href="/login"
        className="text-blue hover:text-cream transition-colors"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
