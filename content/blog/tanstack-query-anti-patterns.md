---
title: "Stop syncing server state with useEffect: 6 TanStack Query anti-patterns and their fixes"
description: "Six TanStack Query v5 mistakes I see in code review, from copying query data into useState to refetching by hand after mutations, and the small, boring fixes that remove whole classes of bugs."
date: 2026-09-29
tags: [React, TypeScript, TanStack Query]
---

Most TanStack Query bugs I review aren't TanStack Query bugs. They come from treating it as a fancier `fetch`, then rebuilding by hand what the library already does: caching, deduplication, invalidation, derived state. The fixes are usually deletions.

Here are the six I flag most often, with the v5 version of each fix.

## 1. Fetching in `useEffect`

```tsx
// ❌ Loading, error, race conditions and caching are now your problem
const [projects, setProjects] = useState<Project[]>([]);
useEffect(() => {
  fetchProjects(filters).then(setProjects);
}, [filters]);
```

When `filters` changes quickly, responses can arrive out of order and the older one wins. There's no loading state, no error state, no retry and no cache, so every mount refetches.

```tsx
// ✅
const { data: projects = [], isPending, error } = useQuery({
  queryKey: ["projects", "list", filters],
  queryFn: () => fetchProjects(filters),
});
```

The rule: **if it comes from the server, it goes through a query.** `useEffect` is for synchronizing with things outside React, not for owning server data.

## 2. Copying query data into `useState`

```tsx
// ❌ Two sources of truth that drift apart
const { data } = useQuery(projectQueries.list(filters));
const [visible, setVisible] = useState<Project[]>([]);
useEffect(() => {
  if (data) setVisible(data.filter((p) => !p.archived));
}, [data]);
```

This renders twice per update, and the copy goes stale the moment someone forgets a dependency. Derive instead. `select` transforms the cached data per component, and the component only re-renders when the selected result changes:

```tsx
// ✅
const { data: visible = [] } = useQuery({
  ...projectQueries.list(filters),
  select: (projects) => projects.filter((p) => !p.archived),
});
```

The one legitimate reason to copy into state is a form: server data is the *initial* value, and the user's edits are local state. Pass the data in as a prop to a component that owns the draft, keyed by id, so a new record resets the form.

## 3. Query keys that don't include every input

```tsx
// ❌ Page 2 is cached as page 1
useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects({ page, search }) });
```

The key is the cache address. Anything the `queryFn` reads must be in the key, or you'll serve the wrong data from cache. Hand-writing keys in twenty components is how that happens, so I centralize them with `queryOptions`:

```ts
import { queryOptions } from "@tanstack/react-query";

export const projectQueries = {
  all: () => ["projects"] as const,
  list: (filters: ProjectFilters) =>
    queryOptions({
      queryKey: [...projectQueries.all(), "list", filters] as const,
      queryFn: () => fetchProjects(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...projectQueries.all(), "detail", id] as const,
      queryFn: () => fetchProject(id),
    }),
};
```

Now keys are consistent, `useQuery(projectQueries.detail(id))` is fully typed, and `queryClient.getQueryData(projectQueries.detail(id).queryKey)` knows its return type. The hierarchy also makes invalidation precise: `["projects"]` hits everything, `["projects", "list"]` only the lists. ESLint's `@tanstack/eslint-plugin-query` catches missing dependencies in keys too.

## 4. Side effects in query callbacks

v5 removed `onSuccess`, `onError` and `onSettled` from `useQuery`, and that was the right call. They ran once per component using the query, not once per fetch, and they didn't run when data came from cache. Toasts fired twice, or never.

Where each side effect goes now:

- **Reacting to a user action** (a toast after saving, a redirect): put it in the **mutation's** callbacks. Mutations run once per call.
- **Global error reporting**: use the `QueryCache` `onError` on the client, once for the whole app.
- **Deriving UI from data**: compute it during render. No effect needed.

```ts
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => reportError(error, { queryKey: query.queryKey }),
  }),
});
```

## 5. Refetching by hand after a mutation

```tsx
// ❌ Only refreshes this component's query; every other view of the data is stale
const { refetch } = useQuery(projectQueries.list(filters));
const rename = useMutation({ mutationFn: renameProject, onSuccess: () => refetch() });
```

Invalidate by key instead, and let every active query that matches refetch itself. If the server returns the updated entity, write it straight into the detail cache so that screen updates without a round trip:

```tsx
// ✅
const queryClient = useQueryClient();
const rename = useMutation({
  mutationFn: renameProject,
  onSuccess: (project) => {
    queryClient.setQueryData(projectQueries.detail(project.id).queryKey, project);
    return queryClient.invalidateQueries({ queryKey: projectQueries.all() });
  },
});
```

Returning the promise from `onSuccess` keeps `rename.isPending` true until the lists have refetched, so the button doesn't flicker back to idle while the old name is still on screen.

## 6. Leaving `staleTime` at zero everywhere

The default `staleTime` is `0`: data is stale immediately, so every mount, window focus and reconnect triggers a refetch. That's a safe default for a library and a noisy one for an app. Ten components reading the same list on one screen share a single request (deduplication), but navigating back and forth refetches all of it every time.

Pick a `staleTime` per kind of data, based on how often it really changes:

```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

// Reference data that changes on deploys, not on clicks
useQuery({ ...countryQueries.list(), staleTime: Infinity });
```

This is the cheapest performance win in most codebases, and it's one line.

## The pattern behind all six

Every fix above does the same thing: it gives server state exactly one owner, the query cache, and makes everything else a function of it. Components read from the cache, mutations write to it or invalidate it, and nothing in between keeps its own copy.

When I review a pull request that uses TanStack Query, I'm mostly looking for the places where that stopped being true.
