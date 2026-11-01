"use client";
import { useState } from "react";
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
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#4d90fe]" : "bg-slate-300 dark:bg-white/20"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</h3>;
}

export function PrivacyCenter({ locale, onBack, hasRecoveryEmail, onCreateAlias, onSelectEncryption, accountCentreUrl = "https://account.dusrel.com/", variant = "panel" }: PrivacyCenterProps) {
  // Local display preferences only. The parent owns persistence; nothing here
  // talks to an API, and real account-level security lives in the Account Centre.
  const [securityHelper, setSecurityHelper] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  const linkClass = "text-sm font-medium text-[#4d90fe] hover:underline";

  const sidebar = variant === "sidebar";

  return (
    <div className={sidebar ? "bg-white px-4 py-4 dark:bg-[#121212]" : "rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1e1e1e]"}>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← {t(locale, "pcBack")}
        </Button>
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
        <section className="space-y-3">
          <SectionTitle>{t(locale, "pcSecurityTitle")}</SectionTitle>
          <div className={sidebar ? "flex flex-col items-start gap-1" : "flex items-center justify-between gap-3"}>
            <span className="text-sm text-slate-900 dark:text-[#e8eaed]">{t(locale, "pcRecoveryEmail")}</span>
            <span className={sidebar ? "flex flex-wrap items-center gap-2" : "flex items-center gap-3"}>
              {!hasRecoveryEmail && <Badge>{t(locale, "pcRecoveryAction")}</Badge>}
              <a className={linkClass} href={accountCentreUrl}>
                {hasRecoveryEmail ? t(locale, "pcRecoveryManage") : t(locale, "pcRecoveryAdd")}
              </a>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-900 dark:text-[#e8eaed]">{t(locale, "pcSecurityHelper")}</span>
            <Switch checked={securityHelper} onChange={setSecurityHelper} label={t(locale, "pcSecurityHelper")} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-900 dark:text-[#e8eaed]">{t(locale, "pcTwoFactor")}</span>
              <Switch checked={twoFactor} onChange={setTwoFactor} label={t(locale, "pcTwoFactor")} />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t(locale, "pcTwoFactorNote")}{" "}
              <a className={linkClass} href={accountCentreUrl}>
                {t(locale, "pcRecoveryManage")}
              </a>
            </p>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-white/10">
          <SectionTitle>{t(locale, "pcHideTitle")}</SectionTitle>
          {sidebar ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-400">{t(locale, "pcHideMyEmail")}</span>
              <Badge>{t(locale, "pcComingSoon")}</Badge>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>{t(locale, "pcHideMyEmail")}</Button>
              <Badge>{t(locale, "pcComingSoon")}</Badge>
            </div>
          )}
          <div>
            <Button variant="secondary" onClick={onCreateAlias}>
              {t(locale, "pcCreateAlias")}
            </Button>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-white/10">
          <SectionTitle>{t(locale, "pcSecureTitle")}</SectionTitle>
          <div className="flex flex-col items-stretch gap-2">
            <Button variant="secondary" onClick={() => onSelectEncryption("password")}>
              {t(locale, "pcEncryptPassword")}
            </Button>
            <Button variant="secondary" onClick={() => onSelectEncryption("file")}>
              {t(locale, "pcEncryptFile")}
            </Button>
            <Button variant="secondary" onClick={() => onSelectEncryption("dusrel")}>
              {t(locale, "pcEncryptDusrel")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
