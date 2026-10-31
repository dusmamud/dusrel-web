"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ACCOUNT_HOME, getDemoSession, setDemoSession, validateReturnTo } from "@dusrel/auth";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Button, Field, Input } from "@dusrel/ui";

function goAfterAuth(returnToRaw: string | null, locale: Locale, router: ReturnType<typeof useRouter>) {
  if (!returnToRaw) {
    router.push(localePath(locale, "/"));
    return;
  }
  const validated = validateReturnTo(returnToRaw);
  // Development-only mapping: in a local dev run, a production return_to
  // for the mail product is mapped to the local mail dev server so the
  // loop can be tried end-to-end. This branch is removed from the
  // production static build because NODE_ENV is "production" there.
  if (process.env.NODE_ENV === "development" && validated.startsWith("https://mail.dusrel.com")) {
    const path = new URL(validated).pathname;
    window.location.href = `http://localhost:3000${path}`;
    return;
  }
  if (validated === ACCOUNT_HOME) {
    router.push(localePath(locale, "/"));
    return;
  }
  window.location.href = validated;
}

function AuthLayout({ children, currentPath, locale, title }: { children: React.ReactNode; currentPath: string; locale: Locale; title: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{t(locale, "demoAccountNote")}</p>
      <div className="mt-6">{children}</div>
      <p className="mt-6 text-sm">
        <a href={counterpartPath(locale, currentPath)} className="text-[#2f6fd6] hover:underline">
          {locale === "en" ? "हिन्दी" : "English"}
        </a>
      </p>
    </div>
  );
}

export function LoginForm({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToRaw = searchParams.get("return_to");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (getDemoSession()) goAfterAuth(returnToRaw, locale, router);
    // Only on mount: an already-signed-in user is sent onward, per docs/28.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AuthLayout currentPath={currentPath} locale={locale} title={t(locale, "signInTitle")}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setDemoSession(email);
          goAfterAuth(returnToRaw, locale, router);
        }}
      >
        <Field label={t(locale, "email")}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </Field>
        <Field label={t(locale, "password")}>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </Field>
        <Button type="submit">{t(locale, "signIn")}</Button>
      </form>
      <p className="mt-4 text-sm">
        <a href={localePath(locale, "/forgot-password")} className="text-[#2f6fd6] hover:underline">
          {t(locale, "forgotPassword")}
        </a>{" "}
        ·{" "}
        <a href={localePath(locale, "/signup")} className="text-[#2f6fd6] hover:underline">
          {t(locale, "signUpTitle")}
        </a>
      </p>
    </AuthLayout>
  );
}

export function SignupForm({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToRaw = searchParams.get("return_to");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthLayout currentPath={currentPath} locale={locale} title={t(locale, "signUpTitle")}>
      <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{t(locale, "inviteOnlyNote")}</p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!invite.trim()) {
            setError(t(locale, "inviteOnlyNote"));
            return;
          }
          setDemoSession(email);
          goAfterAuth(returnToRaw, locale, router);
        }}
      >
        <Field label={t(locale, "email")}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </Field>
        <Field label={t(locale, "password")}>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </Field>
        <Field label={t(locale, "inviteCode")}>
          <Input value={invite} onChange={(e) => setInvite(e.target.value)} />
        </Field>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit">{t(locale, "signUpTitle")}</Button>
      </form>
    </AuthLayout>
  );
}

export function ForgotForm({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout currentPath={currentPath} locale={locale} title={t(locale, "forgotPassword")}>
      <p className="mb-4 text-sm text-gray-600">{t(locale, "forgotPasswordNote")}</p>
      {sent ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{t(locale, "resetLinkSent")}</p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label={t(locale, "email")}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Field>
          <Button type="submit">{t(locale, "forgotPassword")}</Button>
        </form>
      )}
    </AuthLayout>
  );
}
