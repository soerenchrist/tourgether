/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['commons.wikimedia.org', 'tourgether-bucket.s3.eu-central-1.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
