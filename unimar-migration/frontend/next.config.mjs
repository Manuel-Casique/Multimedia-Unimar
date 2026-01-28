/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'portalunimar.unimar.edu.ve',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
         protocol: 'http',
         hostname: '127.0.0.1',
      }
    ],
  },
};

export default nextConfig;
