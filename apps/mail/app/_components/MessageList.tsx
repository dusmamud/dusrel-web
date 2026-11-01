"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { FolderId, MailMessage } from "@dusrel/api-client";
import { t, type Locale } from "@dusrel/locales";
import { Button } from "@dusrel/ui";

/** Time for a message: clock time when it is from today, otherwise a medium date. */
export function formatMessageTime(dateIso: string, locale: Locale): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
    const secs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (secs >= 0 && secs < 60) return `${time} (${secs} ${t(locale, "msgSecondsAgo")})`;
    const mins = Math.floor(secs / 60);
    if (mins >= 1 && mins < 60) return `${time} (${mins} ${t(locale, "msgMinutesAgo")})`;
    return time;
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/** Split a sender string into a display name and, when present, an address in <>. */
export function splitSender(from: string): { name: string; address: string | null } {
  const match = from.match(/^(.*?)<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim() || match[2], address: match[2] };
  return { name: from, address: null };
}

const AVATAR_COLORS = [
  "bg-gradient-to-br from-slate-400 to-slate-600",
  "bg-gradient-to-br from-[#4d90fe] to-purple-500",
  "bg-gradient-to-br from-green-400 to-teal-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-purple-400 to-pink-500",
];

/** Deterministic avatar gradient from the sender string (vivid gradients, like the reference). */
function avatarColor(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) hash = (hash * 31 + sender.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type Filter = "all" | "unread" | "starred" | "attachments" | "encrypted";

const FILTER_OPTIONS: { id: Filter; key: string; prefix: string }[] = [
  { id: "all", key: "msgFilterAll", prefix: "" },
  { id: "unread", key: "msgFilterUnread", prefix: "" },
  { id: "starred", key: "msgFilterStarred", prefix: "★ " },
  { id: "attachments", key: "msgFilterAttachments", prefix: "" },
  { id: "encrypted", key: "msgFilterEncrypted", prefix: "" },
];

export interface MessageListProps {
  locale: Locale;
  messages: MailMessage[];
  selectedId: string | null;
  folder: FolderId;
  title: string;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onMarkAllRead: () => void;
  onGoInbox?: () => void;
  onNewSearch?: () => void;
  query?: string;
  isSearch?: boolean;
  illustration?: ReactNode;
}

function EmptyState({
  illustration,
  text,
  note,
  actions,
}: {
  illustration?: ReactNode;
  text: string;
  note?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      {illustration}
      <p className="text-base font-medium text-slate-900 dark:text-[#e8eaed]">{text}</p>
      {note ? <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{note}</p> : null}
      {actions}
    </div>
  );
}

export function MessageList({
  locale,
  messages,
  selectedId,
  folder,
  title,
  onSelect,
  onToggleStar,
  onMarkAllRead,
  onGoInbox,
  onNewSearch,
  query,
  isSearch,
  illustration,
}: MessageListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    switch (filter) {
      case "unread":
        return messages.filter((m) => !m.read);
      case "starred":
        return messages.filter((m) => m.starred);
      case "attachments":
      case "encrypted":
        // MailMessage carries no attachments or encryption data, so these
        // filters can never match honestly. They yield the empty state.
        return [];
      default:
        return messages;
    }
  }, [messages, filter]);

  const allVisibleSelected = visible.length > 0 && visible.every((m) => selected.has(m.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visible.forEach((m) => next.delete(m.id));
      } else {
        visible.forEach((m) => next.add(m.id));
      }
      return next;
    });
  };

  const toggleRowSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const searchNoResults = Boolean(isSearch && query && messages.length === 0);

  let empty: ReactNode = null;
  if (visible.length === 0) {
    if (filter === "attachments") {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgNoMessages")} note={t(locale, "msgNoAttachmentsData")} />;
    } else if (filter === "encrypted") {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgNoMessages")} note={t(locale, "msgNoEncryptedData")} />;
    } else if (searchNoResults) {
      empty = (
        <EmptyState
          illustration={illustration}
          text={t(locale, "msgNothingFound")}
          note={t(locale, "msgNothingFoundHint")}
          actions={
            <div className="flex flex-wrap justify-center gap-2">
              {onGoInbox ? <Button onClick={onGoInbox}>{t(locale, "msgGoInbox")}</Button> : null}
              {onNewSearch ? (
                <Button variant="secondary" onClick={onNewSearch}>
                  {t(locale, "msgNewSearch")}
                </Button>
              ) : null}
            </div>
          }
        />
      );
    } else if (folder === "trash") {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgEmptyTrash")} note={t(locale, "msgAutoDeleteNote")} />;
    } else if (folder === "spam") {
      empty = (
        <EmptyState
          illustration={illustration}
          text={t(locale, "msgEmptyDraftsSentJunk")}
          note={t(locale, "msgAutoDeleteNote")}
        />
      );
    } else if (folder === "drafts" || folder === "sent") {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgEmptyDraftsSentJunk")} />;
    } else {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgNoMessages")} />;
    }
  }

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="w-full bg-white text-slate-900 dark:bg-[#121212] dark:text-[#e8eaed]">
      {isSearch ? <h2 className="px-4 pt-4 text-lg font-semibold">{title}</h2> : null}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-3 dark:border-white/10">
        <button type="button" onClick={toggleSelectAll} aria-label={t(locale, "msgSelectAll")} className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-[#e8eaed]">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="9" />{allVisibleSelected ? <path d="M8 12.5l2.5 2.5L16 9.5" /> : null}</svg>
          {t(locale, "msgSelectAll")}
        </button>
        <Button variant="secondary" onClick={onMarkAllRead}>
          ✉ {t(locale, "msgMarkAllRead")}
        </Button>
        <div className="relative ml-auto">
          <Button variant="secondary" onClick={() => setFilterOpen((open) => !open)} aria-haspopup="menu" aria-expanded={filterOpen}>
            {t(locale, "msgFilterLabel")} ▾
          </Button>
          {filterOpen ? (
            <>
              <button type="button" aria-label={t(locale, "shellCancel")} onClick={() => setFilterOpen(false)} className="fixed inset-0 z-40 cursor-default" />
              <div role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]">
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(locale, "msgFilterLabel")}</p>
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setFilter(option.id);
                      setFilterOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    {filter === option.id ? "✓ " : ""}
                    {option.prefix}
                    {t(locale, option.key)}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
      {empty ?? (
        <ul>
          {visible.map((message) => {
            const sender = splitSender(message.from);
            const initial = (sender.name.charAt(0) || "?").toUpperCase();
            const isSelected = message.id === selectedId;
            return (
              <li key={message.id}>
                <div
                  onClick={() => onSelect(message.id)}
                  className={`group flex cursor-pointer items-center gap-2 border-b border-slate-200 px-4 py-2 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 ${
                    isSelected ? "bg-slate-100 dark:bg-white/10" : ""
                  }`}
                >
                  {!message.read ? <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-green-500" /> : null}
                  <input
                    type="checkbox"
                    checked={selected.has(message.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRowSelected(message.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={sender.name}
                    className="h-4 w-4 shrink-0 accent-[#4d90fe] opacity-0 checked:opacity-100 focus:opacity-100 group-hover:opacity-100 max-lg:opacity-100 max-sm:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(message.from)}`}
                  >
                    {initial}
                  </span>
                  <span className="max-w-[90px] shrink-0 truncate text-base font-bold text-slate-900 sm:max-w-[180px] dark:text-[#e8eaed]">
                    {sender.name}
                  </span>
                  <button
                    type="button"
                    aria-label={message.starred ? t(locale, "msgUnstar") : t(locale, "msgStar")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(message.id);
                    }}
                    className={`-m-2 shrink-0 p-2 text-base leading-none ${message.starred ? "text-yellow-500" : "text-slate-400 hover:text-yellow-500"}`}
                  >
                    {message.starred ? "★" : "☆"}
                  </button>
                  <span className="min-w-0 flex-1 truncate text-base font-bold text-slate-900 dark:text-[#e8eaed]">
                    {message.subject}
                  </span>
                  <span className="hidden min-w-0 flex-1 truncate text-sm text-slate-500 sm:block dark:text-slate-400">{message.body}</span>
                  <span className="shrink-0 text-[13px] text-slate-500 dark:text-slate-400">
                    {formatMessageTime(message.date, locale)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
