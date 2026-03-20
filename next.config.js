/** @type {import('next').NextConfig} */
const nextConfig = {
 
  
  async redirects() {
    return [
      // Blog legacy slugs
      {
        source:
          "/blog/taxpoliciesinindiaanoverviewofthesystemanditsimplications",
        destination:
          "/blog/tax-policies-in-india-an-overview-of-the-system-and-its-implications",
        permanent: true,
      },
      {
        source: "/blog/zoningregulationsthingstoknow",
        destination: "/blog/zoning-regulations-things-to-know",
        permanent: true,
      },
      {
        source: "/blog/theultimateguidetobuyingyourfirsthome",
        destination: "/blog/the-ultimate-guide-to-buying-your-first-home",
        permanent: true,
      },

      // Builder legacy/typo slugs
      {
        source: "/builder/gaurs",
        destination: "/builder/gaurs-group",
        permanent: true,
      },
      {
        source: "/builder/anant-raj-builders",
        destination: "/builder/anant-raj",
        permanent: true,
      },
      {
        source: "/builder/bhutani",
        destination: "/builder/bhutani-infra",
        permanent: true,
      },
      { source: "/builder/bptp%7D", destination: "/builder/bptp", permanent: true },
      { source: "/builder/eldeco%7D", destination: "/builder/eldeco", permanent: true },
      {
        source: "/builder/landcraft-builders%7D",
        destination: "/builder/landcraft-builders",
        permanent: true,
      },
      {
        source: "/builder/oasis-group%7D",
        destination: "/builder/oasis-group",
        permanent: true,
      },
      {
        source: "/builder/shubhashish-homes%7D",
        destination: "/builder/shubhashish-homes",
        permanent: true,
      },

      // Invalid/legacy public paths
      { source: "/builder/eleque", destination: "/", permanent: true },
      { source: "/builder/embessy", destination: "/", permanent: true },
      { source: "/builder/irajc-ventures", destination: "/", permanent: true },
      {
        source: "/landing-pages/disclaimer.html",
        destination: "/landing-pages/eldeco-la-vida-bella",
        permanent: true,
      },
      {
        source: "/promotional-pages/eldeco-la-vida-bella",
        destination: "/landing-pages/eldeco-la-vida-bella",
        permanent: true,
      },
      {
        source: "/promotional-pages/sikka-kimaya",
        destination: "/landing-pages/sikka-kimaya",
        permanent: true,
      },
     

 
      {
        source: "/__media__/js/netsoltrademark.php",
        destination: "/",
        permanent: false,
      },
    ];
  },
  // Ensure MUI and other packages are transpiled so vendor chunks are generated correctly
  transpilePackages: ["@mui/material", "@mui/system", "@mui/utils"],
  images: {
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
