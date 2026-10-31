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
| `/login` | Canonical login — neeche login/signup + `return_to` rule dekho |
| `/signup` | Canonical signup entry — neeche signup note dekho (URL locked hai, public signup ka timing nahi badla hai) |
| `/forgot-password` | Forgot password flow (F4) |
| `/profile` | Profile — naam, photo, recovery email |
| `/password` | Password change |
| `/two-factor` | TOTP 2FA setup / recovery |
| `/recovery` | Recovery — account recovery aur E2EE seed recovery ka farq saaf dikhega (neeche) |
| `/sessions` | Active sessions / devices, revoke |
| `/app-passwords` | App passwords list / create / revoke |
| `/apps` | Connected apps — FUTURE, OIDC ke saath hi aayega |

- **Signup URL locked hai, public signup ka timing nahi
  badla hai:** `/signup` canonical signup entry hai, lekin
  public signup Phase 4 tak nahi hai (ADR-009, `docs/21`
  F1 — admin/team invite only). Isliye Phase 1 me `/signup`
  par open registration nahi hogi — invite-gated flow hoga
  (invite code / team invite zaroori, warna invite-only
  message). Public signup khulne par bhi URL wahi rahega,
  sirf backend gate hatenga, URL nahi badlega. Product
  apps me `/signup` shared path nahi hai — signup entry
  sirf account app par hai.
- **Logout koi page nahi hai:** logout ek action hoga, jo
  user ko us product ki landing page ya account login par
  wapas le jayega — `/logout` ko bookmarkable page mat
  samajhna.

## Landing buttons → account login/signup + `return_to` tracker

Ye section user ke 2026-10-31 ke decision se aaya hai:
kisi bhi app ki landing page ke Login / Sign up button par
click karne par user seedha account app par jayega, aur us
link me ek tracker hoga taaki success ke baad wahi app me
wapas redirect ho jaye.

### "Tracker" ka matlab — `return_to` parameter, analytics nahi

- Tracker ka matlab yahan **redirect destination carry
  karne wala `return_to` query parameter** hai — jaise
  Google ka `continue`, Auth0 ka `returnTo`, NextAuth ka
  `callbackUrl` hota hai. Dusrel me param ka naam sirf
  `return_to` hoga, doosre naam nahi chalenge.
- Ye koi analytics tracker, marketing cookie ya tracking
  pixel nahi hai. Isme sirf wapas jaane wali URL hoti hai,
  koi user behaviour track nahi hota, aur koi third-party
  ko data nahi jata. Privacy-first rule wahi rahega.

### Landing buttons ke links — seedha account par, product `/login` ke beech me nahi

Har product landing page ke buttons plain `<a href>` links
honge (static export friendly — na JS chahiye, na
middleware), aur unka `return_to` us app ka **app home**
hoga, landing root nahi. Landing root par wapas bhejna
loop banata hai (landing → login → landing), isliye
destination app home hai:

| Landing page ka button | Link (English) |
|---|---|
| Mail landing — Login | `https://account.dusrel.com/login?return_to=https%3A%2F%2Fmail.dusrel.com%2Finbox` |
| Mail landing — Sign up | `https://account.dusrel.com/signup?return_to=https%3A%2F%2Fmail.dusrel.com%2Finbox` |
| Drive landing — Login | `https://account.dusrel.com/login?return_to=https%3A%2F%2Fdrive.dusrel.com%2Ffiles` |
| Drive landing — Sign up | `https://account.dusrel.com/signup?return_to=https%3A%2F%2Fdrive.dusrel.com%2Ffiles` |
| Chat landing — Login | `https://account.dusrel.com/login?return_to=https%3A%2F%2Fchat.dusrel.com%2Frooms` |
| Chat landing — Sign up | `https://account.dusrel.com/signup?return_to=https%3A%2F%2Fchat.dusrel.com%2Frooms` |
| Meet landing — Login | `https://account.dusrel.com/login?return_to=https%3A%2F%2Fmeet.dusrel.com%2Fjoin` |
| Meet landing — Sign up | `https://account.dusrel.com/signup?return_to=https%3A%2F%2Fmeet.dusrel.com%2Fjoin` |

- Hindi landing se link me locale dono jagah preserved
  rahega — account URL par bhi `/hi/` prefix, aur
  `return_to` ke andar bhi `/hi/` path. Example (Mail,
  Hindi): `https://account.dusrel.com/hi/login?return_to=https%3A%2F%2Fmail.dusrel.com%2Fhi%2Finbox`
