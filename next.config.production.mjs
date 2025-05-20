/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    // Add any production image domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      }
    ]
  },
  poweredByHeader: false,
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Get more detailed logging in production
  logging: {
    fetches: {
      fullUrl: false
    }
  },
  // Enable experimental features
  experimental: {
    serverExternalPackages: ['bcrypt'],
    // Enable for production caching
    serverMemoryReserveMb: 128,
    // Convert to RSC for better performance
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app', '*.netlify.app']
    }
  },
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
  // Used to disable debug outputs in production
  env: {
    IS_PRODUCTION: 'true'
  }
}

export default nextConfig 