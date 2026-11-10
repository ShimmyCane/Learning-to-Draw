# Learning to Draw — convo v0.1

**Date:** 2026-11-09 · Started with `/start-project` borrowed from the Index repo, inside Felix-Maze.

## What Jimmy asked

> Create easy-to-follow-along drawing worksheets to print on 8½ × 11, single- or double-sided, for the kids. Start with lines and shapes; grow into options like learning to draw a vehicle or an object, with the intent of teaching how to draw. Borrow from the maze approach: a process for generating, for reviewing, and for printing in bulk. Use the front end and the database (Family project). Create a research folder, track topics, start with a template and develop about five artwork types over ten categories: connect the dots, draw a shape, 2-D, letters, 3-D …

## What was built (round 1)

- A template (the page frame and the look → trace → dots → own fade) and 50 sheets, 10 kinds × 5 (see `schematic.md`).
- Generate → review → print: `process.md`, `tools/check_sheets.js`, `review.html`, `pack.html`.
- Reviews (faces, 🚩 flags, prints) on the device, ready to sync to `ltd_reviews` in the Family project.
- `research/topics.md` and `research/index.html`.

## Questions (answer inline)

1. **Names on the sheets.** Each sheet has "Name ____". Keep it, or leave it off?
   > 
2. **Who's who.** The data says "younger" and "older" instead of names (public repo). Is that enough, or do you want a way to add first names on the device only?
   > 
3. **Two-sided.** Line sheets print well two-sided. Pattern pizza and fat letters may show through. Print those one-sided, or use thicker paper?
   > 
4. **Help level.** Level 1 puts a dotted starter in the "Your turn" box. Too much help for the older child?
   > 
5. **Next kinds.** Which first: more vehicles (bus, truck, train, plane), animals, people, or lettering?
   > 
6. **Step size.** The "draw a thing" steps are five small boxes across the top. Big enough on paper, or two rows of three?
   > 
7. **Database.** OK to apply `ltd_reviews` to the Family project (test first, then the table)? The tool asked for a confirmation this round that wasn't answered in time, so nothing was applied.
   > 
8. **⚙️.** Want a "Notes for improvement" box in ⚙️ as well as flags?
   > 
