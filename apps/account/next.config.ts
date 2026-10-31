import type { NextConfig } from "next";
const config: NextConfig = { output: "export", transpilePackages: ["@dusrel/ui", "@dusrel/locales", "@dusrel/auth"] };
export default config;
