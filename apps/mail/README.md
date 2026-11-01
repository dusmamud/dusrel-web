# apps/mail — Dusrel Mail, Phase 1 build

Dusrel Mail ka webmail — Dusrel suite ka pehla web app, aur
pehla product. Spec `docs/20-web-app.md` me hai, flows
`docs/21-mail-core-user-flows.md` me hain, URLs/paths
`docs/27-production-urls-paths.md` me hain, locales
`docs/26-shared-locales.md` me hain, account split
`docs/28-account-centre.md` me hai.

## Phase 1 — kya bana hai (2026-10-31)

- Stack: Next.js App Router, frontend-only, static export
  (`output: "export"`), Cloudflare Pages ke liye. npm
  workspaces monorepo: `apps/mail` + shared
  `@dusrel/ui`, `@dusrel/locales`, `@dusrel/api-client`,
  `@dusrel/config`.
- Routes (EN + HI, doc 27/26 ke hisab se): `/` landing,
  `/login` demo login, `/inbox`, `/sent`, `/drafts`,
  `/archive`, `/spam`, `/trash`, `/search`, `/settings`,
  `/compose` — aur har ek ka `/hi/` counterpart.
- UI pattern Atomic Mail jaisa standard webmail pattern hai
  (folders sidebar + message list + reading pane + compose
  with To/CC/BCC) — uska code, text ya assets copy nahi
  kiye gaye hain; ye Dusrel branding aur Dusrel docs ke
  features (aliases, password-protected mail, seed recovery)
  par bana hai.
- Landing (2026-10-31, local only, push nahi hua): reference
  landing ke section flow jaisa rebuild kiya gaya hai
  (hero → privacy → simple → devices → secure → FAQ →
  footer), Dusrel ki apni copy ke saath. Main tagline
  "Private email, without the noise" wahi rakha gaya hai.
  Reference ke AI features, ratings/badges aur download
  buttons nahi liye gaye hain, kyunki Dusrel ke paas ye
  (abhi) nahi hain — jhoothi claim banana mana hai.
- Brand shared hai (`packages/brand`): dusrel.com site se
  theme (dusrel-theme key, Light/Dark/System), fonts
  (Sora headings + Inter body, Fontsource) aur sparkle
  logo — mail aur account dono isi ko use karte hain.
- Data layer: `@dusrel/api-client` me `MailApi` interface +
  `MockMailApi` (sample messages). Real backend (auth-api /
  mail-api / JMAP) abhi nahi juda hai, isliye sending,
  receiving, E2EE, real auth aur real search mock hain.
  UI me har jagah "demo data" saaf likha hai.
- Landing ke Login / Sign up buttons doc 28 ke hisab se
  `account.dusrel.com/login|signup?return_to=...` par
  jate hain. Account app abhi nahi bana hai, isliye demo
  ke liye `/login` par ek demo login aur `/inbox` par
  seedha demo inbox bhi diya gaya hai.

## Kya abhi nahi bana hai

- Real auth (account.dusrel.com), real mail send/receive
  (JMAP/Stalwart), E2EE encrypt/decrypt, PWA service worker,
  message detail route (`/message/<id>` alag route nahi hai — reading
  view list ki jagah khulta hai).
- Ye sab agle iterations me aayega, isi mock interface ke
  peeche real implementation lagakar, UI dobara likhe bina.

## Run karna

```bash
npm install
npm run dev:mail     # http://localhost:3000
npm run build:mail   # static export, apps/mail/out/
```

Is folder me code hai — ye ab scope doc nahi raha, Phase 1
build hai.

## Mailbox UI (2026-11-01)

- `app/_components/MailApp.tsx` sab kuch jodta hai; har hissa
  alag file hai (views: folder / compose / settings / search):
  `MailboxRail`, `MailboxSidebar`, `MailboxTopBar`,
  `MessageList`, `ReadingView`, `ComposePanel`, `PrivacyCenter`,
  `SettingsPanel`, `EmptyArt`, `DownloadSlots`.
- Shell: rail (Mail active + 2 naam-rahit "Coming soon"
  placeholder slots — kisi aur product ka naam nahi hai);
  sidebar (Logo, pill + Compose, Privacy Center entry, FOLDERS
  with "+" dialog + har folder ka chhota grey icon, selected
  folder = grey pill, ALIASES with "+" dialog, counts = UNREAD
  counts); top bar (search right-aligned ~340px, locale
  switch, gradient avatar menu: display name + email, Add new account
  → login, Settings, Log out via `@dusrel/auth` logoutUser,
  Upgrade disabled + Coming soon, koi price nahi; ThemeToggle
  top bar me nahi hai — Appearance sirf Settings me hai).
  Mobile par sidebar drawer me khulta hai (hamburger button),
  content ke upar stack nahi hota.
- List + reading: toolbar (Select all, Mark all as read,
  Filter button → dropdown card: All / Unread / Starred /
  With attachments / Encrypted — aakhri do hamesha empty
  hain kyunki `MailMessage` me attachment/encrypted field hi
  nahi hai, nakli match kabhi nahi dikhaye jate); rows
  SINGLE LINE (unread = baayin taraf green dot, coloured
  initial avatar, sender bold, star sender ke turant baad,
  subject bold, snippet grey, time daayin taraf; row
  checkbox sirf hover par dikhta hai). Reading list ki JAGAH
  khulta hai (back arrow; Trash, Junk → spam folder, Move to
  dropdown, Star/Unstar, … menu: Mark read/unread, Block
  sender, Print); subject 22px bold; sender header (avatar,
  naam + address ek line, "To … ▾" doosri line, time + star
  daayin taraf); body halki-grey canvas par centred white
  card (max ~680px) me, Reply / Forward card ke neeche.
  Message kholne par auto-read mark hota hai.
