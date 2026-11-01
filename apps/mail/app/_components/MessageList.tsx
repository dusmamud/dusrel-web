"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

/** Split a formatted message time into its clock/date part and, when present,
    the "(X seconds/minutes ago)" suffix — so the row can hide just the suffix
    on small screens without changing the format used by the reading view. */
function splitTimeParts(formatted: string): { time: string; suffix: string | null } {
  const match = formatted.match(/^(.*) \((.*)\)$/);
  if (!match) return { time: formatted, suffix: null };
  return { time: match[1], suffix: match[2] };
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
  onMoveToTrash?: (id: string) => void;
  onMoveToJunk?: (id: string) => void;
  onToggleRead?: (id: string) => void;
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
  onMoveToTrash,
  onMoveToJunk,
  onToggleRead,
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
        // Only messages that actually carry attachment metadata match.
        return messages.filter((m) => (m.attachmentNames?.length ?? 0) > 0);
      case "encrypted":
        // Only messages with a non-default encryption choice match.
        return messages.filter((m) => !!m.encryption && m.encryption !== "standard");
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

  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  return (
    <div className="w-full bg-white text-slate-900 dark:bg-[#121212] dark:text-[#e8eaed]">
      {isSearch ? <h2 className="px-4 pt-4 text-lg font-semibold">{title}</h2> : null}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-3 dark:border-white/10">
        <button type="button" onClick={toggleSelectAll} aria-label={t(locale, "msgSelectAll")} aria-pressed={allVisibleSelected} className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-[#e8eaed]">
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
            const timeParts = splitTimeParts(formatMessageTime(message.date, locale));
            return (
              <li key={message.id}>
                <div
                  onClick={() => onSelect(message.id)}
                  onKeyDown={(e) => {
                    // Only the row itself opens on Enter/Space. Inner tab stops
                    // (checkbox, star) handle their own keys; ignoring bubbled
                    // events here stops Space on the checkbox from also opening
                    // the message.
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(message.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${sender.name}: ${message.subject}`}
                  className={`group flex cursor-pointer items-center gap-2 border-b border-slate-200 px-4 py-2 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4d90fe]/50 dark:border-white/10 dark:hover:bg-white/5 ${
                    isSelected ? "bg-slate-100 dark:bg-white/10" : ""
                  }`}
                >
                  <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${message.read ? "bg-transparent" : "bg-green-500"}`} />
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
                  <span className="shrink-0 text-[13px] text-slate-500 group-hover:hidden group-focus-within:hidden dark:text-slate-400">
                    {timeParts.time}
                    {timeParts.suffix ? <span className="hidden sm:inline"> ({timeParts.suffix})</span> : null}
                  </span>
                  {onMoveToTrash && onMoveToJunk && onToggleRead ? (
                    <span className="hidden shrink-0 items-center gap-1 group-hover:flex group-focus-within:flex">
                      <button
                        type="button"
                        aria-label={t(locale, "msgMoveToTrash")}
                        title={t(locale, "msgMoveToTrash")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToTrash(message.id);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/10 dark:hover:text-slate-200"
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                      <button
                        type="button"
                        aria-label={t(locale, "msgMoveToJunk")}
                        title={t(locale, "msgMoveToJunk")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToJunk(message.id);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/10 dark:hover:text-slate-200"
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                      </button>
                      <button
                        type="button"
                        aria-label={t(locale, message.read ? "msgMarkUnread" : "msgMarkRead")}
                        title={t(locale, message.read ? "msgMarkUnread" : "msgMarkRead")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleRead(message.id);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/10 dark:hover:text-slate-200"
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      </button>
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
