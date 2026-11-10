/* Learning to Draw: the worksheet engine.
   A sheet is a recipe in data/catalog.js ({ cat, type, title, how, level, inspired }). This file turns a recipe into
   one Letter portrait page as SVG (850 × 1100 units = 1/100 inch). Black and white only: ink is black, lines to
   trace are grey dashes, helper dots are grey. Every point drawn is recorded so tools/check_sheets.js can prove
   nothing runs into the margins, the header or the footer. */
(function (root) {
  "use strict";
  const W = 850, H = 1100;
  const INK = "#111", TRACE = "#8c8c8c", GUIDE = "#c9c9c9", PREV = "#a3a3a3";
  const BOX = { x0: 50, y0: 190, x1: 800, y1: 1020 };     // drawing must stay inside this (white space all round)
  const NAME = "Learning to Draw";

  // ---------- point helpers ----------
  let seen = null;                                     // every point drawn, for the margin check
  const f = n => Math.round(n * 10) / 10;
  const note = (x, y) => { if (seen) seen.push([x, y]); };
  const d = (pts, close) => { pts.forEach(p => note(p[0], p[1])); return "M" + pts.map(p => f(p[0]) + " " + f(p[1])).join(" L") + (close ? " Z" : ""); };
  const deg = a => a * Math.PI / 180;
  function earc(cx, cy, rx, ry, a0, a1, n) {
    n = n || Math.max(8, Math.ceil(Math.abs(a1 - a0) / 6));
    const out = [];
    for (let i = 0; i <= n; i++) { const a = deg(a0 + (a1 - a0) * i / n); out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return out;
  }
  const circ = (cx, cy, r, n = 60) => earc(cx, cy, r, r, -90, 270, n);
  function starPts(cx, cy, R, r, n = 5) { const o = []; for (let i = 0; i < n * 2; i++) { const a = deg(-90 + i * 180 / n), q = i % 2 ? r : R; o.push([cx + q * Math.cos(a), cy + q * Math.sin(a)]); } return o; }
  function heartPts(cx, cy, R) { const o = []; for (let i = 0; i <= 64; i++) { const t = i / 64 * 2 * Math.PI; o.push([cx + R * 16 * Math.pow(Math.sin(t), 3) / 17, cy - R * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 - R * 0.1]); } return o; }
  const move = (pts, s, dx, dy) => pts.map(p => [dx + p[0] * s, dy + p[1] * s]);
  function sample(pts, step) {                          // points spaced evenly along a polyline
    const out = [pts[0]]; let left = step;
    for (let i = 1; i < pts.length; i++) {
      let [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i];
      let seg = Math.hypot(x1 - x0, y1 - y0);
      while (seg >= left) { const t = left / seg; x0 += (x1 - x0) * t; y0 += (y1 - y0) * t; out.push([x0, y0]); seg -= left; left = step; }
      left -= seg;
    }
    return out;
  }

  // ---------- drawing ----------
  function line(pts, o = {}) {
    const { w = 5, c = INK, dash = null, close = false, fill = "none", cap = "round", join = "round" } = o;
    return `<path d="${d(pts, close)}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="${join}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  }
  const ink = (pts, o = {}) => line(pts, Object.assign({ w: 5 }, o));
  const trace = (pts, o = {}) => line(pts, Object.assign({ w: 4, c: TRACE, dash: "11 9" }, o));
  const dot = (x, y, r = 4, c = TRACE) => (note(x, y), `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`);
  const dotted = (pts, step = 24, r = 3.6) => sample(pts, step).map(p => dot(p[0], p[1], r)).join("");
  const startDot = (x, y) => dot(x, y, 8, INK);
  function text(x, y, s, o = {}) {
    const { size = 28, anchor = "start", font = "hand", weight = 400, fill = INK } = o;
    note(x, y);
    const fam = font === "hand" ? "'Patrick Hand', 'Comic Sans MS', cursive" : "Quicksand, Arial, sans-serif";
    return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const rect = (x, y, w, h, o = {}) => line([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], Object.assign({ close: true, w: 3 }, o));
  function turnBox(x, y, w, h, label = "Your turn") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="${INK}" stroke-width="3"/>` + (note(x, y), note(x + w, y + h), "") +
      `<rect x="${x + 18}" y="${y - 18}" width="${label.length * 13 + 30}" height="36" rx="12" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` + text(x + 33, y + 9, label, { size: 26 });
  }
  const badge = (x, y, n) => `<circle cx="${x}" cy="${y}" r="15" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` + text(x, y + 8, String(n), { size: 22, anchor: "middle", font: "ui", weight: 700 });

  // ---------- small pictures in a 100 × 100 box: c circle, e ellipse, p polyline (z = closed), a arc, d dot ----------
  function elPts(e) {
    if (e.t === "c") return { pts: circ(e.x, e.y, e.r), close: true };
    if (e.t === "e") return { pts: earc(e.x, e.y, e.rx, e.ry, -90, 270, 60), close: true };
    if (e.t === "a") return { pts: earc(e.x, e.y, e.rx, e.ry || e.rx, e.a0, e.a1), close: false };
    return { pts: e.p, close: !!e.z };
  }
  function el(e, s, dx, dy, o = {}) {
    if (e.t === "d") return dot(dx + e.x * s, dy + e.y * s, Math.max(3, (e.r || 2.5) * s), o.c || INK);
    const { pts, close } = elPts(e);
    return line(move(pts, s, dx, dy), Object.assign({ close, w: 4.5, dash: e.dash ? "9 7" : null }, o));
  }
  const pic = (els, s, dx, dy, o) => els.map(e => el(e, s, dx, dy, o)).join("");
  const P = (...p) => ({ t: "p", p }), Z = (...p) => ({ t: "p", p, z: true }), Cc = (x, y, r) => ({ t: "c", x, y, r }), E = (x, y, rx, ry) => ({ t: "e", x, y, rx, ry }), A = (x, y, rx, ry, a0, a1) => ({ t: "a", x, y, rx, ry, a0, a1 }), D = (x, y, r) => ({ t: "d", x, y, r });

  const ICONS = {
    bee: [E(50, 55, 26, 18), P([42, 38], [42, 72]), P([56, 38], [56, 72]), E(42, 30, 12, 9), E(60, 30, 12, 9), D(70, 50, 3), P([24, 55], [14, 55])],
    flower: [Cc(50, 34, 10), Cc(50, 16, 9), Cc(68, 34, 9), Cc(50, 52, 9), Cc(32, 34, 9), P([50, 61], [50, 95]), Z([50, 82], [66, 70], [70, 76])],
    cloud: [P([20, 62], [80, 62]), A(32, 52, 14, 12, 90, 270), A(50, 42, 18, 18, 180, 360), A(70, 52, 12, 12, 270, 450)],
    car: [Z([10, 62], [90, 62], [90, 76], [10, 76]), P([24, 62], [34, 44], [66, 44], [76, 62]), Cc(30, 78, 9), Cc(70, 78, 9)],
    flag: [P([30, 92], [30, 10]), Z([30, 12], [76, 24], [30, 38]), P([16, 92], [44, 92])],
    fish: [E(44, 50, 30, 18), Z([72, 50], [92, 34], [92, 66]), D(28, 45, 3)],
    star: [Z(...starPts(50, 52, 42, 18))],
    snail: [A(48, 52, 26, 26, -90, 270), A(50, 54, 15, 15, -90, 200), P([18, 80], [90, 80]), P([74, 80], [84, 70], [86, 56]), P([84, 60], [90, 48]), P([84, 60], [80, 47])],
    sun: [Cc(50, 50, 18), ...[0, 45, 90, 135, 180, 225, 270, 315].map(a => P([50 + 26 * Math.cos(deg(a)), 50 + 26 * Math.sin(deg(a))], [50 + 40 * Math.cos(deg(a)), 50 + 40 * Math.sin(deg(a))]))],
    house: [Z([20, 50], [80, 50], [80, 92], [20, 92]), P([12, 52], [50, 16], [88, 52]), Z([44, 92], [44, 70], [56, 70], [56, 92])],
    heart: [Z(...heartPts(50, 52, 40))],
    apple: [A(38, 58, 22, 28, 70, 300), A(62, 58, 22, 28, 240, 470), P([50, 34], [52, 18]), Z([52, 24], [66, 14], [64, 26])],
    ball: [Cc(50, 50, 36), A(50, 50, 36, 14, 0, 180), P([50, 14], [50, 86])]
  };
  const icon = (name, cx, cy, size = 70) => ICONS[name] ? pic(ICONS[name], size / 100, cx - size / 2, cy - size / 2, { w: 4 }) : "";

  // ---------- step-by-step drawings (categories G and H): each step adds parts; the last may replace (a finished look) ----------
  const STEPS = {
    cube: [[Z([20, 40], [64, 40], [64, 84], [20, 84])], [Z([36, 24], [80, 24], [80, 68], [36, 68])], [P([20, 40], [36, 24]), P([64, 40], [80, 24]), P([64, 84], [80, 68]), P([20, 84], [36, 68])],
      { replace: true, els: [Z([20, 40], [64, 40], [64, 84], [20, 84]), P([20, 40], [36, 24], [80, 24], [80, 68], [64, 84]), P([64, 40], [80, 24]), Object.assign(P([36, 24], [36, 68], [80, 68]), { dash: true }), Object.assign(P([20, 84], [36, 68]), { dash: true })] }],
    cylinder: [[E(50, 24, 28, 10)], [P([22, 24], [22, 78]), P([78, 24], [78, 78])], [A(50, 78, 28, 10, 0, 180)], [P([66, 33], [66, 87]), P([71, 31], [71, 86]), P([75, 29], [75, 84])]],
    cone: [[E(50, 80, 30, 10)], [D(50, 12, 3)], [P([20, 80], [50, 12], [80, 80])],
      { replace: true, els: [P([20, 80], [50, 12], [80, 80]), A(50, 80, 30, 10, 0, 180), Object.assign(A(50, 80, 30, 10, 180, 360), { dash: true }), P([58, 30], [62, 86]), P([64, 44], [68, 86]), P([70, 58], [72, 84])] }],
    ball: [[Cc(50, 46, 30)], [Object.assign(Cc(38, 34, 7), { dash: true })], [A(50, 46, 25, 25, -10, 110), A(50, 46, 20, 20, 0, 100), A(50, 46, 15, 15, 15, 85)], [E(56, 86, 28, 6), P([36, 86], [44, 82]), P([46, 90], [58, 81]), P([62, 90], [72, 82])]],
    road: [[P([4, 44], [96, 44])], [D(50, 44, 2.5)], [P([14, 96], [50, 44]), P([86, 96], [50, 44])], [P([50, 92], [50, 80]), P([50, 68], [50, 60]), P([50, 53], [50, 49])], [P([10, 90], [10, 66]), Cc(10, 60, 7), P([28, 68], [28, 56]), Cc(28, 52, 4.5), P([36, 55], [36, 50]), Cc(36, 48, 2.8)]],
    cat: [[Cc(50, 40, 22)], [Z([32, 27], [30, 8], [44, 19]), Z([68, 27], [70, 8], [56, 19])], [A(50, 80, 24, 17, 200, 340), P([27, 86], [73, 86])], [D(42, 38, 3), D(58, 38, 3), Z([47, 46], [53, 46], [50, 50]), P([50, 50], [46, 54]), P([50, 50], [54, 54]), P([20, 44], [38, 47]), P([80, 44], [62, 47])], [P([72, 84], [86, 78], [90, 62], [84, 52])]],
    car: [[Z([10, 60], [90, 60], [90, 78], [10, 78])], [P([25, 60], [35, 42], [68, 42], [78, 60])], [Cc(28, 80, 10), Cc(72, 80, 10), D(28, 80, 2.5), D(72, 80, 2.5)], [Z([33, 58], [39, 46], [50, 46], [50, 58]), Z([54, 58], [54, 46], [66, 46], [72, 58])], [Cc(85, 66, 3), P([52, 62], [52, 76]), P([56, 66], [60, 66]), P([2, 93], [98, 93])]],
    house: [[Z([20, 50], [80, 50], [80, 92], [20, 92])], [P([14, 52], [50, 18], [86, 52])], [Z([44, 92], [44, 68], [56, 68], [56, 92])], [Z([26, 58], [38, 58], [38, 70], [26, 70]), Z([62, 58], [74, 58], [74, 70], [62, 70]), P([32, 58], [32, 70]), P([68, 58], [68, 70])], [P([64, 35], [64, 20], [72, 20], [72, 42]), Cc(72, 12, 4), Cc(80, 6, 3)]],
    fish: [[E(45, 50, 30, 18)], [Z([74, 50], [94, 34], [94, 66])], [Cc(28, 45, 4), P([16, 54], [22, 55])], [P([38, 33], [48, 20], [58, 34]), P([42, 67], [50, 76], [56, 67])], [A(48, 50, 8, 8, -60, 60), A(60, 50, 8, 8, -60, 60), Cc(8, 30, 3), Cc(12, 20, 4.5)]],
    rocket: [[Z([38, 80], [38, 35], [62, 35], [62, 80])], [P([38, 35], [50, 10], [62, 35])], [Cc(50, 50, 7)], [Z([38, 62], [24, 84], [38, 80]), Z([62, 62], [76, 84], [62, 80])], [P([42, 80], [45, 94], [50, 84], [55, 94], [58, 80]), Z(...starPts(14, 20, 6, 2.5)), Z(...starPts(84, 30, 5, 2))]]
  };
  const stepEls = s => (Array.isArray(s) ? s : s.els);
  function stepsRow(name, y = 200) {
    const steps = STEPS[name], n = steps.length, gap = 12, w = (730 - gap * (n - 1)) / n, h = Math.min(170, w + 20);
    let out = "";
    steps.forEach((st, i) => {
      const x = 60 + i * (w + gap);
      out += `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="${h}" rx="14" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
      const s = (Math.min(w, h) - 22) / 100, dx = x + (w - 100 * s) / 2, dy = y + (h - 100 * s) / 2 + 6;
      if (!st.replace) for (let j = 0; j < i; j++) { if (steps[j].replace) continue; out += pic(stepEls(steps[j]), s, dx, dy, { c: PREV, w: 3 }); }
      out += pic(stepEls(st), s, dx, dy, { w: 4.2 });
      out += badge(x + 4, y + 4, i + 1);
    });
    return { svg: out, bottom: y + h };
  }

  // ---------- a little stroke font (letters 60 wide, 100 tall) ----------
  const L = {
    A: [[[0, 100], [30, 0], [60, 100]], [[12, 62], [48, 62]]],
    B: [[[0, 100], [0, 0]], [[0, 0], [32, 0], ...earc(32, 24, 24, 24, -90, 90), [0, 48]], [[0, 48], [34, 48], ...earc(34, 74, 26, 26, -90, 90), [0, 100]]],
    C: [earc(32, 50, 30, 50, -45, -315)],
    D: [[[0, 0], [0, 100]], [[0, 0], [20, 0], ...earc(20, 50, 40, 50, -90, 90), [0, 100]]],
    E: [[[60, 0], [0, 0], [0, 100], [60, 100]], [[0, 50], [44, 50]]],
    F: [[[60, 0], [0, 0], [0, 100]], [[0, 50], [44, 50]]],
    H: [[[0, 0], [0, 100]], [[60, 0], [60, 100]], [[0, 50], [60, 50]]],
    I: [[[30, 0], [30, 100]], [[10, 0], [50, 0]], [[10, 100], [50, 100]]],
    N: [[[0, 100], [0, 0], [60, 100], [60, 0]]],
    O: [earc(30, 50, 30, 50, -90, 270)],
    U: [[[0, 0], ...earc(30, 70, 30, 30, 180, 0), [60, 0]]],
    W: [[[0, 0], [15, 100], [30, 40], [45, 100], [60, 0]]],
    X: [[[0, 0], [60, 100]], [[60, 0], [0, 100]]],
    1: [[[14, 22], [34, 0], [34, 100]], [[12, 100], [56, 100]]],
    2: [[...earc(30, 28, 28, 28, -170, 30), [0, 100], [60, 100]]],
    3: [earc(28, 26, 27, 25, -160, 90), earc(28, 74, 30, 26, -90, 160)],
    4: [[[46, 100], [46, 0], [0, 68], [60, 68]]],
    5: [[[56, 0], [8, 0], [4, 44], ...earc(28, 68, 30, 32, -125, 150)]]
  };
  const letter = (ch, s, x, y) => (L[ch] || []).map(st => move(st, s, x, y));
  function word(str, s, cx, y, gap = 0.25) {
    const w = 60 * s, g = gap * 100 * s, total = str.length * w + (str.length - 1) * g;
    let x = cx - total / 2; const out = [];
    for (const ch of str) { out.push(...letter(ch, s, x, y)); x += w + g; }
    return out;
  }
  // fat letters: a wide black stroke with a narrower white (or grey) stroke on top = an outline
  function fat(strokes, wide, inner = "#fff", round = false, dx = 0, dy = 0) {
    const o = { cap: round ? "round" : "square", join: round ? "round" : "miter" };
    const sh = strokes.map(st => st.map(p => [p[0] + dx, p[1] + dy]));
    // a closed stroke (O) is drawn closed with flat ends, so no cap pokes out where it starts
    const opt = st => { const a = st[0], b = st[st.length - 1]; return Math.hypot(a[0] - b[0], a[1] - b[1]) < 1 ? Object.assign({}, o, { close: true, cap: "butt" }) : o; };
    return sh.map(st => line(st, Object.assign({ w: wide, c: INK }, opt(st)))).join("") + sh.map(st => line(st, Object.assign({ w: wide - 8, c: inner }, opt(st)))).join("");
  }

  // ---------- page frame ----------
  function frame(rc, body, opts = {}) {
    const code = codeOf(rc), lvl = "●".repeat(rc.level) + "○".repeat(3 - rc.level);
    const keep = seen; seen = null;                    // the header and footer are not part of the drawing area
    const footer = [NAME + " #" + code, rc.title, rc.inspired ? "inspired by " + rc.inspired : ""].filter(Boolean).join(" · ");
    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="8.5in" height="11in">
<rect width="${W}" height="${H}" fill="#fff"/>${opts.defs ? `<defs>${opts.defs}</defs>` : ""}
${text(60, 62, NAME + " #" + code, { size: 22, font: "ui", weight: 700 })}${text(790, 62, "Name ____________", { size: 24, anchor: "end" })}
${text(60, 118, rc.title, { size: 46 })}${text(790, 112, lvl, { size: 22, anchor: "end", font: "ui" })}
${text(60, 156, rc.how, { size: 26, fill: "#333" })}
${body}
${rc.about ? text(425, 1044, rc.about, { size: 15, anchor: "middle", font: "ui", fill: "#333", weight: 600 }) : ""}
${text(425, 1068, footer, { size: footer.length > 80 ? 17 : 19, anchor: "middle", font: "ui", fill: "#333" })}
</svg>`;
    seen = keep;
    return out;
  }
  const codeOf = rc => "LD-" + rc.cat + rc.type;

  // ---------- A. Lines: ink → trace → dots → on your own ----------
  const ROWS = ["ink", "trace", "trace", "dots", "dots", "free"];
  function rowPaths(type, i, y, x0 = 150, x1 = 700) {
    const out = [];
    if (type === 1) out.push([[x0, y], [x1, y]]);
    if (type === 2) for (let x = x0 + 10; x <= x1; x += 46) out.push(i % 2 ? [[x + 16, y - 36], [x - 16, y + 36]] : [[x, y - 36], [x, y + 36]]);
    if (type === 3) { const p = []; for (let x = x0, k = 0; x <= x1 + 0.1; x += 55, k++) p.push([x, y + (k % 2 ? -36 : 36)]); out.push(p); }
    if (type === 4) {
      const p = [];
      if (i % 2 === 0) for (let x = x0; x <= x1; x += 5) p.push([x, y - 32 * Math.sin((x - x0) / 110 * 2 * Math.PI)]);
      else { const a = 110 / (2 * Math.PI), b = 30; for (let t = 0; x0 + a * t - b * Math.sin(t) <= x1; t += 0.12) p.push([x0 + a * t - b * Math.sin(t), y + b - b * Math.cos(t) - 30]); }
      out.push(p);
    }
    if (type === 5) for (const cx of [235, 425, 615]) { const p = []; for (let t = 0; t <= 5 * Math.PI; t += 0.15) p.push([cx + 3.6 * t * Math.cos(t), y + 3.6 * t * Math.sin(t)]); out.push(p); }
    return out;
  }
  const LINE_ICONS = { 1: ["bee", "flower"], 2: ["cloud", "flower"], 3: ["car", "flag"], 4: ["fish", "star"], 5: ["snail", null] };
  function catA(rc) {
    let s = "";
    ROWS.forEach((st, i) => {
      const y = 250 + i * 140, paths = rowPaths(rc.type, i, y), [a, b] = LINE_ICONS[rc.type];
      if (a) s += icon(a, 96, y, 66);
      if (b) s += icon(b, 754, y, 66);
      paths.forEach(p => {
        if (st === "ink") s += ink(p);
        else if (st === "trace") s += trace(p);
        else if (st === "dots") s += dotted(p, 22);
        s += startDot(p[0][0], p[0][1]);
      });
      if (st === "free" && rc.type !== 2 && rc.type !== 5) s += dot(paths[paths.length - 1].slice(-1)[0][0], paths[paths.length - 1].slice(-1)[0][1], 6, INK);
    });
    return frame(rc, s);
  }

  // ---------- B. Shapes ----------
  function shape(kind, cx, cy, R) {
    switch (kind) {
      case "circle": return { pts: circ(cx, cy, R, 64), corners: false };
      case "square": return { pts: move([[-1, -1], [1, -1], [1, 1], [-1, 1]], R * 0.82, cx, cy), corners: true };
      case "rect": return { pts: move([[-1, -0.6], [1, -0.6], [1, 0.6], [-1, 0.6]], R, cx, cy), corners: true };
      case "triangle": return { pts: move([[0, -1], [0.95, 0.75], [-0.95, 0.75]], R, cx, cy), corners: true };
      case "diamond": return { pts: move([[0, -1], [0.7, 0], [0, 1], [-0.7, 0]], R, cx, cy), corners: true };
      case "oval": return { pts: earc(cx, cy, R, R * 0.62, -90, 270, 64), corners: false };
      case "star": return { pts: starPts(cx, cy, R, R * 0.42), corners: true };
      case "heart": return { pts: heartPts(cx, cy, R), corners: false };
    }
  }
  const SHAPES = { 1: ["circle", "circle"], 2: ["square", "rect"], 3: ["triangle", "triangle"], 4: ["diamond", "oval"], 5: ["star", "heart"] };
  function shapeCell(kind, cx, cy, R, st) {
    const sh = shape(kind, cx, cy, R);
    if (st === "ink") return ink(sh.pts, { close: true });
    if (st === "trace") return trace(sh.pts, { close: true }) + startDot(sh.pts[0][0], sh.pts[0][1]);
    if (st === "dots") return (sh.corners ? sh.pts.map(p => dot(p[0], p[1], 5.5)).join("") : sample(sh.pts, 34).map(p => dot(p[0], p[1], 4)).join("")) + startDot(sh.pts[0][0], sh.pts[0][1]);
    return dot(cx, cy, 4);
  }
  function catB(rc) {
    let s = "";
    const rows = [["ink", "trace", "trace", "trace"], ["dots", "dots", "dots", "dots"], ["free", "free", "free", "free"]];
    rows.forEach((row, ri) => row.forEach((st, ci) => {
      const cx = 60 + 91 + ci * 182.5, cy = 285 + ri * 178;
      s += shapeCell(SHAPES[rc.type][ci % 2], cx, cy, 62, st);
    }));
    s += turnBox(60, 760, 730, 240, "Make a picture with your shapes");
    return frame(rc, s);
  }

  // ---------- C. Connect the dots ----------
  const DOTS = {
    1: { pts: starPts(50, 52, 46, 19), extra: [] },
    2: { pts: [[20, 90], [20, 50], [8, 52], [50, 14], [62, 25], [62, 9], [73, 9], [73, 35], [92, 52], [80, 50], [80, 90], [58, 90]], extra: [P([58, 90], [58, 70], [44, 70], [44, 90]), Z([28, 58], [38, 58], [38, 68], [28, 68])] },
    3: { pts: [[8, 50], [15, 38], [28, 28], [45, 24], [60, 28], [72, 38], [80, 46], [93, 30], [88, 50], [93, 70], [80, 54], [72, 62], [60, 72], [45, 76], [28, 72]], extra: [Cc(22, 44, 3), A(52, 50, 10, 12, -70, 70)] },
    4: { pts: [[50, 4], [57, 13], [62, 24], [64, 38], [64, 58], [74, 68], [78, 86], [64, 80], [60, 89], [55, 80], [50, 93], [45, 80], [40, 89], [36, 80], [22, 86], [26, 68], [36, 58], [36, 38], [38, 24], [43, 13]], extra: [Cc(50, 40, 6)] },
    5: { pts: [[8, 66], [40, 66], [48, 6], [84, 66], [94, 66], [80, 88], [20, 88]], labels: "ABCDEFG", extra: [P([48, 12], [48, 64]), P([2, 96], [12, 93], [22, 96], [32, 93], [42, 96], [52, 93], [62, 96], [72, 93], [82, 96], [92, 93], [98, 95])] }
  };
  function catC(rc) {
    const g = DOTS[rc.type], s0 = 6.6, x0 = 425 - 50 * s0, y0 = 215;
    const pts = move(g.pts, s0, x0, y0);
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    let s = pic(g.extra, s0, x0, y0, { w: 4 });
    pts.forEach((p, i) => {
      const dx = p[0] - cx, dy = p[1] - cy, len = Math.hypot(dx, dy) || 1;
      const lab = g.labels ? g.labels[i] : String(i + 1);
      s += dot(p[0], p[1], i === 0 ? 8 : 6, INK) + text(p[0] + dx / len * 24, p[1] + dy / len * 24 + 8, lab, { size: 25, anchor: "middle", font: "ui", weight: i === 0 ? 700 : 600 });
    });
    return frame(rc, s);
  }

  // ---------- D. Mirror: finish the other half ----------
  const MIRROR = {
    1: [P([48, 32], [36, 16], [20, 8], [8, 14], [6, 30], [16, 44], [34, 48], [48, 46]), P([48, 50], [34, 52], [18, 60], [14, 76], [26, 86], [40, 80], [48, 64]), P([50, 24], [46, 30], [45, 50], [46, 72], [50, 78]), P([48, 27], [42, 14], [38, 9], [34, 10]), Cc(24, 26, 5), Cc(28, 70, 4)],
    2: [P([50, 6], [30, 30], [40, 30], [22, 52], [36, 52], [14, 76], [44, 76], [44, 92], [50, 92]), Cc(34, 64, 3), Cc(40, 42, 3)],
    3: [A(50, 50, 34, 38, -90, -270), Cc(36, 44, 5), P([28, 34], [42, 32]), A(14, 52, 6, 9, 90, 270), P([50, 72], [42, 70], [35, 64]), P([50, 12], [44, 4], [40, 13], [32, 6], [30, 16], [22, 10], [22, 22])],
    4: [P([50, 92], [30, 92], [24, 80], [22, 64], [28, 50], [38, 44], [40, 36], [34, 32], [50, 32]), P([44, 32], [40, 18]), Cc(38, 13, 5), P([28, 72], [50, 72]), P([26, 60], [50, 60])],
    5: [P([50, 10], [30, 10], [30, 30], [50, 30]), Z([40, 15], [35, 15], [35, 20], [40, 20]), P([50, 25], [40, 25]), P([45, 30], [45, 35]), P([50, 35], [25, 35], [25, 70], [50, 70]), P([25, 40], [10, 40], [10, 60], [15, 60], [15, 45], [25, 45]), Z([45, 45], [40, 45], [40, 50], [45, 50]), P([40, 70], [40, 90], [30, 90], [30, 85], [35, 85], [35, 70]), P([50, 10], [50, 4])]
  };
  function catD(rc) {
    const s0 = 6.6, x0 = 425 - 50 * s0, y0 = 200, els = MIRROR[rc.type];
    let s = "";
    if (rc.type === 5) for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) s += dot(x0 + i * 5 * s0, y0 + j * 5 * s0, 2.4, GUIDE);
    s += line([[425, y0 - 6], [425, y0 + 100 * s0 + 6]], { w: 2.5, c: TRACE, dash: "4 8" });
    s += pic(els, s0, x0, y0, { w: 4.5 });
    const flip = e => { const { pts } = elPts(e); return pts.map(p => [100 - p[0], p[1]]); };
    if (rc.level === 1) els.forEach(e => { s += dotted(move(flip(e), s0, x0, y0), 26, 3.2); });
    if (rc.level === 2) els.forEach(e => { if (e.t === "p") move(flip(e), s0, x0, y0).forEach(p => { s += dot(p[0], p[1], 4.5); }); });
    return frame(rc, s);
  }

  // ---------- E. Grid copy (and I5, the quilt) ----------
  const GRIDS = {
    1: { n: 3, els: [Z([1.5, 0], [3, 1.5], [1.5, 3], [0, 1.5]), P([1.5, 0], [1.5, 3]), P([0, 1.5], [3, 1.5])] },
    2: { n: 4, els: [Z([0, 4], [0, 2], [2, 0], [4, 2], [4, 4]), P([1.5, 4], [1.5, 2.8], [2.5, 2.8], [2.5, 4])] },
    3: { n: 5, els: [Z([1, 4.5], [0.5, 2.5], [1, 0.5], [2, 1.5], [3, 1.5], [4, 0.5], [4.5, 2.5], [4, 4.5]), P([1.5, 2.5], [2, 2.5]), P([3, 2.5], [3.5, 2.5]), Z([2.5, 3], [2.3, 3.4], [2.7, 3.4]), P([0.2, 3.2], [1.6, 3.5]), P([4.8, 3.2], [3.4, 3.5])] },
    4: { n: 6, els: [Z([0.5, 4.5], [0.5, 3], [1.5, 3], [2.2, 1.8], [4, 1.8], [4.8, 3], [5.5, 3], [5.5, 4.5]), Cc(1.7, 4.6, 0.6), Cc(4.3, 4.6, 0.6), Z([2.4, 3], [2.6, 2.1], [3.9, 2.1], [4.4, 3])] },
    5: { n: 6, els: [Z([0.5, 4], [5.5, 4], [4.5, 5.2], [1.5, 5.2]), P([3, 4], [3, 0.5]), Z([3, 0.7], [5, 3.5], [3, 3.5]), Z([2.8, 1.2], [1.2, 3.5], [2.8, 3.5]), P([0, 5.7], [1, 5.5], [2, 5.7], [3, 5.5], [4, 5.7], [5, 5.5], [6, 5.7])] }
  };
  const ABC = "ABCDEF";
  function grid(x, y, size, n, labels) {
    let s = "";
    const c = size / n;
    for (let i = 0; i <= n; i++) { s += line([[x + i * c, y], [x + i * c, y + size]], { w: i % n ? 1.8 : 3, c: i % n ? GUIDE : INK }); s += line([[x, y + i * c], [x + size, y + i * c]], { w: i % n ? 1.8 : 3, c: i % n ? GUIDE : INK }); }
    if (labels) for (let i = 0; i < n; i++) { s += text(x + (i + 0.5) * c, y - 8, ABC[i], { size: 20, anchor: "middle", font: "ui", weight: 700 }); s += text(x - 12, y + (i + 0.5) * c + 7, String(i + 1), { size: 20, anchor: "middle", font: "ui", weight: 700 }); }
    return s;
  }
  function gridPage(rc, n, drawModel, startPt, defs) {
    const ms = 250, mx = 425 - ms / 2, my = 210, cs = 500, cx = 425 - cs / 2, cy = 500;
    let s = text(mx - 105, my + 30, "Look", { size: 30 }) + grid(mx, my, ms, n, true) + drawModel(mx, my, ms / n);
    s += text(cx - 112, cy + 30, "Copy", { size: 30 }) + grid(cx, cy, cs, n, true);
    if (startPt) s += startDot(cx + startPt[0] * cs / n, cy + startPt[1] * cs / n);
    return frame(rc, s, { defs });
  }
  function catE(rc) {
    const g = GRIDS[rc.type];
    return gridPage(rc, g.n, (x, y, c) => pic(g.els, c, x, y, { w: 4 }), rc.level === 1 ? elPts(g.els[0]).pts[0] : null);
  }

  // ---------- F. Letters ----------
  function letterRows(rc, chars) {
    let s = "";
    chars.split("").forEach((ch, i) => {
      const y = 205 + i * 160, sc = 0.9, top = y + 10, base = top + 90;
      s += line([[60, top], [790, top]], { w: 1.6, c: GUIDE }) + line([[60, top + 45], [790, top + 45]], { w: 1.6, c: GUIDE, dash: "8 8" }) + line([[60, base], [790, base]], { w: 2.4, c: TRACE });
      [80, 195, 300, 405, 510, 615, 720].forEach((x, k) => {
        const strokes = letter(ch, sc, x, top);
        if (k === 0) { s += strokes.map(st => ink(st, { w: 6 })).join(""); strokes.forEach((st, j) => { s += text(st[0][0] - 12, st[0][1] - 4, String(j + 1), { size: 16, font: "ui", weight: 700 }); }); }
        else if (k <= 3) s += strokes.map(st => trace(st)).join("") + startDot(strokes[0][0][0], strokes[0][0][1]);
        else if (k <= 5) s += strokes.map(st => dotted(st, 16, 3)).join("") + startDot(strokes[0][0][0], strokes[0][0][1]);
        else s += startDot(strokes[0][0][0], strokes[0][0][1]);
      });
    });
    return frame(rc, s);
  }
  const WORDS = { 3: "HI", 4: "FUN", 5: "BOX" };
  function catF(rc) {
    if (rc.type === 1) return letterRows(rc, "ABCDE");
    if (rc.type === 2) return letterRows(rc, "12345");
    const wd = WORDS[rc.type], round = rc.type === 4, ch = wd[0], wide = rc.type === 4 ? 34 : 30;
    let s = "";
    const panel = (i, inner) => { const x = 60 + i * 250; s += `<rect x="${x}" y="200" width="230" height="250" rx="14" fill="none" stroke="${INK}" stroke-width="2.5"/>` + badge(x + 4, 204, i + 1); return { x: x + 115 - 51, y: 245 }; };
    const sc = 1.7, cap = round ? "round" : "square";
    // step 1: a skinny letter; step 2: go around it; step 3: color it in (or, for 3-D, push it back and shade the side)
    let p = panel(0); s += letter(ch, sc, p.x, p.y).map(st => ink(st, { w: 5, cap })).join("");
    p = panel(1);
    if (rc.type === 5) s += fat(letter(ch, sc, p.x, p.y), wide, "#fff", false);
    else s += fat(letter(ch, sc, p.x, p.y), wide, "#fff", round) + letter(ch, sc, p.x, p.y).map(st => line(st, { w: 3, c: PREV, cap })).join("");
    p = panel(2);
    if (rc.type === 5) s += fat(letter(ch, sc, p.x + 12, p.y - 12), wide, "#bdbdbd", false) + fat(letter(ch, sc, p.x, p.y), wide, "#fff", false);
    else s += fat(letter(ch, sc, p.x, p.y), wide, "#bdbdbd", round);
    // your turn: the whole word
    s += turnBox(60, 500, 730, 500);
    const strokes = word(wd, 2.7, 425, 610);
    if (rc.type === 5) s += fat(strokes, 64, "#fff", false);
    else s += strokes.map(st => trace(st, { w: 5 })).join("");
    return frame(rc, s);
  }

  // ---------- G. 3-D and H. Shapes into things: steps, then your turn ----------
  const THREE_D = { 1: "cube", 2: "cylinder", 3: "cone", 4: "ball", 5: "road" };
  const THINGS = { 1: "cat", 2: "car", 3: "house", 4: "fish", 5: "rocket" };
  function stepsPage(rc, name) {
    const row = stepsRow(name);
    const top = row.bottom + 40, h = 1000 - top;
    let s = row.svg + turnBox(60, top, 730, h);
    const size = Math.min(h - 60, 520), dx = 425 - size / 2, dy = top + (h - size) / 2 + 10, sc = size / 100;
    if (name === "road") s += pic([...STEPS.road[0], ...STEPS.road[1]], sc, dx, dy, { c: TRACE, w: 3.5 });
    else if (rc.level === 1) s += pic(stepEls(STEPS[name][0]), sc, dx, dy, { c: TRACE, w: 4, dash: "11 9" });
    return frame(rc, s);
  }
  const catG = rc => stepsPage(rc, THREE_D[rc.type]);
  const catH = rc => stepsPage(rc, THINGS[rc.type]);

  // ---------- I. Patterns ----------
  const PATTERN_DEFS = `
    <pattern id="pStripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#fff"/><line x1="0" y1="0" x2="0" y2="16" stroke="#111" stroke-width="5"/></pattern>
    <pattern id="pDots" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#fff"/><circle cx="11" cy="11" r="4" fill="#111"/></pattern>
    <pattern id="pChecks" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#fff"/><rect width="18" height="18" fill="#555"/><rect x="18" y="18" width="18" height="18" fill="#555"/></pattern>
    <pattern id="pZig" width="30" height="22" patternUnits="userSpaceOnUse"><rect width="30" height="22" fill="#fff"/><path d="M0 16 L7.5 6 L15 16 L22.5 6 L30 16" fill="none" stroke="#111" stroke-width="3"/></pattern>
    <pattern id="pWaves" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#fff"/><path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="#111" stroke-width="3"/></pattern>
    <pattern id="pGrid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#fff"/><path d="M0 0 H20 M0 0 V20" stroke="#111" stroke-width="2.5"/></pattern>
    <pattern id="pHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#fff"/><line x1="0" y1="0" x2="0" y2="12" stroke="#111" stroke-width="4"/></pattern>`;
  function motif(k, y) {
    const p = [], x0 = 80, x1 = 770;
    if (k === 0) { const a = 70 / (2 * Math.PI), b = 26; for (let t = 0; x0 + a * t - b * Math.sin(t) <= x1; t += 0.12) p.push([x0 + a * t - b * Math.sin(t), y + b - b * Math.cos(t) - 26]); }
    if (k === 1) for (let x = x0, i = 0; x <= x1; x += 40, i++) { const yy = y + (i % 2 ? -28 : 28); p.push([x, p.length ? p[p.length - 1][1] : yy], [x, yy]); }
    if (k === 2) for (let x = x0; x <= x1; x += 5) p.push([x, y - 28 * Math.sin((x - x0) / 90 * 2 * Math.PI)]);
    if (k === 3) for (let x = x0, i = 0; x <= x1 + 0.1; x += 34.5, i++) p.push([x, y + (i % 2 ? -28 : 28)]);
    if (k === 4) for (let x = x0; x <= x1; x += 4) p.push([x, y + 28 - 56 * Math.abs(Math.sin((x - x0) / 60 * Math.PI))]);
    return p;
  }
  function catI(rc) {
    let s = "", defs = PATTERN_DEFS;
    if (rc.type === 1) {
      for (let i = 0; i < 5; i++) {
        const y = 265 + i * 150, p = motif(i, y), cut = p.findIndex(q => q[0] > 270);
        s += ink(p.slice(0, cut + 1));
        if (i < 3) s += trace(p.slice(cut));
        else if (i === 3) s += dotted(p.slice(cut), 22);
      }
    }
    if (rc.type === 2) {
      const cx = 425, cy = 545, R = 300, fills = ["pStripes", "pDots", "pChecks", "pZig", "pWaves", "pGrid"];
      for (let k = 0; k < 6; k++) {
        const a0 = -90 + k * 60, pts = [[cx, cy], ...earc(cx, cy, R, R, a0, a0 + 60, 20)];
        s += line(pts, { close: true, w: 4, fill: k === 0 ? "url(#pStripes)" : "#fff" });
        const am = deg(a0 + 30); s += text(cx + R * 0.62 * Math.cos(am), cy + R * 0.62 * Math.sin(am) + 12, String(k + 1), { size: 38, anchor: "middle", font: "ui", weight: 700 });
      }
      fills.forEach((id, k) => { const x = 75 + k * 120; s += `<rect x="${x}" y="895" width="80" height="80" rx="10" fill="url(#${id})" stroke="${INK}" stroke-width="3"/>` + text(x + 40, 885, String(k + 1), { size: 24, anchor: "middle", font: "ui", weight: 700 }); note(x, 895); note(x + 80, 975); });
    }
    if (rc.type === 3) {
      const rows = [["circle", "square"], ["triangle", "triangle", "circle"], ["star", "heart", "diamond"], ["grow"], ["oval", "square", "square", "oval"]];
      rows.forEach((pat, i) => {
        const y = 270 + i * 160;
        for (let k = 0; k < 7; k++) {
          const x = 110 + k * 105;
          if (k >= 5) { s += `<rect x="${x - 45}" y="${y - 45}" width="90" height="90" rx="10" fill="none" stroke="${TRACE}" stroke-width="3" stroke-dasharray="9 7"/>`; note(x - 45, y - 45); continue; }
          if (pat[0] === "grow") s += ink(circ(x, y, 10 + k * 8), { close: true });
          else s += ink(shape(pat[k % pat.length], x, y, 38).pts, { close: true });
        }
      });
    }
    if (rc.type === 4) {
      const area = (y0, h, id, draw, label) => {
        s += `<clipPath id="${id}"><rect x="60" y="${y0}" width="730" height="${h}"/></clipPath><g clip-path="url(#${id})">${draw}</g>` + rect(60, y0, 730, h, { w: 4 }) + text(70, y0 - 10, label, { size: 26 });
      };
      let bricks = "";
      for (let r = 0; r < 8; r++) { const y = 220 + r * 45; bricks += line([[60, y], [290 - r * 20, y]], { w: 4 }); for (let x = 60 + (r % 2 ? 45 : 0); x < 290 - r * 20; x += 90) bricks += line([[x, y], [x, y + 45]], { w: 4 }); }
      area(220, 360, "cb", bricks, "");
      let scales = "";
      for (let r = 0; r < 7; r++) for (let x = 60 + (r % 2 ? 30 : 0); x < 320 - r * 25; x += 60) scales += line(earc(x + 30, 640 + r * 50, 30, 30, 0, 180, 18), { w: 4 });
      area(640, 360, "cs", scales, "");
      s += text(300, 212, "Bricks", { size: 28 }) + text(340, 632, "Fish scales", { size: 28 });
      seen && seen.push([60, 220], [790, 1000]);
    }
    if (rc.type === 5) {
      const cells = [[2, 0], [3, 0], [1, 1], [4, 1], [0, 2], [5, 2], [0, 3], [5, 3], [1, 4], [4, 4], [2, 5], [3, 5], [2, 2], [3, 3], [2, 3], [3, 2]];
      return gridPage(rc, 6, (x, y, c) => cells.map(([i, j]) => `<rect x="${f(x + i * c)}" y="${f(y + j * c)}" width="${f(c)}" height="${f(c)}" fill="url(#pHatch)" stroke="${INK}" stroke-width="2"/>`).join(""), null, defs);
    }
    return frame(rc, s, { defs });
  }

  // ---------- J. Finish the picture ----------
  const SQUIGGLES = [
    [[-60, 20], [-30, -30], [0, 10], [30, -40], [60, 0]], earc(0, 0, 50, 30, 200, 520), [[-50, 40], [-50, -30], [50, -30], [30, 40]],
    [[-60, 0], [-20, 0], [-20, -40], [20, -40], [20, 0], [60, 0]], earc(-10, 10, 40, 40, 180, 360).concat([[50, 30]]), [[-40, -40], [40, 40], [40, -40], [-40, 40]]
  ];
  function catJ(rc) {
    let s = "";
    if (rc.type === 1) SQUIGGLES.forEach((q, i) => { const x = 60 + (i % 2) * 375, y = 200 + Math.floor(i / 2) * 272; s += rect(x, y, 355, 252, { w: 3 }) + ink(move(q, 1.7, x + 177, y + 126), { w: 6 }); });
    if (rc.type === 2) for (let i = 0; i < 9; i++) {
      const cx = 170 + (i % 3) * 255, cy = 318 + Math.floor(i / 3) * 255;
      s += ink(circ(cx, cy, 75), { close: true });
      if (i === 0) s += [0, 45, 90, 135, 180, 225, 270, 315].map(a => ink([[cx + 88 * Math.cos(deg(a)), cy + 88 * Math.sin(deg(a))], [cx + 112 * Math.cos(deg(a)), cy + 112 * Math.sin(deg(a))]], { w: 4 })).join("") + dot(cx - 25, cy - 12, 6, INK) + dot(cx + 25, cy - 12, 6, INK) + ink(earc(cx, cy + 5, 32, 26, 20, 160), { w: 4 });
    }
    if (rc.type === 3) {
      const heads = [c => circ(c[0], c[1], 95), c => earc(c[0], c[1], 75, 105, -90, 270), c => move([[-1, -1], [1, -1], [1, 1], [-1, 1]], 88, c[0], c[1]), c => move([[0, -1.1], [1.05, 0.9], [-1.05, 0.9]], 100, c[0], c[1]), c => earc(c[0], c[1], 110, 80, -90, 270), c => heartPts(c[0], c[1], 100)];
      heads.forEach((h, i) => {
        const c = [240 + (i % 2) * 370, 315 + Math.floor(i / 2) * 265];
        s += ink(h(c), { close: true });
        if (i === 0) s += dot(c[0] - 32, c[1] - 18, 8, INK) + dot(c[0] + 32, c[1] - 18, 8, INK) + ink(earc(c[0], c[1] + 10, 45, 35, 20, 160), { w: 5 }) + ink([[c[0], c[1] - 5], [c[0] - 8, c[1] + 18], [c[0] + 4, c[1] + 18]], { w: 4 });
      });
    }
    if (rc.type === 4) {
      s += ink([[255, 330], [235, 360], [210, 420], [200, 520], [200, 900], [225, 950], [625, 950], [650, 900], [650, 520], [640, 420], [615, 360], [595, 330]], { w: 7 });
      s += rect(240, 260, 370, 70, { w: 7 }) + line([[300, 275], [300, 315]], { w: 4 }) + line([[550, 275], [550, 315]], { w: 4 });
      s += text(425, 1000, "What's inside? ____________________", { size: 30, anchor: "middle" });
    }
    if (rc.type === 5) {
      s += line([[60, 860], [790, 860]], { w: 5 }) + line([[60, 960], [790, 960]], { w: 5 });
      for (let x = 80; x < 790; x += 110) s += line([[x, 910], [x + 55, 910]], { w: 5 });
      s += ink(circ(290, 812, 46), { close: true }) + ink(circ(290, 812, 14), { close: true }) + ink(circ(570, 812, 46), { close: true }) + ink(circ(570, 812, 14), { close: true });
      s += icon("sun", 720, 250, 110) + icon("cloud", 140, 250, 130) + icon("cloud", 470, 230, 90);
      s += trace([[230, 760], [640, 760]], { w: 3 });
    }
    return frame(rc, s);
  }

  const CATS = { A: catA, B: catB, C: catC, D: catD, E: catE, F: catF, G: catG, H: catH, I: catI, J: catJ };
  const CATEGORIES = {
    A: { name: "Lines", icon: "〰️", about: "Straight, zigzag, wavy, loops and spirals: the hand learns to steer." },
    B: { name: "Shapes", icon: "🔺", about: "Circles, squares, triangles and friends, from tracing to on your own." },
    C: { name: "Connect the dots", icon: "🔢", about: "Follow the numbers (or letters) and a picture appears." },
    D: { name: "Mirror", icon: "🦋", about: "Half is drawn. Finish the other half to match." },
    E: { name: "Grid copy", icon: "🔲", about: "Copy a picture one square at a time." },
    F: { name: "Letters", icon: "🔤", about: "Letters and numbers, then fat, bubble and 3-D letters." },
    G: { name: "3-D", icon: "🧊", about: "Cubes, cylinders, cones, a shaded ball and a road that goes far away." },
    H: { name: "Shapes into things", icon: "🐱", about: "Simple shapes, one step at a time, become a cat, a car, a house." },
    I: { name: "Patterns", icon: "🧶", about: "Borders, fills, what comes next, bricks and a quilt." },
    J: { name: "Finish the picture", icon: "🎨", about: "Squiggles, circles and faces to turn into anything." }
  };

  function svg(rc) { const fn = CATS[rc.cat]; if (!fn) throw new Error("No template for category " + rc.cat); return fn(rc); }
  // For the checker: the page plus every point drawn (header, title and footer text are checked separately).
  function measured(rc) { seen = []; try { const out = svg(rc); const pts = seen; return { svg: out, pts }; } finally { seen = null; } }

  root.LTD = { W, H, BOX, NAME, svg, measured, codeOf, CATEGORIES, STEPS, LETTERS: L };
})(typeof window !== "undefined" ? window : globalThis);
