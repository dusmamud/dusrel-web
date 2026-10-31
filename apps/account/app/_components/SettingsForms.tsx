"use client";
import { useEffect, useState } from "react";
import { getDemoSession } from "@dusrel/auth";
import { t, type Locale } from "@dusrel/locales";
import { Button, Field, Input } from "@dusrel/ui";

export function HomeInfo({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  useEffect(() => {
    setEmail(getDemoSession() ?? "");
  }, []);
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "welcomeAccount")}</h1>
      {email && <p className="mt-2 text-sm text-gray-600">{email}</p>}
      <p className="mt-2 text-sm text-gray-600">{t(locale, "profileDesc")}</p>
    </div>
  );
}

export function ProfileForm({ locale }: { locale: Locale }) {
  const [name, setName] = useState("You");
  const [recovery, setRecovery] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "profile")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "profileDesc")}</p>
      <div className="mt-4 max-w-lg space-y-3">
        <Field label={t(locale, "displayName")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t(locale, "recoveryEmail")}>
          <Input value={recovery} onChange={(e) => setRecovery(e.target.value)} type="email" />
        </Field>
        <Button onClick={() => setSaved(true)}>{t(locale, "saveProfile")}</Button>
        {saved && <span className="ml-2 text-sm text-gray-600">{t(locale, "savedProfile")}</span>}
      </div>
    </div>
  );
}

export function PasswordForm({ locale }: { locale: Locale }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "changePassword")}</h1>
      <div className="mt-4 max-w-lg space-y-3">
        <Field label={t(locale, "currentPassword")}>
          <Input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" />
        </Field>
        <Field label={t(locale, "newPassword")}>
          <Input value={next} onChange={(e) => setNext(e.target.value)} type="password" />
        </Field>
        <Field label={t(locale, "confirmNewPassword")}>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" />
        </Field>
        {message && <p className="text-sm text-gray-700">{message}</p>}
        <Button
          onClick={() => {
            if (next.length < 8) {
              setMessage(t(locale, "passwordTooShort"));
              return;
            }
            if (next !== confirm) {
              setMessage(t(locale, "passwordMismatch"));
              return;
            }
            setMessage(t(locale, "passwordChanged"));
          }}
        >
          {t(locale, "changePassword")}
        </Button>
      </div>
    </div>
  );
}

function randomSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let out = "";
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function TwoFactorForm({ locale }: { locale: Locale }) {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  useEffect(() => {
    setSecret(randomSecret());
  }, []);
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "twoFactor")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "twoFactorDesc")}</p>
      {enabled ? (
        <div className="mt-4">
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{t(locale, "twoFactorEnabled")}</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => setEnabled(false)}>
              {t(locale, "twoFactorDisable")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 max-w-lg space-y-3">
          <p className="text-sm text-gray-700">{t(locale, "twoFactorSetup")}</p>
          <p className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm break-all">{secret || "…"}</p>
          <Field label={t(locale, "twoFactorCode")}>
            <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" />
          </Field>
          <Button
            onClick={() => {
              if (/^\d{6}$/.test(code)) {
                setEnabled(true);
                setCodes(Array.from({ length: 10 }, () => `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`));
              }
            }}
          >
            {t(locale, "verifyCode")}
          </Button>
          {codes.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="mb-2 text-sm font-medium">Recovery codes</p>
              <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
                {codes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RecoveryInfo({ locale }: { locale: Locale }) {
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "recovery")}</h1>
      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{t(locale, "recoveryWarning")}</p>
      <h2 className="mt-6 font-medium">{t(locale, "forgotPassword")}</h2>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "recoveryPasswordDesc")}</p>
      <h2 className="mt-6 font-medium">Seed recovery</h2>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "recoverySeedDesc")}</p>
      <p className="mt-4 text-sm text-gray-600">No seed phrase is generated or shown on this page in Phase 1. Seed backup is a separate flow from password reset and must never be mixed into one button.</p>
    </div>
  );
}

const initialSessions = [
  { device: "This browser", last: "2026-10-31", current: true, id: "s1" },
  { device: "Phone", last: "2026-10-30", current: false, id: "s2" },
  { device: "Laptop", last: "2026-10-28", current: false, id: "s3" },
];

export function SessionsList({ locale }: { locale: Locale }) {
  const [sessions, setSessions] = useState(initialSessions);
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "devices")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "devicesDesc")}</p>
      <p className="mt-2 text-xs text-gray-500">{t(locale, "sessionsNote")}</p>
      <ul className="mt-4 space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm">
              {s.device} {s.current ? "(current)" : ""} · {s.last}
            </span>
            {!s.current && (
              <Button variant="secondary" onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))}>
                {t(locale, "revoke")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function randomAppPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}-${part()}-${part()}`;
}

export function AppPasswords({ locale }: { locale: Locale }) {
  const [name, setName] = useState("");
  const [shown, setShown] = useState("");
  const [list, setList] = useState<{ created: string; id: string; name: string }[]>([]);
  return (
    <div>
      <h1 className="text-lg font-semibold">{t(locale, "appPasswords")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "appPasswordsDesc")}</p>
      <p className="mt-2 text-xs text-gray-500">{t(locale, "appPasswordsNote")}</p>
      <div className="mt-4 max-w-lg space-y-3">
        <Field label={t(locale, "appPasswordName")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Button
          onClick={() => {
            if (!name.trim()) return;
            setShown(randomAppPassword());
            setList((prev) => [{ created: "2026-10-31", id: `${Date.now()}`, name: name.trim() }, ...prev]);
            setName("");
          }}
        >
          {t(locale, "createAppPassword")}
        </Button>
        {shown && (
          <div className="rounded-lg bg-gray-100 p-3">
            <p className="text-xs text-gray-600">{t(locale, "showOnce")}</p>
            <p className="font-mono text-sm break-all">{shown}</p>
          </div>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {list.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm">
              {item.name} · {item.created}
            </span>
            <Button variant="secondary" onClick={() => setList((prev) => prev.filter((x) => x.id !== item.id))}>
              {t(locale, "revoke")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
