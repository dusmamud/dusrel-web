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
  const sender = splitSender(message.from);

  const closeMenu = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="w-full bg-white px-4 py-4 text-slate-900 dark:bg-[#121212] dark:text-[#e8eaed]">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
        <Button variant="ghost" onClick={onBack} aria-label={t(locale, "msgBack")}>
          ← {t(locale, "msgBack")}
        </Button>
        <Button variant="ghost" onClick={onTrash}>
          {t(locale, "msgTrash")}
        </Button>
        <Button variant="ghost" onClick={onJunk}>
          {t(locale, "msgJunk")}
        </Button>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <select
            aria-label={t(locale, "msgMoveTo")}
            value=""
            onChange={(e) => {
              const folder = e.target.value as FolderId;
              if (folder) onMove(folder);
            }}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none focus:border-[#4d90fe] dark:border-white/20 dark:bg-[#1e1e1e] dark:text-[#e8eaed]"
          >
            <option value="" disabled>
              {t(locale, "msgMoveTo")}
            </option>
            {MOVE_FOLDERS.map((folder) => (
              <option key={folder} value={folder}>
                {t(locale, FOLDER_LABEL_KEY[folder])}
              </option>
            ))}
          </select>
        </label>
        <Button variant="ghost" onClick={onToggleStar}>
          {message.starred ? `★ ${t(locale, "msgUnstar")}` : `☆ ${t(locale, "msgStar")}`}
        </Button>
        <div className="relative">
          <Button variant="ghost" onClick={() => setMenuOpen((open) => !open)} aria-label={t(locale, "msgMoreActions")}>
            …
          </Button>
          {menuOpen ? (
            <div className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]">
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
          ) : null}
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-bold">{message.subject}</h1>
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
            className={`text-lg leading-none ${message.starred ? "text-yellow-500" : "text-slate-400 hover:text-yellow-500"}`}
          >
            {message.starred ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div className="mt-4 bg-slate-100 px-2 py-6 sm:px-4 dark:bg-white/5">
        <div className="mx-auto max-w-[680px] rounded-xl bg-white px-4 py-6 shadow-sm sm:px-6 dark:bg-[#1e1e1e]">
          <p className="whitespace-pre-wrap text-base leading-relaxed">{message.body}</p>
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
