import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Ignora erros de ESLint durante o processo de build na nuvem
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignora erros de TypeScript durante o processo de build na nuvem
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Opcional, mas recomendado para otimizar o empacotamento em provedores de nuvem
  output: "standalone",
};

export default nextConfig;