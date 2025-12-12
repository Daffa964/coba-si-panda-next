/** @type {import('next').NextConfig} */
const nextConfig = {
  // Di Next.js 15, serverActions sudah otomatis aktif.
  // Tidak perlu ditulis di experimental kecuali Anda butuh setting khusus.
  experimental: {
    // serverActions: {}, // Jika butuh config khusus, bentuknya object {}, bukan boolean true
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    LUCIA_SECRET_KEY: process.env.LUCIA_SECRET_KEY,
  },
};

module.exports = nextConfig;