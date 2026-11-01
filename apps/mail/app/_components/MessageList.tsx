"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { FolderId, MailMessage } from "@dusrel/api-client";
import { t, type Locale } from "@dusrel/locales";
import { Button } from "@dusrel/ui";

/** Time for a message: clock time when it is from today, otherwise a medium date. */
export function formatMessageTime(dateIso: string, locale: Locale, hour24?: boolean): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      ...(hour24 === undefined ? {} : { hour12: !hour24 }),
    }).format(date);
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

export function splitTimeParts(formatted: string): { time: string; suffix: string | null } {
  const match = formatted.match(/^(.*?)(\s*\(.*?\))$/);
  if (!match) return { time: formatted, suffix: null };
  return { time: match[1], suffix: match[2] };
}

const AVATAR_GRADIENTS = [
  "radial-gradient(146.59% 146.59% at 96.25% 106.25%, rgb(88, 135, 255) 16.15%, rgb(255, 160, 251) 72.4%)",
  "radial-gradient(155.92% 155.92% at 81.25% 117.5%, rgb(252, 125, 255) 17.29%, rgb(255, 237, 145) 75.93%)",
  "radial-gradient(143.34% 143.34% at 12.5% 115%, rgb(255, 125, 211) 31.8%, rgb(255, 145, 145) 75.7%)",
  "radial-gradient(140% 140% at 80% 20%, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%)",
  "radial-gradient(140% 140% at 20% 80%, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 100%)",
];

