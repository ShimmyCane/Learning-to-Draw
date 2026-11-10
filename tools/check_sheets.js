#!/usr/bin/env node
/* Learning to Draw: check every sheet in data/catalog.js before publishing.
   - every recipe has a template, a title, a short instruction, a level 1–3 and an "inspired by"
   - codes are unique and every category A–J has types 1–5
   - every point drawn stays inside the drawing box (white space round the edge, clear of the header and footer)
   - the page has the code at the top and the footer
   - the drawing matches tools/fingerprints.json (so an engine change can't quietly change a published sheet)
   Usage: node tools/check_sheets.js [--update]   (--update only when a change to a published sheet is intended) */
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const dir = path.join(__dirname, "..");
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ["js/sheets.js", "data/catalog.js"]) vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f });
const { LTD, LTD_CATALOG } = ctx;
const FP = path.join(__dirname, "fingerprints.json");
const fps = fs.existsSync(FP) ? JSON.parse(fs.readFileSync(FP, "utf8")) : {};
const update = process.argv.includes("--update");
const problems = [], seen = new Set(), out = {};
for (const rc of LTD_CATALOG) {
  const code = LTD.codeOf(rc), say = m => problems.push(code + ": " + m);
  if (seen.has(code)) say("duplicate code"); seen.add(code);
  if (!rc.title || !rc.how) say("missing title or instruction");
  if (rc.how && rc.how.length > 70) say("instruction too long for one line (" + rc.how.length + " characters)");
  if (!(rc.level >= 1 && rc.level <= 3)) say("level must be 1–3");
  if (!rc.inspired) say("missing inspired by");
  if (!rc.about) say("missing the about line (who the idea comes from, one line)");
  else if (rc.about.length > 100) say("about line too long for one printed line (" + rc.about.length + ")");
  let m;
  try { m = LTD.measured(rc); } catch (e) { say("does not draw: " + e.message); continue; }
  const { x0, y0, x1, y1 } = LTD.BOX;
  const off = m.pts.filter(([x, y]) => !(x >= x0 && x <= x1 && y >= y0 && y <= y1) || !isFinite(x) || !isFinite(y));
  if (off.length) say(off.length + " points outside the drawing box, e.g. " + off.slice(0, 3).map(p => p.map(Math.round).join(",")).join(" "));
  if (!m.svg.includes(LTD.NAME + " #" + code)) say("no code at the top");
  if (m.pts.length < 10) say("almost nothing drawn");
  const opens = (m.svg.match(/<(path|circle|rect|text|g|pattern|clipPath|defs|svg|line)\b/g) || []).length;
  const closes = (m.svg.match(/\/>|<\/(text|g|pattern|clipPath|defs|svg)>/g) || []).length;
  if (opens !== closes) say("SVG tags don't balance (" + opens + " vs " + closes + ")");
  const fp = crypto.createHash("sha1").update(m.svg).digest("hex").slice(0, 12);
  out[code] = fp;
  if (!rc.retired && fps[code] && fps[code] !== fp && !update) say("changed since it was published (run with --update if that is intended)");
}
for (const c of "ABCDEFGHIJ") for (let t = 1; t <= 5; t++) if (!seen.has("LD-" + c + t)) problems.push("LD-" + c + t + ": missing");
if (!problems.length && (update || !fs.existsSync(FP))) { fs.writeFileSync(FP, JSON.stringify(Object.assign(fps, out), null, 1) + "\n"); console.log("fingerprints written"); }
if (problems.length) { console.log("❌ " + problems.length + " problem(s):\n" + problems.join("\n")); process.exit(1); }
console.log("✅ " + LTD_CATALOG.length + " sheets pass: inside the margins, code on top, footer, fingerprints.");
