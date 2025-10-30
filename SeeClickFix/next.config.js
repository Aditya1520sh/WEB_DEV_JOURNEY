/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Only expose env vars to the client when they are non-empty strings.
    // Empty-string values (from a mistaken env entry) can break URL parsing during
    // prerender/build (NextAuth's parseUrl calls `new URL('')`). Coerce falsy
    // values to undefined so the client-side code falls back to defaults.
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || undefined,
  // Ensure NEXTAUTH_URL is never an empty string at build-time. Prefer an explicit
  // fallback so NextAuth's client-side URL parsing gets a valid absolute URL.
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000',
    MONGODB_URI: process.env.MONGODB_URI || undefined,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || undefined,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || undefined,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || undefined,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || undefined,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || undefined,
  },
}

module.exports = nextConfig