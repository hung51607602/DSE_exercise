import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // LlamaIndex & LLM SDKs use Node-only APIs (fs, pdf parsing...), so load them
  // with native `require` instead of bundling them.
  serverExternalPackages: [
    "llamaindex",
    "@llamaindex/core",
    "@llamaindex/env",
    "@llamaindex/openai",
    "@llamaindex/deepseek",
    "@llamaindex/readers",
    "@anthropic-ai/sdk",
  ],
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
