"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { clearDemoSession, getDemoSession } from "@dusrel/auth";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Logo, ThemeToggle } from "@dusrel/brand";
import { Button } from "@dusrel/ui";

const NAV: { key: string; path: string }[] = [
  { key: "accountHome", path: "/" },
  { key: "profile", path: "/profile" },
  { key: "changePassword", path: "/password" },
  { key: "twoFactor", path: "/two-factor" },
  { key: "recovery", path: "/recovery" },
  { key: "devices", path: "/sessions" },
  { key: "appPasswords", path: "/app-passwords" },
];

export function AccountShell({ children, currentPath, locale, requireSession = true }: { children: ReactNode; currentPath: string; locale: Locale; requireSession?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (requireSession && !getDemoSession()) {
      router.push(localePath(locale, "/login"));
    }
  }, [locale, requireSession, router]);
  if (requireSession && !getDemoSession()) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-slate-600 dark:text-slate-400">{t(locale, "signInTitle")}</div>;
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#121212]/85">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href={localePath(locale, "/")}>
            <Logo label={t(locale, "accountName")} />
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <Link href={counterpartPath(locale, currentPath)} className="rounded-lg border border-slate-300 dark:border-white/20 px-3 py-1.5 text-sm">
            {locale === "en" ? "हिन्दी" : "English"}
          </Link>
          {requireSession && (
            <Button
              variant="secondary"
              onClick={() => {
                clearDemoSession();
                router.push(localePath(locale, "/login"));
              }}
            >
              {t(locale, "logout")}
            </Button>
          )}
        </div>
        <div className="border-t border-slate-100 dark:border-white/10 bg-blue-50 dark:bg-blue-950 px-4 py-2 text-center text-xs text-blue-900 dark:text-blue-200">{t(locale, "demoAccountNote")}</div>
      </header>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {NAV.map((item) => (
              <Link key={item.path} href={localePath(locale, item.path)} className={`rounded-lg px-3 py-2 text-sm ${currentPath === localePath(locale, item.path) ? "bg-[#4d90fe]/10 font-medium text-[#2f6fd6] dark:text-blue-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                {t(locale, item.key)}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] p-4">{children}</main>
      </div>
    </div>
  );
}
