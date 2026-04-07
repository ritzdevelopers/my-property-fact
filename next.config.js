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
        permanent: true,
      },
    ];
  },


  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  // Ensure MUI and other packages are transpiled so vendor chunks are generated correctly
  transpilePackages: ["@mui/material", "@mui/system", "@mui/utils"],
  images: {
    // Explicit qualities used by <Image quality={…}> across the app (required in Next.js 16+).
    qualities: [45, 60, 65, 75, 100],
    // Extra widths so fixed logos can avoid 256w when ~160w suffices (2× 80px), and
    // hero/feature images can use 1400w instead of jumping 1200 → 1920.
    deviceSizes: [640, 750, 828, 1080, 1200, 1400, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 160, 192, 256, 384],
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
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
