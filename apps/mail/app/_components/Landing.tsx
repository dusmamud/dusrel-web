import Link from "next/link";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Button } from "@dusrel/ui";

export function Landing({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const appHome = locale === "hi" ? "https://mail.dusrel.com/hi/inbox" : "https://mail.dusrel.com/inbox";
  const loginUrl = `https://account.dusrel.com/${locale === "hi" ? "hi/" : ""}login?return_to=${encodeURIComponent(appHome)}`;
  const signupUrl = `https://account.dusrel.com/${locale === "hi" ? "hi/" : ""}signup?return_to=${encodeURIComponent(appHome)}`;
  const features = [
    { desc: t(locale, "featurePrivateDesc"), title: t(locale, "featurePrivate") },
    { desc: t(locale, "featureAliasesDesc"), title: t(locale, "featureAliases") },
    { desc: t(locale, "featureProtectedDesc"), title: t(locale, "featureProtected") },
    { desc: t(locale, "featureSeedDesc"), title: t(locale, "featureSeed") },
  ];
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold">{t(locale, "appName")}</span>
        <div className="flex items-center gap-3">
          <a href={loginUrl}>
            <Button variant="secondary">{t(locale, "login")}</Button>
          </a>
          <a href={signupUrl}>
            <Button>{t(locale, "signup")}</Button>
          </a>
          <Link href={counterpartPath(locale, currentPath)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            {locale === "en" ? "हिन्दी" : "English"}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t(locale, "landingTitle")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{t(locale, "landingSubtitle")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <a href={signupUrl}>
            <Button>{t(locale, "signup")}</Button>
          </a>
          <Link href={localePath(locale, "/inbox")}>
            <Button variant="secondary">{t(locale, "demoInbox")}</Button>
          </Link>
        </div>
        <div className="mt-16 grid gap-4 text-left sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs text-gray-500">{t(locale, "demoNote")}</p>
      </main>
    </div>
  );
}
