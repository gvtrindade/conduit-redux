"use client";

import BarLabel from "@/components/bar-label";
import FormTextInput from "@/components/form-text-input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Divider from "@/components/divider";

const version = process.env.VERSION || "0.0.0";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const t = useTranslations("Login");

  const email = watch("email");

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setEmailNotVerified(false);
    setIsPending(true);
    const { error: authError } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    setIsPending(false);
    if (authError) {
      if (authError.status === 403) {
        setEmailNotVerified(true);
        setError(t("errorEmailNotVerified"));
      } else {
        setError(authError.message ?? t("errorInvalidEmailOrPass"));
      }
    } else {
      router.replace("/missions");
    }
  };

  const handleResendVerification = async () => {
    setResendState("sending");
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendState("sent");
      } else {
        setResendState("error");
      }
    } catch {
      setResendState("error");
    }
  };

  const handleLoginWithGoogle = () =>
    authClient.signIn.social({ provider: "google" });

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
            label="EMAIL"
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

          <div className="space-y-2 relative">
            <Link
              href="/forgot-password"
              className="absolute top-1 right-0 text-xs text-blue hover:text-cream transition-colors"
            >
              {t("labelRecoverAccess")}
            </Link>
            <FormTextInput
              id="password"
              label={t("passwordInputLabel")}
              type="password"
              field="password"
              register={register}
              errors={errors}
              validationOpts={{
                required: t("passwordInputRequired"),
              }}
              placeholder={t("passwordInputPlaceholder")}
              symbol="#"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          {emailNotVerified && (
            <div className="text-center space-y-2">
              {resendState === "sent" ? (
                <p className="text-sm text-green-600">
                  {t("validationEmailSentSuccess")}
                </p>
              ) : resendState === "error" ? (
                <p className="text-sm text-destructive">
                  {t("validationEmailSentFail")}
                </p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={resendState === "sending"}
                  onClick={handleResendVerification}
                >
                  {resendState === "sending"
                    ? t("validationEmailSending")
                    : t("resendValidationEmail")}
                </Button>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber border-2 border-[#C07830] rounded-xl py-6 font-bold tracking-widest text-hull hover:text-cream hover:border-cream transition-colors cursor-pointer"
          >
            {isPending ? t("loginButtonLoading") : t("loginButtonLogin")}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-3.5">
          <div className="flex-1 h-px bg-border-custom" />
          <span className="text-[9px] tracking-[0.14em] text-sand">
            {t("labelOr")}
          </span>
          <div className="flex-1 h-px bg-border-custom" />
        </div>

        {/* Login with google button */}
        <Button
          variant="outline"
          onClick={handleLoginWithGoogle}
          className="w-full mb-6 bg-panel border-[1.5px] border-border-custom rounded-xl py-6 font-bold text-sand cursor-pointer text-center hover:border-blue hover:text-cream transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t("loginWithGoogleButton")}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm tracking-wider text-sand">
          {t("labelNoCredentials")}
          <Link
            href="/register"
            className="text-blue hover:text-cream transition-colors"
          >
            {t("linkRequestClearance")}
          </Link>
        </p>
      </div>

      <div className="text-center pt-4 mt-4 text-sm text-panel2">
        <p>
          CONDUIT v{version} &#47;&#47; {t("labelSecureChannel")}
        </p>
        <p className="mt-0.5">{t("labelAllLogs")}</p>
      </div>
    </div>
  );
}
