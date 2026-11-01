// Placeholder slots for download assets the user will add later.
// No store artwork, badge graphic, or external image is rendered here:
// each slot is a plain dashed slate box with a short label, so it is
// obviously a placeholder and never looks like a real store badge.
// These slots belong ONLY in the Settings → Download app section;
// the parent decides placement — they must never appear in the main
// mailbox flow. When a real asset arrives, pass its URL as `href`
// (the slot becomes a plain link) or replace the slot content.

import { t, type Locale } from "@dusrel/locales";

export type DownloadBadgeSlotProps = {
  /** Resolved label text (the caller resolves it via t(locale, key)). */
  label: string;
  /** If absent, the slot is a non-clickable placeholder. */
  href?: string;
};

/** One ~160x48 dashed placeholder box for a future download badge. */
export function DownloadBadgeSlot({ label, href }: DownloadBadgeSlotProps) {
  const boxClass =
    "flex h-12 w-40 items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 text-center text-xs leading-snug text-slate-500 dark:border-white/20 dark:text-slate-400";
  if (href) {
    return (
      <a href={href} className={`${boxClass} hover:underline`}>
        {label}
      </a>
    );
  }
  return (
    <span aria-disabled="true" className={boxClass}>
      {label}
    </span>
  );
}

export type DownloadSlotsProps = {
  locale: Locale;
};

/** Download-app placeholder section (Settings → Download app only). */
export function DownloadSlots({ locale }: DownloadSlotsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {t(locale, "downloadSlotsTitle")}
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <DownloadBadgeSlot label={t(locale, "downloadBadgeAppStore")} />
        <DownloadBadgeSlot label={t(locale, "downloadBadgeGooglePlay")} />
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {t(locale, "downloadSlotsNote")}
      </p>
    </section>
  );
}
