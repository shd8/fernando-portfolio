---
title: "How a request becomes a page"
summary: "What happens in web4kit between a request arriving and a page rendering: the situation, the manifests, three questions per data source, calibration and invariants."
date: 2026-10-09
tags: [web4kit, Web Architecture, Next.js]
canonical: https://shd8.github.io/web4kit/concepts/
---

A web4kit page isn't laid out by hand. For each visitor, web4kit asks a System One decision model, TypeSafe Jev, what to show, with which component, and where. It answers with typed choices, never generated text.

The short version, as I put it [on daily.dev](https://daily.dev/posts/how-a-request-becomes-a-page-in-web4kit-my-open-source-toolkit-request-signals-become-labels-a-sm-00qz8i7m7):

When someone opens the page, cheap signals from the request (where they came from, device, language, local time, rough distance) become a few labels like `visitor=tourist` or `mealWindow=dinner`. The model never sees coordinates or cookies, just those labels.

Then a small decision model answers three questions for every section the site has: show it, with which component, and where. It can only pick from what the site declared, and when it isn't sure it falls back to the default.

After that it's plain code: a layout step that keeps the business rules, a plan cached per situation, and data fetched fresh at render time. Same URL, different page, and no generated text anywhere.

The rest of this post is the longer version.

## The pipeline

```
request
  │
  ▼
Context Envelope ── ?src / utm, Referer, CDN geo, Accept-Language,
  │                 device, Save-Data, local time, consented visit cookie
  ▼
Situation ───────── English labels from closed sets (arrival=visual,
  │                 mealWindow=dinner, openState=open, …)
  ▼
one decider round ─ for every data source, in parallel: what, how, where
  ▼
confidence gating ─ below the threshold → manifest default; uncalibrated → rules
  ▼
layout solver ───── region capacities, invariants, per-device grid
  ▼
Page Plan (JSON) ── decisions only, no user data → cached per situation
  ▼
renderer ────────── data fetched fresh at render time, server-rendered
```

The model decides meaning. Code decides mechanics.

## The situation

The request is turned, in code, into a handful of English labels: how the visitor arrived, their device, the time of day, how far away they are, whether they've booked.

```ts
import { CORE_RULES, collectEnvelope, deriveSituation } from "@web4kit/context";

const { envelope } = collectEnvelope({ url: request.url, headers: request.headers });
const situation = deriveSituation(envelope, CORE_RULES);
// { arrival: "visual", device: "mobile", familiarity: "unknown", language: "english", mediaBudget: "high" }
```

All the arithmetic (distance, opening hours, time zones) happens in these rules. The model only ever sees the labels: no coordinates, no timestamps, no cookies.

Take the restaurant demo, for a tourist arriving from Instagram on a Tuesday. At 20:30 and at 23:40 the labels are different, and so is the page. The [concepts page](https://shd8.github.io/web4kit/concepts/) lets you switch the time and watch both change together.

## Manifests

Each data source says what it is in one sentence (`what`), who it's for (`audience`), and its default placement. Each component says what it shows and which data shapes it accepts.

Those descriptions are the prompt. The model reads them literally. The data itself is fetched at render time and never reaches the model.

## The three questions

For every source, in one round:

1. **What to show:** is it relevant, and how important?
2. **How to show it:** which compatible component?
3. **Where:** which region, and how prominent?

The answers can only be things the manifests declared. There is nothing for the model to make up.

## Calibration

No answer is trusted until it's measured. `pnpm calibrate` runs the engine on fixtures and records, per question kind and language, the confidence above which its answers are right.

In production, an answer below that threshold uses the manifest default, and an unmeasured question uses rules. Every decision records who made it: engine, rule, default or invariant. So when a block shows up somewhere, I can see why.

## Invariants

Some things are never left to a model:

- At most one hero.
- Every source is rendered by exactly one component.
- A source is always shown when its `mustInclude` holds, and never when its `mustExclude` holds.
- Media-heavy components are swapped out when data saving is on.

Whatever the model answers, the page is complete.

## After the decisions

The layout solver turns the decisions into a plan: regions with capacities, the invariants, a grid per device, and seeded tie-breaks.

The plan holds decisions only, never user data, so it's cached per situation. The next visitor in the same situation gets a cached plan, with no model call. The data is still fetched fresh when the page renders.

That's the whole trip. If you want to try it, the [playground](https://shd8.github.io/web4kit/playground/) plans three sites for any situation you pick. For why I think this is worth doing at all, see [Pages that decide themselves](/blog/pages-that-decide-themselves).

*This post is adapted from [web4kit's concepts page](https://shd8.github.io/web4kit/concepts/), where it was first published.*
