# Shared Locales — sab web apps ke liye ek hi locale sach

Status: DRAFT — 2026-10-31
Ye doc web repo ka apna doc hai — `dusrel-backend` se copy nahi
hua hai. Isliye `docs/00-25` (backend verbatim copies) me iski
entry nahi hai; iski entry web repo ke apne index
`docs/WEB-DOCS-INDEX.md` me hai. Backend docs ko haath nahi
lagaya gaya hai, taaki unka verbatim + canonical rule na toote.

Is doc me koi code, config ya translation file nahi ban rahi hai
— sirf rule hai. Code/config tabhi banega jab user uske liye
alag se "code likho" bolega (repo ka ask-first rule, README me).

## Decision — ek line me

- **Shared package:** `packages/locales/` (scope doc:
  `packages/locales/README.md`) — har web app (mail, drive,
  chat, meet) isi se locale lega, apni copy nahi banayega.
  CORRECTION (2026-10-31, `docs/27` ke saath): dusrel.com
  landing isme nahi hai — wo alag Astro site hai, uski
  locales us repo me hain, is package me nahi.
- **Shuruwat ke locales:** sirf 2 — English (`en`) aur Hindi
  (`hi`).
- **Default locale:** English (`en`) — jab koi preference na
  mile, jab key missing ho, aur jab URL me koi locale na ho,
  tab English dikhega.
- **Locale code:** sirf `en` / `hi` — shuruwat me `en-US`,
  `en-IN`, `hi-IN` jaisi region variant nahi hogi. Variant tabhi
  aayega jab uska alag content sach me chahiye ho, alag ADR ke
  saath.

## Kyu shared, har app me alag kyu nahi

- Ek hi string (jaise "Sign in", "Send", "Settings") har app me
  ek hi tarah translate honi chahiye — alag copy me ek app me
  Hindi badlega, dusre me purana reh jayega, aur version drift
  hoga. Ye wahi drift hai jisse bachne ke liye monorepo me
  shared packages hain (`docs/10-project-structure.md` ke rules).
- Shared package par `docs/10` ke sakht rules lagu honge:
  package kabhi app ko import nahi karega, usme app-specific
  logic nahi hoga, secret/URL hardcode nahi hoga, aur uska
  apna README hoga. Circular dependency nahi hogi.
- Har app sirf wahi namespace load karega jo usko chahiye
  (neeche) — poore suite ki strings har app ke bundle me nahi
  jayengi.

## Package ka shape — code aane par (abhi sirf rule)

```
packages/locales/            # scope doc only, code nahi hai
  en/
    common.json              # sab apps: nav, auth, buttons, errors
    mail.json                # sirf mail app
    drive.json               # sirf drive app
    chat.json                # sirf chat app
    meet.json                # sirf meet app
  hi/
    common.json              # en ke saath key-parity, neeche dekho
    mail.json
    drive.json
    chat.json
    meet.json
```
(dusrel.com landing ka koi namespace yahan nahi hai — wo
alag Astro site hai, dekho `docs/27`.)

- Ek bada `en.json` / `hi.json` nahi hoga — namespace split
  isliye hai taaki ek app ki string badalne par dusri app ki
  file ko haath na lage, aur merge conflict kam ho.
- Routing + locale list ka sach bhi isi package me hoga
  (locales list, default locale) — har app apni list nahi
  banayega. Library ka final naam (next-intl ya doosra) code
  phase me lock hoga; is doc me library lock nahi ho rahi hai.

## URL rule — English default, Hindi prefix par

| URL | Locale |
|---|---|
| `/`, `/inbox`, `/login` | English (default, koi prefix nahi) |
| `/hi/`, `/hi/inbox`, `/hi/login` | Hindi |

- English default ka matlab ye hai: **koi prefix na ho to
  English** — `/en/inbox` canonical URL nahi hoga.
- Language switcher page badle bina sirf bhasha badlega:
  `/inbox` <-> `/hi/inbox` — precomputed counterpart path par
  jayega, home par wapas nahi bhejega.
- **Static-export caveat — ye DRAFT ka sabse bada OPEN point
  hai:** is repo ka build static export hai (`docs/20`), isme
  middleware aur server-side locale negotiation nahi chalte.
  Exa-verified next-intl/static-export notes ke hisab se
  `as-needed` (default bina prefix) ke liye middleware chahiye
  hota hai, aur bina middleware ke supported mode har locale
  par prefix (`always`) hai. Isliye upar wala `/` = English
  rule **code phase ke pehle build test se prove karna hoga**
  (route-group / static-mapping se). Agar wo test fail hua, to
  ye rule badlega: `/en/` + `/hi/` (always) canonical hoga, aur
  `/` sirf English index ki copy/redirect hogi — aur ye badlav
  isi doc me date ke saath update hoga, chup-chap nahi.
  Is caveat ke bina `/` = English ko final mat samajhna.

