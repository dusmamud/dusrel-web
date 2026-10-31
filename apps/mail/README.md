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
  dark mode, aliases management UI, filters, message detail
  route (`/message/<id>` alag route nahi hai — reading pane
  me hi khulta hai).
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
