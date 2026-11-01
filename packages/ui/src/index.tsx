import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Button({ children, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-[#4d90fe] text-white hover:bg-[#3b7de8]"
      : variant === "secondary"
        ? "border border-slate-300 dark:border-white/20 bg-white dark:bg-[#1e1e1e] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5";
  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-slate-900 dark:text-[#e8eaed] outline-none focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/30" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-slate-900 dark:text-[#e8eaed] outline-none focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/30" {...props} />;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-[#4d90fe]/10 px-2 py-0.5 text-xs font-medium text-[#2f6fd6] dark:text-blue-300">{children}</span>;
}
