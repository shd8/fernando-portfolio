---
title: "Migrating a large React app to Next.js without a rewrite: an incremental playbook"
description: "How to move a big client-side React app to Next.js one route at a time: a proxy fallback to the old app, a per-request Redux Toolkit store, the SSR bugs that always show up, and measuring whether it was worth it."
date: 2026-10-27
tags: [Next.js, React, Redux Toolkit, Performance, Architecture]
---

"Let's move to Next.js" is an easy decision and a hard project. On a large single-page app, the tempting plan is a rewrite on a branch that lands in one big release. I've led this migration on an international app serving many markets, and the approach I recommend is the opposite: both apps run side by side, and routes move over one at a time, each one shippable on its own.

Here's the playbook.

## Step 0: decide what you're migrating for

Write down the reason before touching code, because it decides the order of the work:

- **Faster first load and better SEO** for public pages → server rendering matters, start with the landing and product pages.
- **Per-market or per-locale content** → routing and i18n matter, start with the routing layer.
- **A cleaner architecture** → that's a refactor, and it doesn't need a framework change. Be honest about which one you're doing.

Also capture a baseline now: Largest Contentful Paint, Time to First Byte and JavaScript bundle size for your top pages. Without it you can't show the migration paid off.

## Step 1: put Next.js in front, and proxy everything else

The key trick is that the new app starts out owning **nothing**. Deploy Next.js in front of the old SPA and forward every route it doesn't know yet to the old app:

```js
// next.config.js
module.exports = {
  async rewrites() {
    return {
      // Checked only after every Next.js page and file has been tried
      fallback: [{ source: "/:path*", destination: `${process.env.LEGACY_APP_URL}/:path*` }],
    };
  },
};
```

On day one, users see exactly the old app. From then on, migrating a route means adding a page in Next.js: it takes over that URL, and everything else keeps going to the old app. Each route is a small release you can roll back by deleting one file.

Two things make this smooth:

- **Share the design system as a package**, so migrated and legacy pages look identical and users can't tell which app they're on.
- **Keep sessions compatible.** Both apps must read the same auth cookie on the same domain. Solve that before the first route moves, not after.

## Step 2: migrate routes in value order

Start with the pages where server rendering pays off most and the state is simplest: marketing, landing and listing pages. Leave the most interactive, state-heavy screens (dashboards, editors, checkout) for last, once the team knows the patterns.

For new routes, use the App Router: `app/` and `pages/` can live in the same project, so there's no reason to start on the older router. Server Components let you fetch data on the server without shipping that code to the browser, which is exactly the performance win you're migrating for.

## Step 3: the Redux store must be per request

Most large React apps have Redux, and this is where SPA habits break on the server. In an SPA, a module-level store is fine: there's one user per JavaScript runtime. On a server, one Node process handles many users at once, and **a global store leaks one user's data into another user's page.**

The fix is to create the store per request. With Redux Toolkit and the App Router, that means a `makeStore` factory and a client-side provider that creates the store once per page load:

```ts
// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { cartSlice } from "./cartSlice";

export const makeStore = () =>
  configureStore({
    reducer: { cart: cartSlice.reducer },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
```

```tsx
// app/StoreProvider.tsx
"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();
  return <Provider store={storeRef.current}>{children}</Provider>;
}
```

This is also a good moment to migrate hand-written Redux (action constants, switch reducers, manual immutability) to Redux Toolkit's `createSlice`. It removes a lot of code, and it's independent of the framework move, so it can be done slice by slice ahead of time.

And look hard at what's in the store. A lot of "global state" in older apps is cached server data. It doesn't belong in Redux at all; it belongs in the server fetch or in a server-state library like TanStack Query. Moving it out usually shrinks the store to a handful of real client state: the cart, UI preferences, a wizard's progress.

## Step 4: the SSR bugs you will hit

Every migration runs into the same handful. Knowing them in advance saves days:

- **`window` and `localStorage` at import time.** Code that runs on module load crashes on the server. Move it into `useEffect`, or into a component rendered only on the client.
- **Hydration mismatches.** Anything that differs between server and client breaks hydration: `new Date()`, `Math.random()`, locale-dependent formatting, reading the viewport width during render. Format dates with an explicit locale and time zone, and render viewport-dependent UI after mount.
- **Libraries that assume a browser.** Charts, maps and editors often do. Load them with `next/dynamic` and `ssr: false`, from a client component.
- **Third-party scripts.** Tag managers and widgets are often the biggest LCP regression. Load them with `next/script` and an appropriate `strategy`, not a raw `<script>` tag.

## Step 5: markets and locales

When the app serves several markets, routing is part of the architecture, not a detail. Put the market or locale in the URL (`/es-es/…`, `/de-de/…`), resolve it in one place (middleware), and pass it down explicitly. Hidden, cookie-only locale state is hard to cache, hard to share and invisible to search engines.

Treat market configuration as data: currencies, legal copy, enabled features and payment methods per market, loaded from one typed config. Adding a market should mean adding an entry and its translations, not touching components. That's what turns rolling out to new markets into a configuration exercise rather than a project.

## Step 6: prove it

When the last route has moved, delete the fallback rewrite and the old app, then compare against the baseline from step 0: LCP and TTFB on the top pages, bundle size, and error rates. If the numbers moved, you have the answer to "was it worth it" in one table. If they didn't, you know exactly which pages to look at.

## The short version

- Put Next.js in front on day one and proxy unknown routes to the old app.
- Move routes one at a time, public and simple pages first.
- Create the Redux store per request, and move server data out of it.
- Expect the classic SSR bugs: browser globals, hydration mismatches, browser-only libraries, third-party scripts.
- Make markets and locales explicit in the URL and in typed configuration.
- Measure before and after, then delete the legacy app.

No big-bang release, no frozen feature work, and at every step the site is shippable.
