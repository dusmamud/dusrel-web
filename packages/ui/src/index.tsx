import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Button({ children, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-[#4d90fe] text-white hover:bg-[#3b7de8]"
      : variant === "secondary"
        ? "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
        : "text-gray-700 hover:bg-gray-100";
  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/30" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#4d90fe] focus:ring-2 focus:ring-[#4d90fe]/30" {...props} />;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-[#4d90fe]/10 px-2 py-0.5 text-xs font-medium text-[#2f6fd6]">{children}</span>;
}
