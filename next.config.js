// Used to configure Next.js
module.exports = {
  async rewrites() {
    return [
      { source: "/robots.txt", destination: "/api/robots" },
      { source: "/sitemap.xml", destination: "/api/sitemap" },
      { source: "/llms.txt", destination: "/api/llms" },
    ];
  },
};
