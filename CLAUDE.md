# Learning to Draw — Claude Code pointer

Purpose: easy follow-along drawing worksheets to print (Letter, one- or two-sided) for the kids: lines and shapes first, then letters, 3-D, and step-by-step things like a cat or a car. Lives inside the Felix Maze repo for now; self-contained so it can move to its own repo later (copy this folder, nothing outside it is used except the `../index.html` link back).

- Design: `schematic.md` · Process (generate → review → print): `process.md` · Quality check: `qc.md` · Goals: `todo.md`
- Research: `research/topics.md` and `research/index.html` (a new "What I was thinking" panel per round)
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/brief.md` and `04 AI/lessons.md`
- Shared conventions: the Index repo's root `CLAUDE.md` (public repo, privacy) and its `02 Refs/Skills/` (start-project, ipad-website, settings-gear, supabase-link, smoke-test)

How to run: open `index.html` (works from the file or GitHub Pages; no server). One sheet: `sheet.html?code=LD-A1`.
Check the bank: `node tools/check_sheets.js` (every sheet draws, stays inside the margins, has its code and footer, and matches `tools/fingerprints.json`; `--update` only when a change to a published sheet is intended).

Rules:
- Letter portrait, black and white. Every sheet has "Learning to Draw #code" at the top and the "inspired by" footer.
- A sheet is a recipe in `data/catalog.js`; `js/sheets.js` draws it. Engine changes can change published sheets; the check must pass before committing.
- Joy first: white space, a finished example, then less help each row (look → trace → dots → on your own).
- First names only, no ages or schools; the children are "younger" and "older" in the data. Scans of drawings go in `private/` (ignored).
- Art is "inspired by", never traced, and properly attributed: `inspired` names the source and `about` tells one line about them, a couple of years above the kids' reading level. Living artists are fine with attribution.
- Retire, don't delete: a replaced sheet gets `retired: true`; its code is never reused.
- Supabase: Family project, app `learning-to-draw`, table `ltd_reviews` (`supabase/001_reviews.sql`). Not applied yet: see `04 AI/brief.md`.
