---
title: "End-to-end type safety from FastAPI to React: Pydantic → OpenAPI → TypeScript"
description: "How I keep a Python backend and a TypeScript frontend in sync without hand-written types: Pydantic models as the source of truth, the OpenAPI schema FastAPI already generates, openapi-typescript, and a CI check that fails on drift."
date: 2026-09-29
tags: [Python, FastAPI, TypeScript, React, API Design]
---

A full stack codebase with a Python backend and a TypeScript frontend has two type systems and one API between them. If the frontend types are written by hand, they're a copy of the backend models, and copies drift. The first sign is usually a runtime `undefined` in production, weeks after someone renamed a field.

You don't need a new framework to fix this. FastAPI already describes your API as an OpenAPI schema. The job is to make that schema the only thing the frontend's types come from, and to make CI fail when the two disagree.

## Step 1: the Pydantic models are the contract

Everything starts from explicit request and response models. Not `dict`, not "whatever the ORM returns":

```python
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

Visibility = Literal["private", "team"]


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    visibility: Visibility = "private"


class Project(BaseModel):
    id: str
    name: str
    visibility: Visibility
    description: str | None = None


@app.post("/projects", status_code=201, operation_id="createProject")
async def create_project(body: ProjectCreate) -> Project:
    ...


@app.get("/projects/{project_id}", operation_id="getProject")
async def get_project(project_id: str) -> Project:
    ...
```

Three habits pay off later:

- **Return type annotations** (or `response_model`) on every route. FastAPI uses them to validate and filter the response, and they become the response schema. Without them the frontend gets `unknown`.
- **`Literal` types for enums the UI branches on.** They turn into TypeScript string unions, so a `switch` on `visibility` is exhaustively checked.
- **Explicit `operation_id`s.** The generated names are otherwise long and unstable. Stable ids make the schema readable and diffs meaningful.

## Step 2: generate the types, don't write them

FastAPI serves the schema at `/openapi.json`, but you don't want CI to start a server just to read it. Dump it from the app object instead:

```bash
python -c "import json; from app.main import app; print(json.dumps(app.openapi(), indent=2))" > openapi.json
npx openapi-typescript openapi.json -o frontend/src/api/schema.d.ts
```

`openapi-typescript` turns the schema into plain TypeScript types, with no runtime code. Pair it with `openapi-fetch`, a tiny client that reads those types, and every call is checked against the backend's real contract:

```ts
import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const api = createClient<paths>({ baseUrl: "/api" });

const { data, error } = await api.POST("/projects", {
  body: { name: "Q4 planning", visibility: "team" },
});
// body is checked against ProjectCreate; data is typed as Project
```

A misspelled path, a missing required field or a wrong enum value is now a compile error, not a 422 in production.

## Step 3: plug it into TanStack Query

The generated client slots into query functions. The only glue is turning an error response into a thrown `Error`, which is what TanStack Query expects:

```ts
import { queryOptions } from "@tanstack/react-query";

export const projectQueries = {
  detail: (projectId: string) =>
    queryOptions({
      queryKey: ["projects", "detail", projectId] as const,
      queryFn: async ({ signal }) => {
        const { data, error } = await api.GET("/projects/{project_id}", {
          params: { path: { project_id: projectId } },
          signal,
        });
        if (error) throw new Error(`GET /projects/${projectId} failed`, { cause: error });
        return data;
      },
    }),
};
```

The chain is now typed end to end: a Pydantic field shows up as a typed property in a React component, and nobody wrote that type by hand.

## Step 4: make drift a failing build

Generation only helps if it can't be skipped. The CI check is two commands: regenerate, then fail if anything changed.

```yaml
- name: API types are up to date
  run: |
    python -c "import json; from app.main import app; print(json.dumps(app.openapi(), indent=2))" > openapi.json
    npx openapi-typescript openapi.json -o frontend/src/api/schema.d.ts
    git diff --exit-code -- openapi.json frontend/src/api/schema.d.ts
```

Committing `openapi.json` is deliberate. In code review, a backend change that alters the API shows up as a readable schema diff, which is exactly where a breaking change should be caught. Then `tsc` points at every frontend line the change breaks.

## Two gotchas worth knowing

**Input and output schemas are different.** In `Project`, `description` has a default, so it's optional when you send it but always present when the API returns it. Recent FastAPI versions model this correctly by generating separate input and output schemas when they differ (you'll see names like `Project-Input` and `Project-Output`). Keep that behaviour; turning it off makes response fields look optional and pushes needless `?.` checks into the UI.

**Types stop at the network boundary.** Generated types describe what the server promised, not what arrived. For most internal APIs, the backend's own response validation plus the CI check is enough. For data you really don't control, or long-lived clients that can outlive a deploy, add a runtime check (Zod or Valibot) at the edge as well.

## Why this is worth it

The payoff isn't the tooling. It's that the API contract lives in one place, the backend models, and every other representation is derived from it automatically. Renaming a field becomes a normal refactor: change the model, regenerate, and let the compiler list what to fix on the other side.
