/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    LUCIA_SECRET_KEY: process.env.LUCIA_SECRET_KEY,
  },
};

module.exports = nextConfig;