# Learning to Draw — brief (for Claude)

**What it is:** printable drawing worksheets (Letter portrait, black and white) in 10 kinds × 5 sheets, with a generate → review → print loop borrowed from Felix Maze. Folder `learning-to-draw/` inside the Felix-Maze repo, self-contained so it can become its own repo.

**State (2026-11-09, round 1):**
- 50 sheets in `data/catalog.js`, all pass `tools/check_sheets.js` (margins, code, footer, fingerprints written).
- Pages: home, sheet, pack (bulk, one/two-sided, flip), review, research. Smoke-tested offline at 390 and 1024 px: no errors, no sideways scroll.
- Reviews live on the device (`ltd.reviews` in localStorage).
- **Database not applied.** `supabase/001_reviews.sql` and `test_001_reviews_rollback.sql` are written. The rolled-back test was sent to the Family project, but the Supabase tool asked for a confirmation that wasn't answered in time, so nothing ran. Next: run the test (expect `RESULT: signed-in rows=2, names refused=true, anon=-1`), then apply the migration, then check `app_table_unregistered`.

**Decisions:**
- Codes `LD-<A–J><1–5>`; retire, don't delete.
- Children are "younger" / "older" in the data, never names or ages (public repo).
- Shared `js/app.js` is a copy in each sub-project (no cross-folder imports), so each folder can leave on its own.
- Inspired-by footers plus a one-line `about` on every sheet. Rule clarified 2026-11-09: attribution, not whether the artist is living. (Gee's Bend could come back to I5 now, with attribution.)

**Open questions:** `convo/convo v0.1.md`.
