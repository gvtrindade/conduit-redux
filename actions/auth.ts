"use server";

import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(data: { email: string; password: string }) {
  return Sentry.withServerActionInstrumentation("loginAction", async () => {
    try {
      await auth.api.signInEmail({
        body: { email: data.email, password: data.password },
        headers: await headers(),
      });
    } catch (error) {
      const err = error as { body?: { message?: string } };
      return { error: err?.body?.message ?? "Invalid email or password" };
    }
    redirect("/eventos");
  });
}

export async function signupAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  return Sentry.withServerActionInstrumentation("signupAction", async () => {
    try {
      await auth.api.signUpEmail({
        body: { name: data.name, email: data.email, password: data.password },
        headers: await headers(),
      });
      return { success: true };
    } catch (error) {
      const err = error as { body?: { message?: string } };
      return { error: err?.body?.message ?? "Failed to create account" };
    }
  });
}

export async function forgotPasswordAction(data: { email: string }) {
  return Sentry.withServerActionInstrumentation(
    "forgotPasswordAction",
    async () => {
      await auth.api.requestPasswordReset({
        body: {
          email: data.email,
          redirectTo: `${process.env.NEXT_APPLICATION_URL}/reset-password`,
        },
      });
      return { success: true };
    },
  );
}

export async function resetPasswordAction(data: {
  token: string;
  newPassword: string;
}) {
  return Sentry.withServerActionInstrumentation(
    "resetPasswordAction",
    async () => {
      try {
        await auth.api.resetPassword({
          body: { newPassword: data.newPassword, token: data.token },
        });
        return { success: true };
      } catch (error) {
        const err = error as { body?: { message?: string } };
        return {
          error: err?.body?.message ?? "Invalid or expired reset token",
        };
      }
    },
  );
}
