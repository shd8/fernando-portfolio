import data from "../../data.json";
import { siteUrl } from "../../src/seo";
import { getPostSummaries } from "../../src/posts";

export default function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10);
  const posts = getPostSummaries();
  const urls = [
    { path: "/", lastmod: today, priority: "1.0" },
    { path: "/cv", lastmod: today, priority: "0.9" },
    ...(posts.length ? [{ path: "/blog", lastmod: posts[0].date, priority: "0.8" }] : []),
    ...posts.map((post) => ({ path: `/blog/${post.slug}`, lastmod: post.date, priority: "0.7" })),
    ...(data.talks.length ? [{ path: "/talks", lastmod: today, priority: "0.7" }] : []),
    { path: "/llms.txt", lastmod: today, priority: "0.5" },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ path, lastmod, priority }) => `  <url><loc>${siteUrl}${path}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600");
  res.send(body);
}
