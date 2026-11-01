import type { NextConfig } from "next";
const config: NextConfig = { output: "export", transpilePackages: ["@dusrel/ui", "@dusrel/locales", "@dusrel/auth", "@dusrel/brand"] };
export default config;
