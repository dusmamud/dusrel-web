"use client";

import { useState } from "react";
import type { FolderId, MailMessage } from "@dusrel/api-client";
import { t, type Locale } from "@dusrel/locales";
import { Button } from "@dusrel/ui";
import { formatMessageTime, splitSender } from "./MessageList";

export interface ReadingViewProps {
  locale: Locale;
  message: MailMessage;
  onBack: () => void;
  onReply: () => void;
  onForward: () => void;
  onTrash: () => void;
  onJunk: () => void;
  onMove: (folder: FolderId) => void;
  onToggleStar: () => void;
  onToggleRead: () => void;
  onBlock: () => void;
  onPrint: () => void;
}

const MOVE_FOLDERS: FolderId[] = ["inbox", "sent", "drafts", "archive", "spam", "trash"];

const FOLDER_LABEL_KEY: Record<FolderId, string> = {
  inbox: "msgFolderInbox",
  sent: "msgFolderSent",
  drafts: "msgFolderDrafts",
  archive: "msgFolderArchive",
  spam: "msgFolderSpam",
  trash: "msgFolderTrash",
};

// Ghost toolbar styling, copied exactly from the shared ui Button ghost
// variant. Plain buttons are used here (not ui Button) because ui Button
// spreads props after its own className, so a caller className would drop
// the base styles — and the focus-visible ring below needs a className.
const TOOLBAR_BTN =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-300 dark:hover:bg-white/5";

export function ReadingView({
  locale,
  message,
  onBack,
  onReply,
  onForward,
  onTrash,
  onJunk,
  onMove,
  onToggleStar,
  onToggleRead,
  onBlock,
  onPrint,
}: ReadingViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const sender = splitSender(message.from);

  const closeMenu = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="w-full bg-white px-4 py-4 text-slate-900 dark:bg-[#121212] dark:text-[#e8eaed]">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
        <button type="button" onClick={onBack} aria-label={t(locale, "msgBack")} className={TOOLBAR_BTN}>
          ← {t(locale, "msgBack")}
        </button>
        <button type="button" onClick={onTrash} aria-label={t(locale, "msgMoveToTrash")} className={TOOLBAR_BTN}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          {t(locale, "msgTrash")}
        </button>
        <button type="button" onClick={onJunk} aria-label={t(locale, "msgMoveToJunk")} className={TOOLBAR_BTN}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          {t(locale, "msgJunk")}
        </button>
        <div className="relative" onKeyDown={(e) => { if (e.key === "Escape") setMoveMenuOpen(false); }}>
          <button
            type="button"
            onClick={() => setMoveMenuOpen((open) => !open)}
            aria-label={t(locale, "msgMoveTo")}
            aria-expanded={moveMenuOpen}
            aria-haspopup="menu"
            className={TOOLBAR_BTN}
          >
            {t(locale, "msgMoveTo")} ▾
          </button>
          {moveMenuOpen ? (
            <>
              <button type="button" aria-label={t(locale, "shellCancel")} onClick={() => setMoveMenuOpen(false)} className="fixed inset-0 z-40 cursor-default" />
              <div role="menu" className="absolute left-0 z-50 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]">
                {MOVE_FOLDERS.map((folder) => (
                  <button
                    key={folder}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoveMenuOpen(false);
                      onMove(folder);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    {t(locale, FOLDER_LABEL_KEY[folder])}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <button type="button" onClick={onToggleStar} className={TOOLBAR_BTN}>
          {message.starred ? `★ ${t(locale, "msgUnstar")}` : `☆ ${t(locale, "msgStar")}`}
        </button>
        <div className="relative" onKeyDown={(e) => { if (e.key === "Escape") setMenuOpen(false); }}>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={t(locale, "msgMoreActions")} className={TOOLBAR_BTN}>
            …
          </button>
          {menuOpen ? (
            <>
              <button type="button" aria-label={t(locale, "shellCancel")} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 cursor-default" />
              <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]">
              <button
                type="button"
                onClick={closeMenu(onToggleRead)}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
              >
                {message.read ? t(locale, "msgMarkUnread") : t(locale, "msgMarkRead")}
              </button>
              <button
                type="button"
                onClick={closeMenu(onBlock)}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
              >
                {t(locale, "msgBlockSender")}
              </button>
              <button
                type="button"
                onClick={closeMenu(onPrint)}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
              >
                {t(locale, "msgPrint")}
              </button>
            </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-300 text-base font-semibold text-white">
          {(sender.name.charAt(0) || "?").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] text-slate-900 dark:text-[#e8eaed]">
            <span className="font-semibold">{sender.name}</span>
            {sender.address ? <span className="text-slate-500 dark:text-slate-400"> {sender.address}</span> : null}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {t(locale, "msgTo")}: {message.to} ▾
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">{formatMessageTime(message.date, locale)}</span>
          <button
            type="button"
            aria-label={message.starred ? t(locale, "msgUnstar") : t(locale, "msgStar")}
            onClick={onToggleStar}
            className={`rounded text-lg leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${message.starred ? "text-yellow-500" : "text-slate-400 hover:text-yellow-500"}`}
          >
            {message.starred ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div className="mt-4 bg-slate-100 px-2 py-6 sm:px-4 dark:bg-white/5">
        <div className="mx-auto max-w-[680px] rounded-xl bg-white px-4 py-6 shadow-sm sm:px-6 dark:bg-[#1e1e1e]">
          <h1 className="text-2xl font-bold">{message.subject}</h1>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed">{message.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={onReply}>{t(locale, "msgReply")}</Button>
            <Button variant="secondary" onClick={onForward}>
              {t(locale, "msgForward")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
