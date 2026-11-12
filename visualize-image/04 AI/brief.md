# Visualize Image — brief (for Claude)

**What it is:** a six-step method (crop, mass, construct, bold, value and color, filters) that turns any image into a taught drawing, shown as frames. Inspired by an AI tool that turned a living-room photo into a flat layered scene of primitives. Folder `visualize-image/` inside Learning-to-Draw, self-contained.

**State (2026-11-12, round 1b):** design plus viewer and one scene. `scene.html` + `js/viz.js` draw 14 frames from `data/scenes/VI-001.js` (a museum kitchen Jimmy supplied as a stand-in image; photo is in `private/`, ignored). Layers were placed by hand from the photo; not yet verified by Jimmy. The living-room photo and the 2-D result live in another program and in an archived asset in the Detail library, not in this repo. Jimmy will upload an image for reference.

**Decisions:**
- Placeholder for any image, not specific to the living room.
- Order of steps as Jimmy gave it; crop first (composition, contrast, suggestions to rearrange or move the viewpoint).
- Layers back to front; horizon named early because earlier attempts failed on horizons and backgrounds.
- Leaving things out is allowed and recorded.
- Rooms and people photos stay in `private/`.

**Open questions:** `convo/convo v0.1.md`.

**Round 2 (2026-11-12, V2):** Jimmy asked for graphics like Learning to Draw, V1 archived, crop and frame as a function of loading or taking a photo, and a printable worksheet that teaches how to draw as the end result. He likes pass 2 (VI-002). Built `css/app.css` (copy), `js/ws.js`, `sheet.html`, `crop.html`, restyled `index.html` and `scene.html`; V1 is in `archive/v1/`. The crop page's contrast detection is a simple edge-energy search and suggested the left cabinet on the kitchen photo; treat it as a first guess. Steps 2 to 7 for a new photo still need Claude to build a scene file.
