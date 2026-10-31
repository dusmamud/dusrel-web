# Production URLs aur Paths — har app ka subdomain, paths same-to-same

Status: DRAFT — 2026-10-31
Ye doc web repo ka apna doc hai — `dusrel-backend` se copy nahi
hua hai. Isliye `docs/00-25` (backend verbatim copies) me iski
entry nahi hai; iski entry web repo ke apne index
`docs/WEB-DOCS-INDEX.md` me hai. Backend docs ko haath nahi
lagaya gaya hai.

Is doc me koi code, config ya DNS change nahi ho raha hai —
sirf URL/path ka sach hai. Code/config/DNS tabhi banega jab
user uske liye alag se bolega (repo ka ask-first rule).

## Production domains — user decision, "example" nahi

`docs/20` ki table me ye domains "(example)" likhe the. Is doc
se wo example khatam hota hai — dusrel-web ke liye yehi
production domains honge:

| App | Production URL | Cloudflare Pages project |
|---|---|---|
| Mail | https://mail.dusrel.com | mail — alag project |
| Drive | https://drive.dusrel.com | drive — alag project |
| Chat | https://chat.dusrel.com | chat — alag project |
| Meet | https://meet.dusrel.com | meet — alag project |

- Har app ka alag Cloudflare Pages project, alag env, alag
  deploy workflow hoga (`docs/20` ka rule wahi rahega) — ek
  app ka deploy dusre ko tode nahi.
- Meet is list me isliye hai kyunki user ne "sabhi apps" bola
  hai, aur `docs/20` me meet pehle se chaaron apps me tha.
  Agar meet ko is scheme se hatana ho to user batayega, tab
  ye doc update hoga — chup-chap nahi.

## Har subdomain ka root = us product ki landing page

- `https://mail.dusrel.com/` par **Mail ki landing page**
  hogi — public product page, login ka rasta usi se milega.
  Root kabhi seedha inbox, login ya app home par redirect
  nahi hoga.
- Wahi rule sabhi apps par same-to-same hai:
  `drive.dusrel.com/` par Drive ki landing,
  `chat.dusrel.com/` par Chat ki landing,
  `meet.dusrel.com/` par Meet ki landing.
- Landing page public aur shareable hogi — login kiye hue
  user ke liye bhi root landing hi dikhegi, usme "Open Mail"
  / "Open Drive" jaisa CTA hoga jo app home par le jayega.
  Logged-in user ko root se zabardasti app home par dhakelna
  mana hai, taaki public landing URL hamesha landing hi rahe.
- SEO: har subdomain ki landing page public SEO page hogi
  (locale canonical + `hreflang`, `docs/26` ke hisab se) —
  ye `docs/20` ke purane "SEO sirf dusrel.com landing ke
  liye" wale frame se badlav hai, aur is doc se supersede
  hota hai. Login ke peeche wale app pages par `noindex`
  ka rule wahi rahega.

## dusrel.com / landing — is repo me IGNORE karo

- **dusrel.com is monorepo ka app nahi hai.** Wo pehle se
  alag se bana hua hai — Astro + React islands site, repo
  `dusmamud/dusrel`, folder `~/workspace/dusrel/site/dusrel-site`,
  2026-10-17 se live hai.
- Isliye dusrel-web ke URL/path scheme me landing app ko
  ignore karo: is doc ki tables me `dusrel.com` ek dusrel-web
  app ke taur par nahi aayega, aur `apps/landing/` is repo me
  koi code ka hissa nahi banega.
- Suite ke common pages (privacy, terms, suite home) ka
  canonical ghar dusrel.com hi rahega — har product app un
  pages ko apne subdomain par duplicate nahi karega, balki
  dusrel.com par link karega (neeche shared paths dekho).
- `apps/landing/README.md` jo repo me pehle se hai, wo is
  decision ke baad stale scope doc hai — usko hatana ya
  redirect note lagana alag step hoga, is doc se folder
  delete nahi ho raha hai.

## Paths same-to-same — sabhi apps me ek hi rule

### Rule 1 — Path me app ka naam kabhi nahi aayega

Subdomain hi app batata hai, isliye path me app slug dobara
nahi likha jayega:

- Sahi: `mail.dusrel.com/inbox`, `drive.dusrel.com/files`
- Galat: `mail.dusrel.com/mail/inbox`,
  `drive.dusrel.com/drive/files`

### Rule 2 — Slug hamesha English, lowercase, kebab-case

- URL slug kabhi translate nahi hoga — Hindi UI me bhi path
  wahi English slug rahega (jaise `/hi/inbox`, `/hi/files`).
  Sirf content translate hoga, URL nahi. Isse link, bookmark
  aur cross-app switcher kabhi nahi toot-ta.
- Slug lowercase + kebab-case hoga (`/app-passwords`, kabhi
  `/AppPasswords` ya `/app_passwords` nahi).

### Rule 3 — Locale prefix har path par same tareeke se lagega

`docs/26` ka rule har path par lagu hai: English bina prefix,
Hindi `/hi/` prefix ke saath, aur slug dono me ek jaisa:

