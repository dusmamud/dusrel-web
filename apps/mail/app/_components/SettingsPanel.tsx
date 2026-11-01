"use client";
import { useEffect, useState, type ReactNode } from "react";
import { t, type Locale } from "@dusrel/locales";
import { Button, Field, Input, Textarea } from "@dusrel/ui";
import { AppearanceCards } from "@dusrel/brand";

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
  // Optional controlled Security Helper state. When MailApp passes these, this
  // switch shares the same localStorage key as PrivacyCenter's switch (the
  // persistence itself lives in MailApp); otherwise it falls back to local
  // state, exactly as before.
  securityHelper?: boolean;
  onSecurityHelperChange?: (value: boolean) => void;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${checked ? "bg-[#4d90fe]" : "bg-slate-300 dark:bg-white/20"}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-semibold text-slate-900 dark:text-[#e8eaed]">{label}</span>
      <span className="flex flex-1 items-center justify-end gap-3">{children}</span>
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
  securityHelper: securityHelperProp,
  onSecurityHelperChange,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [time24h, setTime24h] = useState(true);
  const [autoTimezone, setAutoTimezone] = useState(true);
  const [browserTimezone, setBrowserTimezone] = useState("");
  const [localSecurityHelper, setLocalSecurityHelper] = useState(false);
  // Settings owned here persist in localStorage (same contract keys the
  // Privacy Center reads, so both switches share one stored value).
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const securityHelper = securityHelperProp ?? localSecurityHelper;
  const handleSecurityHelper = (value: boolean) => {
    if (onSecurityHelperChange) onSecurityHelperChange(value);
    else setLocalSecurityHelper(value);
  };
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Read on mount only, so server and client render the same first pass.
  useEffect(() => {
    try {
      setBrowserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setBrowserTimezone("");
    }
    try {
      const stored24h = window.localStorage.getItem("dusrel-mail-time24h");
      if (stored24h === "true" || stored24h === "false") setTime24h(stored24h === "true");
      const storedTz = window.localStorage.getItem("dusrel-mail-auto-timezone");
      if (storedTz === "true" || storedTz === "false") setAutoTimezone(storedTz === "true");
      if (securityHelperProp === undefined) {
        const storedHelper = window.localStorage.getItem("dusrel-mail-security-helper");
        if (storedHelper === "true" || storedHelper === "false") setLocalSecurityHelper(storedHelper === "true");
      }
    } catch {
      // Private mode etc.: settings just don't persist.
    }
    setSettingsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return;
    try {
      window.localStorage.setItem("dusrel-mail-time24h", time24h ? "true" : "false");
    } catch {
      // Private mode etc.: the setting just doesn't persist.
    }
  }, [time24h, settingsHydrated]);

  useEffect(() => {
    if (!settingsHydrated) return;
    try {
      window.localStorage.setItem("dusrel-mail-auto-timezone", autoTimezone ? "true" : "false");
    } catch {
      // Private mode etc.: the setting just doesn't persist.
    }
  }, [autoTimezone, settingsHydrated]);

  useEffect(() => {
    if (!settingsHydrated || securityHelperProp !== undefined) return;
    try {
      window.localStorage.setItem("dusrel-mail-security-helper", localSecurityHelper ? "true" : "false");
    } catch {
      // Private mode etc.: the setting just doesn't persist.
    }
  }, [localSecurityHelper, settingsHydrated, securityHelperProp]);

  const linkClass = "text-sm font-medium text-[#4d90fe] hover:underline";

  const iconProps = {
    "aria-hidden": true,
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "shrink-0 text-slate-400",
  } as const;
  const NAV_ICONS = {
    account: (<svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
    upgrade: (<svg {...iconProps}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>),
    privacy: (<svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
    sessions: (<svg {...iconProps}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>),
    aliases: (<span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-400">@</span>),
    hide: (<svg {...iconProps}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /><line x1="1" y1="1" x2="23" y2="23" /></svg>),
    autoreply: (<svg {...iconProps}><polyline points="9 14 4 9 9 4" /><path d="M20 20v-4a4 4 0 0 0-4-4H4" /></svg>),
    signature: (<svg {...iconProps}><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>),
    billing: (<svg {...iconProps}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>),
    download: (<svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>),
  };
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
    <div className="min-h-[600px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#1e1e1e]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spTitle")}</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose} aria-label={t(locale, "spClose")} title={t(locale, "spClose")}>
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav className="flex shrink-0 flex-col gap-1 lg:w-56" aria-label={t(locale, "spTitle")}>
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(locale, "spTitle")}</p>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "true" : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${
                activeSection === item.id ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-[#e8eaed]" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              {NAV_ICONS[item.id]}
              {t(locale, item.key)}
              {/* Sessions pane lists only the current session — honest count. */}
              {item.id === "sessions" && <span className="ml-auto text-xs text-slate-400">1</span>}
              {item.id === "autoreply" && <span className="ml-auto text-xs text-slate-400">{autoReply.enabled ? t(locale, "spOn") : t(locale, "spOff")}</span>}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {activeSection === "account" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spAccount")}</h3>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spDisplayName")}</span>
                <Input value={displayName} onChange={(e) => onDisplayNameChange(e.target.value)} />
              </label>
              <div>
                <span className="mb-1 block text-sm font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spDefaultEmail")}</span>
                <span className="block text-sm text-slate-900 dark:text-[#e8eaed]">{email}</span>
              </div>
              <Row label={t(locale, "spPassword")}>
                <span aria-hidden="true" className="text-sm tracking-widest text-slate-900 dark:text-[#e8eaed]">
                  ••••••••
                </span>
                <Button variant="secondary" onClick={() => { window.location.href = accountCentreUrl; }}>
                  {t(locale, "spChange")}
                </Button>
              </Row>
              <p className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spSystemPreferences")}</p>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spAppearance")}</p>
                <AppearanceCards />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spTimeFormatLabel")}</span>
                  <span className="block text-sm text-slate-600 dark:text-slate-300">{t(locale, "spTimeFormat")}</span>
                </span>
                <Switch checked={time24h} onChange={setTime24h} label={t(locale, "spTimeFormatLabel")} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spAutoTimezone")}</span>
                  {autoTimezone && browserTimezone && (
                    <span className="block text-sm text-slate-600 dark:text-slate-300">
                      {t(locale, "spTimezone")}: {browserTimezone}
                    </span>
                  )}
                </span>
                <Switch checked={autoTimezone} onChange={setAutoTimezone} label={t(locale, "spAutoTimezone")} />
              </div>
              <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                <Row label={t(locale, "spDelete")}>
                  <button
                    type="button"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    {t(locale, "spDelete")}
                  </button>
                </Row>
              </div>
            </div>
          )}

          {activeSection === "upgrade" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spUpgrade")}</h3>
              {pricingNote}
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spPrivacy")}</h3>
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
                <Switch checked={securityHelper} onChange={handleSecurityHelper} label={t(locale, "spSecurityHelper")} />
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spSessions")}</h3>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spAliases")}</h3>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spHide")}</h3>
              <p className="font-medium text-slate-900 dark:text-[#e8eaed]">{t(locale, "spHideSoon")}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spHideNote")}</p>
            </div>
          )}

          {activeSection === "autoreply" && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spAutoReply")}</h3>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spSignature")}</h3>
              <Field label={t(locale, "spSignature")}>
                <Textarea rows={4} value={signature} onChange={(e) => onSignatureChange(e.target.value)} />
              </Field>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spSignatureNote")}</p>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spBilling")}</h3>
              {pricingNote}
            </div>
          )}

          {activeSection === "download" && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "spDownload")}</h3>
              <div>{downloadSlot ?? <p className="text-sm text-slate-600 dark:text-slate-300">{t(locale, "spDownloadNote")}</p>}</div>
            </div>
          )}
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
            <div className="flex items-start justify-between gap-3">
              <h3 id="settings-delete-title" className="text-base font-semibold text-slate-900 dark:text-[#e8eaed]">
                {t(locale, "spDelete")}
              </h3>
              <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} aria-label={t(locale, "spClose")} title={t(locale, "spClose")}>
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </Button>
            </div>
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
