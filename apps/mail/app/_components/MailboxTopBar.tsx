"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
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
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (displayName.trim()[0] ?? email.trim()[0] ?? "?").toUpperCase();

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const pick = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#121212]/85">
      <div className="flex items-center gap-3 px-4 py-3">
        {onMenu ? (
          <button type="button" onClick={onMenu} aria-label={t(locale, "shellMenu")} className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-base leading-none text-slate-700 dark:border-white/20 dark:text-slate-300 lg:hidden">
            ☰
          </button>
        ) : null}
        <div className="flex-1" />
        <form onSubmit={submitSearch} className="w-full max-w-[340px] flex-1">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t(locale, "shellSearchPlaceholder")} aria-label={t(locale, "shellSearchPlaceholder")} type="search" />
        </form>
        <div className="flex items-center justify-end gap-3">
          <Link href={counterpartHref} className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-white/20 dark:text-slate-300">
            {locale === "en" ? t(locale, "shellLocaleHindi") : t(locale, "shellLocaleEnglish")}
          </Link>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t(locale, "shellAccountMenu")}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4d90fe] via-purple-400 to-pink-400 text-sm font-semibold text-white hover:opacity-90"
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
                  <button type="button" role="menuitem" onClick={pick(onAddAccount)} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
                    {t(locale, "shellAddAccount")}
                  </button>
                  <button type="button" role="menuitem" onClick={pick(onOpenSettings)} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
                    {t(locale, "shellSettings")}
                  </button>
                  <button type="button" role="menuitem" onClick={pick(onLogout)} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
                    {t(locale, "shellLogout")}
                  </button>
                  <button type="button" role="menuitem" disabled className="flex w-full cursor-not-allowed items-center justify-between px-4 py-2 text-left text-sm text-slate-500 opacity-50 dark:text-slate-400">
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
