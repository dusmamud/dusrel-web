# Account Centre — account.dusrel.com (identity, product nahi)

Status: DRAFT — 2026-10-31
Ye doc web repo ka apna doc hai — `dusrel-backend` se copy nahi
hua hai. Isliye `docs/00-25` (backend verbatim copies) me iski
entry nahi hai; iski entry web repo ke apne index
`docs/WEB-DOCS-INDEX.md` me hai. Backend docs ko haath nahi
lagaya gaya hai.

Is doc me koi code, config ya DNS change nahi ho raha hai —
sirf account centre ka sach hai. Code/config/DNS tabhi banega
jab user uske liye alag se bolega (repo ka ask-first rule).

## Decision — ek line me

- **Production URL:** https://account.dusrel.com — alag
  Cloudflare Pages project, jaise baaki apps (`docs/27` ka
  rule: alag project, alag env, alag deploy).
- **Ye product app nahi hai.** Mail/Drive/Chat/Meet product
  apps hain; Account Centre suite ka identity centre hai —
  uska kaam account ko sambhalna hai, mail/drive/chat/meet
  ka kaam karna nahi hai.
- **Backend sach:** ye app `services/auth-api/` ka web UI
  hoga — wahi SSO service jo pehle se sab apps ke liye ek
  login deti hai (`docs/05`, `services/auth-api/README.md`).
  Account Centre me koi alag user database, alag password
  store ya alag auth logic nahi banega.
- **Pattern:** Proton ka `account.proton.me` aur Google ka
  `myaccount.google.com` jaisa — ek hi account, sab services
  me shared, aur uski settings ek hi jagah (sources neeche).

## Root ka exception — account app ki koi public landing nahi hai

`docs/27` ka rule hai ki har product subdomain ka root uski
public landing page hoti hai. **Account Centre is rule ka
exception hai:**

- `account.dusrel.com/` par koi public landing/marketing page
  nahi hogi. Root account home/overview hoga, aur login ke
  peeche hoga.
- Login nahi hai to root `/login` par le jayega (wapas aane
  ka rasta `return_to` se, neeche dekho).
- Logged-in user ke liye bhi root kabhi public landing nahi
  banegi — account home hi rahega. Account Centre ka SEO
  goal nahi hai; uske pages par `noindex` ka rule app pages
  jaisa hi rahega.

## Kya account centre me hoga, kya app me rahega — split

Ye split hi is doc ka sabse zaroori hissa hai. Account-level
cheez account centre me, app-level cheez us app me — dono
ko ek jagah mix nahi karna hai.

### Account Centre me (suite-level, sab apps par lagu)

| Cheez | Source / note |
|---|---|
| Profile — naam, profile photo, recovery email | Personal info, Google/Proton pattern jaisa |
| Password change | `docs/21` F4 (normal account ke liye) |
| Forgot password flow | `docs/21` F4 — login flow ka hissa |
| 2FA — TOTP setup, use, recovery | `docs/21` F5, `auth-api` scope me TOTP hai |
| Recovery — account recovery + E2EE seed recovery ka farq | Neeche warning dekho — ye dono ek nahi hain |
| Active sessions / devices — list + revoke | `auth-api` scope me session list/revoke hai |
| App passwords — IMAP clients ke liye | `docs/21` F6, `auth-api` scope me hai |
| Connected apps / permissions | Future — OIDC provider baad me aayega (`auth-api` scope), tabhi ye section aayega, pehle nahi |
| Plans / storage (aage chalkar) | Future — jab billing/storage ka decision hoga, tabhi; is doc se billing lock nahi ho raha hai |

### Product app me rahega (app-level, account centre me nahi)

- Mail: filters, signature, folders, alias manage (`docs/21`
  F11/F12 — alias app ka kaam hai, account ka nahi, jab tak
  alias ko suite-level identity na mana jaye; wo alag decision
  hoga).
- Drive: sharing defaults, upload/download settings.
- Chat: notifications, room settings.
- Meet: video/audio defaults, room settings.
- Har app ka `/settings` ab sirf us app ki settings ka page
  hoga — account-level sections wahan duplicate nahi honge.
  Har app ke `/settings` me ek saaf link hoga: "Account
  settings → account.dusrel.com" — jo account home par le
  jayega, kisi toote hue path par nahi.

## Paths — DRAFT inventory (pattern locked, poori list app spec me lock hogi)

Slug rule `docs/27` jaisa hi hai: English, lowercase,
kebab-case, kabhi translate nahi hoga; locale prefix `docs/26`
ke hisab se (`/hi/<same-path>`).