| English | Hindi |
|---|---|
| `mail.dusrel.com/` (Mail landing) | `mail.dusrel.com/hi/` |
| `mail.dusrel.com/login` | `mail.dusrel.com/hi/login` |
| `mail.dusrel.com/inbox` | `mail.dusrel.com/hi/inbox` |
| `drive.dusrel.com/files` | `drive.dusrel.com/hi/files` |

### Rule 4 — Shared paths, har app me ek hi matlab

Ye paths har app me honge, ek hi naam aur ek hi kaam ke
saath. Koi app inka naam apne hisab se nahi badlega:

| Path | Matlab (har app me ek jaisa) |
|---|---|
| `/` | Us product ki public landing page (SEO) |
| `/login` | Login — SSO flow (`docs/05`, `docs/21` F3 ke hisab se) |
| `/settings` | Account + us app ki settings (flow `docs/21` F14 jaisa, har app me apna settings content) |

- **Signup path Phase 1 me nahi hoga:** public signup
  Phase 4 tak nahi hai (ADR-009, `docs/21` F1 — Phase 1 me
  admin/team invite only). Isliye `/signup` ko shared path
  list me mat samajhna; wo tabhi aayega jab public signup
  ka alag decision hoga.
- **Privacy / Terms / suite home:** ye pages har subdomain
  par duplicate nahi honge. Har app inke liye dusrel.com ke
  canonical pages par link karega (jaise
  `dusrel.com/privacy`, `dusrel.com/terms` — exact path
  dusrel-site repo ka sach hai, is repo se lock nahi ho raha
  hai). Har app par `/privacy` banakar 4 copy rakhna mana hai.
- **Cross-app switcher:** app badalne par subdomain badlega,
  path wahi rahega jahan wo path target app me maujood hai
  (jaise `/settings` par mail se drive jaane par
  `drive.dusrel.com/settings`). Jahan wo path target app me
  nahi hai (jaise `/inbox` se drive jaana), switcher target
  app ke home par le jayega (Drive ke liye `/files`),
  toote hue path par nahi.

## Har app ka app home + shuruati paths — DRAFT inventory

Neeche wali list poori final path list nahi hai — ye
shuruati inventory hai, jiska pattern (subdomain + English
slug + no app prefix) locked hai, lekin poori list har app
ke apne flow/spec doc me lock hogi. Mail ki list
`docs/21` ke flows/folders se li gayi hai; Drive/Chat/Meet
ki list unke scope READMEs se li gayi hai, isliye un par
"DRAFT — app spec me lock hona baaki hai" likha hai.

### Mail — `mail.dusrel.com`

App home login ke baad `/inbox` hai. Folders `docs/21` F1/F11
ke hisab se hain:

| Path | Kaam |
|---|---|
| `/` | Mail landing page (public) |
| `/login` | Login |
| `/inbox` | App home — Inbox |
| `/compose` | Compose + send (F8) |
| `/sent` | Sent folder |
| `/drafts` | Drafts folder |
| `/archive` | Archive folder |
| `/spam` | Spam folder |
| `/trash` | Trash folder |
| `/search` | Search + filters (F13) |
| `/settings` | Settings (F14) — shared path |

### Drive — `drive.dusrel.com` (DRAFT — app spec me lock hona baaki hai)

| Path | Kaam |
|---|---|
| `/` | Drive landing page (public) |
| `/login` | Login |
| `/files` | App home — Files |
| `/shared` | Shared files/folders |
| `/folder/<id>` | Ek folder ka view |
| `/settings` | Settings — shared path |

### Chat — `chat.dusrel.com` (DRAFT — app spec me lock hona baaki hai)

| Path | Kaam |
|---|---|
| `/` | Chat landing page (public) |
| `/login` | Login |
| `/rooms` | App home — Rooms list |
| `/room/<id>` | Ek room ka chat view |
| `/settings` | Settings — shared path |

### Meet — `meet.dusrel.com` (DRAFT — app spec me lock hona baaki hai)

| Path | Kaam |
|---|---|
| `/` | Meet landing page (public) |
| `/login` | Login |
| `/join` | App home — Join by code/link |
| `/room/<code>` | Ek meeting room ka video view |
| `/settings` | Settings — shared path |

## Kya is doc me nahi hai (OPEN, alag decision chahiye)

- Drive/Chat/Meet ki poori functional path list — sirf
  shuruati inventory upar hai, final list unke flow docs me
  lock hogi.
- Cross-subdomain SSO session ka rule (ek subdomain par login
  dusre par kaise chalega) — `docs/20` me token storage bhi
  OPEN hai, isliye is doc me us par koi dawa nahi hai.
- DNS / Cloudflare Pages project ka asli setup — ye doc
  sirf URL ka sach hai, DNS record ya Pages project banana
  is doc se nahi ho raha hai.
- dusrel.com ke andar ke paths — wo alag Astro repo ka
  sach hai, is doc me lock nahi ho raha hai.
- Koi naya subdomain ya naya app — alag decision se aayega,
  is list me auto-add nahi hoga.
