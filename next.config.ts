import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist (usado internamente pelo pdf-parse) carrega um worker em tempo de execução
  // que o bundler não resolve corretamente; mantém o pacote fora do bundle.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
