import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignora erros de TypeScript que possam quebrar a compilação
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Otimiza para deploys modernos (Netlify, Vercel, Docker)
  output: "standalone",
};

export default nextConfig;