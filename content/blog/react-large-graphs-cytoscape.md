---
title: "Rendering 1,000+ node graphs in React without freezing the UI"
description: "Why graph libraries and React's render cycle fight each other, and the setup I use with Cytoscape.js and a vanilla Zustand store: one long-lived instance, batched diffs, and UI state that never re-renders the canvas."
date: 2026-09-29
tags: [React, TypeScript, Data Visualization, Performance]
---

Interactive graphs are one of the few places where React's default model works against you. A network graph with a thousand nodes and a few thousand edges is a big, mutable, imperative scene. React wants to re-render from state. Put the two together naively and every hover, click or filter change rebuilds the whole graph.

The fix isn't a faster library. It's deciding which parts React owns and which parts it doesn't. I've built graph exploration UIs this way on Cytoscape.js; the same ideas apply to Sigma, vis-network or a hand-rolled canvas.

## The mistake: the graph as a pure function of props

```tsx
// ❌ Every parent render creates and lays out a brand new graph
function Graph({ elements }: { elements: ElementDefinition[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cy = cytoscape({ container: ref.current, elements, layout: { name: "cose" } });
    return () => cy.destroy();
  });
  return <div ref={ref} className="h-full w-full" />;
}
```

Wrappers that re-create the instance on every change hide the same problem. Recreating means re-parsing every element, re-running the layout and throwing away zoom, pan and selection. At a few hundred nodes it stutters. At a thousand the tab locks up for seconds.

## Rule 1: one long-lived instance

Create the Cytoscape instance once per mounted canvas, keep it in a ref, and destroy it on unmount. React owns the container `<div>`; Cytoscape owns everything inside it.

```tsx
import cytoscape, { type Core } from "cytoscape";

export function GraphCanvas({ elements, store }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      style: graphStyle,
      // Renderer options that matter at this size:
      textureOnViewport: true,   // pan/zoom a cached bitmap instead of redrawing
      hideEdgesOnViewport: true, // skip edges while the user is moving the view
      pixelRatio: 1,             // don't render at 2-3x on retina screens
    });
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // ...
  return <div ref={containerRef} className="h-full w-full" />;
}
```

The cleanup also makes it safe under React Strict Mode, which mounts effects twice in development.

## Rule 2: apply diffs, in a batch

When the data changes (a filter, an expanded neighbourhood, new results), don't replace the graph. Work out what was added and removed, and apply both inside `cy.batch()`, so Cytoscape recalculates styles and redraws once instead of once per element:

```tsx
useEffect(() => {
  const cy = cyRef.current;
  if (!cy) return;

  const nextIds = new Set(elements.map((el) => el.data.id));
  let added = cy.collection();
  cy.batch(() => {
    cy.elements().filter((el) => !nextIds.has(el.id())).remove();
    added = cy.add(elements.filter((el) => cy.getElementById(el.data.id!).empty()));
  });

  // Lay out only what's new, around what the user already knows
  if (added.nonempty()) {
    added.layout({ name: "cose", animate: false, fit: false }).run();
  }
}, [elements]);
```

Two details matter. Nodes must come before the edges that reference them in `elements`, or `add` throws. And running the layout only on the new elements keeps the rest of the graph where it was, so the user doesn't lose their mental map every time something loads.

## Rule 3: UI state outside React's render path

Selection, hover, "highlight this node's neighbours": this state changes constantly, and several React components need it (a side panel, a toolbar, a tooltip). But the canvas must not re-render when it changes. It just needs a class toggled on two nodes.

A vanilla Zustand store gives you both. React components subscribe with selectors and re-render only for the slice they read. The canvas subscribes imperatively and touches only the elements that changed:

```ts
import { createStore } from "zustand/vanilla";

type GraphUiState = {
  selectedId: string | null;
  select: (id: string | null) => void;
};

export const createGraphUiStore = () =>
  createStore<GraphUiState>()((set) => ({
    selectedId: null,
    select: (id) => set({ selectedId: id }),
  }));

export type GraphUiStore = ReturnType<typeof createGraphUiStore>;
```

```tsx
// Inside the mount effect in GraphCanvas
cy.on("tap", "node", (event) => store.getState().select(event.target.id()));
cy.on("tap", (event) => {
  if (event.target === cy) store.getState().select(null);
});

const unsubscribe = store.subscribe((state, prev) => {
  if (state.selectedId === prev.selectedId) return;
  cy.batch(() => {
    if (prev.selectedId) cy.getElementById(prev.selectedId).removeClass("selected");
    if (state.selectedId) cy.getElementById(state.selectedId).addClass("selected");
  });
});
// ...and call unsubscribe() in the cleanup, before cy.destroy()
```

```tsx
// Anywhere in React
function SelectionPanel({ store }: { store: GraphUiStore }) {
  const selectedId = useStore(store, (s) => s.selectedId);
  // ...
}
```

A click now costs two class changes on the canvas and one re-render of the panel. Nothing else runs.

Because the store is created by a factory rather than being a global, each graph on screen gets its own instance (pass it down through context). Two graphs side by side, or the same view open for two different datasets, can't leak selection or filters into each other.

## Rule 4: render less

Past a certain size, the fastest node is the one you don't draw:

- **Hide labels when zoomed out.** Cytoscape's `min-zoomed-font-size` style skips text rendering below a readable size. Text is one of the most expensive things on the canvas.
- **Start from a neighbourhood, not the whole graph.** Load the node the user asked about and its first-degree neighbours, then expand on demand. It's faster and usually more useful than a hairball.
- **Keep styles cheap.** Plain shapes and solid colours render far faster than images, shadows and curved edges on every element. Save the expensive styles for the selection.

## Where the line sits

The whole approach comes down to one boundary. React owns the layout of the page, the panels and the data flow. The graph library owns the scene. The store is the narrow bridge between them, carrying ids and flags, never the graph itself.

Once that boundary is clear, a thousand nodes is an ordinary workload, not a performance project.
