// Used to configure Next.js
module.exports = {
  experimental: {
    // These routes read blog posts from disk at request time.
    outputFileTracingIncludes: {
      "/api/sitemap": ["./content/**"],
      "/api/llms": ["./content/**"],
      // Pages revalidate (ISR) to publish scheduled posts, so they need the posts at runtime too.
      "/": ["./content/**"],
      "/cv": ["./content/**"],
      "/talks": ["./content/**"],
      "/blog": ["./content/**"],
      "/blog/[slug]": ["./content/**"],
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
