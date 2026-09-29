// Notifies IndexNow (Bing, Yandex, Seznam, Naver...) about every URL in the live sitemap.
// Usage: node scripts/indexnow.mjs [https://site-url] [--published-today]
//   --published-today: only submit blog posts whose publish date is today (plus /blog), for scheduled posts.
const KEY = "e1f23f2202311c4bdb7ee15213daa158"; // public/<KEY>.txt must serve this value

const args = process.argv.slice(2);
const publishedTodayOnly = args.includes("--published-today");
const siteUrl = (args.find((arg) => arg.startsWith("http")) || process.env.SITE_URL || "https://fernando-gomez-graciani.vercel.app").replace(/\/$/, "");
const { host } = new URL(siteUrl);

const sitemap = await (await fetch(`${siteUrl}/sitemap.xml`)).text();
const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map(([, url, lastmod]) => ({ url, lastmod }));
if (entries.length === 0) throw new Error(`No URLs found in ${siteUrl}/sitemap.xml`);

const today = new Date().toISOString().slice(0, 10);
const newPosts = entries.filter(({ url, lastmod }) => url.includes("/blog/") && lastmod === today);
if (publishedTodayOnly && newPosts.length === 0) {
  console.log(`No posts published today (${today}); nothing to submit.`);
  process.exit(0);
}
const urlList = publishedTodayOnly ? [`${siteUrl}/blog`, ...newPosts.map(({ url }) => url)] : entries.map(({ url }) => url);

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
