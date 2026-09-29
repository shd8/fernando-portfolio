// Notifies IndexNow (Bing, Yandex, Seznam, Naver...) about every URL in the live sitemap.
// Usage: node scripts/indexnow.mjs [https://site-url]
const KEY = "e1f23f2202311c4bdb7ee15213daa158"; // public/<KEY>.txt must serve this value

const siteUrl = (process.argv[2] || process.env.SITE_URL || "https://fernando-gomez-graciani.vercel.app").replace(/\/$/, "");
const { host } = new URL(siteUrl);

const sitemap = await (await fetch(`${siteUrl}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
if (urlList.length === 0) throw new Error(`No URLs found in ${siteUrl}/sitemap.xml`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${siteUrl}/${KEY}.txt`, urlList }),
});

// 200 = accepted, 202 = accepted and key validation pending
console.log(`IndexNow ${res.status} for ${urlList.length} URLs:\n${urlList.join("\n")}`);
if (![200, 202].includes(res.status)) {
  console.error(await res.text());
  process.exit(1);
}
