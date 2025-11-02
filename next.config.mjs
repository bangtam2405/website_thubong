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
  // Exclude canvas and fabric from server components (Next.js 13+)
  serverExternalPackages: ['canvas', 'fabric'],
  
  webpack: (config, { isServer, webpack }) => {
    // Exclude canvas and fabric from server-side bundle (for Vercel deployment)
    if (isServer) {
      // Ignore canvas native bindings trong server-side build
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^canvas$/,
          contextRegExp: /node_modules[\/\\]canvas/,
        })
      );
      
      config.externals = config.externals || [];
      config.externals.push(
        {
          canvas: 'commonjs canvas',
        },
        {
          fabric: 'commonjs fabric',
        },
        {
          jsdom: 'commonjs jsdom',
        }
      );
      
      // Mock fabric and canvas for server-side
      config.resolve.alias = {
        ...config.resolve.alias,
        'fabric': require.resolve('./lib/fabric-stub.js'),
        'canvas': require.resolve('./lib/canvas-stub.js'),
        'jsdom': false,
      };
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
