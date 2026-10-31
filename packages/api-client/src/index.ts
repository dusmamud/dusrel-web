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

const seed: MailMessage[] = [
  { body: "Welcome to Dusrel Mail. This is a Phase 1 demo message. Real mail will arrive here once the mail backend is connected.", date: "2026-10-31T09:00:00Z", folder: "inbox", from: "Dusrel Team <team@dusrel.com>", id: "m1", read: false, starred: true, subject: "Welcome to Dusrel Mail", to: "you@dusrel.com" },
  { body: "Your weekly summary is ready. This demo message shows how a message, its sender and its date are rendered in the reading pane.", date: "2026-10-30T15:20:00Z", folder: "inbox", from: "Dusrel Digest <digest@dusrel.com>", id: "m2", read: false, starred: false, subject: "Your weekly summary", to: "you@dusrel.com" },
  { body: "Thanks for trying the demo. Replying and forwarding are mock actions in Phase 1 and open the composer with a prefilled subject.", date: "2026-10-29T11:05:00Z", folder: "inbox", from: "Asha <asha@example.com>", id: "m3", read: true, starred: false, subject: "Trying the new inbox", to: "you@dusrel.com" },
  { body: "This is a message you sent in the demo. It appears in Sent after you use the composer.", date: "2026-10-28T08:40:00Z", folder: "sent", from: "you@dusrel.com", id: "m4", read: true, starred: false, subject: "Hello from the demo", to: "asha@example.com" },
  { body: "A draft you started earlier. Drafts are stored only in this browser in Phase 1.", date: "2026-10-27T18:15:00Z", folder: "drafts", from: "you@dusrel.com", id: "m5", read: true, starred: false, subject: "Draft: project notes", to: "team@dusrel.com" },
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
    const message: MailMessage = { body: input.body, date: new Date().toISOString(), folder: "sent", from: "you@dusrel.com", id: `sent-${Date.now()}`, read: true, starred: false, subject: input.subject || "(No subject)", to: input.to };
    this.messages = [message, ...this.messages];
    return message;
  }
}

export const mailApi: MailApi = new MockMailApi();
export const folderIds: FolderId[] = ["inbox", "sent", "drafts", "archive", "spam", "trash"];
