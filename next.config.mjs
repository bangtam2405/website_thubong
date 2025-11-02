/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    unoptimized: true,
    domains: ['localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'backend-webthubong.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/**',
      },
    ],
  },
  // Exclude canvas from server components (Next.js 13+)
  serverExternalPackages: ['canvas'],
  
  webpack: (config, { isServer }) => {
    // Exclude canvas from server-side bundle (for Vercel deployment)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    } else {
      // For client-side, replace canvas with a stub
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default nextConfig