## Locale kaise chuna jayega — detection order (static site par)

Server-side negotiation nahi hai, isliye order client-side /
URL-based hai, is priority me:

1. **URL prefix** — `/hi/...` ho to Hindi, prefix na ho to
   English. URL hi sach hai; URL ke khilaf koi auto-switch nahi.
2. **User ki saved choice** — user ne switcher se jo chuna,
   wahi agli baar bhi milega. Storage ka final rule (local
   storage vs account setting) code phase me lock hoga; tab tak
   saved choice ko browser preference se upar mat samajhna, aur
   neeche wale step ko sirf pehli visit par istemal karna.
3. **Browser preference** — sirf pehli visit par, jab na URL me
   locale ho na saved choice ho: browser ki language ko sirf
   `[en, hi]` se match karo, jo mile wahi; `hi` mile to `/hi/`
   par client-side le jao, warna English par raho.
4. **Fallback** — kuch match na ho to English.

- User ne ek baar Hindi chuni, phir browser English par bhi
  Hindi hi milegi — saved choice ko browser override nahi karega.
- Koi locale auto-detect karke user ko bina bataye bhasha
  nahi badlega: pehli visit par browser `hi` ho to Hindi par
  le jana theek hai, lekin uske baad switcher hi control hai.

## Missing key aur key-parity — fallback English hai

- Hindi me koi key missing ho to UI blank nahi hogi, key ka
  naam (`mail.inbox.title`) bhi nahi dikhega — us key ki
  **English string** dikhegi. Ye fallback i18next ke fallback
  principle jaisa hai: jitna accurate mile, utna dikhao, aur
  kabhi khali mat chhodo.
- Dev build me missing key log hogi, taaki gap chhupa na rahe.
- **Key-parity test (P0):** `en` aur `hi` ke har namespace me
  key set ek jaisa hona chahiye. Koi key sirf ek locale me ho
  to test fail hoga — jaanboojh kar chhoda gaya gap bhi isi
  doc me likhna hoga, warna wo bug mana jayega.
- Hindi ko English file copy karke "translate ho gaya" maan
  kar ship nahi karna hai — untranslated key fallback English
  se dikhegi, aur gap list me rahegi.

## Keys, variables aur formatting ke rules

- **Hardcoded user-visible string mana hai:** component me
  seedha `"Send"` / `"Bhejo"` likhna nahi hoga — har dikhne
  wali string locale key se aayegi.
- **Key stable hogi, English text key nahi hoga:** key jaise
  `mail.compose.send` hogi, `"Send"` khud key nahi hoga —
  warna English text badalte hi saari keys toot jayengi.
- **Variables ICU MessageFormat se:** string ke tukde jodkar
  (concatenation) sentence nahi banana hai, kyunki Hindi me
  shabd ka order alag ho sakta hai. Poora sentence ek key
  hoga, variable placeholder ke saath (jaise `{count}`) — aur
  plural ICU plural rule se hoga, `if count == 1` wali
  English-only logic se nahi.
- **Date/number/time locale-aware honge:** `Intl.DateTimeFormat`
  aur `Intl.NumberFormat` active locale ke saath — apna date
  format (`DD/MM/YYYY` hardcode) nahi likhna hai.
- **Hindi LTR hai:** Devanagari script left-to-right chalegi —
  isme RTL layout, mirrored UI ya RTL stylesheet ka koi kaam
  nahi hai. RTL tabhi aayega jab koi RTL locale (jaise Urdu /
  Arabic) alag ADR se add ho.
- **Digit system OPEN hai:** Hindi me number Devanagari digits
  me dikhe ya Latin digits me, ye code phase se pehle user ke
  sample se lock hoga — is doc me is par koi dawa nahi hai.

## Language switcher

- Har web app me ek hi switcher hoga (UI `packages/ui` se,
  locale list `packages/locales` se) — har app apna switcher
  nahi banayega.
- Switcher me shuruwat me sirf 2 option honge: English, Hindi
  (Hindi apni script me, "हिन्दी" likha hoga — sirf "Hindi"
  Roman me nahi).
- Switch karne par login nahi tootega, aur current page ka
  counterpart khulega (upar URL rule dekho).

