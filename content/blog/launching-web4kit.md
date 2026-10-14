---
title: "Launching web4kit"
summary: "I launched web4kit, an open source toolkit that plans each page per visitor with TypeSafe Jev. What it is, where I posted it, and how to try it in the playground or with the Vercel starter."
date: 2026-10-06
tags: [web4kit, Open Source, Next.js]
---

Today I launched web4kit. It's an open source toolkit, MIT licensed, where a page is planned per visitor when the request comes in, instead of once at build time.

This is the launch video:

<video controls preload="metadata" playsinline poster="https://shd8.github.io/web4kit/media/web4kit-launch.jpg">
  <source src="https://shd8.github.io/web4kit/media/web4kit-launch.mp4" type="video/mp4">
  <track kind="captions" src="https://shd8.github.io/web4kit/media/web4kit-launch.vtt" srclang="en" label="English" default>
  <a href="https://github.com/shd8/web4kit">Watch the launch video on GitHub</a>.
</video>

It's the same video as in the [web4kit README](https://github.com/shd8/web4kit).

## What it is

The request context (`?src` and UTM, Referer, CDN geo, Accept-Language, device, Save-Data, local time) becomes a situation made of a few closed labels. Then a small decision model, TypeSafe Jev, goes through every data source the site declares and decides whether it shows up, which component it uses and where it goes.

It can only pick from what you declared, so nothing gets generated. Normal code does the layout and rendering.

On a Next.js App Router site it's one call from a server component:

```tsx
// app/page.tsx
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const page = await site.page({ searchParams });
  return <PlanView plan={page.plan} data={page.data} manifests={site.manifests} registry={defaultRegistry} />;
}
```

It's still v0, and it plans read-only pages, so the API will change. I wrote up the reasoning, and where the evidence stops, in [Pages that decide themselves](/blog/pages-that-decide-themselves).

## Where I posted it

- **LinkedIn:** the launch post with the video, on [my LinkedIn](https://www.linkedin.com/in/fernando-gomez-graciani/).
- **Next.js Discussions:** [web4kit: plan each page per visitor from a Server Component](https://github.com/vercel/next.js/discussions/99751), #99751 in Show and tell. I asked two things there. Does `createSite()` with `site.page({ searchParams })` feel right for the App Router, or would you expect this in middleware or at the route level? And pages are `force-dynamic` right now, so how would you mix the per-situation plan cache with Next's own caching?
- **daily.dev:** I shared [the thesis](https://daily.dev/posts/i-wrote-up-the-idea-behind-web4kit-an-open-source-toolkit-i-ve-been-building-what-if-a-page-was-de-6v3wc5ggq) in the Open Source squad, and later [how a request becomes a page](https://daily.dev/posts/how-a-request-becomes-a-page-in-web4kit-my-open-source-toolkit-request-signals-become-labels-a-sm-00qz8i7m7) in the WebDev squad.

## Try it

- **In the browser:** the [playground](https://shd8.github.io/web4kit/playground/) plans three sites for any situation you pick. No key needed.
- **Your own copy:** the welcome starter, [shd8/web4kit-starter](https://github.com/shd8/web4kit-starter), deploys to Vercel in one click with [this button](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshd8%2Fweb4kit-starter&project-name=my-web4kit-site&repository-name=my-web4kit-site). It runs on the rules engine with no configuration. Add `JEV_API_KEY` to the project's environment later to have Jev plan the pages.
- **Locally:**

```bash
pnpm create web4kit my-site
cd my-site && pnpm install && pnpm dev
```

The code is at [github.com/shd8/web4kit](https://github.com/shd8/web4kit). Feedback on the API is the most useful thing I can get right now, in the Next.js discussion or as an issue.
