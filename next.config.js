/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure MUI and other packages are transpiled so vendor chunks are generated correctly
  transpilePackages: ["@mui/material", "@mui/system", "@mui/utils"],
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8005",
        pathname: "/api/v1/get/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8005",
        pathname: "/api/v1/fetch-image/**",
      },
      {
        protocol: "https",
        hostname: "apis.mypropertyfact.in",
        pathname: "/api/v1/get/images/**",
      },
      {
        protocol: "https",
        hostname: "apis.mypropertyfact.in",
        pathname: "/get/images/**",
      },
      {
        protocol: "https",
        hostname: "apis.mypropertyfact.in",
        pathname: "/fetch-image/**",
      },
    ],
    // Cache optimized images for 1 year (improves "Use efficient cache lifetimes" in Lighthouse)
    minimumCacheTTL: 31536000,
    // Add device sizes and image sizes for better optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Configure allowed quality values for Next.js 16 compatibility
    qualities: [75, 80, 85, 90, 95, 100],
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
