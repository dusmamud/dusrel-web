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

  // Escape closes the avatar menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Global Ctrl+K / Cmd+K focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.getElementById("input-search-messages");
        if (input) input.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const pick = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header
      inert={inert ? true : undefined}
      className="border-b border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#121212]"
    >
      <div className="flex h-14 items-center gap-3 px-4">
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            aria-label={t(locale, "shellMenu")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}

        {/* Search Engine Field */}
        <form onSubmit={submitSearch} className="w-full max-w-[420px] flex-1">
          <div className="relative flex items-center">
            {/* Search Magnifier */}
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 text-slate-400"
            >
              <circle cx="9" cy="9" r="6" />
              <line x1="14" y1="14" x2="18.5" y2="18.5" />
            </svg>

            <input
              id="input-search-messages"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t(locale, "shellSearchPlaceholder")}
              aria-label={t(locale, "shellSearchPlaceholder")}
              type="text"
              autoComplete="off"
              className="h-9 w-full rounded-lg border border-slate-200/80 bg-slate-50/80 py-1.5 pl-9 pr-14 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#4d90fe] focus:bg-white focus:ring-2 focus:ring-[#4d90fe]/25 dark:border-white/10 dark:bg-white/5 dark:text-[#e8eaed] dark:placeholder:text-slate-500 dark:focus:border-[#4d90fe] dark:focus:bg-[#181818]"
            />

            {/* Shortcut hint / clear */}
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <div className="pointer-events-none absolute right-2.5 hidden sm:flex items-center">
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  Ctrl K
                </kbd>
              </div>
            )}
          </div>
        </form>

        <div className="flex-1" />

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          <Link
            href={counterpartHref}
            className="hidden sm:inline-flex shrink-0 items-center rounded-lg border border-slate-200/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {locale === "en" ? t(locale, "shellLocaleHindi") : t(locale, "shellLocaleEnglish")}
          </Link>

          {/* User Profile Avatar & Popover */}
          <div className="relative shrink-0">
            <button
              data-testid="avatar-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t(locale, "shellAccountMenu")}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full p-0.5 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50"
              style={{
                background:
                  "radial-gradient(155.92% 155.92% at 81.25% 117.5%, rgb(252, 125, 255) 17.29%, rgb(255, 237, 145) 75.93%)",
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full border border-white/60 bg-slate-900/40 text-xs font-semibold text-white">
                {initial}
              </div>
            </button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  aria-label={t(locale, "shellCancel")}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#1e1e1e]"
                >
                  {/* User Card */}
                  <div className="flex items-center gap-3 p-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-0.5"
                      style={{
                        background:
                          "radial-gradient(155.92% 155.92% at 81.25% 117.5%, rgb(252, 125, 255) 17.29%, rgb(255, 237, 145) 75.93%)",
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/80 bg-slate-900/40 text-lg font-semibold text-white">
                        {initial}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {email}
                      </p>
                    </div>
                  </div>

                  <hr className="my-1 border-slate-100 dark:border-white/10" />

                  {/* Menu Options */}
                  <div className="py-1 space-y-0.5">
                    <button
                      data-testid="menu-add-new-account"
                      type="button"
                      role="menuitem"
                      onClick={pick(onAddAccount)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{t(locale, "shellAddAccount")}</span>
                    </button>

                    <button
                      data-testid="menu-settings"
                      type="button"
                      role="menuitem"
                      onClick={pick(onOpenSettings)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.6 12.3a1 1 0 01.3 1.3l.1.1a1.5 1.5 0 11-2.1 2.1l-.1-.1a1 1 0 01-1.3-.3 1 1 0 01-.7.7v.2a1.5 1.5 0 11-3 0v-.2a1 1 0 01-.7-.7 1 1 0 01-1.3.3l-.1.1a1.5 1.5 0 11-2.1-2.1l.1-.1a1 1 0 01.3-1.3 1 1 0 01-.7-.7h-.2a1.5 1.5 0 110-3h.2a1 1 0 01.7-.7 1 1 0 01-.3-1.3l-.1-.1a1.5 1.5 0 112.1-2.1l.1.1a1 1 0 011.3.3 1 1 0 01.7-.7v-.2a1.5 1.5 0 113 0v.2a1 1 0 01.7.7 1 1 0 011.3-.3l.1-.1a1.5 1.5 0 112.1 2.1l-.1.1a1 1 0 01-.3 1.3 1 1 0 01.7.7h.2a1.5 1.5 0 110 3h-.2a1 1 0 01-.7.7z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{t(locale, "shellSettings")}</span>
                    </button>

                    <button
                      data-testid="menu-logout"
                      type="button"
                      role="menuitem"
                      onClick={pick(onLogout)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M13.3 14.2L17.5 10m0 0L13.3 5.8M17.5 10H7.5M10 14.2v.4a2.5 2.5 0 01-2.5 2.5H6.7a3 3 0 01-3-3V6.7a3 3 0 013-3h.8A2.5 2.5 0 0110 6.2v.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{t(locale, "shellLogout")}</span>
                    </button>
                  </div>

                  <hr className="my-1 border-slate-100 dark:border-white/10" />

                  {/* Upgrade CTA */}
                  <div className="p-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      <span>{t(locale, "shellUpgrade")}</span>
                      <span className="rounded bg-[#4d90fe] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        PLUS
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
