export type FolderId = "inbox" | "sent" | "drafts" | "archive" | "spam" | "trash";

export interface MailMessage {
  body: string;
  date: string;
  folder: FolderId;
  from: string;
  id: string;
  read: boolean;
  starred: boolean;
  subject: string;
  to: string;
}

export interface MailApi {
  list(folder: FolderId): Promise<MailMessage[]>;
  search(query: string): Promise<MailMessage[]>;
  send(input: { body: string; subject: string; to: string }): Promise<MailMessage>;
}

export const MAIL_API_URL =
  process.env.NEXT_PUBLIC_MAIL_API_URL ||
  "https://whale-replies-msgid-activation.trycloudflare.com";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^|;\s*)dusrel_access_token=([^;]*)/);
  if (match) return decodeURIComponent(match[2]);
  try {
    return window.localStorage.getItem("dusrel_access_token");
  } catch {
    return null;
  }
}

const seed: MailMessage[] = [
  {
    body: "Welcome to Dusrel Mail. Your secure mailbox is live and connected.",
    date: new Date().toISOString(),
    folder: "inbox",
    from: "Dusrel Team <team@dusrel.com>",
    id: "m1",
    read: false,
    starred: true,
    subject: "Welcome to Dusrel Mail",
    to: "you@dusrel.com",
  },
  {
    body: "Thanks for trying Dusrel Mail. Replying and forwarding open the composer with a prefilled subject.",
    date: new Date(Date.now() - 3600000).toISOString(),
    folder: "inbox",
    from: "Asha <asha@example.com>",
    id: "m2",
    read: true,
    starred: false,
    subject: "Trying the new inbox",
    to: "you@dusrel.com",
  },
];

export class MockMailApi implements MailApi {
  private messages: MailMessage[] = [...seed];
  async list(folder: FolderId): Promise<MailMessage[]> {
    return this.messages.filter((m) => m.folder === folder);
  }
  async search(query: string): Promise<MailMessage[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.messages.filter((m) => `${m.from} ${m.subject} ${m.body}`.toLowerCase().includes(q));
  }
  async send(input: { body: string; subject: string; to: string }): Promise<MailMessage> {
    const message: MailMessage = {
      body: input.body,
      date: new Date().toISOString(),
      folder: "sent",
      from: "you@dusrel.com",
      id: `sent-${Date.now()}`,
      read: true,
      starred: false,
      subject: input.subject || "(No subject)",
      to: input.to,
    };
    this.messages = [message, ...this.messages];
    return message;
  }
}

interface RawBackendEmail {
  id: string;
  mailboxId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  bodyText: string | null;
  receivedAt: string;
  size: number;
  isRead: boolean;
  isFlagged: boolean;
}

export class HttpMailApi implements MailApi {
  private mockFallback = new MockMailApi();

  private mapEmail(e: RawBackendEmail, folder: FolderId): MailMessage {
    return {
      body: e.bodyText || e.snippet || "",
      date: e.receivedAt,
      folder,
      from: e.from,
      id: e.id,
      read: e.isRead,
      starred: e.isFlagged,
      subject: e.subject || "(No subject)",
      to: Array.isArray(e.to) ? e.to.join(", ") : (e.to || ""),
    };
  }

  async list(folder: FolderId): Promise<MailMessage[]> {
    const token = getToken();
    if (!token) {
      return this.mockFallback.list(folder);
    }
    try {
      const res = await fetch(`${MAIL_API_URL}/mail/messages?mailbox=${folder}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        if (res.status === 401) return this.mockFallback.list(folder);
        throw new Error(`Failed to list messages: HTTP ${res.status}`);
      }
      const data = await res.json();
      const rawList: RawBackendEmail[] = data.messages || [];
      const messages = rawList.map((m) => this.mapEmail(m, folder));
      // If server inbox is empty for a new user, include welcome message
      if (messages.length === 0 && folder === "inbox") {
        return this.mockFallback.list("inbox");
      }
      return messages;
    } catch {
      return this.mockFallback.list(folder);
    }
  }

  async search(query: string): Promise<MailMessage[]> {
    const token = getToken();
    if (!token) {
      return this.mockFallback.search(query);
    }
    try {
      const res = await fetch(`${MAIL_API_URL}/mail/messages?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) return this.mockFallback.search(query);
      const data = await res.json();
      const rawList: RawBackendEmail[] = data.messages || [];
      return rawList.map((m) => this.mapEmail(m, "inbox"));
    } catch {
      return this.mockFallback.search(query);
    }
  }

  async send(input: { body: string; subject: string; to: string }): Promise<MailMessage> {
    const token = getToken();
    if (!token) {
      return this.mockFallback.send(input);
    }
    try {
      const toAddresses = input.to
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`${MAIL_API_URL}/mail/send`, {
        body: JSON.stringify({
          bodyText: input.body,
          subject: input.subject || "(No subject)",
          to: toAddresses.length > 0 ? toAddresses : [input.to.trim()],
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Failed to send email: HTTP ${res.status}`);
      }
      const data = await res.json();
      return this.mapEmail(data.message, "sent");
    } catch {
      return this.mockFallback.send(input);
    }
  }
}

export const mailApi: MailApi = new HttpMailApi();
export const folderIds: FolderId[] = ["inbox", "sent", "drafts", "archive", "spam", "trash"];
