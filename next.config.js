/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['maps.googleapis.com', 'maps.gstatic.com'],
    },
    env: {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },
  }
  
  module.exports = nextConfig