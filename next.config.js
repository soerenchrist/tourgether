/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['commons.wikimedia.org'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
