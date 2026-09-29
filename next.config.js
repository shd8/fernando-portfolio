// Used to configure Next.js
module.exports = {
  experimental: {
    // API routes read blog posts from disk at request time.
    outputFileTracingIncludes: {
      "/api/sitemap": ["./content/**"],
      "/api/llms": ["./content/**"],
    },
  },
  async rewrites() {
    return [
      { source: "/robots.txt", destination: "/api/robots" },
      { source: "/sitemap.xml", destination: "/api/sitemap" },
      { source: "/llms.txt", destination: "/api/llms" },
    ];
  },
};