export function avatarGradient(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) hash = (hash * 31 + sender.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function avatarColor(sender: string): string {
  return "bg-slate-800 text-white";
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
  hour24?: boolean;
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
    <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
      {illustration}
      <p className="text-base font-semibold text-slate-900 dark:text-[#e8eaed]">{text}</p>
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
  hour24,
  onGoInbox,
  onNewSearch,
  query,
  isSearch,
  illustration,
}: MessageListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const visible = useMemo(() => {
    switch (filter) {
      case "unread":
        return messages.filter((m) => !m.read);
      case "starred":
        return messages.filter((m) => m.starred);
      case "attachments":
        return messages.filter((m) => (m.attachmentNames?.length ?? 0) > 0);
      case "encrypted":
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

  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filterOpen]);

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
            <div className="flex flex-wrap justify-center gap-2 pt-2">
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
      empty = <EmptyState illustration={illustration} text={t(locale, "msgEmptyDraftsSentJunk")} note={t(locale, "msgAutoDeleteNote")} />;
    } else if (folder === "drafts" || folder === "sent") {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgEmptyDraftsSentJunk")} />;
    } else {
      empty = <EmptyState illustration={illustration} text={t(locale, "msgNoMessages")} />;
    }
  }

  return (
    <div className="w-full bg-white text-slate-900 dark:bg-[#181818] dark:text-[#eaebed]">
      {isSearch ? <h2 className="px-4 pt-4 text-lg font-semibold">{title}</h2> : null}

      {/* Atomic Style List Header Bar */}
      <div className="flex h-11 items-center justify-between border-b border-slate-200/80 px-4 text-xs font-medium dark:border-white/10">
        <div className="flex items-center gap-3">
          {/* Select all checkbox & label */}
          <button
            type="button"
            onClick={toggleSelectAll}
            aria-label={t(locale, "msgSelectAll")}
            aria-pressed={allVisibleSelected}
            className="flex items-center gap-2 rounded text-slate-700 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-300 dark:hover:text-white"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                allVisibleSelected
                  ? "border-[#4d90fe] bg-[#4d90fe] text-white"
                  : "border-slate-300 bg-white dark:border-white/20 dark:bg-white/5"
              }`}
            >
              {allVisibleSelected ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            <span>{t(locale, "msgSelectAll")}</span>
          </button>

          {/* Mark all as read */}
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 rounded text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-400 dark:hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t(locale, "msgMarkAllRead")}</span>
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            data-testid="toolbar-filter-button"
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={filterOpen}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M6 10h8M8 15h4" strokeLinecap="round" />
            </svg>
            <span>{t(locale, "msgFilterLabel")}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {filterOpen ? (
            <>
              <button
                type="button"
                aria-label={t(locale, "shellCancel")}
                onClick={() => setFilterOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="menu"
                className="absolute right-0 z-50 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-white/10 dark:bg-[#1e1e1e]"
              >
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setFilter(option.id);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors ${
                      filter === option.id
                        ? "bg-slate-100 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>
                      {option.prefix}
                      {t(locale, option.key)}
                    </span>
                    {filter === option.id && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Message Items Table */}
      {empty ?? (
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {visible.map((message) => {
            const sender = splitSender(message.from);
            const initial = (sender.name.charAt(0) || "?").toUpperCase();
            const isSelected = message.id === selectedId;
            const isChecked = selected.has(message.id);
            const timeParts = splitTimeParts(formatMessageTime(message.date, locale, hour24));
            const isUnread = !message.read;

            return (
              <li key={message.id}>
                <div
                  onClick={() => onSelect(message.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${sender.name}: ${message.subject}`}
                  className={`group relative flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4d90fe]/50 ${
                    isSelected
                      ? "bg-slate-100/90 dark:bg-white/10"
                      : isUnread
                      ? "bg-slate-50/50 hover:bg-slate-100/60 dark:bg-white/[0.02] dark:hover:bg-white/5"
                      : "bg-white hover:bg-slate-50 dark:bg-[#181818] dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Left Column: Avatar / Checkbox Swap + Sender Name */}
                  <div className="flex min-w-[140px] sm:min-w-[180px] max-w-[200px] shrink-0 items-center gap-2.5">
                    {/* Avatar swaps to Checkbox on hover or when checked */}
                    <div
                      className="relative flex h-7 w-7 shrink-0 items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Checkbox */}
                      <label
                        data-testid="email-item-checkbox"
                        className={`absolute inset-0 z-10 flex cursor-pointer items-center justify-center transition-opacity ${
                          isChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRowSelected(message.id)}
                          className="h-4 w-4 rounded border-slate-300 accent-[#4d90fe]"
                        />
                      </label>

                      {/* Initial Avatar */}
                      <div
                        className={`h-7 w-7 rounded-full p-0.5 transition-opacity ${
                          isChecked ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                        }`}
                        style={{ background: avatarGradient(message.from) }}
                      >
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900/40 text-[11px] font-bold text-white">
                          {initial}
                        </div>
                      </div>
                    </div>

                    {/* Author Name */}
                    <span
                      className={`truncate ${
                        isUnread
                          ? "font-semibold text-slate-900 dark:text-white"
                          : "font-normal text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {sender.name}
                    </span>
                  </div>

                  {/* Center Column: Star + Subject + Snippet Preview */}
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <button
                      data-testid="email-star-button"
                      data-starred={message.starred}
                      type="button"
                      aria-label={message.starred ? t(locale, "msgUnstar") : t(locale, "msgStar")}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(message.id);
                      }}
                      className="shrink-0 p-1 text-slate-400 transition-colors hover:text-amber-400"
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
                    </button>

                    <div className="min-w-0 flex-1 truncate">
                      <span
                        className={`mr-2 ${
                          isUnread
                            ? "font-semibold text-slate-900 dark:text-white"
                            : "font-normal text-slate-800 dark:text-[#eaebed]"
                        }`}
                      >
                        {message.subject}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {message.body}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Time OR Quick Hover Actions */}
                  <div className="shrink-0 flex items-center justify-end">
                    {/* Timestamp: visible normally, hidden on group-hover */}
                    <span className="text-xs text-slate-400 tabular-nums group-hover:hidden dark:text-slate-500">
                      {timeParts.time}
                    </span>

                    {/* Hover Action Toolbar: visible on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      {onToggleRead && (
                        <button
                          type="button"
                          aria-label={t(locale, isUnread ? "msgMarkRead" : "msgMarkUnread")}
                          title={t(locale, isUnread ? "msgMarkRead" : "msgMarkUnread")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRead(message.id);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2.5 5h15v10h-15V5z" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2.5 6l7.5 5 7.5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}

                      {onMoveToJunk && (
                        <button
                          type="button"
                          data-testid="email-junk-button"
                          aria-label={t(locale, "msgMoveToJunk")}
                          title={t(locale, "msgMoveToJunk")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToJunk(message.id);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="10" cy="10" r="7.5" />
                            <path d="M4.5 4.5l11 11" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}

                      {onMoveToTrash && (
                        <button
                          type="button"
                          data-testid="email-trash-button"
                          aria-label={t(locale, "msgMoveToTrash")}
                          title={t(locale, "msgMoveToTrash")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToTrash(message.id);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-rose-600 dark:hover:bg-white/10 dark:hover:text-rose-400"
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 5h14M7 5V3h6v2M5 5v12h10V5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
