"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@dusrel/ui";
import { t, type Locale } from "@dusrel/locales";

export type ComposeEncryption = "password" | "file" | "dusrel" | "standard";

export interface ComposePayload {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  encryption: ComposeEncryption;
  encryptionPassword?: string;
  attachmentNames: string[];
}

export interface ComposePanelProps {
  locale: Locale;
  displayName: string;
  signature: string;
  initialTo?: string;
  initialCc?: string;
  initialBcc?: string;
  initialSubject?: string;
  initialBody?: string;
  initialEncryption?: ComposeEncryption;
  initialAttachmentNames?: string[];
  docked?: boolean;
  onSend: (payload: ComposePayload) => void;
  onSaveDraft: (payload: ComposePayload) => void;
  onDeleteDraft: () => void;
  onClose: () => void;
  onDraftChange?: (payload: ComposePayload) => void;
}

function splitAddresses(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function ComposePanel({
  locale,
  displayName,
  signature,
  initialTo = "",
  initialCc = "",
  initialBcc = "",
  initialSubject = "",
  initialBody = "",
  initialEncryption = "standard",
  initialAttachmentNames = [],
  docked = false,
  onSend,
  onSaveDraft,
  onDeleteDraft,
  onClose,
  onDraftChange,
}: ComposePanelProps) {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState(initialCc);
  const [bcc, setBcc] = useState(initialBcc);
  const [showCc, setShowCc] = useState(initialCc.length > 0);
  const [showBcc, setShowBcc] = useState(initialBcc.length > 0);
  const [showFormatting, setShowFormatting] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [encryption, setEncryption] = useState<ComposeEncryption>(initialEncryption);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [restoredNames, setRestoredNames] = useState<string[]>(initialAttachmentNames);
  const [collapsed, setCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const payload = (): ComposePayload => ({
    to: splitAddresses(to),
    cc: splitAddresses(cc),
    bcc: splitAddresses(bcc),
    subject,
    body,
    encryption,
    ...(encryption === "password" ? { encryptionPassword } : {}),
    attachmentNames: [...files.map((file) => file.name), ...restoredNames],
  });

  useEffect(() => {
    onDraftChange?.(payload());
  }, [to, cc, bcc, subject, body, encryption, encryptionPassword, files, restoredNames, onDraftChange]);

  // Global Ctrl+Enter / Cmd+Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && to.trim().length > 0) {
      e.preventDefault();
      onSend(payload());
    }
  };

  const sendDisabled = to.trim().length === 0;

  function wrapSelection(kind: "bold" | "italic" | "list") {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const selected = body.slice(start, end);
    const after = body.slice(end);
    let next = body;
    let nextStart = start;
    let nextEnd = end;

    if (kind === "list") {
      if (selected.length > 0) {
        const marked = selected
          .split("\n")
          .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
          .join("\n");
        next = `${before}${marked}${after}`;
        nextEnd = start + marked.length;
      } else {
        const lineStart = before.lastIndexOf("\n") + 1;
        next = `${body.slice(0, lineStart)}- ${body.slice(lineStart)}`;
        nextStart = start + 2;
        nextEnd = end + 2;
      }
    } else {
      const mark = kind === "bold" ? "**" : "*";
      if (selected.length > 0) {
        next = `${before}${mark}${selected}${mark}${after}`;
        nextEnd = end + mark.length * 2;
      } else {
        next = `${before}${mark}${mark}${after}`;
        nextStart = start + mark.length;
        nextEnd = end + mark.length;
      }
    }

    setBody(next);
    window.setTimeout(() => {
      el.focus();
      el.setSelectionRange(nextStart, nextEnd);
    }, 0);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length > 0) setFiles((prev) => [...prev, ...picked]);
    event.target.value = "";
  }

  function insertSignature() {
    if (!signature) return;
    setBody((prev) => (prev.length === 0 ? signature : `${prev}\n\n${signature}`));
  }

  const panelClass = fullScreen
    ? "fixed inset-0 z-50 flex flex-col rounded-none border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-[#181818] dark:text-[#eaebed]"
    : `relative flex flex-col ${
        docked
          ? "fixed bottom-0 right-6 z-40 w-[560px] max-h-[calc(100vh-60px)] rounded-t-2xl shadow-2xl"
          : "mx-auto w-full max-w-[620px] rounded-2xl shadow-xl"
      } border border-slate-200/90 bg-white text-slate-900 dark:border-white/10 dark:bg-[#181818] dark:text-[#eaebed]`;

  const fieldClass =
    "w-full border-0 border-b border-slate-200/70 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#4d90fe] dark:border-white/10 dark:text-[#eaebed] dark:placeholder:text-slate-500";

  const rowInputClass =
    "w-full border-0 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eaebed] dark:placeholder:text-slate-500";

  if (collapsed) {
    return (
      <div
        className={`${
          docked ? "fixed bottom-0 right-6 z-40 w-96 rounded-t-xl" : "rounded-xl"
        } flex items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-xl dark:border-white/10 dark:bg-[#1e1e1e] dark:text-[#eaebed]`}
      >
        <span className="truncate text-sm font-semibold">
          {subject.trim().length > 0 ? subject : t(locale, "composePanelNoSubject")}
        </span>
        <Button
          variant="ghost"
          onClick={() => setCollapsed(false)}
          aria-label={t(locale, "composePanelExpand")}
        >
          {t(locale, "composePanelExpand")}
        </Button>
      </div>
    );
  }

  return (
    <section
      className={panelClass}
      aria-label={t(locale, "composePanelTitle")}
      onKeyDown={handleKeyDown}
    >
      {/* 1. Window Head Controls */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-2.5 dark:border-white/10">
        <div
          data-testid="compose-from-trigger"
          className="flex min-w-0 items-center gap-2.5 rounded-lg py-0.5"
        >
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0.5"
            style={{
              background:
                "radial-gradient(155.92% 155.92% at 81.25% 117.5%, rgb(252, 125, 255) 17.29%, rgb(255, 237, 145) 75.93%)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900/40 text-[10px] font-bold text-white">
              D
            </div>
          </div>
          <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
            {displayName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Collapse */}
          <button
            data-testid="compose-collapse"
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label={t(locale, "composePanelCollapse")}
            title={t(locale, "composePanelCollapse")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12" strokeLinecap="round" />
            </svg>
          </button>

          {/* Fullscreen Toggle */}
          <button
            data-testid="compose-fullscreen"
            type="button"
            onClick={() => setFullScreen((prev) => !prev)}
            aria-label={fullScreen ? t(locale, "composePanelExitFullScreen") : t(locale, "composePanelFullScreen")}
            title={fullScreen ? t(locale, "composePanelExitFullScreen") : t(locale, "composePanelFullScreen")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {fullScreen ? (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 8h4V4M16 8h-4V4M4 12h4v4M16 12h-4v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 3H3v4M13 3h4v4M7 17H3v-4M13 17h4v-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Close */}
          <button
            data-testid="compose-close"
            type="button"
            onClick={onClose}
            aria-label={t(locale, "composePanelClose")}
            title={t(locale, "composePanelCloseDiscard")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/10 dark:hover:text-rose-400"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. Recipient and Subject Fields */}
      <div className={`flex min-h-0 flex-1 flex-col gap-3 ${fullScreen ? "overflow-y-auto" : ""} px-4 py-3`}>
        <div className="flex flex-col">
          {/* To Field */}
          <div className="flex items-center gap-2 border-b border-slate-200/70 focus-within:border-[#4d90fe] dark:border-white/10">
            <span className="text-xs font-semibold text-slate-400">To:</span>
            <div className="flex-1">
              <input
                data-testid="compose-to-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={t(locale, "composePanelToPlaceholder")}
                aria-label={t(locale, "composePanelTo")}
                autoComplete="off"
                className={rowInputClass}
              />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                data-testid="compose-cc-toggle"
                type="button"
                onClick={() => setShowCc((prev) => !prev)}
                className={`rounded px-1.5 py-0.5 text-xs font-semibold transition-colors ${
                  showCc
                    ? "bg-[#4d90fe]/10 text-[#4d90fe]"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                Cc
              </button>
              <button
                data-testid="compose-bcc-toggle"
                type="button"
                onClick={() => setShowBcc((prev) => !prev)}
                className={`rounded px-1.5 py-0.5 text-xs font-semibold transition-colors ${
                  showBcc
                    ? "bg-[#4d90fe]/10 text-[#4d90fe]"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                Bcc
              </button>
            </div>
          </div>

          {showCc && (
            <div className="flex items-center gap-2 border-b border-slate-200/70 focus-within:border-[#4d90fe] dark:border-white/10">
              <span className="text-xs font-semibold text-slate-400">Cc:</span>
              <input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder={t(locale, "composePanelToPlaceholder")}
                aria-label={t(locale, "composePanelCc")}
                autoComplete="off"
                className={rowInputClass}
              />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center gap-2 border-b border-slate-200/70 focus-within:border-[#4d90fe] dark:border-white/10">
              <span className="text-xs font-semibold text-slate-400">Bcc:</span>
              <input
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder={t(locale, "composePanelToPlaceholder")}
                aria-label={t(locale, "composePanelBcc")}
                autoComplete="off"
                className={rowInputClass}
              />
            </div>
          )}

          {/* Subject Field */}
          <input
            data-testid="compose-subject-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t(locale, "composePanelSubjectPlaceholder")}
            aria-label={t(locale, "composePanelSubject")}
            className={fieldClass}
          />
        </div>

        {/* Rich Formatting Bar (When Toggled) */}
        {showFormatting && (
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5"
            role="toolbar"
            aria-label={t(locale, "composePanelBody")}
          >
            <button
              type="button"
              onClick={() => wrapSelection("bold")}
              aria-label={t(locale, "composePanelBold")}
              className="rounded px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("italic")}
              aria-label={t(locale, "composePanelItalic")}
              className="rounded px-2 py-1 text-xs italic text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("list")}
              aria-label={t(locale, "composePanelList")}
              className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
            >
              • List
            </button>
          </div>
        )}

        {/* 3. Textarea Body */}
        <div className="flex flex-1 flex-col">
          <textarea
            ref={bodyRef}
            rows={fullScreen ? 16 : 9}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t(locale, "composePanelBodyPlaceholder")}
            aria-label={t(locale, "composePanelBody")}
            className="w-full flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eaebed] dark:placeholder:text-slate-500"
          />
        </div>

        {/* 4. File Attachment Input & List */}
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFiles}
          aria-label={t(locale, "composePanelChooseFiles")}
        />
        {files.length + restoredNames.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 p-2.5 dark:border-white/10">
            <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t(locale, "composePanelAttachments")} ({files.length + restoredNames.length})
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={t(locale, "composePanelRemoveFile")}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {restoredNames.map((name, index) => (
                <li
                  key={`restored-${name}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
                >
                  <span className="truncate max-w-[150px]">{name}</span>
                  <button
                    type="button"
                    onClick={() => setRestoredNames((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={t(locale, "composePanelRemoveFile")}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Bottom Action Toolbar */}
        <div className="flex flex-col gap-2.5 border-t border-slate-200/80 pt-3 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            {/* Left Actions: Send + Encryption */}
            <div className="flex items-center gap-2">
              <button
                data-testid="compose-send-button"
                type="button"
                disabled={sendDisabled}
                onClick={() => onSend(payload())}
                title="Send message · Ctrl+Enter"
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-black disabled:opacity-50 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <span>{t(locale, "composePanelSend")}</span>
                <span className="hidden sm:inline-block text-[10px] opacity-70">· Ctrl+Enter</span>
              </button>

              <Button
                variant="secondary"
                onClick={() => onSaveDraft(payload())}
              >
                {t(locale, "composePanelSaveDraft")}
              </Button>

              {/* Encryption Trigger */}
              <label
                data-testid="compose-encrypt-trigger"
                className="relative flex items-center"
              >
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="pointer-events-none absolute left-2.5 text-slate-400"
                >
                  <path d="M5 8V6a5 5 0 0110 0v2M4 8h12v10H4V8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <select
                  className="rounded-xl border border-slate-200/80 bg-white py-1.5 pl-8 pr-2.5 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/25 dark:border-white/15 dark:bg-[#1e1e1e] dark:text-slate-300"
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value as ComposeEncryption)}
                  aria-label={t(locale, "composePanelEncryption")}
                >
                  <option value="standard">{t(locale, "composePanelEncryptionStandardOption")}</option>
                  <option value="password">{t(locale, "composePanelEncryptionPasswordOption")}</option>
                  <option value="file">{t(locale, "composePanelEncryptionFileOption")}</option>
                  <option value="dusrel">{t(locale, "composePanelEncryptionDusrelOption")}</option>
                </select>
              </label>
            </div>

            {/* Right Tools: AI, Signature, Attach, Format, Delete */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                aria-label="AI assistant"
                title="AI assistant (coming soon)"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-50 dark:text-slate-500"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={insertSignature}
                aria-label="Insert signature"
                title={t(locale, "composePanelInsertSignature")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.167 2.5L17.5 5.833 6.667 16.667H3.333V13.333L14.167 2.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                data-testid="compose-attachment"
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach files"
                title={t(locale, "composePanelAttachFiles")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.5 9.167l-7.5 7.5a4.714 4.714 0 01-6.667-6.667l7.5-7.5a3.143 3.143 0 014.445 4.444L7.778 14.444a1.571 1.571 0 01-2.222-2.222l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setShowFormatting((prev) => !prev)}
                aria-pressed={showFormatting}
                aria-label="Text formatting"
                title="Formatting"
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  showFormatting
                    ? "bg-[#4d90fe]/10 text-[#4d90fe]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                Aa
              </button>

              <button
                data-testid="compose-delete"
                type="button"
                onClick={onDeleteDraft}
                aria-label="Delete draft"
                title={t(locale, "composePanelDeleteDraft")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5h14M7 5V3h6v2M5 5v12h10V5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {encryption === "password" && (
            <input
              type="password"
              value={encryptionPassword}
              onChange={(e) => setEncryptionPassword(e.target.value)}
              placeholder={t(locale, "composePanelEncryptionPassword")}
              aria-label={t(locale, "composePanelEncryptionPassword")}
              autoComplete="off"
              className={fieldClass}
            />
          )}
        </div>
      </div>
    </section>
  );
}
