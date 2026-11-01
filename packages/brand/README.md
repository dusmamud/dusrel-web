# packages/brand — Dusrel brand, shared by every web app

Theme, icon aur fonts ka ek hi source of truth. Ye sab
dusrel.com site project se liya gaya hai, taaki site aur
web apps ek jaise dikhen:

- **Theme:** `dusrel-theme` localStorage key, default
  `system`. Dark mode `.dark` class strategy se hai
  (`@custom-variant dark` in `theme.css`), aur no-FOUC
  script site ke `Base.astro` wali logic ka hi React
  version hai. Theme option: Light / Dark / System.
- **Fonts:** Sora (headings, 600/700/800) + Inter (body,
  400/500/600), Fontsource se self-hosted — site ke
  `global.css` wahi weights use karta hai. Brand color
  `#4d90fe` (deep `#3b78e7`).
- **Color grading (site jaisi, Tailwind gray NAHI):** page
  light = white / slate-900, page dark = `#121212` /
  `#e8eaed` (site `Base.astro`); cards light = white +
  slate-200 border, cards dark = `#1e1e1e` + white/10
  border; secondary dark surface = white/5; header =
  white/85 (dark `#121212`/85) + backdrop blur; footer
  light = slate-50 (dark black/40); primary button =
  `#4d90fe`, hover `#3b7de0` (site Hero/SiteNav actual).
  Text scale slate family hai (900 / 700 / 600 / 500 /
  400, dark me `#e8eaed` / slate-200 / slate-300 /
  slate-400).
- **Icon/logo:** Dusrel ka apna blue four-ribbon sparkle.
  Logo file site ke `public/logo.svg` se copy karke har
  app ke `public/logo.svg` me rakhi gayi hai (Next.js me
  shared package se public asset serve nahi hota, isliye
  file copy karni padti hai — source of truth site ka logo
  hi hai). `Logo` component isi file ko dikhata hai.

Har app ko ye package use karna hai: apne `globals.css`
me `@import "@dusrel/brand/theme.css"` karo, root layout
me sabse pehle `<ThemeScript />` rakho, aur header me
`<Logo />` + `<ThemeToggle />` lagao.
