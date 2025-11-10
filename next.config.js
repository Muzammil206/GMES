import withNextIntl from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withIntl = withNextIntl('./i18n/request.ts');
const withPwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    unoptimized: true,
  },
};

export default withPwaConfig(withIntl(nextConfig));
