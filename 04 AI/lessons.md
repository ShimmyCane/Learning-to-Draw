# Learning to Draw — lessons

## 2026-11-09 (round 1)

- **Record every drawn point.** The engine logs each point it draws; the checker then proves nothing touches the margins, the header or the footer. It caught four sheets on the first run (spirals too big, wide words, sun rays).
- **Pause the point log for the header.** Header and footer text sit outside the drawing box on purpose; the frame turns the log off while it writes them.
- **Fat letters = a wide black stroke under a narrower white one.** Closed strokes (O) need flat ends, or the square cap pokes out where the stroke starts.
- **Don't write fingerprints when the check fails**, or a broken sheet becomes the baseline.
- **Look at a contact strip.** Rendering all five sheets of a kind side by side (Playwright) found overlapping labels (sailboat dots, "Look" over the grid numbers) that the checker can't see.
- **A Supabase call can stop for a confirmation.** If it times out, don't retry in the same turn; leave the SQL in the repo and mark the database "not applied".

## 2026-11-09 (round 1b)

- **The art rule is attribution.** Every sheet now prints an `about` line (one true sentence about the source) above the footer; the checker requires it and keeps it under 100 characters so it fits on one line.
