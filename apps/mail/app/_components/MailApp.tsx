"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { folderIds, mailApi, type FolderId, type MailMessage } from "@dusrel/api-client";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Badge, Button, Field, Input, Textarea } from "@dusrel/ui";

export type MailView = "folder" | "compose" | "settings" | "search";

export function MailApp({ currentPath, folder = "inbox", locale, view }: { currentPath: string; folder?: FolderId; locale: Locale; view: MailView }) {
  const router = useRouter();
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MailMessage[]>([]);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [signature, setSignature] = useState("— Sent with Dusrel Mail");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    mailApi.list(folder).then((list) => {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of list) if (!ids.has(m.id)) merged.push(m);
        return merged;
      });
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    });
  }, [folder]);

  useEffect(() => {
    if (view !== "search") return;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    mailApi.search(query).then(setResults);
  }, [query, view]);

  const folderMessages = useMemo(() => messages.filter((m) => m.folder === folder), [messages, folder]);
  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const shown = view === "search" ? results : folderMessages;
  const counts = useMemo(() => {
    const map = new Map<FolderId, number>();
    for (const f of folderIds) map.set(f, messages.filter((m) => m.folder === f).length);
    return map;
  }, [messages]);

  const update = (id: string, patch: Partial<MailMessage>) => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const move = (id: string, toFolder: FolderId) => {
    update(id, { folder: toFolder });
    setSelectedId(null);
  };

  const send = async () => {
    await mailApi.send({ body, subject, to });
    setSent(true);
    router.push(localePath(locale, "/sent"));
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href={localePath(locale, "/")} className="text-lg font-bold text-gray-900">
            {t(locale, "appName")}
          </Link>
          <div className="flex-1" />
          <Link href={localePath(locale, "/compose")}>
            <Button>{t(locale, "compose")}</Button>
          </Link>
          <Link href={localePath(locale, "/settings")} className="text-sm text-gray-700 hover:underline">
            {t(locale, "settings")}
          </Link>
          <Link href={counterpartPath(locale, currentPath)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            {locale === "en" ? "हिन्दी" : "English"}
          </Link>
        </div>
        <div className="border-t border-gray-100 bg-blue-50 px-4 py-2 text-center text-xs text-blue-900">{t(locale, "demoNote")}</div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t(locale, "folders")}</p>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {folderIds.map((f) => (
              <Link key={f} href={localePath(locale, `/${f}`)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${folder === f && view === "folder" ? "bg-[#4d90fe]/10 font-medium text-[#2f6fd6]" : "text-gray-700 hover:bg-gray-100"}`}>
                <span>{t(locale, f)}</span>
                <span className="text-xs text-gray-500">{counts.get(f) ?? 0}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          {view === "compose" ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h1 className="mb-4 text-lg font-semibold">{t(locale, "compose")}</h1>
              {sent && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{t(locale, "sent")}</p>}
              <div className="space-y-3">
                <Field label={t(locale, "to")}>
                  <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" type="email" />
                </Field>
                <Field label={t(locale, "subject")}>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </Field>
                <Field label={t(locale, "body")}>
                  <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
                </Field>
                <div className="flex gap-2">
                  <Button onClick={send} disabled={!to.trim()}>
                    {t(locale, "send")}
                  </Button>
                  <Button variant="secondary" onClick={() => setSaved(true)}>
                    {t(locale, "saveDraft")}
                  </Button>
                  {saved && <span className="self-center text-sm text-gray-600">{t(locale, "saved")}</span>}
                </div>
              </div>
            </div>
          ) : view === "settings" ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h1 className="mb-2 text-lg font-semibold">{t(locale, "settingsTitle")}</h1>
              <p className="mb-4 text-sm text-gray-600">{t(locale, "settingsNote")}</p>
              <div className="max-w-lg space-y-3">
                <Field label={t(locale, "displayName")}>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </Field>
                <Field label={t(locale, "signature")}>
                  <Textarea rows={3} value={signature} onChange={(e) => setSignature(e.target.value)} />
                </Field>
                <Button onClick={() => setSaved(true)}>{t(locale, "save")}</Button>
                {saved && <span className="ml-2 text-sm text-gray-600">{t(locale, "saved")}</span>}
              </div>
              <p className="mt-6 text-sm">
                <a href="https://account.dusrel.com/" className="font-medium text-[#2f6fd6] hover:underline">
                  {t(locale, "accountNote")} →
                </a>
              </p>
            </div>
          ) : (
            <div>
              {view === "search" && (
                <form
                  className="mb-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(locale, "searchPlaceholder")} />
                </form>
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white">
                  <h1 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold">{view === "search" ? t(locale, "searchResults") : t(locale, folder)}</h1>
                  {shown.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-600">{t(locale, "noMessages")}</p>
                  ) : (
                    <ul>
                      {shown.map((m) => (
                        <li key={m.id}>
                          <button onClick={() => setSelectedId(m.id)} className={`block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${selectedId === m.id ? "bg-[#4d90fe]/5" : ""}`}>
                            <span className="flex items-center justify-between gap-2">
                              <span className={`truncate text-sm ${m.read ? "text-gray-700" : "font-semibold text-gray-900"}`}>{m.from}</span>
                              <span className="shrink-0 text-xs text-gray-500">{formatDate(m.date)}</span>
                            </span>
                            <span className={`block truncate text-sm ${m.read ? "text-gray-600" : "font-medium text-gray-900"}`}>{m.subject}</span>
                            <span className="block truncate text-xs text-gray-500">{m.body}</span>
                            {!m.read && <Badge>New</Badge>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  {selected ? (
                    <div>
                      <h2 className="text-lg font-semibold">{selected.subject}</h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {selected.from} · {formatDate(selected.date)}
                      </p>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{selected.body}</p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        <Link href={localePath(locale, "/compose")}>
                          <Button variant="secondary">{t(locale, "reply")}</Button>
                        </Link>
                        <Link href={localePath(locale, "/compose")}>
                          <Button variant="secondary">{t(locale, "forward")}</Button>
                        </Link>
                        <Button variant="secondary" onClick={() => update(selected.id, { read: !selected.read })}>
                          {selected.read ? t(locale, "markUnread") : t(locale, "markRead")}
                        </Button>
                        <Button variant="secondary" onClick={() => update(selected.id, { starred: !selected.starred })}>
                          {selected.starred ? "★" : "☆"}
                        </Button>
                        <Button variant="secondary" onClick={() => move(selected.id, "archive")}>
                          {t(locale, "archive")}
                        </Button>
                        <Button variant="secondary" onClick={() => move(selected.id, "trash")}>
                          {t(locale, "trash")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{t(locale, "selectMessage")}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
