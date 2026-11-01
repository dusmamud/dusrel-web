"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Button, Input } from "@dusrel/ui";
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
  initialSubject?: string;
  initialBody?: string;
  initialEncryption?: ComposeEncryption;
  docked?: boolean;
  onSend: (payload: ComposePayload) => void;
  onSaveDraft: (payload: ComposePayload) => void;
  onDeleteDraft: () => void;
  onClose: () => void;
}

function splitAddresses(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

// NOTE: This panel performs no sending, no upload and no cryptography itself.
// The encryption choice (and the password, when that option is picked) is only
// a UI selection passed to the parent in the payload. There is no backend
// connected yet, so nothing here encrypts, sends or stores a real message.

export function ComposePanel({
  locale,
  displayName,
  signature,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  initialEncryption = "standard",
  docked = false,
  onSend,
  onSaveDraft,
  onDeleteDraft,
  onClose,
}: ComposePanelProps) {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [encryption, setEncryption] = useState<ComposeEncryption>(initialEncryption);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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
    attachmentNames: files.map((file) => file.name),
  });

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
    ? "fixed inset-0 z-50 flex flex-col rounded-none border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#1e1e1e] dark:text-[#e8eaed]"
    : `relative flex flex-col ${docked ? "rounded-t-xl" : "rounded-xl"} border border-slate-200 bg-white text-slate-900 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e] dark:text-[#e8eaed]`;

  // Minimized bar: only the subject plus the expand button, per spec.
  if (collapsed) {
    return (
      <div className={fullScreen ? "fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-[#1e1e1e] dark:text-[#e8eaed]" : "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e] dark:text-[#e8eaed]"}>
        <span className="truncate text-sm font-medium">{subject.trim().length > 0 ? subject : t(locale, "composePanelNoSubject")}</span>
        <Button variant="ghost" onClick={() => setCollapsed(false)} aria-label={t(locale, "composePanelExpand")}>
          {t(locale, "composePanelExpand")}
        </Button>
      </div>
    );
  }

  return (
    <section className={panelClass} aria-label={t(locale, "composePanelTitle")}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4d90fe] via-purple-400 to-pink-400 text-sm font-semibold text-white" aria-hidden="true">
            D
          </span>
          <span className="truncate text-sm font-medium">{displayName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" onClick={() => setCollapsed(true)} aria-label={t(locale, "composePanelCollapse")}>
            {t(locale, "composePanelCollapse")}
          </Button>
          <Button variant="ghost" onClick={() => setFullScreen((prev) => !prev)} aria-label={fullScreen ? t(locale, "composePanelExitFullScreen") : t(locale, "composePanelFullScreen")}>
            {fullScreen ? t(locale, "composePanelExitFullScreen") : t(locale, "composePanelFullScreen")}
          </Button>
          {/* Closing discards an unsent, unsaved draft: this panel never
              auto-saves into Drafts, and neither should the parent on close. */}
          <Button variant="ghost" onClick={onClose} aria-label={t(locale, "composePanelClose")} title={t(locale, "composePanelCloseDiscard")}>
            {t(locale, "composePanelClose")}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder={t(locale, "composePanelToPlaceholder")} aria-label={t(locale, "composePanelTo")} autoComplete="off" />
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" onClick={() => setShowCc((prev) => !prev)} aria-pressed={showCc}>
                {t(locale, "composePanelCc")}
              </Button>
              <Button variant="ghost" onClick={() => setShowBcc((prev) => !prev)} aria-pressed={showBcc}>
                {t(locale, "composePanelBcc")}
              </Button>
            </div>
          </div>

          {showCc ? (
            <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder={t(locale, "composePanelToPlaceholder")} aria-label={t(locale, "composePanelCc")} autoComplete="off" />
          ) : null}
          {showBcc ? (
            <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder={t(locale, "composePanelToPlaceholder")} aria-label={t(locale, "composePanelBcc")} autoComplete="off" />
          ) : null}

          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t(locale, "composePanelSubjectPlaceholder")} aria-label={t(locale, "composePanelSubject")} />
        </div>

        <div className="flex flex-col gap-2">
          {showFormatting ? (
          <div className="flex flex-wrap gap-1" role="toolbar" aria-label={t(locale, "composePanelBody")}>
            <Button variant="ghost" onClick={() => wrapSelection("bold")} aria-label={t(locale, "composePanelBold")}>
              {t(locale, "composePanelBold")}
            </Button>
            <Button variant="ghost" onClick={() => wrapSelection("italic")} aria-label={t(locale, "composePanelItalic")}>
              {t(locale, "composePanelItalic")}
            </Button>
            <Button variant="ghost" onClick={() => wrapSelection("list")} aria-label={t(locale, "composePanelList")}>
              {t(locale, "composePanelList")}
            </Button>
          </div>
          ) : null}
          {/* Native textarea (not @dusrel/ui Textarea): the formatting toolbar
              needs a ref for cursor/selection restore, and ui Textarea does
              not forward one. Classes match ui Textarea exactly. */}
          <textarea
            ref={bodyRef}
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label={t(locale, "composePanelBody")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/30 dark:border-white/20 dark:bg-[#1e1e1e] dark:text-[#e8eaed]"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">{t(locale, "composePanelSentFrom")}</p>
        </div>

        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles} aria-label={t(locale, "composePanelChooseFiles")} />
        {files.length > 0 ? (
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">{t(locale, "composePanelAttachments")}</p>
            <ul className="flex flex-col gap-1">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10">
                  <span className="min-w-0 truncate">{file.name}</span>
                  <Button variant="ghost" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))} aria-label={t(locale, "composePanelRemoveFile")}>
                    {t(locale, "composePanelRemoveFile")}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Plain button, not @dusrel/ui Button: ui Button spreads props after
                its own className, so a custom colour className would drop its base styles. */}
            <button type="button" disabled={sendDisabled} onClick={() => onSend(payload())} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              {t(locale, "composePanelSend")}
            </button>
            <Button variant="secondary" onClick={() => onSaveDraft(payload())}>
              {t(locale, "composePanelSaveDraft")}
            </Button>
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(locale, "composePanelEncryption")}</span>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/30 dark:border-white/20 dark:bg-[#1e1e1e] dark:text-[#e8eaed]"
                value={encryption}
                onChange={(e) => setEncryption(e.target.value as ComposeEncryption)}
                aria-label={t(locale, "composePanelEncryption")}
              >
                <option value="password">{t(locale, "composePanelEncryptionPasswordOption")}</option>
                <option value="file">{t(locale, "composePanelEncryptionFileOption")}</option>
                <option value="dusrel">{t(locale, "composePanelEncryptionDusrelOption")}</option>
                <option value="standard">{t(locale, "composePanelEncryptionStandardOption")}</option>
              </select>
            </label>
            <span className="flex-1" aria-hidden="true" />
            {/* Dusrel has no AI features: this icon is disabled and labelled
                as coming soon, and must never imply it works. */}
            <button type="button" disabled aria-label="AI assistant (coming soon)" title="AI assistant (coming soon)" className="rounded-lg p-2 text-slate-400 opacity-50 dark:text-slate-500">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
              </svg>
            </button>
            <button type="button" onClick={insertSignature} aria-label={t(locale, "composePanelInsertSignature")} title={t(locale, "composePanelInsertSignature")} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} aria-label={t(locale, "composePanelAttachFiles")} title={t(locale, "composePanelAttachFiles")} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button type="button" onClick={() => setShowFormatting((prev) => !prev)} aria-pressed={showFormatting} aria-label="Aa" title="Aa" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
              Aa
            </button>
            <button type="button" onClick={onDeleteDraft} aria-label={t(locale, "composePanelDeleteDraft")} title={t(locale, "composePanelDeleteDraft")} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          {encryption === "password" ? (
            <Input type="password" value={encryptionPassword} onChange={(e) => setEncryptionPassword(e.target.value)} placeholder={t(locale, "composePanelEncryptionPassword")} aria-label={t(locale, "composePanelEncryptionPassword")} autoComplete="off" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
