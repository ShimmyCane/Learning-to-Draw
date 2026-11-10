# Learning to Draw — Schematic

**Track:** A. Family play (simple, graphic, few words; options in ⚙️). The sheets are the product; the pages are for picking, reviewing and printing.
**Status:** Round 1 — template + 50 sheets (10 kinds × 5). Not printed or tried yet.
**Platform:** plain HTML/CSS/JS, no build, GitHub Pages (inside Felix-Maze for now). Sheets print on US Letter, portrait, black and white.
**Conversation:** `convo/convo v0.1.md`

## Purpose

Easy-to-follow drawing worksheets the kids can do at the table: start with lines and shapes, grow into letters, 3-D and drawing real things (a cat, a car, a vehicle on wheels) with the aim of teaching how to draw, step by step. Borrowed from Felix Maze: a recipe bank, a check before publishing, a review loop with flags, and bulk printing.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: the ten kinds as collapsible groups of cards, ⭐ sheet of the day, 🖨️ Print in bulk, 🔍 Review |
| `sheet.html?code=LD-A1` | One sheet. ◀ ▶, 🖨️ Print this one. **How did it go?** (Younger / Older, 😴 😊 😣) and **🚩 Flag** with a reason and a note |
| `pack.html` | Print in bulk: pick kinds and levels, one- or two-sided (long or short edge flip), mix them up. Flagged sheets are left out |
| `review.html` | Open flags (✅ fixed / fine as is, 📋 copy the list for Claude) and a table of faces per sheet and child, with print counts |
| `research/index.html` | What I was thinking (round 1), the ten kinds, topics tracked |

## The sheet (the template)

- Letter portrait, 8.5 × 11 in; drawing units are 1/100 inch (850 × 1100).
- Top line: "Learning to Draw #LD-A1" and "Name ____". Title (big, hand font), level dots ●○○, one line saying what to do.
- Drawing box 0.5 in from the sides, clear of the header and footer (`LTD.BOX`; the checker proves every point is inside).
- Footer: "Learning to Draw #code · title · inspired by …".
- Ink is black; lines to trace are grey dashes; helper dots are grey. A big black dot is where to start.
- **The fade:** look (black) → trace (dashes) → dots → on your own. Steps show the new part in black and earlier parts in grey.

## Numbering

`LD-<kind><type>`: kind is a letter A–J, type is 1–5. **LD-H2** = Shapes into things, sheet 2 (Draw a car). New sheets in a kind take the next number (6, 7 …); retired codes are never reused.

## The ten kinds × five sheets

| | Kind | Sheets |
|---|---|---|
| A | Lines | bee to the flower (straight), rain (up-down, slants), mountains (zigzag), waves and loops, snail spirals |
| B | Shapes | circles, squares and rectangles, triangles, diamonds and ovals, stars and hearts (+ "make a picture" box) |
| C | Connect the dots | star 1–10, house 1–12, fish 1–15, rocket 1–20, sailboat A–G |
| D | Mirror | butterfly, pine tree, funny face, flower vase, robot on a dot grid |
| E | Grid copy | kite 3×3, house 4×4, cat face 5×5, car 6×6, sailboat 6×6 |
| F | Letters | A–E, 1–5 (stroke numbers, trace → dots → own), fat block, bubble, 3-D letters |
| G | 3-D | cube, cylinder, cone, shading a ball, the road far away (one-point perspective) |
| H | Shapes into things | cat, car, house, fish, rocket (5 steps, then your turn) |
| I | Patterns | borders, pattern pizza, what comes next, bricks and scales, quilt square |
| J | Finish the picture | squiggles, circles into things, faces, what's in the jar, build a vehicle on wheels |

## Levels 1–3

Level 1 has the most help (a dotted starter in the "Your turn" box, dots on every mirror point, start dot on the copy grid). Level 2 has some (corner dots). Level 3 has none. Levels are about help, not ages; faces from each child set what to print next.

## Engine (`js/`)

| File | What it holds |
|---|---|
| `sheets.js` | Drawing helpers (trace, dots, fat letters), small pictures, step drawings, a stroke font, the page frame, one template per kind |
| `app.js` | ⚙️ drawer, error panel, reviews on the device + Supabase sync, printing pages one- or two-sided, card pictures (shared with Learning Kangaroo) |
| `bank.js` | The catalog minus retired sheets, review reasons and faces |
| `config.js` | Family project URL + publishable key, table name, page links |
| `data/catalog.js` | The published sheets: one recipe each |

## Data

Supabase **Family** project, app `learning-to-draw`, table `ltd_reviews` (flags, faces, prints). Reviews are kept on the device first and synced when signed in with the family account in ⚙️. `supabase/001_reviews.sql` + `test_001_reviews_rollback.sql`: **written, not applied** (see `04 AI/brief.md`).

## Feedback

🚩 Flag (with a note) and faces on every sheet's page, read back on `review.html`, synced to `ltd_reviews`.
