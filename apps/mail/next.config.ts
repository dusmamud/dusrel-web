import type { NextConfig } from "next";
const config: NextConfig = { output: "export", transpilePackages: ["@dusrel/ui", "@dusrel/locales", "@dusrel/api-client", "@dusrel/brand"] };
export default config;
