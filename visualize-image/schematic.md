# Visualize Image — Schematic

**Track:** B. Learn-by-doing (a method, shown one worked drawing at a time).
**Status:** Round 1, design only. The workflow is drafted from the living-room example (photo and result not yet in the repo; they go in `private/` and `data/scenes/`).
**Platform:** plain HTML/CSS/JS, no build, GitHub Pages. Linked from the Index.
**Conversation:** `convo/convo v0.1.md`

## Purpose

Show how to turn any picture into a drawing by deciding, in order: what to frame, what the big shapes are, how smaller things sit on them, what matters most, and how light and color fall. Each scene is a short walk through those frames (like a step viewer) so someone else can follow along and then do their own image.

Why it works: asking an AI for the *big picture* gave a flat layered scene of simple geometry. Earlier tries failed because horizons and backgrounds were not understood. So the method is built layer by layer, back to front, and the horizon is named early.

## The six steps (one frame, or a few, each)

| # | Step | The question | What it makes |
|---|---|---|---|
| 1 | **Crop and frame** | What is interesting here? Where is the contrast sweetest? | A crop rectangle, the reason, and optional "move something / stand somewhere else" suggestions |
| 2 | **Mass** | What are the biggest shapes, and where is the horizon? | Primitives (circles, ovals, rectangles, triangles) as flat layers, back to front: background, ground and wall planes, big objects. They become the anchors on the page |
| 3 | **Construct** | What sits on or overlaps the masses? | Light lines: secondary figures, then overlapping figures, then a ranked list of priorities |
| 4 | **Bold** | What is this drawing about? | Trace and thicken the outlines that matter; thin or drop the rest. A one-line vision, and what was left back |
| 5 | **Value and color** | Where are the lights, mids, darks? Then which colors? | Two or three frames: value blocks (3–5 grays), then limited color |
| 6 | **Filters** | What if the world were only dots, facets or lines? | Alternate renderings of the same scene |

Steps 1 to 5 are the lesson. Step 6 is play and also a way to see the scene differently.

## Filters (step 6)

Lenses applied to the final frame: round dots (halftone), octagon dots, triangle facets (low-poly), lines only (hatching and contour). Each lens is a function over the scene; more are added by recipe.

## Pages (planned)

| Page | What it does |
|---|---|
| `index.html` | Home: the six steps in a row, scenes (placeholder), link back to the Index |
| `scene.html?id=…` | One scene as frames: ◀ ▶, the rule caption, step labels, a toggle to see the original photo |
| `filters.html?id=…` | The final frame under each filter |
| `research/index.html` | What I was thinking, topics tracked |

## Data

A scene is one JSON file in `data/scenes/<id>.json`: `source` (private image path, never committed), `crop`, `horizon` (0–1 from top), `layers` (ordered back to front; each is a primitive: `type` circle, oval, rect or tri, `x y w h`, `priority` 1–5, `value` 0–4, `color`), `vision`, `leftOut`, `notes`. Frames are drawn from this; nothing hand-drawn per frame.

## Numbering

Scenes `VI-001`, `VI-002` … ; filters `F-dots`, `F-octagons`, `F-facets`, `F-lines`. Retired ids are never reused.
