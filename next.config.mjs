/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '192.168.0.193',
    '192.168.0.193:3000',
    'shopping-parents-aud-screensaver.trycloudflare.com',
  ],
}

export default nextConfig