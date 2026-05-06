"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmEmail, resendConfirmation } from "@/lib/api/users";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Confirming your email...");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("This confirmation link is missing required information.");
      return;
    }

    let cancelled = false;
    confirmEmail(email, token)
      .then((res) => {
        if (cancelled) return;
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Confirmation failed.");
      });

    return () => {
      cancelled = true;
    };
  }, [email, token]);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendMessage(null);
    try {
      const res = await resendConfirmation(email);
      setResendMessage(res.message);
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : "Resend failed.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card-bg p-8 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-text-heading">
          {status === "verifying" && "Confirming email"}
          {status === "success" && "Email confirmed"}
          {status === "error" && "Confirmation failed"}
        </h1>
        <p className="mt-3 text-sm text-text-muted">{message}</p>

        {status === "success" && (
          <Link
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Continue to sign in
          </Link>
        )}

        {status === "error" && email && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full rounded-lg border border-border-strong bg-surface-alt px-4 py-3 text-sm font-semibold text-text-heading transition hover:bg-accent-soft disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend confirmation email"}
            </button>
            {resendMessage && (
              <p className="text-xs text-text-muted">{resendMessage}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
