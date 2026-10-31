# Dusrel Web — Web Client Monorepo (Docs Only, No Code Yet)

> Status: DOCUMENTATION PHASE ONLY — 2026-10-31
> Is folder/repo me abhi koi code nahi hai. Sirf web client ka
> monorepo structure aur usse related docs hain. Code likhne se
> pehle user se alag se approval lena hai.
> Ye rule is repo ke har future step par lagu rahega: pehle batao,
> phir confirmation ke baad hi code/config likho.

## Ye kya hai

Dusrel Web, Dusrel suite ka web client monorepo hai. Mail, Drive,
Chat, Meet aur landing — ye sab web apps isi repo ke `apps/`
hisse me banengi, ek hi design system aur ek hi API client share
karke. Backend is repo me nahi hai.

Backend ka source of truth alag repo hai:
[https://github.com/dusmamud/dusrel-backend](https://github.com/dusmamud/dusrel-backend)
— wahan Hono services, Stalwart mail server, CockroachDB aur R2
ka sach hai. Web apps us backend se REST API ke through baat
karengi, Next.js me Server Actions ya server-side backend logic
nahi likha jayega.

## Pehla client, pehla product

Sabse pehle **Dusrel Mail ka webmail** banega (`apps/mail/`).
Drive, Chat, Meet aur landing uske baad hain, pehle nahi.
Web app native apps se pehle aayegi, aur jab tak native app na
aaye, PWA ke taur par phone/desktop par install bhi ho sakegi.

## Stack — docs ke liye istemal hua stack

- Framework: Next.js App Router, **frontend-only mode**
- Build: static export (`out` folder) — Cloudflare Pages ke liye
- Language: TypeScript, strict mode
- UI: React 19 + Tailwind v4 + shared design system (`packages/ui/`)
- State: Zustand (client state) + TanStack Query (server state)
- Forms: React Hook Form + Zod (wahi Zod schemas jo backend ke
  `packages/api-contracts` me hain)
- Mail protocol: JMAP primary (Stalwart se); IMAP fallback ka
  decision code phase me lock hoga
- PWA: manifest + service worker + install prompt
- Deploy: har web app ka alag Cloudflare Pages project, alag env,
  alag deploy workflow — ek app ka deploy dusre ko tode nahi

Poori spec `docs/20-web-app.md` me hai.

## Web apps

| Web app | Pages project (example) | Kaam |
|---|---|---|
| mail | mail.dusrel.com | Inbox, compose, reply, folders, alias, E2EE webmail |
| drive | drive.dusrel.com | Files, folders, sharing, upload/download |
| chat | chat.dusrel.com | Rooms, messages, WebSocket |
| meet | meet.dusrel.com | LiveKit rooms, video UI |
| landing | dusrel.com | Product page, login link, privacy/terms link |

## Folder structure — docs only, code aane se pehle

```
dusrel-web/                  # total 56 md files, 0 code files
  README.md                  # ye file (web repo ke liye naya)
  docs/                      # backend ke saare 26 docs, verbatim
    00-docs-index.md
    01-product-overview.md
    02-prd.md
    03-trd.md
    04-architecture.md
    05-api-contracts.md
    06-database-design.md
    07-security-e2ee.md
    08-mail-deliverability.md
    09-deployment.md
    10-project-structure.md
    11-roadmap.md
    12-decisions-adr.md
    13-testing-qa.md
    14-operations-runbook.md
    15-client-overview.md
    16-android-native.md
    17-ios-swift.md
    18-desktop.md
    19-client-security-sync.md
    20-web-app.md            # web app ka poora spec — pehle ye
    21-mail-core-user-flows.md
    22-mail-core-security-bot-ddos.md
    23-mail-core-infra-deliverability.md
    24-mail-core-e2ee-privacy.md
    25-mail-core-day1-checklist.md
    dusrel-backend-README.md # backend root README, verbatim copy
    web-app-scope.md         # clients/web-app/README, verbatim copy
    WEB-DOCS-INDEX.md        # kaun sa doc kis sawaal ka jawab deta hai
  apps/
    mail/README.md           # pehla web app — scope doc, code nahi
    drive/README.md          # future — scope doc, code nahi
    chat/README.md           # future — scope doc, code nahi
    meet/README.md           # future — scope doc, code nahi
    landing/README.md        # future — scope doc, code nahi
  clients/                   # backend clients, verbatim (4 files)
    web-app/README.md
    android-native/README.md
    ios-swift/README.md
    desktop-tauri/README.md
  services/                  # backend services scope, verbatim (6 files)
    auth-api/README.md, mail-api/README.md, mail-server/README.md,
    drive-api/README.md, chat-api/README.md, meet-api/README.md
  packages/                  # backend packages (6) + web packages (2)
    auth/, crypto/, db/, api-contracts/, config/, utils/ — verbatim
    ui/README.md             # shared design system — scope doc
    api-client/README.md     # shared API client — scope doc
  infra/README.md            # backend infra scope, verbatim
  .github/workflows/
    README.md                # web Pages deploy plan — workflow files baad me
    backend-plan.md          # backend workflows README, verbatim copy
```

Har `apps/*` aur `packages/ui, api-client` folder me abhi sirf
ek README hai jo uska scope batata hai. Implementation files
(`.tsx`, `.ts`, `package.json`, workflow `.yml`) tabhi add honge
jab user us app ke liye alag se "code likho" bolega.

## Docs kahan se aaye — copy ka sach, chhupaya nahi

`dusrel-backend` ke **saare 45 md files ki content** is repo me
hai, 2026-10-31 ko push ke waqt disk par maujood backend working
tree se verbatim liye gaye. File ke andar koi text change nahi
kiya gaya hai. IMPORTANT — source ka sach: backend ka committed
HEAD tab bhi `4aa1950` tha, lekin us waqt backend working tree
me 18 files me uncommitted nits-fix edits the (74 insertions,
69 deletions). Dusrel-web me wahi latest working-tree version
liya gaya hai, taaki ye repo stale HEAD wali copy na ban jaye.
Backend repo ko is kaam me haath nahi lagaya gaya hai — na
commit, na push — uske uncommitted edits wahi ke wahi hain,
unka faisla us thread/user ka rahega.

Sirf 2 files ka path badla hai, kyunki is repo me us path par
web ke liye naya file pehle se hai — content wahi hai, naam
alag hai, aur ye mapping yahan likhi hai:

- Backend root `README.md` → is repo me
  `docs/dusrel-backend-README.md`
- Backend `.github/workflows/README.md` → is repo me
  `.github/workflows/backend-plan.md`

Baaki 43 files wahi path par hain jo backend repo me tha:
`docs/00-25` (26), `clients/*` (4), `services/*` (6),
`packages/*` (6), `infra/README.md` (1). Total: 1 + 1 + 26 + 4 +
6 + 6 + 1 = 45.

Iske upar is repo ke 11 naye md files hain: root `README.md`,
`docs/WEB-DOCS-INDEX.md`, `docs/web-app-scope.md` (ye
`clients/web-app/README.md` ka duplicate convenience copy hai),
`apps/*` (5), `packages/ui, api-client` (2) aur
`.github/workflows/README.md` (web plan). Isliye repo total
45 + 11 = 56 md files hai.

Iska ek limit saaf hai: agar `dusrel-backend` ke docs badle, to
ye copies apne aap update nahi hongi. Tab dobara sync karna
hoga, aur sync ka decision user ka hoga. Backend hi canonical
rahega; ye copies web-client view hain, naya source of truth
nahi. `clients/android-native, ios-swift, desktop-tauri` aur
backend `services/packages/infra` ke scope docs yahan sirf
reference ke liye hain — unka code is web repo me nahi banega.

## Sabse sakht rules

1. **Ask-first:** koi code, config, install ya push user ki explicit
   approval ke bina nahi.
2. **Server kabhi plaintext key nahi dekhega:** private key aur
   seed phrase browser me hi rahenge, server par kabhi plaintext
   me nahi jayenge.
3. **Service worker me plaintext mail cache mana hai** jab tak
   encryption ka rule na ban jaye.
4. **Draft autosave plaintext rahega** jab tak draft encryption
   alag se na ban jaye — ye limit UI me saaf dikhani hai.
5. **No secret in repo:** API keys, token, DB connection string
   kabhi Git me nahi. Sirf env / Secure Vault.
6. **Claim only what is verified:** koi feature "ho gaya" tabhi
   likhna jab uska test pass ho.

## Docs padhne ka order

1. `docs/WEB-DOCS-INDEX.md` — kaun sa doc kis sawaal ka jawab deta hai
2. `docs/20-web-app.md` — web app ka poora spec
3. `docs/01-product-overview.md` — product kya hai, kiske liye hai
4. `docs/04-architecture.md` + `docs/05-api-contracts.md` — web
   backend se kaise judega
5. `docs/07-security-e2ee.md` + `docs/19-client-security-sync.md` —
   browser me E2EE kaise hoga
6. Baaki docs — flows, security, deliverability, Day-1 checklist
