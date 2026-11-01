"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { folderIds, mailApi, type FolderId, type MailMessage } from "@dusrel/api-client";
import { getStoredUser, logoutUser } from "@dusrel/auth";
import { counterpartPath, localePath, t, type Locale } from "@dusrel/locales";
import { Button, Field, Input } from "@dusrel/ui";
import { MailboxRail } from "./MailboxRail";
import { MailboxSidebar, type MailboxFolder } from "./MailboxSidebar";
import { MailboxTopBar } from "./MailboxTopBar";
import { MessageList, splitSender } from "./MessageList";
import { ReadingView } from "./ReadingView";
import { ComposePanel, type ComposeEncryption, type ComposePayload } from "./ComposePanel";
import { PrivacyCenter } from "./PrivacyCenter";
import { SettingsPanel, type AutoReplyValue } from "./SettingsPanel";
import { EmptyArt } from "./EmptyArt";
import { DownloadSlots } from "./DownloadSlots";

export type MailView = "folder" | "compose" | "settings" | "search";

type CustomFolder = { id: string; name: string };
type ComposeInitial = {
  to: string;
  subject: string;
  body: string;
  encryption?: ComposeEncryption;
};

const CUSTOM_FOLDERS_KEY = "dusrel-mail-custom-folders";
const ALIASES_KEY = "dusrel-mail-aliases";
const ACTIVE_CUSTOM_KEY = "dusrel-mail-active-custom";

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function cleanAliasName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function MailApp({ currentPath, folder = "inbox", locale, view }: { currentPath: string; folder?: FolderId; locale: Locale; view: MailView }) {
  const router = useRouter();
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [topQuery, setTopQuery] = useState("");
  const [results, setResults] = useState<MailMessage[]>([]);
  const [displayName, setDisplayName] = useState("You");
  const [email, setEmail] = useState("you@dusrel.com");
  const [signature, setSignature] = useState("— Sent with Dusrel Mail");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeKey, setComposeKey] = useState(0);
  const [composeInitial, setComposeInitial] = useState<ComposeInitial>({ to: "", subject: "", body: "" });
  const [aliases, setAliases] = useState<string[]>([]);
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [activeCustom, setActiveCustom] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [autoReply, setAutoReply] = useState<AutoReplyValue>({ enabled: false, message: "" });
  const [aliasDialog, setAliasDialog] = useState(false);
  const [aliasName, setAliasName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local-only state (custom folders, aliases, active custom folder) loads
  // after mount so the server render and the first client render match.
  useEffect(() => {
    try {
      const user = getStoredUser();
      if (user?.displayName) setDisplayName(user.displayName);
      if (user?.email) setEmail(user.email);
    } catch {
      // No stored session: demo identity stays.
    }
    setCustomFolders(readStored<CustomFolder[]>(CUSTOM_FOLDERS_KEY, []));
    setAliases(readStored<string[]>(ALIASES_KEY, []));
    try {
      const pending = window.sessionStorage.getItem(ACTIVE_CUSTOM_KEY);
      if (pending) {
        setActiveCustom(pending);
        window.sessionStorage.removeItem(ACTIVE_CUSTOM_KEY);
      }
    } catch {
      // sessionStorage unavailable: ignore.
    }
    if (view === "search") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setQuery(q);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CUSTOM_FOLDERS_KEY, JSON.stringify(customFolders));
    } catch {
      // Private mode etc.: local-only folders just don't persist.
    }
  }, [customFolders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(ALIASES_KEY, JSON.stringify(aliases));
    } catch {
      // Private mode etc.: local-only aliases just don't persist.
    }
  }, [aliases, hydrated]);

  useEffect(() => {
    mailApi.list(folder).then((list) => {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of list) if (!ids.has(m.id)) merged.push(m);
        return merged;
      });
      // No auto-select: the inbox opens on the list, like the reference.
      // Selecting a row opens the reading view and marks the message read.
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

  const visibleMessages = useMemo(
    () => messages.filter((m) => !blocked.has(m.from)),
    [messages, blocked],
  );
  const folderMessages = useMemo(
    () => visibleMessages.filter((m) => m.folder === folder),
    [visibleMessages, folder],
  );
  const searchMessages = useMemo(
    () => results.filter((m) => !blocked.has(m.from)),
    [results, blocked],
  );
  const selected = messages.find((m) => m.id === selectedId) ?? results.find((m) => m.id === selectedId) ?? null;
  const activeCustomFolder = customFolders.find((c) => c.id === activeCustom) ?? null;
  const unreadCounts = useMemo(() => {
    const map = new Map<FolderId, number>();
    for (const f of folderIds) {
      map.set(f, visibleMessages.filter((m) => m.folder === f && !m.read).length);
    }
    return map;
  }, [visibleMessages]);

  const sidebarFolders: MailboxFolder[] = [
    ...folderIds.map((f) => ({
      id: f as string,
      label: t(locale, f),
      count: unreadCounts.get(f) ?? 0,
    })),
    ...customFolders.map((c) => ({ id: c.id, label: c.name, count: 0 })),
  ];

  const update = (id: string, patch: Partial<MailMessage>) => {
    // Search results are separate objects from the folder list, so a toggle
    // must land in both states or the reading view would show stale data.
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setResults((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };
  const move = (id: string, toFolder: FolderId) => {
    update(id, { folder: toFolder });
    setSelectedId(null);
  };
  const selectMessage = (id: string) => {
    update(id, { read: true });
    setSelectedId(id);
  };

  const openCompose = (initial: ComposeInitial) => {
    setComposeInitial(initial);
    setComposeKey((k) => k + 1);
    setComposeOpen(true);
    setPrivacyOpen(false);
  };

  const reply = () => {
    if (!selected) return;
    const address = splitSender(selected.from).address ?? selected.from;
    const subject = selected.subject.startsWith("Re:") ? selected.subject : `Re: ${selected.subject}`;
    openCompose({ to: address, subject, body: "" });
  };

  const forward = () => {
    if (!selected) return;
    const subject = selected.subject.startsWith("Fwd:") ? selected.subject : `Fwd: ${selected.subject}`;
    openCompose({ to: "", subject, body: selected.body });
  };

  // NOTE: api-client send() accepts only to/subject/body today, so Cc, Bcc,
  // the encryption choice and attachment names are collected by the compose
  // UI but do not travel with the sent message yet. Wiring them needs a
  // send() signature change in @dusrel/api-client (a later step, not silent
  // behaviour change here).
  const handleSend = async (payload: ComposePayload) => {
    await mailApi.send({ body: payload.body, subject: payload.subject, to: payload.to.join(", ") });
    setComposeOpen(false);
    router.push(localePath(locale, "/sent"));
  };

  const handleSaveDraft = (payload: ComposePayload) => {
    const draft: MailMessage = {
      body: payload.body,
      date: new Date().toISOString(),
      folder: "drafts",
      from: `${displayName} <${email}>`,
      id: `draft-${Date.now()}`,
      read: true,
      starred: false,
      subject: payload.subject || "(No subject)",
      to: payload.to.join(", "),
    };
    setMessages((prev) => [draft, ...prev]);
    if (view === "compose") {
      router.push(localePath(locale, "/drafts"));
    } else {
      setComposeOpen(false);
    }
  };

  const createFolder = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomFolders((prev) => [...prev, { id: `custom-${Date.now()}`, name: trimmed }]);
  };

  const selectFolder = (id: string) => {
    setSidebarOpen(false);
    if ((folderIds as string[]).includes(id)) {
      setActiveCustom(null);
      setSelectedId(null);
      router.push(localePath(locale, `/${id}`));
      return;
    }
    // Custom folders are local-only: switching to one works from a folder or
    // search view. From compose/settings pages, go to the inbox first and let
    // the mount effect restore the custom selection via sessionStorage.
    setActiveCustom(id);
    setSelectedId(null);
    if (view !== "folder" && view !== "search") {
      try {
        window.sessionStorage.setItem(ACTIVE_CUSTOM_KEY, id);
      } catch {
        // Without sessionStorage the inbox just opens normally.
      }
      router.push(localePath(locale, "/inbox"));
    }
  };

  const submitAlias = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanAliasName(aliasName);
    if (!clean) return;
    const address = `${clean}@dusrel.com`;
    setAliases((prev) => (prev.includes(address) ? prev : [...prev, address]));
    setAliasName("");
    setAliasDialog(false);
  };

  const openPrivacy = () => {
    // Privacy Center is a sidebar mode (like the reference): it swaps the
    // sidebar content while the main pane — including an open compose
    // card — stays where it is.
    setPrivacyOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Best effort: the login page is the destination either way.
    }
    router.push(localePath(locale, "/login"));
  };

  const topSearchValue = view === "search" ? query : topQuery;
  const topSearchSubmit = () => {
    if (view === "search") return;
    router.push(`${localePath(locale, "/search")}?q=${encodeURIComponent(topQuery)}`);
  };

  const readingView = selected ? (
    <ReadingView
      locale={locale}
      message={selected}
      onBack={() => setSelectedId(null)}
      onReply={reply}
      onForward={forward}
      onTrash={() => move(selected.id, "trash")}
      onJunk={() => move(selected.id, "spam")}
      onMove={(toFolder) => move(selected.id, toFolder)}
      onToggleStar={() => update(selected.id, { starred: !selected.starred })}
      onToggleRead={() => update(selected.id, { read: !selected.read })}
      onBlock={() => {
        setBlocked((prev) => new Set(prev).add(selected.from));
        setSelectedId(null);
      }}
      onPrint={() => window.print()}
    />
  ) : null;

  const folderArt =
    folder === "trash" ? (
      <EmptyArt kind="bin" className="h-24 w-32 text-slate-300 dark:text-slate-600" />
    ) : (
      <EmptyArt kind="envelope" className="h-24 w-32 text-slate-300 dark:text-slate-600" />
    );

  // One sidebar definition for desktop and the mobile drawer: folders by
  // default, the Privacy Center as a sidebar mode when it is open.
  const sidebarContent = privacyOpen ? (
    <div className="h-full w-64 shrink-0 border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#121212]">
      <PrivacyCenter
        variant="sidebar"
        locale={locale}
        onBack={() => setPrivacyOpen(false)}
        // The mail app cannot know the account-centre recovery state
        // yet, so the recommendation badge stays until that wiring
        // lands. It links out; it never claims an email is set.
        hasRecoveryEmail={false}
        onCreateAlias={() => setAliasDialog(true)}
        onSelectEncryption={(enc) => openCompose({ to: "", subject: "", body: "", encryption: enc })}
      />
    </div>
  ) : (
    <MailboxSidebar
      locale={locale}
      folders={sidebarFolders}
      activeId={activeCustom ?? (view === "folder" ? folder : "")}
      onSelect={selectFolder}
      onCompose={() => {
        setSidebarOpen(false);
        if (view !== "compose") openCompose({ to: "", subject: "", body: "" });
      }}
      onOpenPrivacyCenter={openPrivacy}
      onCreateFolder={createFolder}
      aliases={aliases}
      onCreateAlias={() => setAliasDialog(true)}
    />
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#121212] dark:text-[#e8eaed]">
      <div className="flex flex-col lg:flex-row">
        <div className="hidden shrink-0 lg:block">
          <MailboxRail locale={locale} activeItem="mail" />
        </div>
        <div className="hidden shrink-0 lg:block">{sidebarContent}</div>
        {sidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label={t(locale, "shellCancel")} onClick={() => setSidebarOpen(false)} className="absolute inset-0 cursor-default bg-slate-900/40" />
            <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white shadow-xl dark:bg-[#121212]">{sidebarContent}</div>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <MailboxTopBar
            locale={locale}
            value={topSearchValue}
            onChange={(v) => {
              if (view === "search") setQuery(v);
              else setTopQuery(v);
            }}
            onSubmit={topSearchSubmit}
            displayName={displayName}
            email={email}
            onAddAccount={() => router.push(localePath(locale, "/login"))}
            onOpenSettings={() => {
              setPrivacyOpen(false);
              router.push(localePath(locale, "/settings"));
            }}
            onLogout={handleLogout}
            counterpartHref={counterpartPath(locale, currentPath)}
            onMenu={() => setSidebarOpen(true)}
          />
          <div className="border-b border-slate-100 bg-blue-50 px-4 py-2 text-center text-xs text-blue-900 dark:border-white/10 dark:bg-blue-950 dark:text-blue-200">
            {t(locale, "demoNote")}
          </div>
          <main className="p-4">
            {view === "compose" ? (
              <ComposePanel
                key="page"
                locale={locale}
                displayName={displayName}
                signature={signature}
                onSend={handleSend}
                onSaveDraft={handleSaveDraft}
                onDeleteDraft={() => router.push(localePath(locale, "/inbox"))}
                onClose={() => router.push(localePath(locale, "/inbox"))}
              />
            ) : view === "settings" ? (
              <div className="relative">
                <div className="pointer-events-none select-none opacity-40" aria-hidden="true">
                  <MessageList
                    locale={locale}
                    messages={folderMessages}
                    selectedId={null}
                    folder={folder}
                    title={t(locale, folder)}
                    onSelect={() => {}}
                    onToggleStar={() => {}}
                    onMarkAllRead={() => {}}
                    illustration={folderArt}
                  />
                </div>
                <div
                  className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/40 p-2 sm:items-center sm:p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) router.push(localePath(locale, "/inbox"));
                  }}
                >
                  <div className="my-auto max-h-[calc(100dvh-1rem)] w-full max-w-[860px] overflow-y-auto">
                    <SettingsPanel
                      locale={locale}
                      displayName={displayName}
                      onDisplayNameChange={setDisplayName}
                      email={email}
                      signature={signature}
                      onSignatureChange={setSignature}
                      aliases={aliases}
                      onCreateAlias={() => setAliasDialog(true)}
                      autoReply={autoReply}
                      onAutoReplyChange={setAutoReply}
                      blockedCount={blocked.size}
                      downloadSlot={<DownloadSlots locale={locale} />}
                      onClose={() => router.push(localePath(locale, "/inbox"))}
                    />
                  </div>
                </div>
              </div>
            ) : view === "search" ? (
              readingView ?? (
                <MessageList
                  locale={locale}
                  messages={searchMessages}
                  selectedId={selectedId}
                  folder="inbox"
                  title={t(locale, "searchResults")}
                  onSelect={selectMessage}
                  onToggleStar={(id) => update(id, { starred: !messages.find((m) => m.id === id)?.starred })}
                  onMarkAllRead={() => searchMessages.forEach((m) => update(m.id, { read: true }))}
                  onGoInbox={() => router.push(localePath(locale, "/inbox"))}
                  onNewSearch={() => setQuery("")}
                  query={query}
                  isSearch
                  illustration={<EmptyArt kind="magnifier" className="h-24 w-32 text-slate-300 dark:text-slate-600" />}
                />
              )
            ) : activeCustomFolder ? (
              <MessageList
                locale={locale}
                messages={[]}
                selectedId={null}
                folder="inbox"
                title={activeCustomFolder.name}
                onSelect={selectMessage}
                onToggleStar={() => {}}
                onMarkAllRead={() => {}}
                illustration={<EmptyArt kind="envelope" className="h-24 w-32 text-slate-300 dark:text-slate-600" />}
              />
            ) : (
              readingView ?? (
                <MessageList
                  locale={locale}
                  messages={folderMessages}
                  selectedId={selectedId}
                  folder={folder}
                  title={t(locale, folder)}
                  onSelect={selectMessage}
                  onToggleStar={(id) => update(id, { starred: !messages.find((m) => m.id === id)?.starred })}
                  onMarkAllRead={() => folderMessages.forEach((m) => update(m.id, { read: true }))}
                  illustration={folderArt}
                />
              )
            )}
          </main>
        </div>
      </div>

      {composeOpen && view !== "compose" ? (
        <>
          <div className="pointer-events-none fixed inset-0 z-30 bg-slate-900/30" aria-hidden="true" />
          <div className="fixed inset-x-0 bottom-0 z-40 sm:inset-x-auto sm:right-4 sm:w-[640px] sm:max-w-[calc(100vw-2rem)]">
          <div className="max-h-[90vh] overflow-y-auto">
            <ComposePanel
              key={composeKey}
              docked
              locale={locale}
              displayName={displayName}
              signature={signature}
              initialTo={composeInitial.to}
              initialSubject={composeInitial.subject}
              initialBody={composeInitial.body}
              initialEncryption={composeInitial.encryption}
              onSend={handleSend}
              onSaveDraft={handleSaveDraft}
              onDeleteDraft={() => setComposeOpen(false)}
              onClose={() => setComposeOpen(false)}
            />
          </div>
        </div>
        </>
      ) : null}

      {aliasDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t(locale, "shellCancel")}
            onClick={() => {
              setAliasDialog(false);
              setAliasName("");
            }}
            className="absolute inset-0 cursor-default bg-slate-900/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(locale, "shellAddAlias")}
            className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#1e1e1e]"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-[#e8eaed]">{t(locale, "shellAddAlias")}</h2>
            <form onSubmit={submitAlias} className="space-y-3">
              <Field label={t(locale, "aliasName")}>
                <Input
                  autoFocus
                  value={aliasName}
                  onChange={(e) => setAliasName(e.target.value)}
                  placeholder={t(locale, "aliasPlaceholder")}
                />
              </Field>
              {cleanAliasName(aliasName) ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {cleanAliasName(aliasName)}@dusrel.com
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button type="submit" disabled={!cleanAliasName(aliasName)}>
                  {t(locale, "shellCreate")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setAliasDialog(false);
                    setAliasName("");
                  }}
                >
                  {t(locale, "shellCancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
