"use client";
import { useEffect, useState } from "react";

export const THEME_KEY = "dusrel-theme";
export type ThemeChoice = "light" | "dark" | "system";

function osDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function storedTheme(): ThemeChoice {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

export function effectiveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  return osDark() ? "dark" : "light";
}

export function applyTheme(choice: ThemeChoice): void {
  const eff = effectiveTheme(choice);
  const dark = eff === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = eff;
  document.querySelectorAll("meta[data-theme-color]").forEach((meta) => {
    meta.setAttribute("content", dark ? "#121212" : "#ffffff");
  });
}

// Blocking no-FOUC script, same logic as the dusrel.com site layout:
// reads the same localStorage key ('dusrel-theme', default 'system')
// and sets the .dark class before React hydrates. Render this as the
// first child of <body> in each app's root layout.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('dusrel-theme')||'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var resolved=dark?'dark':'light';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=resolved;var color=dark?'#121212':'#ffffff';document.querySelectorAll('meta[data-theme-color]').forEach(function(m){m.setAttribute('content',color);});}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}

const OPTIONS: { label: string; value: ThemeChoice }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => {
    const current = storedTheme();
    setChoice(current);
    applyTheme(current);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      if (storedTheme() === "system") applyTheme("system");
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY) {
        const next = storedTheme();
        setChoice(next);
        applyTheme(next);
      }
    };
    media.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const pick = (next: ThemeChoice) => {
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode must not break the toggle.
    }
    setChoice(next);
    applyTheme(next);
  };
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-slate-300 bg-white p-0.5 dark:border-white/20 dark:bg-white/5" role="group" aria-label="Theme">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => pick(opt.value)}
          aria-pressed={choice === opt.value}
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${choice === opt.value ? "bg-[#4d90fe] text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Logo({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2">
      <img src="/logo.svg" alt="Dusrel logo" width={32} height={32} className="h-8 w-8 shrink-0" />
      <span className="font-display whitespace-nowrap text-lg font-bold text-slate-900 dark:text-[#e8eaed]">{label}</span>
    </span>
  );
}

const CARD_OPTIONS: { label: string; value: ThemeChoice; icon: React.ReactNode }[] = [
  {
    label: "System",
    value: "system",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: "Dark",
    value: "dark",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    label: "Light",
    value: "light",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
];

// Three-card appearance picker (System / Dark / Light), same theme key and
// apply logic as ThemeToggle. Used by the mail settings pane, where the
// reference shows cards, not a segmented control.
export function AppearanceCards() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => {
    const current = storedTheme();
    setChoice(current);
    applyTheme(current);
  }, []);
  const pick = (next: ThemeChoice) => {
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode must not break the picker.
    }
    setChoice(next);
    applyTheme(next);
  };
  return (
    <div className="grid w-full grid-cols-3 gap-2" role="group" aria-label="Appearance">
      {CARD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => pick(opt.value)}
          aria-pressed={choice === opt.value}
          className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-sm font-medium ${choice === opt.value ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-[#e8eaed]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#1e1e1e] dark:text-slate-300 dark:hover:bg-white/5"}`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
