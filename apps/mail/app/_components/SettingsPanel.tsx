"use client";
import { useEffect, useState, type ReactNode } from "react";
import { t, type Locale } from "@dusrel/locales";
import { Button, Field, Input, Textarea } from "@dusrel/ui";
import { ThemeToggle } from "@dusrel/brand";

export type SettingsSection = "account" | "upgrade" | "privacy" | "sessions" | "aliases" | "hide" | "autoreply" | "signature" | "billing" | "download";

export interface AutoReplyValue {
  enabled: boolean;
  message: string;
}

export interface SettingsPanelProps {
  locale: Locale;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  email: string;
  signature: string;
  onSignatureChange: (value: string) => void;
  aliases: string[];
  onCreateAlias: () => void;
  autoReply: AutoReplyValue;
  onAutoReplyChange: (value: AutoReplyValue) => void;
  blockedCount?: number;
  accountCentreUrl?: string;
  downloadSlot?: ReactNode;
  onClose?: () => void;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#4d90fe]" : "bg-slate-300 dark:bg-white/20"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-slate-900 dark:text-[#e8eaed]">{label}</span>
      <span className="flex items-center gap-3">{children}</span>
    </div>
  );
}

export function SettingsPanel({
  locale,
  displayName,
  onDisplayNameChange,
  email,
  signature,
  onSignatureChange,
  aliases,
  onCreateAlias,
  autoReply,
  onAutoReplyChange,
  blockedCount = 0,
  accountCentreUrl = "https://account.dusrel.com/",
  downloadSlot,
  onClose,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [time24h, setTime24h] = useState(true);
  const [autoTimezone, setAutoTimezone] = useState(true);
  const [browserTimezone, setBrowserTimezone] = useState("");
  const [securityHelper, setSecurityHelper] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Read on mount only, so server and client render the same first pass.
  useEffect(() => {
    try {
      setBrowserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setBrowserTimezone("");
    }
  }, []);

  const linkClass = "text-sm font-medium text-[#4d90fe] hover:underline";

  const nav: { id: SettingsSection; key: string }[] = [
    { id: "account", key: "spAccount" },
    { id: "upgrade", key: "spUpgrade" },
    { id: "privacy", key: "spPrivacy" },
    { id: "sessions", key: "spSessions" },
    { id: "aliases", key: "spAliases" },
    { id: "hide", key: "spHide" },
    { id: "autoreply", key: "spAutoReply" },
    { id: "signature", key: "spSignature" },
    { id: "billing", key: "spBilling" },
    { id: "download", key: "spDownload" },
  ];

  const pricingNote = (
    <div className="space-y-2">
      <p className="font-medium text-slate-900 dark:text-[#e8eaed]">{t(locale, "spPricingTitle")}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spPricingText")}</p>
    </div>
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#1e1e1e]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spTitle")}</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            {t(locale, "spClose")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav className="flex shrink-0 flex-col gap-1 lg:w-56" aria-label={t(locale, "spTitle")}>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "true" : undefined}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeSection === item.id ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-[#e8eaed]" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              {t(locale, item.key)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {activeSection === "account" && (
            <div className="space-y-4">
              <Field label={t(locale, "spDisplayName")}>
                <Input value={displayName} onChange={(e) => onDisplayNameChange(e.target.value)} />
              </Field>
              <Field label={t(locale, "spDefaultEmail")}>
                <Input value={email} readOnly />
              </Field>
              <Row label={t(locale, "spPassword")}>
                <span aria-hidden="true" className="text-sm tracking-widest text-slate-900 dark:text-[#e8eaed]">
                  ••••••••
                </span>
                <a className={linkClass} href={accountCentreUrl}>
                  {t(locale, "spChange")}
                </a>
              </Row>
              <Row label={t(locale, "spAppearance")}>
                <ThemeToggle />
              </Row>
              <Row label={t(locale, "spTimeFormat")}>
                <Switch checked={time24h} onChange={setTime24h} label={t(locale, "spTimeFormat")} />
              </Row>
              <Row label={t(locale, "spAutoTimezone")}>
                <Switch checked={autoTimezone} onChange={setAutoTimezone} label={t(locale, "spAutoTimezone")} />
              </Row>
              {autoTimezone && browserTimezone && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t(locale, "spTimezone")}: {browserTimezone}
                </p>
              )}
              <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                <Row label={t(locale, "spDelete")}>
                  <button
                    type="button"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    {t(locale, "spDelete")}
                  </button>
                </Row>
              </div>
            </div>
          )}

          {activeSection === "upgrade" && pricingNote}

          {activeSection === "privacy" && (
            <div className="space-y-4">
              <Row label={t(locale, "spTwoFactor")}>
                <a className={linkClass} href={accountCentreUrl}>
                  {t(locale, "spManageCentre")}
                </a>
              </Row>
              <Row label={t(locale, "spRecoveryEmail")}>
                <a className={linkClass} href={accountCentreUrl}>
                  {t(locale, "spManageCentre")}
                </a>
              </Row>
              <Row label={t(locale, "spSecurityHelper")}>
                <Switch checked={securityHelper} onChange={setSecurityHelper} label={t(locale, "spSecurityHelper")} />
              </Row>
              <Row label={t(locale, "spBlocked")}>
                <span className="text-sm text-slate-600 dark:text-slate-300">{blockedCount}</span>
                {/* No management callback exists in this panel's props, so the
                    button stays disabled rather than pretending to work. */}
                <Button disabled>{t(locale, "spManageBlocked")}</Button>
              </Row>
            </div>
          )}

          {activeSection === "sessions" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-[#e8eaed]">{t(locale, "spCurrentSession")}</span>
                  <span className="block text-sm text-slate-600 dark:text-slate-300">
                    {t(locale, "spThisBrowser")} · {t(locale, "spOnline")}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  {/* Ending a session is an Account Centre action. */}
                  <Button disabled>{t(locale, "spEndSession")}</Button>
                  <a className={linkClass} href={accountCentreUrl}>
                    {t(locale, "spManageCentre")}
                  </a>
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spSessionNote")}</p>
            </div>
          )}

          {activeSection === "aliases" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-900 dark:text-[#e8eaed]">
                {t(locale, "spDefaultIdentity")}: {displayName} / {email}
              </p>
              {aliases.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spNoAliases")}</p>
              ) : (
                <ul className="space-y-1">
                  {aliases.map((alias) => (
                    <li key={alias} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-white/10 dark:text-[#e8eaed]">
                      {alias}
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="secondary" onClick={onCreateAlias}>
                {t(locale, "spCreateAlias")}
              </Button>
            </div>
          )}

          {activeSection === "hide" && (
            <div className="space-y-2">
              <p className="font-medium text-slate-900 dark:text-[#e8eaed]">{t(locale, "spHideSoon")}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spHideNote")}</p>
            </div>
          )}

          {activeSection === "autoreply" && (
            <div className="space-y-3">
              <Row label={t(locale, "spAutoReply")}>
                <span className="text-sm text-slate-600 dark:text-slate-300">{autoReply.enabled ? t(locale, "spOn") : t(locale, "spOff")}</span>
                <Switch
                  checked={autoReply.enabled}
                  onChange={(enabled) => onAutoReplyChange({ ...autoReply, enabled })}
                  label={t(locale, "spAutoReply")}
                />
              </Row>
              {autoReply.enabled && (
                <Field label={t(locale, "spReplyMessage")}>
                  <Textarea
                    rows={4}
                    value={autoReply.message}
                    placeholder={t(locale, "spReplyPlaceholder")}
                    onChange={(e) => onAutoReplyChange({ ...autoReply, message: e.target.value })}
                  />
                </Field>
              )}
            </div>
          )}

          {activeSection === "signature" && (
            <div className="space-y-3">
              <Field label={t(locale, "spSignature")}>
                <Textarea rows={4} value={signature} onChange={(e) => onSignatureChange(e.target.value)} />
              </Field>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spSignatureNote")}</p>
            </div>
          )}

          {activeSection === "billing" && pricingNote}

          {activeSection === "download" && <div>{downloadSlot ?? <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spDownloadNote")}</p>}</div>}
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={() => setDeleteDialogOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-delete-title"
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#1e1e1e]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="settings-delete-title" className="text-base font-semibold text-slate-900 dark:text-[#e8eaed]">
              {t(locale, "spDelete")}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(locale, "spDeleteText")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a className={linkClass} href={accountCentreUrl}>
                {t(locale, "spGoCentre")}
              </a>
              <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                {t(locale, "spCancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
