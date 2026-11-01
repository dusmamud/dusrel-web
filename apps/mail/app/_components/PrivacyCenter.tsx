"use client";
import { useEffect, useState } from "react";
import { t, type Locale } from "@dusrel/locales";
import { Badge, Button } from "@dusrel/ui";

export type SecureEmailType = "password" | "file" | "dusrel";

export interface PrivacyCenterProps {
  locale: Locale;
  onBack: () => void;
  hasRecoveryEmail: boolean;
  onCreateAlias: () => void;
  onSelectEncryption: (enc: SecureEmailType) => void;
  accountCentreUrl?: string;
  variant?: "panel" | "sidebar";
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

function SectionTitle({ children, open, onToggle }: { children: string; open: boolean; onToggle: () => void }) {
  return (
    <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50"
      >
        <span>{children}</span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "" : "rotate-180"}`}
        >
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
    </h3>
  );
}

function RowIcon({ name }: { name: "person" | "lock" | "shield" | "eye" | "file" | "sparkle" }) {
  const common = {
    "aria-hidden": true,
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "shrink-0 text-slate-400",
  } as const;
  const paths = {
    person: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
    lock: (<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    eye: (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
    file: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
    sparkle: <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function PrivacyCenter({ locale, onBack, hasRecoveryEmail, onCreateAlias, onSelectEncryption, accountCentreUrl = "https://account.dusrel.com/", variant = "panel" }: PrivacyCenterProps) {
  // Security Helper persists to the shared localStorage key below — the same
  // key the SettingsPanel switch is persisted to via MailApp props — so both
  // switches read one source of truth. Two-factor stays local display state;
  // real account-level security lives in the Account Centre.
  const [securityHelper, setSecurityHelper] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState({ security: false, hide: false, secure: false });

  // Read on mount only, so server and client render the same first pass.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("dusrel-mail-security-helper");
      if (stored === "true" || stored === "false") setSecurityHelper(stored === "true");
    } catch {
      // Private mode must not break the panel.
    }
  }, []);

  const handleSecurityHelper = (value: boolean) => {
    setSecurityHelper(value);
    try {
      window.localStorage.setItem("dusrel-mail-security-helper", value ? "true" : "false");
    } catch {
      // Private mode must not break the panel.
    }
  };

  const toggleSection = (section: "security" | "hide" | "secure") =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  const linkClass = "text-sm font-medium text-[#4d90fe] hover:underline";

  const sidebar = variant === "sidebar";

  return (
    <div className={sidebar ? "bg-white px-4 py-4 dark:bg-[#121212]" : "rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1e1e1e]"}>
      <div className="mb-3 flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          aria-label={t(locale, "pcBack")}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ‹ <span className="uppercase">{t(locale, "pcBack")}</span>
        </button>
        {sidebar ? null : <h2 className="text-lg font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "pcTitle")}</h2>}
      </div>

      {!sidebar && !promptDismissed && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="font-medium text-slate-900 dark:text-[#e8eaed]">{t(locale, "pcProtectTitle")}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(locale, "pcProtectText")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setPromptDismissed(true)}>
              {t(locale, "pcDismiss")}
            </Button>
            <a className={linkClass} href={accountCentreUrl}>
              {t(locale, "pcRecoveryAdd")}
            </a>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <section className="space-y-4">
          <SectionTitle open={!collapsed.security} onToggle={() => toggleSection("security")}>{t(locale, "pcSecurityTitle")}</SectionTitle>
          {!collapsed.security && (
            <>
          <a
            href={accountCentreUrl}
            aria-label={!hasRecoveryEmail ? `${t(locale, "pcRecoveryEmail")} — ${t(locale, "pcRecoveryAction")}` : undefined}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:hover:bg-white/5"
          >
            <span className="flex items-center gap-2 text-[15px] text-slate-600 dark:text-[#e8eaed]"><RowIcon name="person" />{t(locale, "pcRecoveryEmail")}</span>
            <span className="flex shrink-0 items-center gap-2">
              {!hasRecoveryEmail && (
                <span aria-hidden="true" title={t(locale, "pcRecoveryAction")} className="h-2 w-2 rounded-full bg-amber-500" />
              )}
              <span aria-hidden="true" className="text-slate-400">›</span>
            </span>
          </a>
          <div className="flex items-center justify-between gap-3 py-2">
            <span className="flex items-center gap-2 text-[15px] text-slate-600 dark:text-[#e8eaed]"><RowIcon name="lock" />{t(locale, "pcSecurityHelper")}</span>
            <Switch checked={securityHelper} onChange={handleSecurityHelper} label={t(locale, "pcSecurityHelper")} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2 text-[15px] text-slate-600 dark:text-[#e8eaed]"><RowIcon name="shield" />{t(locale, "pcTwoFactor")}</span>
              <Switch checked={twoFactor} onChange={setTwoFactor} label={t(locale, "pcTwoFactor")} />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t(locale, "pcTwoFactorNote")}{" "}
              <a className={linkClass} href={accountCentreUrl}>
                {t(locale, "pcRecoveryManage")}
              </a>
            </p>
          </div>
            </>
          )}
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-5 dark:border-white/10">
          <SectionTitle open={!collapsed.hide} onToggle={() => toggleSection("hide")}>{t(locale, "pcHideTitle")}</SectionTitle>
          {!collapsed.hide && (
            <>
          {sidebar ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[15px] text-slate-400"><RowIcon name="eye" />{t(locale, "pcHideMyEmail")}</span>
              <Badge>{t(locale, "pcComingSoon")}</Badge>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>{t(locale, "pcHideMyEmail")}</Button>
              <Badge>{t(locale, "pcComingSoon")}</Badge>
            </div>
          )}
          <div>
            <button type="button" onClick={onCreateAlias} className="flex items-center gap-2 rounded-lg px-2 py-3 text-left text-[15px] text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-[#e8eaed] dark:hover:bg-white/5">
              <span aria-hidden="true" className="flex h-[20px] w-[20px] shrink-0 items-center justify-center text-slate-400">@</span>
              {t(locale, "pcCreateAlias")}
            </button>
          </div>
            </>
          )}
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-5 dark:border-white/10">
          <SectionTitle open={!collapsed.secure} onToggle={() => toggleSection("secure")}>{t(locale, "pcSecureTitle")}</SectionTitle>
          {!collapsed.secure && (
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => onSelectEncryption("password")} className="flex items-center gap-2 rounded-lg px-2 py-3 text-left text-[15px] text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-[#e8eaed] dark:hover:bg-white/5">
              <RowIcon name="lock" />{t(locale, "pcEncryptPassword")}
            </button>
            <button type="button" onClick={() => onSelectEncryption("file")} className="flex items-center gap-2 rounded-lg px-2 py-3 text-left text-[15px] text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-[#e8eaed] dark:hover:bg-white/5">
              <RowIcon name="file" />{t(locale, "pcEncryptFile")}
            </button>
            <button type="button" onClick={() => onSelectEncryption("dusrel")} className="flex items-center gap-2 rounded-lg px-2 py-3 text-left text-[15px] text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 dark:text-[#e8eaed] dark:hover:bg-white/5">
              <RowIcon name="sparkle" />{t(locale, "pcEncryptDusrel")}
            </button>
          </div>
          )}
        </section>
      </div>
    </div>
  );
}
