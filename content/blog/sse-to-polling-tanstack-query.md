---
title: "Replacing Server-Sent Events with self-terminating polling in TanStack Query"
description: "Why I stopped streaming progress for long-running jobs, and the typed, job-based polling pattern with TanStack Query v5 that replaced it: contract, hook, backoff and resume after reload."
date: 2026-09-29
tags: [React, TypeScript, TanStack Query, API Design]
---

Long-running work shows up in every product sooner or later: file imports, exports, report generation, AI pipelines. The user clicks a button, the server needs 30 seconds or 10 minutes, and the UI has to show progress and then the result.

Server-Sent Events (SSE) look like the perfect fit. One request, the server pushes progress, done. I've shipped that design, and I've also replaced it. This post is about what went wrong with streaming, and the pattern I use instead: **a job resource on the server, and a self-terminating polling query on the client.**

## Where streaming progress breaks down

SSE is a good protocol. The problems show up in everything around it:

- **Infrastructure in the middle.** Proxies, load balancers and CDNs buffer responses or close idle connections. A stream that works on `localhost` stalls in production behind a 60-second idle timeout.
- **Lost events are lost state.** If the connection drops between `progress: 80%` and `done`, the client never learns the job finished. `EventSource` reconnects, but only helps if the server replays events with `Last-Event-ID`, which most implementations don't.
- **The tab goes to sleep.** Laptops close, mobile browsers suspend background tabs. When the user comes back, the stream is gone and the UI is stuck on the last event it saw.
- **Reloading loses everything.** The progress lives in the open connection, so a page refresh drops it, even though the job is still running on the server.
- **Auth and testing get awkward.** The native `EventSource` can't send custom headers, and asserting on a stream in tests is much harder than asserting on a JSON response.

What these share: **the client's knowledge of the job depends on a connection staying healthy.** So the fix is to make the server the single source of truth, and let the client ask for it whenever it wants.

## The contract: a job is a resource

Before touching the UI, I write down the API contract and agree it with whoever owns the backend. Two endpoints are enough:

```http
POST /imports            → 202 Accepted, Location: /jobs/{id}
                            { "id": "job_123", "status": "queued" }

GET  /jobs/{id}          → 200 OK, Cache-Control: no-store
                            { "id": "job_123", "status": "running", "progress": 0.42 }
```

Starting the work returns immediately with a job id. The job's state is a normal resource you can `GET` at any time, from any tab, after any reload. If the client misses an update, nothing is lost: the next request gets the current truth.

On the client, the contract becomes a type. A discriminated union makes illegal states unrepresentable: a `running` job always has progress, a `failed` job always has an error, and `succeeded` always has a result.

```ts
import { z } from "zod";

export const JobSchema = z.discriminatedUnion("status", [
  z.object({ id: z.string(), status: z.literal("queued") }),
  z.object({ id: z.string(), status: z.literal("running"), progress: z.number().min(0).max(1) }),
  z.object({ id: z.string(), status: z.literal("succeeded"), resultUrl: z.string().url() }),
  z.object({
    id: z.string(),
    status: z.literal("failed"),
    error: z.object({ code: z.string(), message: z.string() }),
  }),
]);

export type Job = z.infer<typeof JobSchema>;

export const isTerminal = (job: Job) => job.status === "succeeded" || job.status === "failed";
```

Parsing responses with the schema at the network boundary means contract drift fails loudly in one place, instead of turning into `undefined` somewhere deep in the UI.

```ts
export async function fetchJob(id: string, signal?: AbortSignal): Promise<Job> {
  const res = await fetch(`/api/jobs/${id}`, { signal });
  if (!res.ok) throw new Error(`GET /jobs/${id} failed with ${res.status}`);
  return JobSchema.parse(await res.json());
}
```

## The hook: polling that stops itself

In TanStack Query v5, `refetchInterval` can be a function of the query. That's what makes the polling self-terminating: it keeps going while the job is active, and returns `false` the moment the job reaches a terminal state. There's no `isPolling` flag, no `setInterval` and no cleanup code.

```ts
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

const POLL_MS = 2_000;
const MAX_BACKOFF_MS = 30_000;

export const jobQuery = (id: string | undefined) =>
  queryOptions({
    queryKey: ["jobs", id],
    queryFn: id ? ({ signal }) => fetchJob(id, signal) : skipToken,
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job && isTerminal(job)) return false;

      // Back off while requests are failing, e.g. during a deploy or a network blip.
      const failures = query.state.fetchFailureCount;
      return failures > 0 ? Math.min(POLL_MS * 2 ** failures, MAX_BACKOFF_MS) : POLL_MS;
    },
    // Don't poll from hidden tabs; TanStack Query refetches on focus anyway.
    refetchIntervalInBackground: false,
    retry: 3,
  });

export const useJob = (id: string | undefined) => useQuery(jobQuery(id));
```

