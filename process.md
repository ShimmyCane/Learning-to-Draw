# Learning to Draw — Process

Three steps, borrowed from Felix Maze: **generate → review → print in bulk**.

## 1. Generate

1. Pick the kind (A–J) and the next type number. Write the recipe in `data/catalog.js`: `cat`, `type`, `level` (1–3), `title`, `how` (one line, at most 70 characters), `inspired` (the artist, teacher or source) and `about` (one true line about them, under 100 characters).
2. If the kind needs new art, add it in `js/sheets.js` (a new step drawing in `STEPS`, a new dot picture in `DOTS`, a new mirror half in `MIRROR`, a new grid picture in `GRIDS`, a new letter in `L`).
3. Run `node tools/check_sheets.js`. It must pass: draws, inside the margins, code on top, footer, tags balance, fingerprint unchanged for published sheets. A new sheet gets its fingerprint on `--update`.
4. Look at it: open `sheet.html?code=…` and go through `qc.md`.

## 2. Review

- After the kids draw, open the sheet's page: tap **Younger** or **Older**, then a face (😴 too easy · 😊 just right · 😣 too hard).
- Anything wrong (too hard, unclear, prints badly): **🚩 Flag** with a reason and a note. Flagged sheets are never bulk-printed.
- `review.html` lists open flags and every sheet's faces. 📋 copies the flags for Claude, who fixes the recipe or replaces the sheet (old one `retired: true`), re-runs the check, and marks the flag ✅ fixed.
- Signed in (⚙️), reviews sync to `ltd_reviews`, so Claude can read them straight from the database.

## 3. Print in bulk

- `pack.html`: choose kinds and levels, one- or two-sided, mix them up, 🖨️ Print. The browser prints one sheet per page, Letter portrait, no margins.
- **Two-sided:** turn on two-sided in the print box. Portrait pages flip on the **long edge**. If your printer flips on the short edge, pick that and the backs are turned upside down for you.
- Heavy fills (pattern pizza, fat and 3-D letters) can show through thin paper; print those one-sided.
- Each print is logged (`printed`) so the review table shows what has been used.