| Path | Kaam |
|---|---|
| `/` | Account home / overview — login ke peeche; login nahi hai to `/login` |
| `/login` | Canonical login — neeche login rule dekho |
| `/forgot-password` | Forgot password flow (F4) |
| `/profile` | Profile — naam, photo, recovery email |
| `/password` | Password change |
| `/two-factor` | TOTP 2FA setup / recovery |
| `/recovery` | Recovery — account recovery aur E2EE seed recovery ka farq saaf dikhega (neeche) |
| `/sessions` | Active sessions / devices, revoke |
| `/app-passwords` | App passwords list / create / revoke |
| `/apps` | Connected apps — FUTURE, OIDC ke saath hi aayega |

- **Signup path Phase 1 me nahi hoga:** public signup
  Phase 4 tak nahi hai (ADR-009, `docs/21` F1 — admin/team
  invite only). Isliye `/signup` is list me nahi hai.
- **Logout koi page nahi hai:** logout ek action hoga, jo
  user ko us product ki landing page ya account login par
  wapas le jayega — `/logout` ko bookmarkable page mat
  samajhna.

## Login rule — canonical login account centre par

- **Canonical login:** `account.dusrel.com/login` hi login
  ka asli form hoga. Har product app ka `/login` (jo
  `docs/27` me shared path hai) ab login entry ka matlab
  rakhega: wo user ko account login par bhejega, apna alag
  login form duplicate nahi karega.
- **Wapas aane ka rasta (`return_to`):** login ke baad user
  wahi wapas jayega jahan se aaya tha (jaise
  `mail.dusrel.com/inbox`), lekin sirf tab jab `return_to`
  allowlist me ho — sirf `*.dusrel.com` subdomains, kabhi
  bahar ki URL nahi. Bahar ki URL par redirect open-redirect
  bug hai, isliye allowlist ke bahar ka `return_to` ignore
  karke account home par jana hoga. Ye security rule is doc
  se locked hai, code phase me test hoga.
- **Cross-subdomain session:** ek subdomain par login dusre
  par kaise chalega (cookie domain, token storage) — ye
  `docs/20` me pehle se OPEN tha, aur `docs/27` me bhi OPEN
  likha tha. Account Centre ke saath ye point taal nahi
  sakte: account app banne se pehle iska rule alag se lock
  karna hoga. Is doc me us par koi dawa nahi hai — cookie
  vs token, `.dusrel.com` scope, sab code/security review
  ke baad lock hoga.

## Recovery warning — password recovery ≠ E2EE recovery

Ye farq account centre ki UI me saaf, chhupaye bina dikhana
hoga:

- **Account password bhoolna:** password reset se account
  wapas mil sakta hai (normal account flow, F4).
- **E2EE seed khona:** seed phrase ke bina purana E2EE mail
  nahi khul sakta — ye `docs/07` aur `docs/13` ka rule hai
  ("seed ke bina E2EE mail nahi khulta — ye test pass hona
  hi chahiye"). Password reset seed ko wapas nahi lata.
- Isliye `/recovery` page par dono ko alag alag dikhana hoga,
  aur seed backup ka rasta (seed phrase dikhana/save karwana)
  password reset se alag hoga. Dono ko ek "Recover account"
  button me mix karna mana hai.

## Build order — Day 1 me poora account app nahi banega

- Pehle docs (ye doc) → phir minimal account app: profile,
  password, 2FA, sessions, app passwords — Mail ke saath.
- Connected apps (`/apps`), plans/storage, data export/delete
  baad me, apne alag decisions ke saath.
- Minimal version me bhi account-level sections ko product
  apps me duplicate nahi karna hai — link ka rule Day 1 se
  lagu hoga, warna baad me migration karni padegi.

## Kya is doc me nahi hai (OPEN, alag decision chahiye)

- Cross-subdomain SSO session ka rule (cookie/token scope) —
  upar dekho, account app se pehle lock karna hoga.
- Profile fields ki final list (kaun se fields `auth-api`
  contract me honge) — `docs/05` ke saath lock hogi.
- OIDC provider ka scope aur `/apps` ka final design —
  future, `auth-api` scope me "baad me" likha hai.
- Billing/plans/storage quota — koi decision is doc se nahi
  hai.
- DNS / Pages project ka asli setup — ye doc sirf URL ka
  sach hai.
- Account app ka app switcher design — product apps ke
  switcher jaisa hi hoga (subdomain badlo, path wahi jahan
  maujood ho), lekin uska final UI app spec me lock hoga.

## Sources — Exa se cross-verified (2026-10-31)

- Proton Account shared across all services, changes apply
  to every product; login at `account.proton.me`:
  https://proton.me/support/open-account-settings
- Google Account centre — personal info, data & privacy,
  security & sign-in, payments & subscriptions, ek jagah:
  https://myaccount.google.com/preferences
- Cross-app shared auth pattern — identity shared, ek
  account sab apps me, entitlement per app:
  https://github.com/ooiyeefei/ccc/blob/main/skills/cross-app-shared-auth/SKILL.md
