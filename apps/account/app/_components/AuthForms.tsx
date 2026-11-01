"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ACCOUNT_HOME,
  AUTH_API_URL,
  getDemoSession,
  getStoredToken,
  loginUser,
  signupUser,
  validateReturnTo,
} from "@dusrel/auth";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Logo, ThemeToggle } from "@dusrel/brand";
import { Button, Field, Input } from "@dusrel/ui";

function goAfterAuth(returnToRaw: string | null, locale: Locale, router: ReturnType<typeof useRouter>) {
  if (!returnToRaw) {
    router.push(localePath(locale, "/"));
    return;
  }
  const validated = validateReturnTo(returnToRaw);
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
      <div className="mb-8 flex items-center justify-between">
        <Logo label={t(locale, "accountName")} />
        <ThemeToggle />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t(locale, "demoAccountNote")}</p>
      <div className="mt-6">{children}</div>
      <p className="mt-6 text-sm">
        <a href={counterpartPath(locale, currentPath)} className="text-[#2f6fd6] dark:text-blue-300 hover:underline">
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getStoredToken() || getDemoSession()) goAfterAuth(returnToRaw, locale, router);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({
        email: email.trim(),
        password,
        returnTo: returnToRaw ?? undefined,
      });
      goAfterAuth(res.redirectTo || returnToRaw, locale, router);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout currentPath={currentPath} locale={locale} title={t(locale, "signInTitle")}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label={t(locale, "email")}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@dusrel.com" required />
        </Field>
        <Field label={t(locale, "password")}>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </Field>
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "..." : t(locale, "signIn")}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <a href={localePath(locale, "/forgot-password")} className="text-[#2f6fd6] dark:text-blue-300 hover:underline">
          {t(locale, "forgotPassword")}
        </a>{" "}
        ·{" "}
        <a href={localePath(locale, "/signup")} className="text-[#2f6fd6] dark:text-blue-300 hover:underline">
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(locale === "hi" ? "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए" : "Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      const res = await signupUser({
        displayName: email.split("@")[0],
        email: email.trim(),
        inviteCode: invite.trim() || undefined,
        password,
        returnTo: returnToRaw ?? undefined,
      });
      goAfterAuth(res.redirectTo || returnToRaw, locale, router);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout currentPath={currentPath} locale={locale} title={t(locale, "signUpTitle")}>
      <p className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">{t(locale, "inviteOnlyNote")}</p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label={t(locale, "email")}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@dusrel.com" required />
        </Field>
        <Field label={t(locale, "password")}>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </Field>
        <Field label={t(locale, "inviteCode")}>
          <Input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="(Optional in Beta)" />
        </Field>
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "..." : t(locale, "signUpTitle")}
        </Button>
      </form>
    </AuthLayout>
  );
}

export function ForgotForm({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch(`${AUTH_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      // Never enumerate: always show success message
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout currentPath={currentPath} locale={locale} title={t(locale, "forgotPassword")}>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t(locale, "forgotPasswordNote")}</p>
      {sent ? (
        <p className="rounded-lg bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-800 dark:text-green-200">{t(locale, "resetLinkSent")}</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label={t(locale, "email")}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@dusrel.com" required />
          </Field>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "..." : t(locale, "forgotPassword")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
