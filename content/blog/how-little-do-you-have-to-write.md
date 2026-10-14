---
title: "How little do you have to write?"
summary: "Two pre-registered web4kit ablations on how much a developer has to write. One line per source got TypeSafe Jev to 89.5%. Adding audience and include got it to 98.3%, against 98.8% with the full manifests, except on the explorer's invariants."
date: 2026-10-13
tags: [web4kit, Testing, Developer Experience]
---

A web4kit site is described by manifests. For each data source you write what it is, who it's for, its defaults, business rules and some heuristics for the rules engine. That's less than writing pages, but it's still work.

So I wanted to know the minimum. How much can I take out before the model stops planning good pages? I ran two pre-registered studies on the same four sites: Casa Lumbre (a restaurant), Meridian Supply (a database explorer), Casa Ribeira (the hotel starter) and the welcome starter.

The reports are [zero-config](https://github.com/shd8/web4kit/blob/main/reports/ablation/zero-config/report.md) and its follow-up, [Z2](https://github.com/shd8/web4kit/blob/main/reports/ablation/zero-config-z2/report.md).

## The arms

- **F (full):** the site's manifests, unchanged.
- **Z1 (what only):** each source keeps its one-line `what`. `not_for`, tags, `audience` and heuristics are removed, defaults become neutral, and the site gets one purpose sentence, such as "Website of Casa Ribeira, a boutique hotel in Porto".
- **Z0 (pure):** like Z1, but `what` is replaced by the source id and its field names, for example "Late shipments: id, detail, eta, delay, supplier". No text written by the owner at all.

In every arm I kept `mustInclude` / `mustExclude`, because business rules can't be inferred, and the site's situation rules, which a developer still writes.

I scored Jev ungated, using its answers directly with no calibration profile. That's the honest number for a site that hasn't been calibrated yet.

One bias to know about: the fixtures and labels were written against the full manifests, so F has a home advantage.

## The first study: not shown

The rule, fixed before any engine ran: Z0 holds if it's at least 90%, at most 5 points below F, and keeps at least 99% of invariants on every site. If Z0 fails and Z1 passes, it "holds with one line". Otherwise, not shown.

The averages across the four sites:

| arm | Jev decision accuracy |
|---|---|
| F | 98.8% |
| Z1 | 89.5% |
| Z0 | 74.0% |

Neither zero-config arm passes. One line per source gets you to 89.5%, which is a lot for one line, but it's not the bar.

The [getting started guide](https://shd8.github.io/web4kit/docs/getting-started/) has the reason: with `what` alone, the score dropped mostly because time-bound blocks were shown at the wrong time. A line like "this morning's breakfast" tells the model what the block is. It doesn't say when it's for.

## The follow-up: what, audience and include

I registered Z2 after I knew the first verdict and before I ran it. It's reported separately, and it never changes that verdict.

Z2 is Z1 plus two things per source: its `audience` and its default `include`. `not_for`, tags and heuristics are still gone, and the salience, region, prominence and component defaults are still neutral.

The rule: Z2 holds if, on every site, its accuracy and invariants are each at most 2 points below F's. It holds on average if that's only true of the four-site averages.

| | F | Z2 |
|---|---|---|
| Accuracy | 98.8% | 98.3% |
| Invariants | 98.8% | 97.5% |

The verdict is **holds on average**. On the restaurant, the hotel and the welcome starter, Z2 is within 2 points of F on both.

The miss is the explorer's invariants: 91.3% for Z2, against 95.7% for F. Two invariants failed there, one source missing for an analyst on mobile and one placed in the wrong region for an executive on desktop.

So `audience` and `include` carry most of the quality. In practice that's what I'd write first: one sentence on what the source is, who it's for, and whether it's on the page by default.

## Why the heuristics stay

If Jev barely needs heuristics, why does web4kit still ask for them?

Because they drive the rules engine, and the rules engine is the fallback whenever a model is unavailable or a question kind isn't calibrated. That fallback has to be a sensible page on its own.

The guide puts numbers on what happens when it isn't. Without heuristics and placement defaults, the starters' rules-only pages drop from 100% to between 73% and 83% decision accuracy. Z2 shows the same thing: the rules engine scored 73.1% on the welcome starter and 83.4% on the hotel, while Jev was at 100.0% on both.

So the heuristics aren't there for the model. They're there for the day the model isn't.

## What the docs say now

The guide tells you to say who a source is for with `audience` rather than prose. The linter, the dev server and `pnpm web4kit check` flag a time-bound `what` with no `audience`, which is the mistake that cost Z1 most of its points.

The full tables, the Z0 descriptions and every invariant failure are in the [zero-config report](https://github.com/shd8/web4kit/blob/main/reports/ablation/zero-config/report.md) and the [Z2 report](https://github.com/shd8/web4kit/blob/main/reports/ablation/zero-config-z2/report.md).
