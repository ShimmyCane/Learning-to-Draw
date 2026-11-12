# Visualize Image — Schematic

**Track:** B. Learn-by-doing (a method, shown one worked drawing at a time).
**Status:** Round 2 (V2). V1 (the plain frame viewer) is archived in `archive/v1/`. V2 is worksheets in the Learning to Draw look, a crop page for your own photo, and a gallery view. Favorite scene: `VI-002`. (Round 1b: Design plus a working viewer and one worked scene (`VI-001`, a museum kitchen). The living-room photo has not arrived yet.)
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

## Pages (V2)

| Page | What it does |
|---|---|
| `index.html` | Home: the six steps in a row, scenes (placeholder), link back to the Index |
| `crop.html` | Step 1 as a function: take or choose a photo, it suggests a crop (most contrast on a third) and a horizon from the edges, you drag the box, corner or horizon, and a preview zooms into the crop. Save on the device, copy for Claude, or print the step 1 sheet. The photo is never uploaded |
| `sheet.html?id=VI-002&s=1&level=1` | Seven printable Letter worksheets, one per step (crop, big shapes, add what sits on them, bold, light to dark, color, dots). Each has a finished Look example, a Your turn box, help level 1 to 3, and an inspired-by footer. Print one or all seven |
| `scene.html?id=VI-002` | Gallery view: the 14 frames big, with Play and full screen. (Was `scene.html` in V1: ◀ ▶, the rule caption, step labels, a toggle to see the original photo |
| `research/index.html` | What I was thinking, topics tracked |

## Data

A scene is one file, `data/scenes/<id>.js` (a JS file so it loads from `file://`), holding an object: `source` (private image path, never committed), `crop`, `horizon` (0–1 from top), `layers` (ordered back to front; each has `type` rect, poly, oval or circle, geometry `g` in photo pixels, `group` plane/mass/secondary/overlap, `priority` 1–5, `value` 0–4, `color`, optional `anchor`), `vision`, `leftOut`, `notes`. Frames are drawn from this; nothing hand-drawn per frame.

## Numbering

Scenes `VI-001`, `VI-002` … ; filters `F-dots`, `F-octagons`, `F-facets`, `F-lines`. Retired ids are never reused.

## Engine (`js/viz.js`)

Draws each frame as SVG from the scene: crop with thirds, horizon and the receding lines that find it; planes; masses; anchors; secondary and overlapping figures; priority numbers; bold outlines by priority; five-gray values; palette. Filters draw the kept layers small on a canvas, sample color and lightness, and rebuild them as round dots, octagon dots, triangle facets or hatching lines. Priority 5 layers disappear from step 4 on (what was left back).

## Worksheets (`js/ws.js`)

`WS.sheet(scene, step 1–7, level 1–3)` returns one 850 × 1100 SVG. The example and the Your turn box are the scene's crop drawn into nested SVG views. Help fades: level 1 traces the shapes in grey dashes, level 2 gives dots at corners or centers, level 3 gives only ticks, anchors or an empty frame. Each step names its source in the footer (rule of thirds, block-in, Cézanne, lost and found edges, notan, Zorn, Ben-Day dots).
