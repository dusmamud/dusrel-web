// Return-to validation, locked by docs/28. This is the single source of
// truth for every app that links to the Account Centre login/signup.
// Security rules: https only, host must exactly match the allowlist
// (no suffix tricks), path must start with a single "/" (no "//").
// Invalid or missing input falls back to the Account Centre home.
// This function is destination validation only — it is NOT CSRF
// protection. An OIDC/OAuth flow must also use state (+ nonce/PKCE).

export const ACCOUNT_HOME = "https://account.dusrel.com/";

// Phase 1 list only: the products currently in focus plus the suite
// home. Doc 28 holds the full allowlist; hosts for products that are
// not in focus yet are added here only when that product is built,
// never before. Until then, a return_to to such a host falls back to
// the Account Centre home, which is the safe behaviour.
export const RETURN_TO_HOSTS = [
  "mail.dusrel.com",
  "account.dusrel.com",
  "dusrel.com",
] as const;

export function validateReturnTo(raw: string | null | undefined): string {
  if (!raw) return ACCOUNT_HOME;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return ACCOUNT_HOME;
  }
  if (url.protocol !== "https:") return ACCOUNT_HOME;
  if (!(RETURN_TO_HOSTS as readonly string[]).includes(url.hostname)) return ACCOUNT_HOME;
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

// Demo session only, Phase 1. This is NOT real authentication: the value
// lives in this browser's localStorage and is never sent to a server.
// It exists so the Account Centre and Mail demo flows can be tried
// end-to-end before the real auth-api exists. Real auth must replace
// this whole module, not extend it.
const DEMO_SESSION_KEY = "dusrel-demo-session";

export function getDemoSession(): string | null {
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
    // Demo only: a private-mode failure must not break the page.
  }
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Demo only.
  }
}
