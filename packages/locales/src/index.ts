import accountEn from "./en/account.json";
import commonEn from "./en/common.json";
import mailEn from "./en/mail.json";
import accountHi from "./hi/account.json";
import commonHi from "./hi/common.json";
import mailHi from "./hi/mail.json";

export type Locale = "en" | "hi";
export const locales: Locale[] = ["en", "hi"];
export const defaultLocale: Locale = "en";
export const isLocale = (value: string): value is Locale => value === "en" || value === "hi";

type Dict = Record<string, string>;
const dictionaries: Record<Locale, Dict> = {
  en: { ...commonEn, ...mailEn, ...accountEn },
  hi: { ...commonHi, ...mailHi, ...accountHi },
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
}

export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === "en" ? clean : `/hi${clean === "/" ? "" : clean}`;
}

export function counterpartPath(locale: Locale, path: string): string {
  if (locale === "en") return `/hi${path === "/" ? "" : path}`;
  return path.replace(/^\/hi(\/|$)/, "/") || "/";
}
