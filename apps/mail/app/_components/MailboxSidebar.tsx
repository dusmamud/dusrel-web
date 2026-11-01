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
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-slate-400">
      <path d="M2.5 10.8333V14.1667C2.5 15.5474 3.61929 16.6667 5 16.6667H15C16.3807 16.6667 17.5 15.5474 17.5 14.1667V10.8333M2.5 10.8333L4.72222 4.16667H15.2778L17.5 10.8333M2.5 10.8333H6.66667C7.58714 10.8333 8.33333 11.5795 8.33333 12.5C8.33333 13.4205 9.07952 14.1667 10 14.1667C10.9205 14.1667 11.6667 13.4205 11.6667 12.5C11.6667 11.5795 12.4129 10.8333 13.3333 10.8333H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sent: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-slate-400">
      <path d="M18.3334 1.66667L9.16675 10.8333M18.3334 1.66667L12.5001 18.3333L9.16675 10.8333M18.3334 1.66667L1.66675 7.50001L9.16675 10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  drafts: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-slate-400">
      <path d="M14.1667 2.5L17.5 5.83333L6.66667 16.6667H3.33333V13.3333L14.1667 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  archive: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-slate-400">
      <path d="M17.5 6.66667V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V6.66667M8.33333 10H11.6667M1.66667 3.33333H18.3333C18.7936 3.33333 19.1667 3.70643 19.1667 4.16667V5.83333C19.1667 6.29357 18.7936 6.66667 18.3333 6.66667H1.66667C1.20643 6.66667 0.833336 6.29357 0.833336 5.83333V4.16667C0.833336 3.70643 1.20643 3.33333 1.66667 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  spam: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-slate-400">
      <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.16667 4.16667L15.8333 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-slate-400">
      <path d="M2.5 5H17.5M15.8333 5V16.6667C15.8333 17.5871 15.0871 18.3333 14.1667 18.3333H5.83333C4.91286 18.3333 4.16667 17.5871 4.16667 16.6667V5M6.66667 5V3.33333C6.66667 2.41286 7.41286 1.66667 8.33333 1.66667H11.6667C12.5871 1.66667 13.3333 2.41286 13.3333 3.33333V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

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
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#121212] lg:w-64">
      {/* 1. App Logo */}
      <div className="px-4 pb-2 pt-4">
        <Logo label={t(locale, "shellAppName")} />
      </div>

      {/* 2. Atomic Style Compose Button */}
      <div className="px-4 py-3">
        <button
          data-testid="compose-button"
          type="button"
          onClick={onCompose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M9.9974 4.1665V15.8332M4.16406 9.99984H15.8307"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t(locale, "shellCompose")}</span>
        </button>
      </div>

      {/* 3. Atomic Style Privacy Center Button */}
      <button
        type="button"
        onClick={onOpenPrivacyCenter}
        aria-label="Privacy center"
        className="group mx-2 flex items-center justify-between rounded-lg border border-slate-200/60 px-3 py-2 text-left text-[13px] font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <span className="flex items-center gap-2.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            aria-hidden="true"
            className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
          >
            <path
              d="M14.1668 8.33333V6.66667C14.1668 4.36548 12.3013 2.5 10.0002 2.5C7.69898 2.5 5.8335 4.36548 5.8335 6.66667V8.33333M10.0002 12.0833V13.75M7.3335 17.5H12.6668C14.067 17.5 14.767 17.5 15.3018 17.2275C15.7722 16.9878 16.1547 16.6054 16.3943 16.135C16.6668 15.6002 16.6668 14.9001 16.6668 13.5V12.3333C16.6668 10.9332 16.6668 10.2331 16.3943 9.69836C16.1547 9.22795 15.7722 8.8455 15.3018 8.60582C14.767 8.33333 14.067 8.33333 12.6668 8.33333H7.3335C5.93336 8.33333 5.2333 8.33333 4.69852 8.60582C4.22811 8.8455 3.84566 9.22795 3.60598 9.69836C3.3335 10.2331 3.3335 10.9332 3.3335 12.3333V13.5C3.3335 14.9001 3.3335 15.6002 3.60598 16.135C3.84566 16.6054 4.22811 16.9878 4.69852 17.2275C5.2333 17.5 5.93336 17.5 7.3335 17.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t(locale, "shellPrivacyCenter")}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
        >
          <path d="M7.5 5L12.5 10L7.5 15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 4. Folders List Header */}
      <div className="mt-5 flex items-center justify-between px-4 pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t(locale, "shellFolders")}
        </p>
        <button
          type="button"
          data-testid="sidebar-folder-add"
          onClick={() => setDialogOpen(true)}
          aria-label={t(locale, "shellAddFolder")}
          className="flex h-5 w-5 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
        </button>
      </div>

      {/* 5. System & Custom Folders */}
      <nav className="space-y-0.5 px-2">
        {folders.map((f) => {
          const isActive = activeId === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              aria-current={isActive ? "page" : undefined}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${
                isActive
                  ? "bg-slate-100 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                {FOLDER_ICON_PATHS[f.id] ?? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                <span className="truncate">{f.label}</span>
              </span>

              {f.id === "inbox" ? (
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={handleRefresh}
                    title="Refresh"
                    className={`opacity-0 transition-opacity group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ${
                      refreshing ? "animate-spin opacity-100 text-[#4d90fe]" : ""
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </span>
                  {f.count > 0 && (
                    <span className="shrink-0 rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      {f.count}
                    </span>
                  )}
                </div>
              ) : f.count > 0 ? (
                <span className="shrink-0 rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  {f.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* 6. Aliases Section */}
      <div className="mt-5 flex items-center justify-between px-4 pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t(locale, "shellAliases")}
        </p>
        <button
          type="button"
          data-testid="sidebar-alias-add"
          onClick={onCreateAlias}
          aria-label={t(locale, "shellAddAlias")}
          className="flex h-5 w-5 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
        </button>
      </div>
      <div className="space-y-0.5 px-2">
        {aliases.length === 0 ? (
          <p className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
            {t(locale, "shellNoAliases")}
          </p>
        ) : (
          aliases.map((alias) => (
            <div
              key={alias}
              className="flex items-center gap-2 truncate rounded-lg px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#4d90fe]/80" />
              <span className="truncate">{alias}</span>
            </div>
          ))
        )}
      </div>

      {/* 7. Promo Banner (Sits above bottom) */}
      {promo ? (
        <div className="mt-auto border-t border-slate-200/60 p-3 dark:border-white/10">
          {promo}
        </div>
      ) : null}

      {/* 8. Add Folder Modal Dialog */}
      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t(locale, "shellCancel")}
            onClick={closeDialog}
            className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-xs"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(locale, "shellCreateFolder")}
            className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#1e1e1e]"
          >
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-[#e8eaed]">
              {t(locale, "shellCreateFolder")}
            </h2>
            <form onSubmit={submitFolder} className="space-y-4">
              <Field label={t(locale, "shellFolderName")}>
                <Input
                  autoFocus
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder={t(locale, "shellFolderNamePlaceholder")}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeDialog}>
                  {t(locale, "shellCancel")}
                </Button>
                <Button type="submit" disabled={!folderName.trim()}>
                  {t(locale, "shellCreate")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
