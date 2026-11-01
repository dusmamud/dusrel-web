"use client";
import { t, type Locale } from "@dusrel/locales";

export type MailboxRailItem = "mail" | "placeholder1" | "placeholder2";

export function MailboxRail({ locale, activeItem, onMail }: { locale: Locale; activeItem: MailboxRailItem; onMail?: () => void }) {
  const comingSoon = t(locale, "shellComingSoon");
  const soonLabel = t(locale, "shellSoon");
  return (
    <nav aria-label={t(locale, "shellMail")} className="flex h-full w-14 shrink-0 flex-col items-center gap-8 border-r border-slate-200 bg-slate-50 py-4 dark:border-white/10 dark:bg-[#121212]">
      <button
        type="button"
        onClick={onMail}
        aria-label={t(locale, "shellMail")}
        aria-current={activeItem === "mail" ? "page" : undefined}
        className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl text-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${
          activeItem === "mail" ? "font-medium text-slate-900 dark:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-300"
        }`}
      >
        <span aria-hidden="true">✉</span>
        <span className="text-xs leading-tight">{t(locale, "shellMail")}</span>
      </button>
      {(["placeholder1", "placeholder2"] as const).map((slot) => (
        <button
          key={slot}
          type="button"
          disabled
          title={comingSoon}
          aria-label={comingSoon}
          className="flex h-12 w-12 cursor-not-allowed flex-col items-center justify-center rounded-xl text-[22px] text-slate-400 opacity-50 dark:text-slate-500"
        >
          <span aria-hidden="true">○</span>
          <span className="text-xs leading-tight">{soonLabel}</span>
        </button>
      ))}
    </nav>
  );
}
