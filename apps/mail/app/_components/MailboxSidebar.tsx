"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { t, type Locale } from "@dusrel/locales";
import { Logo } from "@dusrel/brand";
import { Button, Field, Input } from "@dusrel/ui";

export type MailboxFolderId = "inbox" | "sent" | "drafts" | "archive" | "spam" | "trash";

export type MailboxFolder = {
  id: string;
  label: string;
  count: number;
};

const FOLDER_ICON_PATHS: Record<string, ReactNode> = {
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  sent: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  drafts: <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  archive: (
    <>
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </>
  ),
  spam: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
};

function FolderIcon({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400">
      {FOLDER_ICON_PATHS[id] ?? <rect x="3" y="3" width="18" height="18" rx="2" />}
    </svg>
  );
}

export function MailboxSidebar({
  locale,
  folders,
  activeId,
  onSelect,
  onCompose,
  onOpenPrivacyCenter,
  onCreateFolder,
  aliases,
  onCreateAlias,
  promo,
}: {
  locale: Locale;
  folders: MailboxFolder[];
  activeId: string;
  onSelect: (id: string) => void;
  onCompose: () => void;
  onOpenPrivacyCenter: () => void;
  onCreateFolder: (name: string) => void;
  aliases: string[];
  onCreateAlias: () => void;
  promo?: ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const closeDialog = () => {
    setDialogOpen(false);
    setFolderName("");
  };

  const submitFolder = (e: FormEvent) => {
    e.preventDefault();
    const name = folderName.trim();
    if (!name) return;
    onCreateFolder(name);
    closeDialog();
  };

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#121212] lg:w-64">
      <div className="px-4 pb-2 pt-4">
        <Logo label={t(locale, "shellAppName")} />
      </div>
      <div className="px-4 py-3">
        {/* Plain button, not @dusrel/ui Button: ui Button spreads props after
            its own className, so a w-full className would drop its base styles. */}
        <button type="button" onClick={onCompose} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
          + {t(locale, "shellCompose")}
        </button>
      </div>
      <button type="button" onClick={onOpenPrivacyCenter} className="flex w-full items-center justify-between border-y border-slate-200 px-4 py-2 text-left text-[15px] text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 focus-visible:ring-inset dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
        <span className="flex items-center gap-2">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span className="uppercase">{t(locale, "shellPrivacyCenter")}</span>
        </span>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-slate-400"><rect x="4" y="4" width="5" height="5" rx="1" /><rect x="9.5" y="4" width="5" height="5" rx="1" /><rect x="15" y="4" width="5" height="5" rx="1" /><rect x="4" y="9.5" width="5" height="5" rx="1" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><rect x="15" y="9.5" width="5" height="5" rx="1" /><rect x="4" y="15" width="5" height="5" rx="1" /><rect x="9.5" y="15" width="5" height="5" rx="1" /><rect x="15" y="15" width="5" height="5" rx="1" /></svg>
      </button>
      <div className="mt-4 flex items-center justify-between px-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(locale, "shellFolders")}</p>
        <button type="button" onClick={() => setDialogOpen(true)} aria-label={t(locale, "shellAddFolder")} className="rounded-md px-3 py-2 text-lg leading-none text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-300 dark:hover:bg-white/5">
          +
        </button>
      </div>
      <nav className="mt-1 px-2">
        {folders.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f.id)}
            aria-current={activeId === f.id ? "page" : undefined}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${activeId === f.id ? "bg-slate-100 font-medium text-slate-900 dark:bg-white/10 dark:text-[#e8eaed]" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"}`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <FolderIcon id={f.id} />
              <span className="truncate">{f.label}</span>
            </span>
            {f.count > 0 && <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">{f.count}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-4 flex items-center justify-between px-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(locale, "shellAliases")}</p>
        <button type="button" onClick={onCreateAlias} aria-label={t(locale, "shellAddAlias")} className="rounded-md px-3 py-2 text-lg leading-none text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-300 dark:hover:bg-white/5">
          +
        </button>
      </div>
      <div className="mt-1 px-2">
        {aliases.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">{t(locale, "shellNoAliases")}</p>
        ) : (
          <ul>
            {aliases.map((alias) => (
              <li key={alias} className="truncate px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                {alias}
              </li>
            ))}
          </ul>
        )}
      </div>
      {promo ? <div className="mt-auto border-t border-slate-200 px-4 py-4 dark:border-white/10">{promo}</div> : null}
      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label={t(locale, "shellCancel")} onClick={closeDialog} className="absolute inset-0 cursor-default bg-slate-900/40" />
          <div role="dialog" aria-modal="true" aria-label={t(locale, "shellCreateFolder")} className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "shellCreateFolder")}</h2>
            <form onSubmit={submitFolder} className="space-y-3">
              <Field label={t(locale, "shellFolderName")}>
                <Input autoFocus value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder={t(locale, "shellFolderNamePlaceholder")} />
              </Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={!folderName.trim()}>
                  {t(locale, "shellCreate")}
                </Button>
                <Button type="button" variant="secondary" onClick={closeDialog}>
                  {t(locale, "shellCancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
