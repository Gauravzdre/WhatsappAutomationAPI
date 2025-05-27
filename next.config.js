/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify
  ...(process.env.NETLIFY && {
    output: 'export',
    distDir: 'out',
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  }),
  
  // Disable image optimization for static export when on Netlify
  images: {
    unoptimized: process.env.NETLIFY ? true : false,
  },
}

module.exports = nextConfig 