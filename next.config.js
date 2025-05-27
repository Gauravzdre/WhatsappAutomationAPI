/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export configuration since we have dynamic pages
  // Netlify will handle the deployment with their Next.js plugin
  images: {
    unoptimized: false,
  },
}

module.exports = nextConfig 