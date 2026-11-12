# Visualize Image — Claude Code pointer

Purpose: take any 2-D image (a photo of a room, a street, a still life) and teach, one drawing at a time, how to draw it: crop → mass → construct → bold → value and color → filters. Each step is a labeled frame, so another person can learn from it and make their own drawing. Born from a living-room photo that an image tool turned into a flat scene of circles, ovals, rectangles and triangles, like layers in Photoshop. Lives inside the Learning-to-Draw repo for now; self-contained so it can move to its own repo (copy this folder; nothing outside it is used except the `../index.html` link back to the Index).

- Design: `schematic.md` · Process (the six steps): `process.md` · Quality check: `qc.md` · Goals: `todo.md`
- Research: `research/topics.md` and `research/index.html` (a new "What I was thinking" panel per round)
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/brief.md` and `04 AI/lessons.md`
- Shared conventions: the Index repo's root `CLAUDE.md` (public repo, privacy) and `02 Refs/Skills/` (not in every session; follow from `convo/convo v0.1.md` if absent)

How to run: open `index.html` (works from the file or GitHub Pages; no server). Pages: `crop.html` (load or take a photo, see the crop and zoom), `sheet.html?id=VI-002` (seven printable Letter worksheets, help levels 1 to 3), `scene.html?id=VI-002` (large gallery view). V1 is archived in `archive/v1/`.

Rules:
- The end result is a printable worksheet that teaches how to draw (Learning to Draw look: Letter portrait, black and white, Look then Your turn, help fades by level, footer with "inspired by"). Gallery view is the on-screen extra.
- Any image in, same six steps out. Nothing is specific to the living room; it is only the first example (slot `data/scenes/`).
- **Big picture first.** Horizon, then background planes, then the biggest masses, before any object. Say where the horizon is in every scene.
- Every frame says what the step looked for (the rule) in one line, so a learner can repeat it on their own image.
- Leaving things out is a decision, not a failure: step 4 names the vision and what is allowed to fade.
- Photos of rooms and people go in `private/` (ignored). First names only, no addresses. The children are "younger" and "older" in the data.
- Outside art and teaching sources are "inspired by", properly attributed, never traced.
- Retire, don't delete: a replaced scene or filter gets `retired: true`; ids are never reused.
