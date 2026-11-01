import Link from "next/link";
import { Logo, ThemeToggle } from "@dusrel/brand";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Button } from "@dusrel/ui";

// Mail landing, rebuilt to mirror the reference landing page's section
// flow (hero -> privacy -> simple -> devices -> secure -> FAQ -> footer)
// with Dusrel's own copy and branding. Nothing from the reference is
// copied: no reference text, images, ratings or badges are used, and
// no feature Dusrel does not have is claimed. In particular:
// - No AI feature section: Dusrel Mail has no AI features.
// - No ratings/review badges: Dusrel Mail has no such ratings yet.
// - No download buttons: no native apps are offered in this build.
// The main tagline is kept exactly as it was: "Private email,
// without the noise" (EN) / its Hindi translation.

export function Landing({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const appHome = locale === "hi" ? "https://mail.dusrel.com/hi/inbox" : "https://mail.dusrel.com/inbox";
  const loginUrl = `https://account.dusrel.com/${locale === "hi" ? "hi/" : ""}login?return_to=${encodeURIComponent(appHome)}`;
  const signupUrl = `https://account.dusrel.com/${locale === "hi" ? "hi/" : ""}signup?return_to=${encodeURIComponent(appHome)}`;
  // Privacy grid: four properties of Dusrel's end-to-end encryption
  // design (docs/07), not four separate products. Zero-access and
  // on-device decryption describe how E2EE works, they are not
  // additional features invented for this page.
  const privacyCards = [
    { desc: t(locale, "featurePrivateDesc"), title: t(locale, "featurePrivate") },
    { desc: t(locale, "privacyZeroAccessDesc"), title: t(locale, "privacyZeroAccess") },
    { desc: t(locale, "privacyOnDeviceDesc"), title: t(locale, "privacyOnDevice") },
    { desc: t(locale, "featureSeedDesc"), title: t(locale, "featureSeed") },
  ];
  const simpleCards = [
    { desc: t(locale, "featureAliasesDesc"), title: t(locale, "featureAliases") },
    { desc: t(locale, "featureProtectedDesc"), title: t(locale, "featureProtected") },
    { desc: t(locale, "secureNoTrackDesc"), title: t(locale, "secureNoTrack") },
  ];
  const deviceCards = [
    { desc: t(locale, "devicesWebDesc"), title: t(locale, "devicesWeb") },
    { desc: t(locale, "devicesResponsiveDesc"), title: t(locale, "devicesResponsive") },
    { desc: t(locale, "devicesNoInstallDesc"), title: t(locale, "devicesNoInstall") },
  ];
  const secureCards = [
    { desc: t(locale, "secureSpamDesc"), title: t(locale, "secureSpam") },
    { desc: t(locale, "secure2faDesc"), title: t(locale, "secure2fa") },
    { desc: t(locale, "secureAccountDesc"), title: t(locale, "secureAccount") },
  ];
  const faqs = [
    { a: t(locale, "faqA1"), q: t(locale, "faqQ1") },
    { a: t(locale, "faqA2"), q: t(locale, "faqQ2") },
    { a: t(locale, "faqA3"), q: t(locale, "faqQ3") },
    { a: t(locale, "faqA4"), q: t(locale, "faqQ4") },
  ];
  const section = "mx-auto max-w-5xl px-4 py-16";
  const card = "rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1e1e1e]";
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#121212]/85">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4">
          <Link href={localePath(locale, "/")}>
            <Logo label={t(locale, "appName")} />
          </Link>
          <nav className="ml-4 hidden items-center gap-4 text-sm text-slate-700 dark:text-slate-300 sm:flex">
            <a href="#privacy" className="hover:underline">
              {t(locale, "navPrivacy")}
            </a>
            <a href="#features" className="hover:underline">
              {t(locale, "navFeatures")}
            </a>
            <a href="#faq" className="hover:underline">
              {t(locale, "navFaq")}
            </a>
          </nav>
          <div className="flex-1" />
          <ThemeToggle />
          <a href={loginUrl}>
            <Button variant="secondary">{t(locale, "login")}</Button>
          </a>
          <a href={signupUrl}>
            <Button>{t(locale, "signup")}</Button>
          </a>
          <Link href={counterpartPath(locale, currentPath)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-white/20">
            {locale === "en" ? "हिन्दी" : "English"}
          </Link>
        </div>
      </header>

      <main>
        <section className={`${section} text-center`}>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-[#e8eaed]">{t(locale, "landingTitle")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">{t(locale, "landingSubtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={signupUrl}>
              <Button>{t(locale, "signup")}</Button>
            </a>
            <Link href={localePath(locale, "/inbox")}>
              <Button variant="secondary">{t(locale, "demoInbox")}</Button>
            </Link>
          </div>
          <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-[#1e1e1e]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(locale, "inbox")}</p>
            {[t(locale, "previewRow1"), t(locale, "previewRow2"), t(locale, "previewRow3")].map((row) => (
              <div key={row} className="border-t border-slate-200 px-2 py-2 text-sm text-slate-800 dark:border-white/10 dark:text-slate-200">
                {row}
              </div>
            ))}
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t(locale, "demoNote")}</p>
          </div>
        </section>

        <section id="privacy" className={section}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "privacyTitle")}</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{t(locale, "privacySubtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {privacyCards.map((f) => (
              <div key={f.title} className={card}>
                <h3 className="font-semibold text-slate-900 dark:text-[#e8eaed]">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className={section}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "simpleTitle")}</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{t(locale, "simpleSubtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {simpleCards.map((f) => (
              <div key={f.title} className={card}>
                <h3 className="font-semibold text-slate-900 dark:text-[#e8eaed]">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={section}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "devicesTitle")}</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{t(locale, "devicesSubtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {deviceCards.map((f) => (
              <div key={f.title} className={card}>
                <h3 className="font-semibold text-slate-900 dark:text-[#e8eaed]">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={section}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "secureTitle")}</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{t(locale, "secureSubtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {secureCards.map((f) => (
              <div key={f.title} className={card}>
                <h3 className="font-semibold text-slate-900 dark:text-[#e8eaed]">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className={section}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8eaed]">{t(locale, "faqTitle")}</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className={card}>
                <h3 className="font-semibold text-slate-900 dark:text-[#e8eaed]">{f.q}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <Logo label={t(locale, "appName")} />
          <nav className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
            <Link href={localePath(locale, "/inbox")} className="hover:underline">
              {t(locale, "inbox")}
            </Link>
            <a href="https://account.dusrel.com/" className="hover:underline">
              {t(locale, "accountNote")}
            </a>
            <a href="https://dusrel.com/privacy-policy" className="hover:underline">
              Privacy
            </a>
            <a href="https://dusrel.com/terms" className="hover:underline">
              Terms
            </a>
            <a href="https://dusrel.com/" className="hover:underline">
              dusrel.com
            </a>
          </nav>
        </div>
        <p className="mx-auto max-w-5xl px-4 pb-6 text-xs text-slate-500 dark:text-slate-400">{t(locale, "demoNote")}</p>
      </footer>
    </div>
  );
}
