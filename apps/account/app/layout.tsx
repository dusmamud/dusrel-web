import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeScript } from "@dusrel/brand";
import "./globals.css";
export const metadata: Metadata = { description: "Dusrel Account — your identity centre.", title: "Dusrel Account" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-[#121212] dark:text-[#e8eaed]">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
