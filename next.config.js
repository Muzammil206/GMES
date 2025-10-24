/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public", 
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);