- ComposePanel: folder/search pages par bottom-right floating
  card (640px, halki backdrop), `/compose` par full view.
  Sender header + Collapse / Full screen / Close (close
  karne par unsaved draft discard hota hai, Drafts me
  auto-save kabhi nahi hota); To + Cc/Bcc toggles, Subject,
  body (Bold/Italic/List markdown markers wala toolbar),
  Choose Files (sirf file names, koi upload nahi), "Sent
  from Dusrel Mail", footer: Send (via `mailApi.send`),
  Save draft (local draft banakar `/drafts` par jata hai),
  Encryption dropdown (by password / as file / Dusrel /
  Standard), phir AI assistant button DISABLED + Coming
  soon (Dusrel me AI feature nahi hai), Insert signature,
  Attach files, Delete draft.
- PrivacyCenter: SIDEBAR mode hai — sidebar ka content swap
  ho jata hai, main pane (list/reading) wahi rehta hai; back
  control "To inboxes". Security options (recovery email row
  → Account Centre link; jab tak centre se state wiring nahi
  aati, recommendation badge dikhta hai — ye placeholder
  hai, koi email set hone ka daava nahi; Security Helper +
  2FA sirf local toggles). Hide identity (Hide My Email
  disabled + Coming soon; Create alias → dialog). Send
  secure email (3 options compose kholkar wahi encryption
  preselect kar deti hain).
- SettingsPanel: `/settings` par centred MODAL hai (max ~860px,
  inbox list dimmed background me, backdrop click ya Close →
  inbox). 10 sections (Account, Upgrade plan, Privacy
  & Security, Active Sessions, Addresses & Aliases, Hide My
  Email, Auto-reply, Signature, Billing, Download app);
  selected nav = grey pill. Account: display name, read-only
  default email, masked password + Change → Account Centre,
  REAL ThemeToggle (Light/Dark/System), 24-hour +
  auto-timezone toggles, `Intl` timezone display, Delete
  account = confirm dialog jisme sirf Account Centre link +
  Cancel hai (koi deletion perform/fake nahi hoti). Active
  Sessions: sirf current session row, End disabled. Upgrade
  plan + Billing: pricing undecided note, koi price/purchase
  button nahi. Download app: `DownloadSlots` placeholders.
- Local-only (localStorage, koi backend nahi): custom
  folders (sidebar + dialog se bante hain, navigation ke
  baad bhi rehte hain; unka content view abhi empty list
  hai — messages unme file nahi kiye ja sakte); aliases
  (dialog se `name@dusrel.com` banta hai). Blocked senders
  session-local hain (lists se chhup jate hain, count
  Settings me dikhta hai).
- Known gaps (imaandari se): Cc, Bcc, encryption choice aur
  attachment names compose UI collect karta hai, par send
  hone par sirf To/Subject/Body jata hai — `api-client`
  ka `send()` abhi sirf ye 3 field leta hai, uska signature
  badalna baaki hai. Compose overlay folder navigation par
  band ho jata hai (routes hain, SPA state nahi) — analyzed
  app jaisa folders ke beech panel khula rehna yahan nahi
  hai. Row hover actions (time ki jagah icons) abhi nahi
  hain. Reference ka mobile reflow verify nahi ho saka
  (uske browser me viewport resize nahi hai) — mobile
  layout Dusrel ka apna drawer pattern hai. Scheduled send
  nahi hai. Search ke "With attachments"/"Encrypted" filters
  hamesha empty hain (field hi nahi hai). PrivacyCenter ka
  recovery badge placeholder hai (mail app account-centre
  state nahi padh sakta).
- Locale: `mail.json` me 226 keys EN+HI parity par hain
  (pehle 54; +1 `shellMenu`). Nayi keys sidecars se aayi hain
  (`shell*`, `msg*`, `composePanel*`, `pc*`, `sp*`,
  `download*` + `aliasName`/`aliasPlaceholder`); HI Roman
  Hindi me hai, jo mail app ke existing HI convention se
  milta hai. Sidecar `*.keys.json` files translation source
  ke taur par rakhi gayi hain (unme Devanagari originals
  hain).
- Screenshots (2026-11-01, local build se):
  `~/workspace/your_files/mail-screenshots/` me
  `dusrel-inbox-1440-v2.png`, `dusrel-inbox-390-v2.png`,
  `dusrel-reading-1440-v2.png`, `dusrel-privacy-1440-v2.png`,
  `dusrel-compose-1440-v2.png`, `dusrel-settings-1440-v2.png`
  (round-2, reference se compare karke fix ke baad); purane
  `mail-inbox-v5.png`, `mail-reading-v6.png` aadi pre-fix
  hain.
- Asset slots jo user ko baad me bharne hain:
  - Download badges (App Store / Google Play) —
    `DownloadSlots` ke slots me assets aayenge; tab tak
    dashed placeholder boxes dikhenge, koi asli store badge
    artwork nahi hai.
  - Illustration replacements — agar `EmptyArt` ki jagah koi
    design ki hui illustration aani hai, to wo bhi yahan se
    replace hogi; abhi wali art original line art hai, kisi
    reference ki illustration copy/trace nahi ki gayi hai.
- Reference ka koi text, image, rating ya price copy nahi
  hua hai — sirf layout/flow liya gaya hai, Dusrel ki apni
  copy aur branding ke saath.
