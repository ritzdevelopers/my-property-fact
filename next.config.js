/** @type {import('next').NextConfig} */
(function normalizeLegacyPublicApiEnv() {
  const v = process.env.NEXT_PUBLIC_API_URL;
  if (typeof v !== "string" || !v.trim()) return;
  const withoutTrailing = v.trim().replace(/\/+$/, "");
  if (/^https?:\/\/apis\.mypropertyfact\.in$/i.test(withoutTrailing)) {
    process.env.NEXT_PUBLIC_API_URL = `${withoutTrailing}/api/v1/`;
  }
})();

function getBackendApiOrigin() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005/api/v1/";
  return String(raw).trim().replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
}

const nextConfig = {
  // Keep title, description, and canonical in <head> for all requests (not streamed into <body>).
  htmlLimitedBots: /.*/,

  async rewrites() {
    const apiOrigin = getBackendApiOrigin();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },

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
      {
        source: "/builder/one-global-/-forbes",
        destination: "/builder/one-global-forbes",
        permanent: true,
      },
      {
        source: "/builder/home-%26-soul",
        destination: "/builder/home-and-soul",
        permanent: true,
      },

      // Invalid/legacy public paths
      { source: "/builder/eleque", destination: "/", permanent: true },
      { source: "/builder/embessy", destination: "/", permanent: true },
      { source: "/builder/irajc-ventures", destination: "/", permanent: true },
      { source: "/landing-pages/disclaimer.html", destination: "/", permanent: true },
      { source: "/landing-pages/eldeco-la-vida-bella", destination: "/", permanent: true },
      { source: "/landing-pages/eldeco-la-vida-bella/thanks", destination: "/", permanent: true },
      { source: "/promotional-pages/eldeco-la-vida-bella", destination: "/", permanent: true },
      { source: "/landing-pages/eldeco-la-villa-bella2", destination: "/", permanent: true },
      { source: "/landing-pages/eldeco-la-villa-bella2/thanks", destination: "/", permanent: true },
      { source: "/promotional-pages/eldeco-la-villa-bella2", destination: "/", permanent: true },
      { source: "/landing-pages/sikka-kimaya", destination: "/", permanent: true },
      { source: "/landing-pages/sikka-kimaya/thanks", destination: "/", permanent: true },
      { source: "/promotional-pages/sikka-kimaya", destination: "/", permanent: true },

      { source: "/career", destination: "/join-our-team", permanent: true },

      // Gurgaon → Gurugram (legacy city name)
      { source: "/city/gurgaon", destination: "/city/gurugram", permanent: true },
      {
        source: "/property-rate-and-trend/gurgaon",
        destination: "/property-rate-and-trend/gurugram",
        permanent: true,
      },
      {
        source: "/apartments-in-gurgaon",
        destination: "/apartments-in-gurugram",
        permanent: true,
      },
      {
        source: "/flats-in-gurgaon",
        destination: "/flats-in-gurugram",
        permanent: true,
      },
      {
        source: "/commercial-property-in-gurgaon",
        destination: "/commercial-property-in-gurugram",
        permanent: true,
      },
      {
        source: "/new-projects-in-gurgaon",
        destination: "/new-projects-in-gurugram",
        permanent: true,
      },
      {
        source: "/offices-and-shop-in-gurgaon",
        destination: "/offices-and-shop-in-gurugram",
        permanent: true,
      },
      {
        source: "/:segment((?:\\d+-bhk|[^/]+))-in-gurgaon",
        destination: "/:segment-in-gurugram",
        permanent: true,
      },
      {
        source: "/:floor((?:\\d+-bhk|[^/]+))-:category(new-projects|apartments|commercial|offices-and-shop)-in-gurgaon",
        destination: "/:floor-:category-in-gurugram",
        permanent: true,
      },

      // Dwarka → Delhi (locality listed as separate city in API)
      { source: "/city/dwarka", destination: "/city/delhi", permanent: true },
      {
        source: "/property-rate-and-trend/dwarka",
        destination: "/property-rate-and-trend/delhi",
        permanent: true,
      },
      {
        source: "/apartments-in-dwarka",
        destination: "/apartments-in-delhi",
        permanent: true,
      },
      {
        source: "/flats-in-dwarka",
        destination: "/flats-in-delhi",
        permanent: true,
      },
      {
        source: "/commercial-property-in-dwarka",
        destination: "/commercial-property-in-delhi",
        permanent: true,
      },
      {
        source: "/new-projects-in-dwarka",
        destination: "/new-projects-in-delhi",
        permanent: true,
      },
      {
        source: "/offices-and-shop-in-dwarka",
        destination: "/offices-and-shop-in-delhi",
        permanent: true,
      },
      {
        source: "/:segment((?:\\d+-bhk|[^/]+))-in-dwarka",
        destination: "/:segment-in-delhi",
        permanent: true,
      },
      {
        source: "/:floor((?:\\d+-bhk|[^/]+))-:category(new-projects|apartments|commercial|offices-and-shop)-in-dwarka",
        destination: "/:floor-:category-in-delhi",
        permanent: true,
      },




      {
        source: "/__media__/js/netsoltrademark.php",
        destination: "/",
        permanent: true,
      },

      // Legacy: /web-story/{slug} → /api/v1/web-story/{slug} (proxied to backend via rewrites)
      {
        source: "/web-story/:slug*",
        destination: "/api/v1/web-story/:slug*",
        permanent: true,
      },
    ];
  },


  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      // Ensure crawlers and proxies don't cache robots.txt
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self';media-src 'self' https://otherassets.blob.core.windows.net https://*.cdninstagram.com https://*.fbcdn.net; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self' https://www.google.com https://*.google.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com; img-src 'self' https: data: blob:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https:; form-action 'self' https:; upgrade-insecure-requests",
          },
        ],
      },
    ];
  },
  // Ensure MUI and other packages are transpiled so vendor chunks are generated correctly
  transpilePackages: ["@mui/material", "@mui/system", "@mui/utils"],
  images: {

    qualities: [45, 60, 65, 68, 70, 75, 88, 100],
    // Cache optimized images longer so repeat visits aren't re-rushed through the optimizer.
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
