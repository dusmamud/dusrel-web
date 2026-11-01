"use client";

import { useState } from "react";
import type { FolderId, MailMessage } from "@dusrel/api-client";
import { t, type Locale } from "@dusrel/locales";
import { avatarGradient, formatMessageTime, splitSender } from "./MessageList";

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
  hour24?: boolean;
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

const TOOLBAR_BTN =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-300 dark:hover:bg-white/5";

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
  hour24,
}: ReadingViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const sender = splitSender(message.from);
  const initial = (sender.name.charAt(0) || "?").toUpperCase();

  const closeMenu = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="w-full bg-white px-5 py-4 text-slate-900 dark:bg-[#181818] dark:text-[#eaebed]">
      {/* 1. Atomic Style Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-3 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          {/* Back Button */}
          <button
            data-testid="reader-back-button"
            type="button"
            onClick={onBack}
            aria-label={t(locale, "msgBack")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12.5 15L7.5 10L12.5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Trash */}
          <button
            data-testid="reader-trash"
            type="button"
            onClick={onTrash}
            aria-label={t(locale, "msgMoveToTrash")}
            className={TOOLBAR_BTN}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M7 5V3h6v2M5 5v12h10V5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t(locale, "msgTrash")}</span>
          </button>

          {/* Junk */}
          <button
            data-testid="reader-junk"
            type="button"
            onClick={onJunk}
            aria-label={t(locale, "msgMoveToJunk")}
            className={TOOLBAR_BTN}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="7.5" />
              <path d="M4.5 4.5l11 11" strokeLinecap="round" />
            </svg>
            <span>{t(locale, "msgJunk")}</span>
          </button>

          {/* Move To Dropdown */}
          <div className="relative" onKeyDown={(e) => { if (e.key === "Escape") setMoveMenuOpen(false); }}>
            <button
              data-testid="reader-move"
              type="button"
              onClick={() => setMoveMenuOpen((open) => !open)}
              aria-label={t(locale, "msgMoveTo")}
              aria-expanded={moveMenuOpen}
              aria-haspopup="menu"
              className={TOOLBAR_BTN}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2.5 4.167C2.5 3.246 3.246 2.5 4.167 2.5h3.333c.442 0 .866.176 1.179.488l1.666 1.667h5.488c.921 0 1.667.746 1.667 1.667v9.511c0 .921-.746 1.667-1.667 1.667H4.167c-.921 0-1.667-.746-1.667-1.667V4.167z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t(locale, "msgMoveTo")}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {moveMenuOpen ? (
              <>
                <button
                  type="button"
                  aria-label={t(locale, "shellCancel")}
                  onClick={() => setMoveMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute left-0 z-50 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-white/10 dark:bg-[#1e1e1e]"
                >
                  {MOVE_FOLDERS.map((folder) => (
                    <button
                      key={folder}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoveMenuOpen(false);
                        onMove(folder);
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      {t(locale, FOLDER_LABEL_KEY[folder])}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* Star Button */}
          <button
            data-testid="reader-star"
            data-starred={message.starred}
            type="button"
            onClick={onToggleStar}
            className={TOOLBAR_BTN}
          >
            {message.starred ? (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="rgb(245, 158, 11)">
                <path d="M10 1.667l2.572 5.21 5.75.836-4.16 4.056.982 5.727L10 14.792l-5.144 2.704.982-5.727-4.16-4.056 5.75-.836L10 1.667z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 1.667l2.572 5.21 5.75.836-4.16 4.056.982 5.727L10 14.792l-5.144 2.704.982-5.727-4.16-4.056 5.75-.836L10 1.667z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span>{t(locale, message.starred ? "msgUnstar" : "msgStar")}</span>
          </button>
        </div>

        {/* 3-dots More Menu */}
        <div className="relative" onKeyDown={(e) => { if (e.key === "Escape") setMenuOpen(false); }}>
          <button
            data-testid="reader-more-button"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t(locale, "msgMoreActions")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label={t(locale, "shellCancel")}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute right-0 z-50 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-white/10 dark:bg-[#1e1e1e]">
                <button
                  type="button"
                  onClick={closeMenu(onToggleRead)}
                  className="block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {message.read ? t(locale, "msgMarkUnread") : t(locale, "msgMarkRead")}
                </button>
                <button
                  type="button"
                  onClick={closeMenu(onBlock)}
                  className="block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {t(locale, "msgBlockSender")}
                </button>
                <button
                  type="button"
                  onClick={closeMenu(onPrint)}
                  className="block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {t(locale, "msgPrint")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* 2. Message Subject Title */}
      <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        {message.subject}
      </h1>

      {/* 3. Sender Header Card */}
      <div className="mt-4 flex items-start gap-3.5 border-b border-slate-100 pb-5 dark:border-white/5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0.5"
          style={{ background: avatarGradient(message.from) }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900/40 text-sm font-bold text-white">
            {initial}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {sender.name}
            </span>
            {sender.address && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                &lt;{sender.address}&gt;
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>to {message.to} ▾</span>
            {message.encryption && message.encryption !== "standard" && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a3.5 3.5 0 00-3.5 3.5V6H4a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-.5V4.5A3.5 3.5 0 008 1zm2 5H6V4.5a2 2 0 114 0V6z" />
                </svg>
                <span>E2EE</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-xs text-slate-400 tabular-nums dark:text-slate-500">
            {formatMessageTime(message.date, locale, hour24)}
          </span>
        </div>
      </div>

      {/* 4. Message Content Body */}
      <div className="prose dark:prose-invert mt-6 max-w-none text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        <p className="whitespace-pre-wrap">{message.body}</p>
      </div>

      {/* Attachments Section if present */}
      {message.attachmentNames && message.attachmentNames.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-200/80 p-3 dark:border-white/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Attachments ({message.attachmentNames.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {message.attachmentNames.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3v10m-4-4l4 4 4-4M3 17h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="truncate max-w-[200px]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Bottom Quick Reply / Forward Actions */}
      <div className="mt-10 flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-white/5">
        <button
          type="button"
          onClick={onReply}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 active:scale-[0.98] dark:border-white/15 dark:bg-[#1e1e1e] dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7.5 5L2.5 10L7.5 15M2.5 10H14.167C15.547 10 16.667 11.12 16.667 12.5V15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Reply</span>
        </button>

        <button
          type="button"
          onClick={onForward}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 active:scale-[0.98] dark:border-white/15 dark:bg-[#1e1e1e] dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12.5 5L17.5 10L12.5 15M17.5 10H5.833C4.453 10 3.333 11.12 3.333 12.5V15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Forward</span>
        </button>
      </div>
    </div>
  );
}
