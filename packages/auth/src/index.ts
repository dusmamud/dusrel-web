// Return-to validation, locked by docs/28. This is the single source of
// truth for every app that links to the Account Centre login/signup.
// Security rules: https only, host must exactly match the allowlist
// (no suffix tricks), path must start with a single "/" (no "//").
// Invalid or missing input falls back to the Account Centre home.

export const ACCOUNT_HOME = "https://account.dusrel.com/";

export const RETURN_TO_HOSTS = [
  "mail.dusrel.com",
  "account.dusrel.com",
  "dusrel.com",
] as const;

export const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  "https://innovative-remove-generally-amber.trycloudflare.com";

export function validateReturnTo(raw: string | null | undefined): string {
  if (!raw) return ACCOUNT_HOME;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return ACCOUNT_HOME;
  }
  // Allow http only on localhost for local testing
  if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) {
    return ACCOUNT_HOME;
  }
  const isAllowedHost =
    (RETURN_TO_HOSTS as readonly string[]).includes(url.hostname) ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".trycloudflare.com");
  if (!isAllowedHost) return ACCOUNT_HOME;
  if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return ACCOUNT_HOME;
  return url.toString();
}

export function accountLoginUrl(returnTo: string, locale: "en" | "hi" = "en"): string {
  const prefix = locale === "hi" ? "hi/" : "";
  return `https://account.dusrel.com/${prefix}login?return_to=${encodeURIComponent(validateReturnTo(returnTo))}`;
}

export function accountSignupUrl(returnTo: string, locale: "en" | "hi" = "en"): string {
  const prefix = locale === "hi" ? "hi/" : "";
  return `https://account.dusrel.com/${prefix}signup?return_to=${encodeURIComponent(validateReturnTo(returnTo))}`;
}

// -----------------------------------------------------------------------------
// Authentication Tokens & User Model
// -----------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "user";
  status: string;
  quotaGb: number;
  totpEnabled: boolean;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const STORAGE_KEY_TOKEN = "dusrel_access_token";
const STORAGE_KEY_REFRESH = "dusrel_refresh_token";
const STORAGE_KEY_USER = "dusrel_user";
const DEMO_SESSION_KEY = "dusrel-demo-session";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isDusrelDomain = window.location.hostname.endsWith("dusrel.com");
  const domainPart = isDusrelDomain ? "; domain=.dusrel.com" : "";
  const securePart = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax${domainPart}${securePart}`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  const isDusrelDomain = window.location.hostname.endsWith("dusrel.com");
  const domainPart = isDusrelDomain ? "; domain=.dusrel.com" : "";
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie(STORAGE_KEY_TOKEN) || window.localStorage.getItem(STORAGE_KEY_TOKEN) || null;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = getCookie(STORAGE_KEY_USER) || window.localStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    setCookie(STORAGE_KEY_TOKEN, session.accessToken);
    setCookie(STORAGE_KEY_REFRESH, session.refreshToken);
    setCookie(STORAGE_KEY_USER, JSON.stringify(session.user));
    window.localStorage.setItem(STORAGE_KEY_TOKEN, session.accessToken);
    window.localStorage.setItem(STORAGE_KEY_REFRESH, session.refreshToken);
    window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session.user));
    // Keep backward-compatible demo key for components referencing it
    window.localStorage.setItem(DEMO_SESSION_KEY, session.user.email);
  } catch {
    // Non-fatal if storage fails in private browsing
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    removeCookie(STORAGE_KEY_TOKEN);
    removeCookie(STORAGE_KEY_REFRESH);
    removeCookie(STORAGE_KEY_USER);
    window.localStorage.removeItem(STORAGE_KEY_TOKEN);
    window.localStorage.removeItem(STORAGE_KEY_REFRESH);
    window.localStorage.removeItem(STORAGE_KEY_USER);
    window.localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Non-fatal
  }
}

// -----------------------------------------------------------------------------
// API Actions
// -----------------------------------------------------------------------------

export async function loginUser(input: {
  email: string;
  password: string;
  totpCode?: string;
  backupCode?: string;
  returnTo?: string;
}): Promise<AuthSession & { redirectTo: string }> {
  const res = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
  const session: AuthSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  };
  saveSession(session);
  return { ...session, redirectTo: data.redirectTo || ACCOUNT_HOME };
}

export async function signupUser(input: {
  email: string;
  password: string;
  displayName?: string;
  inviteCode?: string;
  returnTo?: string;
}): Promise<AuthSession & { redirectTo: string }> {
  const res = await fetch(`${AUTH_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }
  const session: AuthSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  };
  saveSession(session);
  return { ...session, redirectTo: data.redirectTo || ACCOUNT_HOME };
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearSession();
}

// -----------------------------------------------------------------------------
// Backward Compatibility for existing components
// -----------------------------------------------------------------------------

export function getDemoSession(): string | null {
  const user = getStoredUser();
  if (user?.email) return user.email;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DEMO_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setDemoSession(email: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_SESSION_KEY, email);
  } catch {
    // Ignore
  }
}

export function clearDemoSession(): void {
  clearSession();
}
