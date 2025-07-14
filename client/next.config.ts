import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

// // next.config.js
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true, // Use the faster Rust compiler for minification
//   poweredByHeader: false, // Hide "X-Powered-By: Next.js" header for security

//   headers: async () => [
//     {
//       source: "/(.*)",
//       headers: [
//         {
//           key: "X-Content-Type-Options",
//           value: "nosniff",
//         },
//         {
//           key: "X-Frame-Options",
//           value: "SAMEORIGIN",
//         },
//         {
//           key: "X-XSS-Protection",
//           value: "1; mode=block",
//         },
//         {
//           key: "Referrer-Policy",
//           value: "strict-origin-when-cross-origin",
//         },
//         {
//           key: "Permissions-Policy",
//           value:
//             "camera=(), microphone=(), geolocation=(), interest-cohort=()",
//         },
//         {
//           key: "Strict-Transport-Security",
//           value: "max-age=63072000; includeSubDomains; preload",
//         },
//         {
//           key: "Content-Security-Policy",
//           value: `
//             default-src 'self';
//             script-src 'self' 'unsafe-inline' 'unsafe-eval';
//             style-src 'self' 'unsafe-inline';
//             img-src * blob: data:;
//             font-src 'self';
//             connect-src *;
//             frame-ancestors 'self';
//           `.replace(/\s{2,}/g, ' ').trim(),
//         },
//       ],
//     },
//   ],

//   // Enable image optimization domains
//   images: {
//     domains: ["your-cdn.com", "images.example.com"], // Replace with trusted sources
//   },

//   // Enforce trailing slashes (optional)
//   trailingSlash: false,

//   // Internationalization (optional)
//   i18n: {
//     locales: ['en'],
//     defaultLocale: 'en',
//   },

//   // Output static HTML if using static export
//   // output: 'export',
// };

// module.exports = nextConfig;
