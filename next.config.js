/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unjgllyuuvgcyezkcrpt.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuración para TypeScript
  typescript: {
    // Habilita la verificación de tipos en tiempo de compilación
    ignoreBuildErrors: false,
  },
  // Configuración de compilación
  compiler: {
    // Habilita la eliminación de código muerto basado en navegadores
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

module.exports = nextConfig;
