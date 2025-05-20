/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  poweredByHeader: false,
  compress: true,
  webpack: (config) => {
    // Add a fallback for Node.js native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  experimental: {
    serverExternalPackages: ['bcrypt'],
  },
}

export default nextConfig 