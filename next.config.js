/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify
  output: process.env.NETLIFY ? 'export' : undefined,
  
  // Disable image optimization for static export
  images: {
    unoptimized: process.env.NETLIFY ? true : false,
  },
  
  // Trailing slash for consistency
  trailingSlash: true,
  
  // Disable server-side features for static export when on Netlify
  ...(process.env.NETLIFY && {
    distDir: 'out',
  }),
}

module.exports = nextConfig 