"use client";
import { t, type Locale } from "@dusrel/locales";

export type MailboxRailItem = "mail" | "placeholder1" | "placeholder2";

export function MailboxRail({ locale, activeItem }: { locale: Locale; activeItem: MailboxRailItem }) {
  const comingSoon = t(locale, "shellComingSoon");
  const soonLabel = t(locale, "shellSoon");
  return (
    <nav aria-label={t(locale, "shellMail")} className="flex h-full w-10 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-slate-50 py-3 dark:border-white/10 dark:bg-[#121212]">
      <button
        type="button"
        aria-label={t(locale, "shellMail")}
        aria-current={activeItem === "mail" ? "page" : undefined}
        className={`flex h-10 w-10 flex-col items-center justify-center rounded-xl text-base ${
          activeItem === "mail" ? "bg-[#4d90fe]/10 font-medium text-[#2f6fd6] dark:text-blue-300" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
        }`}
      >
        <span aria-hidden="true">✉</span>
        <span className="text-[10px] leading-tight">{t(locale, "shellMail")}</span>
      </button>
      {(["placeholder1", "placeholder2"] as const).map((slot) => (
        <button
          key={slot}
          type="button"
          disabled
          title={comingSoon}
          aria-label={comingSoon}
          className="flex h-10 w-10 cursor-not-allowed flex-col items-center justify-center rounded-xl text-slate-400 opacity-50 dark:text-slate-500"
        >
          <span aria-hidden="true">○</span>
          <span className="text-[10px] leading-tight">{soonLabel}</span>
        </button>
      ))}
    </nav>
  );
}