- Product app ka `/login` path ab bhi entry ka kaam karega:
  jo user seedha `mail.dusrel.com/login` kholega, wo bhi
  account login par jayega, aur uska default `return_to`
  us app ka home hoga (Mail ke liye `/inbox`). Landing
  buttons product `/login` ke beech se nahi guzrenge —
  wo seedha account URL par jayenge, upar wali table ke
  hisab se.
- dusrel.com (alag Astro site) ke buttons par bhi wahi rule
  lagega, lekin uski implementation dusrel-site repo me
  hogi, is doc me uske paths lock nahi ho rahe hain. Wahan
  default `return_to` account home (`account.dusrel.com/`)
  hoga, aur jis app ka button ho (jaise "Open Mail") uska
  `return_to` us app ka home hoga.

### Flow — success par wapas, har step me `return_to` zinda rahega

1. User landing button click karta hai → account
   `/login` ya `/signup` khulta hai, `return_to` ke saath.
2. Auth poora hota hai — agar 2FA on hai to 2FA step me
   bhi `return_to` carry hoga, step badalte hi drop nahi
   hoga. Forgot-password flow me jaane par bhi wapas
   aane ke baad `return_to` wahi rahega.
3. Success par `auth-api` `return_to` validate karke user
   ko usi app home par redirect karega.
4. User pehle se logged-in hai aur login button click
   karta hai to form dobara nahi dikhega — account login
   seedha `return_to` par redirect karega (Google jaisa
   behaviour).
5. Signup success par bhi wahi rule hai: naya user
   `return_to` wale app home par jayega, wahan us app ka
   first-run onboarding chalega (`docs/21` F2 jaisa) —
   account home par atakna nahi hoga.

### Validation — locked security rules (code phase me test honge)

- **Scheme sirf `https`:** `http`, `javascript:`,
  `data:` ya protocol-relative `//evil.com` — sab reject.
- **Host exact allowlist, suffix trick nahi chalega:**
  sirf ye hosts allowed hain — `mail.dusrel.com`,
  `drive.dusrel.com`, `chat.dusrel.com`,
  `meet.dusrel.com`, `account.dusrel.com`, `dusrel.com`.
  `dusrel.com.evil.com`, `evil-dusrel.com`,
  `mail.dusrel.com@evil.com`, `mail.dusrel.com.evil.com`
  — sab reject. Sirf ".dusrel.com se khatam hota hai"
  wala loose check mana hai; host ko list se exact match
  karna hoga (RFC 9700 ka exact-match principle, OAuth
  redirect URI validation jaisa).
- **Path single `/` se shuru hoga:** `//` se shuru hone
  wala path reject, kyunki wo protocol-relative trick hai.
- **Validate server-side hoga (`auth-api`):** client-side
  JS check sirf UX ke liye ho sakta hai, security ke liye
  nahi. Final redirect se pehle server `return_to` ko
  decode karke dobara validate karega.
- **Invalid / missing `return_to` par fallback:** account
  home (`account.dusrel.com/`) — kabhi bahar ki URL par
  nahi, kabhi error page par user ko atakana nahi hai.
- **`return_to` CSRF protection nahi hai:** OIDC/OAuth
  flow aane par usme alag se `state` (+ `nonce` / PKCE,
  RFC 9700 / OWASP ke hisab se) chahiye hoga.
  `return_to` sirf destination hai, `state` ki jagah
  nahi le sakta. Dono alag alag honge.

### Canonical login — pehle wala rule, ab tracker ke saath

- **Canonical login:** `account.dusrel.com/login` hi login
  ka asli form hoga. Har product app ka `/login` login
  entry ka matlab rakhega: wo user ko account login par
  bhejega, apna alag login form duplicate nahi karega.
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
- Google login `continue` parameter — login ke baad
  continue URL par redirect, lekin sirf google.com domain
  tak (isliye Dusrel me exact host allowlist hai):
  https://security.stackexchange.com/questions/57688/whats-the-security-impact-of-tampering-with-google-oauth-continue-parameter
- Auth0 `returnTo` — login ke baad wapas jaane wali URL
  sirf Allowed Callback URLs me registered honi chahiye:
  https://auth0.com/docs/authenticate/login/redirect-users-after-login
- NextAuth `callbackUrl` — signin ke baad original page
  par wapas, encoded callback URL se:
  https://next-auth.js.org/getting-started/client#specifying-a-callbackurl
- OAuth 2.0 Security Best Current Practice (RFC 9700) —
  redirect URI exact string match, `state` se CSRF
  protection, PKCE/nonce:
  https://www.rfc-editor.org/rfc/rfc9700.pdf
- OWASP Open Redirect + OAuth2 Cheat Sheet — arbitrary
  query-param redirect mana hai, redirect_uri trusted
  domain ka hona chahiye, warna token leak hota hai:
  https://community.owasp.org/attacks/open_redirect
  https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
