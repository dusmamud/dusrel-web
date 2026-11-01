# apps/account — Dusrel Account Centre, Phase 1 build

Dusrel Account Centre — suite ka identity centre, product
app nahi hai. Production URL: account.dusrel.com. Iska root
koi public landing nahi hai — account home hai, login ke
peeche (poora spec `docs/28-account-centre.md` me hai,
URLs/paths `docs/27-production-urls-paths.md` me hain).

## Phase 1 — kya bana hai (2026-10-31)

- Stack: Next.js App Router, frontend-only, static export,
  Cloudflare Pages ke liye. Shared `@dusrel/ui`,
  `@dusrel/locales` (account namespace, EN + HI parity),
  `@dusrel/auth` (return_to validation + demo session).
- Routes (EN + HI): `/` account home, `/login`, `/signup`
  (invite-gated), `/forgot-password`, `/profile`,
  `/password`, `/two-factor`, `/recovery`, `/sessions`,
  `/app-passwords` — aur har ek ka `/hi/` counterpart.
- Brand shared hai (`packages/brand`, 2026-10-31): dusrel.com
  site se theme (Light/Dark/System), fonts (Sora + Inter)
  aur sparkle logo — header me Logo + ThemeToggle lagte
  hain, aur saare surfaces par dark mode classes hain.
- Login/signup flow doc 28 ke hisab se hai: `return_to`
  parameter ko server-rule se validate karke (https only,
  exact host allowlist, single-slash path) success ke baad
  wahi redirect hota hai; invalid/missing par account home
  fallback; pehle se signed-in user ko form dobara nahi
  dikhta. `return_to` CSRF protection nahi hai — OIDC me
  `state` alag se chahiye hoga.
- Recovery page par password recovery aur seed recovery ka
  farq saaf alag dikhaya gaya hai — Phase 1 me is page par
  koi seed phrase generate ya dikhaya nahi jata hai.

## Kya abhi nahi bana hai

- Real auth backend (`auth-api`), real session list/revoke,
  real TOTP verify, real app passwords, real password reset
  email — sab demo hai (browser localStorage session, koi
  server call nahi). Real implementation isi `@dusrel/auth`
  interface ke peeche aayegi.
- Connected apps (`/apps`) future me OIDC ke saath aayega,
  Phase 1 me nahi hai.

## Run karna

```bash
npm install
npm run dev:account    # http://localhost:3001
npm run build:account  # static export, apps/account/out/
```

Is folder me code hai — ye ab scope doc nahi raha, Phase 1
build hai.
