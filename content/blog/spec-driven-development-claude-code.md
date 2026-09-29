---
title: "Spec-driven development with Claude Code: write the contract, then let the agent implement it"
description: "How I use a coding agent every day without vibe-coding: a short written spec (contract, data model, acceptance criteria) comes first, the agent implements against it, and review, types and tests check the result against the spec, not against a chat log."
date: 2026-09-29
tags: [AI-Assisted Development, Claude Code, Engineering Practices]
---

I use Claude Code for most of the code I ship. The part that makes that work isn't the model or the prompts. It's that every change starts from a short written spec, and the spec, not the conversation, is what the code gets reviewed against.

Without that, agent-written code has a problem ordinary code doesn't: if the only record of *what we meant to build* is a chat, then neither a reviewer nor the agent can tell afterwards whether the code is right. It might be. You just can't check.

## What goes in a spec

A spec here is a page, not a document. Three sections:

1. **The contract**: endpoints, request and response shapes, error cases. Or, for UI work, the component's props and the states it can be in.
2. **The data model**: the types and what's allowed to be null.
3. **Acceptance criteria**: concrete, checkable behaviour, written as scenarios.

For example, for an "export a report as CSV" feature:

```md
# Spec: CSV export for reports

## Contract
POST /reports/{id}/exports        → 202 { "jobId": string }
GET  /jobs/{jobId}                → 200 Job (queued | running | succeeded | failed)
  succeeded → { "downloadUrl": string, "expiresAt": ISO-8601 }

## Data model
Job is a discriminated union on `status`; `progress` (0–1) exists only when running.

## Acceptance criteria
- WHEN the user clicks Export THEN the button shows progress and stays disabled until the job ends
- WHEN the job succeeds THEN the download starts once, even if the page was reloaded meanwhile
- WHEN the job fails THEN the user sees the error message and can retry
- WHEN the user leaves the page THEN polling stops
```

Writing this takes ten or fifteen minutes. Most of the real decisions happen here: the contract gets agreed with whoever owns the other side of the API before anyone writes code, and edge cases show up as missing scenarios instead of as bugs.

For changes that span several files or teams, tools like [OpenSpec](https://github.com/Fission-AI/OpenSpec) keep specs in the repo and have each change propose a delta to them. For a single feature, a markdown file next to the code is enough. The format matters much less than the habit.

## Then the agent implements against it

With a spec in place, the prompt becomes almost boring: "implement `specs/csv-export.md`, following the conventions in `CLAUDE.md`, and add tests for every acceptance criterion." The agent has what it needs, and it's no longer guessing at intent.

Two Claude Code features carry most of the weight:

- **`CLAUDE.md`** holds the repo's conventions once: folder structure, how we fetch data, naming, which libraries to use and which to avoid. The agent reads it every session, so I don't repeat it in every prompt.
- **Custom slash commands** turn the workflow into a single step. A file like `.claude/commands/implement-spec.md` encodes the process:

```md
Implement the spec at $ARGUMENTS.

1. Read the spec and CLAUDE.md. List any ambiguity as questions before writing code.
2. Write the types from the "Data model" section first.
3. Write one test per acceptance criterion, then the implementation.
4. Run typecheck, lint and tests. Fix failures; don't disable rules or skip tests.
5. Summarise which criteria are covered and by which test.
```

Now `/implement-spec specs/csv-export.md` runs the same process every time, for everyone on the team.

Step 1 is the one I'd keep if I could only keep one. An agent that asks "should a failed export be retryable, or does the user start a new one?" before coding is worth far more than one that picks an answer silently.

## Review against the spec, not the diff

Reviewing agent code by reading every line is slow, and it's not where the risk is. My review order is:

1. **Does each acceptance criterion have a test, and does the test check that criterion?** Tests that pass without asserting anything are the most common failure I see.
2. **Does the code match the contract?** Types generated from the API schema make this mostly a compile-time question.
3. **Then the diff itself**: naming, structure, anything that fights the codebase's conventions.

If something is wrong, I fix the spec first when the spec was unclear, and the code second. That keeps the spec true, so the next change starts from something accurate.

## What I don't delegate

The agent writes most of the code. It doesn't decide what "correct" means, and it doesn't get to loosen the checks:

- **Strict TypeScript**, with no `any` escapes to make an error go away.
- **Lint rules and tests in CI** that fail the build. The agent runs them locally, but CI is the one that counts.
- **The contract itself.** API shapes get agreed between people, then written down. The agent implements them; it doesn't invent them.

That's the difference between spec-driven development and vibe coding. Both use the same tools. In one of them, you can prove afterwards that the code does what it was supposed to do.

## Getting started

You don't need a framework to try this. For your next feature, write the three sections above in a markdown file before opening the agent, and ask it to list its questions first. The first time it asks something you hadn't thought about, the spec has already paid for itself.
