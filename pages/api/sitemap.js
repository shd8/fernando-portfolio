import { siteUrl } from "../../src/seo";

export default function handler(req, res) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = ["/", "/llms.txt"];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${siteUrl}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`).join("\n")}
</urlset>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.send(body);
}
