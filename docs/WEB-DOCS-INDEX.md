# Web Docs Index — kaun sa doc kis sawaal ka jawab deta hai

Ye index is repo ke `docs/` folder ke liye hai. Is repo me
`dusrel-backend` ke saare 26 docs (00-25) hain, isliye neeche
poori list hai — koi doc chhoda nahi gaya hai. Poora backend
docs index bhi `docs/00-docs-index.md` me verbatim hai.

| Doc | Sawaal |
|---|---|
| `20-web-app.md` | Web app ka poora spec kya hai — pehla client, Pages, PWA, E2EE? |
| `web-app-scope.md` | Web app ka scope ek page me kya hai? (backend repo ke `clients/web-app/README.md` se) |
| `15-client-overview.md` | Ek hi backend, alag alag client experience ka shared plan kya hai? |
| `19-client-security-sync.md` | Sab client par ek hi security + sync rulebook kya hai? |
| `01-product-overview.md` | Dusrel kya hai, kiske liye, kyu alag hai? |
| `02-prd.md` | Kya banega, kya nahi, Phase 1 me kaun se feature? |
| `03-trd.md` | Stack kya hai, constraints kya hain, kya nahi karna? |
| `04-architecture.md` | System kaise judta hai, web backend se kaise baat karega? |
| `05-api-contracts.md` | Har service ka API shape kya hoga, auth kaise hoga? |
| `06-database-design.md` | Cockroach me kaun si table/schema, R2 me kaun sa object? (backend internal, web ke liye reference) |
| `07-security-e2ee.md` | Seed, keys, encryption, threats, aur honest limits kya hain? |
| `08-mail-deliverability.md` | Mail Gmail/Outlook inbox me kaise pahuchega, spam me kyu nahi? (backend/VPS, reference) |
| `09-deployment.md` | Kya kahan deploy hoga — web Pages par, mail VPS-only? |
| `10-project-structure.md` | Folder, naming, shared packages ke rules kya hain? |
| `11-roadmap.md` | Phase 1, 2, 3, 4 me kya, kis order me? |
| `12-decisions-adr.md` | Har bada decision kyu liya, rejected option kya tha? |
| `13-testing-qa.md` | Launch se pehle kaun se test pass hone hi chahiye? |
| `14-operations-runbook.md` | Backup, monitoring, outage me kya karna hai? (backend/VPS, reference) |
| `16-android-native.md` | Android native app ka stack, offline-first, security kya hoga? (native, reference) |
| `17-ios-swift.md` | iOS Swift app ka stack, SwiftData, Keychain kya hoga? (native, reference) |
| `18-desktop.md` | Desktop app Tauri se kyu, Electron kab, security kya hogi? (native, reference) |
| `21-mail-core-user-flows.md` | Mail ke step-by-step user flows kya hain? |
| `22-mail-core-security-bot-ddos.md` | Bot, brute-force, DDoS, takeover se kaise bachenge? |
| `23-mail-core-infra-deliverability.md` | Deliverability, bounce/queue, backup order ke gaps kaun se the? |
| `24-mail-core-e2ee-privacy.md` | Key lifecycle, retention, deletion, privacy-policy content ke gaps? |
| `25-mail-core-day1-checklist.md` | Mail Phase 1 shuru karne se pehle lock hone wali master checklist? |
| `26-shared-locales.md` | Sab web apps ke liye shared locales kya hain — shuruwat me en + hi, default en? (web repo ka apna doc, backend copy nahi) |

## Backend ke baaki scope docs — is repo me kahan hain

Backend ke saare 45 md files ki content is repo me hai:

- `docs/00-25` (26 files) — upar wali poori list
- `docs/26-shared-locales.md` (1 file) — web repo ka apna doc, backend copy nahi; isliye backend ke 26 docs ke alag se hai
- `docs/dusrel-backend-README.md` — backend root README
- `clients/*` (4), `services/*` (6), `packages/auth, crypto,
  db, api-contracts, config, utils` (6), `infra/README.md` (1)
- `.github/workflows/backend-plan.md` — backend workflows README

Ye scope docs sirf reference ke liye hain — backend aur native
ka code is web repo me nahi banega. Web ka apna code jab banega
to `apps/*` aur `packages/ui, api-client` me banega.

Status rule wahi hai jo backend repo me hai: har doc ke top par
`DRAFT` ya `LOCKED` likha hai; `LOCKED` tabhi hoga jab user us
doc ko alag se approve karega. Docs me koi secret nahi hoga.