A few details that matter in production:

- **`skipToken`** keeps the query idle until there's a job id, and keeps the types honest: inside `queryFn`, `id` is a `string`, not `string | undefined`.
- **The `signal`** cancels in-flight requests when the component unmounts or the key changes.
- **Backoff on failure** uses `fetchFailureCount`, which resets on the next success. A backend deploy doesn't turn every open tab into a retry storm.
- **Focus refetching** replaces the "tab went to sleep" problem. When the user comes back, the query refetches and the UI jumps straight to the current state.

## The component: derive, don't sync

Starting the job is a mutation. The job id doesn't need its own `useState`; it's the mutation's data:

```tsx
function ImportButton({ file }: { file: File }) {
  const start = useMutation({ mutationFn: () => startImport(file) });
  const { data: job } = useJob(start.data?.id);

  if (!job) {
    return (
      <button onClick={() => start.mutate()} disabled={start.isPending}>
        Import
      </button>
    );
  }

  switch (job.status) {
    case "queued":
      return <p>Waiting for a worker…</p>;
    case "running":
      return <progress value={job.progress} max={1} />;
    case "succeeded":
      return <a href={job.resultUrl}>Download the result</a>;
    case "failed":
      return <p role="alert">Import failed: {job.error.message}</p>;
  }
}
```

Every piece of UI state is derived from the query data. There's no "status" copied into local state and no effect that mirrors one value into another, so the two can never disagree. The `switch` over the discriminated union also gets exhaustiveness checking for free: add a `cancelled` status to the schema and TypeScript points at every place that needs to handle it.

When a real side effect is needed, like refreshing the list of imports once one succeeds, I keep it in one effect with one clear condition, in the consumer rather than inside the hook:

```tsx
const queryClient = useQueryClient();

useEffect(() => {
  if (job?.status === "succeeded") {
    queryClient.invalidateQueries({ queryKey: ["imports"] });
  }
}, [job?.status, queryClient]);
```

The hook returns state; the component decides what to do with it. That's also why this hook has no `onSuccess` callback. TanStack Query v5 removed those callbacks from `useQuery` for good reasons ([TkDodo explains why](https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose)).

## Surviving a reload

Because the job lives on the server, resuming after a refresh is one line of state management: put the job id in the URL.

```tsx
// useSearchParams from React Router (or next/navigation in Next.js)
const [searchParams] = useSearchParams();
const jobId = searchParams.get("job") ?? start.data?.id;
const { data: job } = useJob(jobId);
```

After the mutation succeeds, write `?job=job_123` to the URL. Reload the page, share the link, or open it in another tab, and `useJob` picks up polling exactly where the server is. With streaming, this is the part that usually needs a whole reconnection subsystem.

## What it costs, and when streaming still wins

Polling isn't free. It adds up to one polling interval of latency, and it makes more requests than a stream. In practice:

| | Job-based polling | Server-Sent Events / WebSockets |
|---|---|---|
| Survives drops, sleep, reloads | Yes, by design | Only with replay/reconnect logic |
| Latency | Up to one interval | Near real time |
| Works through any proxy/CDN | Yes, plain HTTP | Needs streaming-friendly infrastructure |
| Testing | Plain JSON responses | Stream fixtures |
| Best for | Jobs of seconds to hours | Chat, collaboration, high-frequency updates |

For long-running jobs, a 2-second delay is invisible, and a cheap `GET` of a small JSON document is easy for the backend to serve. If you need to go further, the server can return a suggested interval (for example `Retry-After`) and `refetchInterval` can read it from the data.

When updates are frequent and latency matters (chat, cursors, live dashboards), streaming is still the right tool. The mistake is treating a job that takes minutes as if it were a live feed.

## Checklist

- Model the job as a resource: `POST` returns an id, `GET` returns the current state.
- Agree the contract first, and encode it as a discriminated union validated at the boundary.
- Use `refetchInterval` as a function, so polling stops itself on terminal states.
- Back off on failures with `fetchFailureCount`, and don't poll hidden tabs.
- Derive UI state from query data; keep side effects in one effect in the consumer.
- Put the job id in the URL so reloads and shared links resume for free.

The result is less code than the streaming version, and a lot less that can break. Most of the reliability comes from the contract: once the server owns the job's state, the client only has to ask for it.
