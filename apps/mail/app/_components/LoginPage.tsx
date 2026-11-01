"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Logo, ThemeToggle } from "@dusrel/brand";
import { Button, Field, Input } from "@dusrel/ui";

export function LoginPage({ currentPath, locale }: { currentPath: string; locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <Logo label={t(locale, "appName")} />
        <ThemeToggle />
      </div>
      <h1 className="text-2xl font-bold">{t(locale, "demoLoginTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t(locale, "demoLoginNote")}</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(localePath(locale, "/inbox"));
        }}
      >
        <Field label={t(locale, "email")}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </Field>
        <Field label={t(locale, "password")}>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </Field>
        <Button type="submit">{t(locale, "signIn")}</Button>
      </form>
      <p className="mt-6 text-sm">
        <Link href={counterpartPath(locale, currentPath)} className="text-[#2f6fd6] dark:text-blue-300 hover:underline">
          {locale === "en" ? "हिन्दी" : "English"}
        </Link>
      </p>
    </div>
  );
}
