const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

// next-intl writes its alias into experimental.turbo when Turbopack is active,
// but Next.js 16 moved that config to the top-level turbopack key.
// Promote the alias and remove the now-invalid experimental.turbo entry.
const config = withNextIntl(nextConfig);

if (config.experimental?.turbo) {
  config.turbopack = {
    ...config.turbopack,
    resolveAlias: {
      ...config.turbopack?.resolveAlias,
      ...config.experimental.turbo.resolveAlias,
    },
  };
  delete config.experimental.turbo;
  if (Object.keys(config.experimental).length === 0) {
    delete config.experimental;
  }
}

module.exports = config;
