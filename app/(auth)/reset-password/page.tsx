"use client";

import { resetPasswordAction } from "@/actions/auth";
import BarLabel from "@/components/bar-label";
import Divider from "@/components/divider";
import FormTextInput from "@/components/form-text-input";
import { PasswordStrength } from "@/components/password-strength";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ newPassword: string; confirmPassword: string }>();

  const t = useTranslations("ResetPassword");

  const onSubmit = (data: { newPassword: string }) => {
    if (!token) {
      setError(t("invalidTokenError"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await resetPasswordAction({
        token,
        newPassword: data.newPassword,
      });
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/login");
      }
    });
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="mb-6 text-2xl font-tight tracking-widest">
          {t("invalidLinkTitle")}
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          {t("invalidLinkDescription")}
        </p>
        <Divider />
        <Link
          href="/forgot-password"
          className="text-blue hover:text-cream transition-colors"
        >
          {t("requestNewLink")}
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormTextInput
              id="newPassword"
              label={t("newPasswordLabel")}
              type="password"
              field="newPassword"
              register={register}
              errors={errors}
              validationOpts={{
                required: t("newPasswordRequired"),
                minLength: {
                  value: 8,
                  message: t("newPasswordMinLength"),
                },
                validate: (val: string) => {
                  if (!/[a-z]/.test(val))
                    return t("newPasswordLowercase");
                  if (!/[A-Z]/.test(val))
                    return t("newPasswordUppercase");
                  if (!/\d/.test(val)) return t("newPasswordNumber");
                  if (!/[^a-zA-Z0-9]/.test(val))
                    return t("newPasswordSymbol");
                  return true;
                },
              }}
              placeholder={t("newPasswordPlaceholder")}
              symbol="#"
            />
            <PasswordStrength value={watch("newPassword") ?? ""} />
          </div>

          <FormTextInput
            id="confirmPassword"
            label={t("confirmPasswordLabel")}
            type="password"
            field="confirmPassword"
            register={register}
            errors={errors}
            validationOpts={{
              required: t("confirmPasswordRequired"),
              validate: (val: string) =>
                val === watch("newPassword") || t("confirmPasswordMismatch"),
            }}
            placeholder={t("confirmPasswordPlaceholder")}
            symbol="#"
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-blue border-2 border-[#4A7A8D] rounded-xl py-4 text-[13px] tracking-widest text-hull cursor-pointer mt-5 transition-colors hover:text-cream hover:border-cream"
            disabled={isPending}
          >
            {isPending ? t("resetButtonLoading") : t("resetButtonReset")}
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
