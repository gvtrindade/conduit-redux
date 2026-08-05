"use client";

import { signupAction } from "@/actions/auth";
import BarLabel from "@/components/bar-label";
import FormTextInput from "@/components/form-text-input";
import { PasswordStrength } from "@/components/password-strength";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Divider from "@/components/divider";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>();

  const t = useTranslations("Register");

  const onSubmit = (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setError(null);
    startTransition(async () => {
      const res = await signupAction({
        name: data.email.split("@")[0],
        email: data.email,
        password: data.password,
      });
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSent(true);
      }
    });
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="mb-6 text-2xl font-tight tracking-widest">
          {t("emailSentTitle")}
        </h1>
        <p>{t("emailSentBody1")}</p>
        <p>{t("emailSentBody2")}</p>
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
        <Image
          className="mb-3"
          width="80"
          height="80"
          src="logo.svg"
          alt="conduit logo"
        />
        <h1 className="font-tight font-bold text-2xl text-cream">CONDUIT</h1>
        <BarLabel className="text-sm tracking-wide text-sand">
          {t("subtitle")}
        </BarLabel>
      </div>

      <Divider />

      <div className="w-full px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormTextInput
            id="email"
            label={t("emailInputLabel")}
            type="email"
            field="email"
            register={register}
            errors={errors}
            validationOpts={{
              required: t("emailInputRequired"),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t("emailInputInvalidAddress"),
              },
            }}
            placeholder={t("emailInputPlaceholder")}
            symbol="@"
          />

          <div className="space-y-2">
            <FormTextInput
              id="password"
              label={t("passwordInputLabel")}
              type="password"
              field="password"
              register={register}
              errors={errors}
              validationOpts={{
                required: t("passwordInputRequired"),
                minLength: {
                  value: 8,
                  message: t("passwordInputMinLength"),
                },
                validate: (val: string) => {
                  if (!/[a-z]/.test(val)) return t("passwordInputLowercase");
                  if (!/[A-Z]/.test(val)) return t("passwordInputUppercase");
                  if (!/\d/.test(val)) return t("passwordInputNumber");
                  if (!/[^a-zA-Z0-9]/.test(val))
                    return t("passwordInputSymbol");
                  return true;
                },
              }}
              placeholder={t("passwordInputPlaceholder")}
              symbol="#"
            />
            <PasswordStrength value={watch("password") ?? ""} />
          </div>

          <FormTextInput
            id="confirmPassword"
            label={t("confirmPasswordInputLabel")}
            type="password"
            field="confirmPassword"
            register={register}
            errors={errors}
            validationOpts={{
              required: t("confirmPasswordInputRequired"),
              validate: (val: string) =>
                val === watch("password") || t("confirmPasswordMismatch"),
            }}
            placeholder={t("confirmPasswordInputPlaceholder")}
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
            {isPending
              ? t("registerButtonCreating")
              : t("registerButtonCreate")}
          </Button>
        </form>
      </div>

      <Divider />

      <p className="text-sm text-muted-foreground">
        {t("labelIsMember")}
        <Link
          href="/register"
          className="text-blue hover:text-cream transition-colors"
        >
          {t("lableAuthenticate")}
        </Link>
      </p>
    </div>
  );
}
