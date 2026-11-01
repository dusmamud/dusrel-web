"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { t, type Locale } from "@dusrel/locales";
import { Badge, Input } from "@dusrel/ui";

export function MailboxTopBar({
  locale,
  value,
  onChange,
  onSubmit,
  displayName,
  email,
  onAddAccount,
  onOpenSettings,
  onLogout,
  counterpartHref,
  onMenu,
  inert,
}: {
  locale: Locale;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  displayName: string;
  email: string;
  onAddAccount: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  counterpartHref: string;
  onMenu?: () => void;
  inert?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (displayName.trim()[0] ?? email.trim()[0] ?? "?").toUpperCase();

  // Escape closes the avatar menu (backdrop click and item picks already do).
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const pick = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header inert={inert ? true : undefined} className="border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#121212]/85">
      <div className="flex items-center gap-3 px-4 py-3">
        {onMenu ? (
          <button type="button" onClick={onMenu} aria-label={t(locale, "shellMenu")} className="min-h-10 shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-base leading-none text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:border-white/20 dark:text-slate-300 lg:hidden">
            ☰
          </button>
        ) : null}
        <div className="flex-1 max-sm:hidden" />
        <form onSubmit={submitSearch} className="w-full max-w-[340px] flex-1 sm:flex-[2_1_0%]">
          <div className="relative">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t(locale, "shellSearchPlaceholder")} aria-label={t(locale, "shellSearchPlaceholder")} type="search" className="h-[42px] py-2.5 pl-10" />
          </div>
        </form>
        <div className="flex items-center justify-end gap-3">
          <Link href={counterpartHref} className="shrink-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:border-white/20 dark:text-slate-300">
            {locale === "en" ? t(locale, "shellLocaleHindi") : t(locale, "shellLocaleEnglish")}
          </Link>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t(locale, "shellAccountMenu")}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4d90fe] via-purple-400 to-pink-400 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50"
            >
              {initial}
            </button>
            {menuOpen ? (
              <>
                <button type="button" aria-label={t(locale, "shellCancel")} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]">
                  <div className="border-b border-slate-100 px-4 py-2 dark:border-white/10">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-[#e8eaed]">{displayName}</p>
                    <p className="truncate text-sm text-slate-600 dark:text-slate-400">{email}</p>
                  </div>
                  <button type="button" role="menuitem" onClick={pick(onAddAccount)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 focus-visible:ring-inset dark:text-slate-300 dark:hover:bg-white/5">
                    {t(locale, "shellAddAccount")}
                  </button>
                  <button type="button" role="menuitem" onClick={pick(onOpenSettings)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 focus-visible:ring-inset dark:text-slate-300 dark:hover:bg-white/5">
                    {t(locale, "shellSettings")}
                  </button>
                  <button type="button" role="menuitem" onClick={pick(onLogout)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 focus-visible:ring-inset dark:text-slate-300 dark:hover:bg-white/5">
                    {t(locale, "shellLogout")}
                  </button>
                  <button type="button" role="menuitem" disabled className="flex w-full cursor-not-allowed items-center justify-between px-4 py-2.5 text-left text-sm text-slate-500 opacity-50 dark:text-slate-400">
                    <span>{t(locale, "shellUpgrade")}</span>
                    <Badge>{t(locale, "shellComingSoon")}</Badge>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