## SEO — har product ki landing page ke liye

- App pages (mail/drive/chat/meet) login ke peeche hain, unka
  SEO goal nahi hai — `docs/20` ka noindex rule wahi rahega.
- Har subdomain ki landing page (`docs/27` — jaise
  `mail.dusrel.com/`) public SEO page hogi: har locale page
  ka apna canonical hoga, aur `hreflang` me `en` + `hi` dono
  honge, `x-default` English root (`/`) hoga.
- Hindi landing page ka content Hindi me hoga — English page
  ko Hindi URL par duplicate karke SEO ke liye ship nahi karna
  hai; jab tak Hindi content taiyaar na ho, us page ka Hindi
  version publish nahi hoga, sirf fallback UI ke liye English
  string dikhegi.
- dusrel.com ka SEO is doc se nahi hai — wo alag Astro site
  hai (dekho `docs/27`).

## Nayi locale add karne ki checklist (baad me, jab user bolega)

1. Locale code `packages/locales` ki list me add karo.
2. Har namespace ki poori file us locale me banao, key-parity
   test pass karo.
3. `/{locale}/` routes + switcher entry + har product
   landing ka `hreflang` add karo.
4. Date/number/plural sample us locale me check karo.
5. Is doc me locale, date aur status update karo.
- Bina poori checklist ke nayi locale "support" nahi mani jayegi.

## Test — is doc ke P0 (docs/13 ko haath nahi lagaya gaya)

- [ ] English default: bina prefix, bina saved choice, bina
  browser Hindi ke — English dikhta hai.
- [ ] Hindi URL: `/hi/inbox` par Hindi dikhta hai, English
  strings sirf missing-key fallback me dikhte hain.
- [ ] Switcher: `/inbox` se Hindi par jaane par `/hi/inbox`
  khulta hai, wapas English par `/inbox` — login nahi toot-ta.
- [ ] Saved choice: Hindi chunne ke baad dobara aane par bhi
  Hindi milta hai, browser English hone par bhi.
- [ ] Key-parity: `en` vs `hi` — har namespace me key set
  ek jaisa hai, test pass hai.
- [ ] Fallback: Hindi me jaanboojh kar ek key hatane par UI
  me uski English string dikhti hai, blank/key-naam nahi.
- [ ] Static-export routing gate: `/` = English wala rule
  production static build par prove hua hai, ya doc update
  karke `/en/` + `/hi/` (always) par jana pada hai.
- [ ] Formatting: Hindi me date/number sample locale-aware
  hai, hardcode format nahi hai.

## Kya is doc me nahi hai (OPEN, alag decision chahiye)

- i18n library ka final naam (next-intl ya doosra) — code
  phase me lock hoga, is doc me library lock nahi hai.
- Saved-choice storage (local storage vs account setting, aur
  account setting ke liye backend field) — code phase me lock
  hoga; backend API contract me abhi aisa field nahi hai.
- Hindi strings ka translation workflow (kaun translate karega,
  koi tool hoga ya nahi) — is doc me nahi hai; machine
  translation ko bina review ke ship nahi karna hai.
- Static-export routing ka final shape — upar caveat dekho,
  build test se prove hona baaki hai.
- Koi teesri locale, region variant, ya RTL locale — sab alag
  decision honge, is doc se auto-add nahi honge.

## Sources — Exa se cross-verified (2026-10-31)

- Next.js App Router i18n guide — browser `Accept-Language`
  se locale match + default locale, `app/[lang]` routing,
  per-locale dictionary + `getDictionary` pattern:
  https://nextjs.org/docs/app/guides/internationalization
- next-intl routing configuration — `defineRouting` me
  `locales` list + `defaultLocale` (jab koi locale match na ho):
  https://next-intl.dev/docs/routing/configuration
- next-intl static export — bina middleware ke `as-needed`
  nahi chalta, supported mode har locale par prefix (`always`)
  hai; static setup me custom routing layer ki zaroorat hoti hai:
  https://github.com/amannn/next-intl/discussions/2132
- i18next fallback principle — key na mile to parent/default
  language par graceful fallback, khali nahi:
  https://www.i18next.com/principles/fallback
- ICU MessageFormat — poora sentence ek unit, variable
  placeholder se, tukde jodkar nahi:
  https://unicode-org.github.io/icu/userguide/format_parse/messages/
- Shared i18n package pattern (monorepo) — shared package me
  routing/default-locale/navigation, app me namespace-wise
  messages (`common`, `auth`, ...):
  https://makerkit.dev/docs/nextjs-prisma/internationalization/overview
