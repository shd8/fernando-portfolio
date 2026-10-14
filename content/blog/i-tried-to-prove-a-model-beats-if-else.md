---
title: "I tried to prove a model beats if/else"
summary: "I fixed the rules before running the experiment: remove the hand-written heuristics from four web4kit sites and see whether TypeSafe Jev still plans good pages. It was 25.4 points ahead of the rules engine, and the verdict was still not shown."
date: 2026-10-01
tags: [web4kit, Testing, Web Architecture]
---

The first question anyone asks about web4kit is whether it's just if/else with extra steps. It's a fair question. A site author can write a rule for every situation, and a rules engine will follow them.

So I ran an experiment to answer it, and I wrote down what would count as a win before I looked at any data. This is a readable summary of the [ablation report](https://github.com/shd8/web4kit/blob/main/reports/ablation/report.md). The short version: the model was far ahead, and the verdict is still "not shown".

## What I compared

web4kit has two kinds of engine behind the same interface. One is a model, TypeSafe Jev (1.13.0 in this run), that answers typed questions about each data source on a page. The other is a deterministic rules engine that replays hand-written heuristics.

Each data source in a web4kit site is described by its owner: a `what` sentence, optionally a `not_for` line and tags, an `audience` (who it's for), defaults, and business invariants (`mustInclude` / `mustExclude`). The rules engine also needs heuristics, which are the if/else part.

The question was simple. If I take the heuristics away, does the model still plan good pages from the descriptions alone, where the rules engine falls apart?

I used four sites:

- Casa Lumbre, a restaurant
- Meridian Supply, a database explorer
- Casa Ribeira, the hotel starter
- the welcome starter

## The rule I fixed in advance

The gap is the mean over sites, at 0% heuristics kept, of Jev's pooled decision accuracy minus the rules engine's.

- **holds:** the gap with heuristics and audiences removed is at least 10 points, and Jev keeps at least 99% of invariants on every site in that same condition.
- **holds partially:** the gap with only heuristics removed is at least 10 points, while the gap with audiences removed too is below 10.
- **not shown:** anything else.

The invariant bar matters. A model that is more accurate on average but breaks a business rule on some pages isn't good enough to plan pages on its own.

## How it ran

There were two arms. In one, I removed each site's heuristics in steps (100%, 75%, 50%, 25% and 0% kept). In the other, I did the same and also removed every `audience`. Descriptions, defaults and invariants stayed in both.

The removal order was fixed by seed 7, and nested: a heuristic kept at 25% is kept at every higher level. I repeated the restaurant with seed 1009 to check the order didn't matter much.

Heuristics never reach the model, so within an arm Jev answers the same questions at every level. I recorded Jev once per site and arm, with 3 repeats, and replayed the recordings for every level. The recordings cost $0.68.

I scored decision accuracy against the final page, after gating, defaults, invariants and fallbacks. That's what a visitor actually gets.

## What happened

With every heuristic removed, Jev was **25.4 points** ahead of the rules engine on average. With audiences removed too, it was **25.0 points** ahead. Both are well over the 10-point bar.

The rules engine got worse as I removed heuristics, which is what you'd expect. On the restaurant, its decision accuracy across all decisions went from 87.5% with every heuristic to 59.2% with none. Jev stayed at 96.0% at 0%, because it never used them.

Then the invariants. With audiences removed, at 0% heuristics, Jev kept:

| site | invariants |
|---|---|
| restaurant | 99.6% |
| explorer | 65.2% |
| hotel | 97.7% |
| welcome | 100.0% |

Two sites are under 99%. So the verdict is **not shown**.

On the explorer, most failures were an empty hero, plus a briefing placed in the wrong region. The rules engine failed the same invariants and more, at 60.9%. Being better than the rules engine wasn't the bar, though.

## What I take from it

The model covers situations nobody wrote a rule for. Descriptions alone get it much further than rules alone.

It doesn't make business rules optional. Without the `audience` lines, the model sometimes breaks them on some sites. That's why web4kit is meant to be used with audiences, heuristics and invariants all in place, and with all of them, every site keeps 100% of its invariants.

The report's own conclusion is to lead with cost, safety and explainability.

I ran a [follow-up with placement labels](https://github.com/shd8/web4kit/blob/main/reports/ablation/followup-placement/report.md) for the two sites that missed. It was registered separately and was also not shown. I cover the wider argument in [Pages that decide themselves](/blog/pages-that-decide-themselves).

The full tables, every invariant failure and the per-site charts are in the [ablation report](https://github.com/shd8/web4kit/blob/main/reports/ablation/report.md).
