/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    // Deshabilitar temporalmente la verificación de tipos en tiempo de compilación
    ignoreBuildErrors: true,
  },
  // Configuración de compilación
  compiler: {
    // Habilita la eliminación de código muerto basado en navegadores
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

module.exports = nextConfig;
