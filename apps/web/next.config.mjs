/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // shared DTOs are consumed as source across the monorepo
  transpilePackages: ['@chommie/shared-types'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
