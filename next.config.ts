import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a plain static site into ./out — deployable free to
  // GitHub Pages, Netlify, Vercel or Cloudflare Pages.
  output: "export",
  images: { unoptimized: true },

  // Pin the workspace root. A stray package-lock.json in the home
  // directory otherwise makes Next infer ~/ as the project root.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
