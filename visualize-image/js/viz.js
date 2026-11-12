// Visualize Image: draws every frame of a scene from its recipe (data/scenes/<id>.js).
window.VI = window.VI || { scenes: {} };

VI.STEPS = {
  "1": { name: "Crop and frame", rule: "Find the contrast, put it near a third, find the horizon, then crop." },
  "2": { name: "Mass", rule: "Planes first, then only the biggest shapes, back to front. Squint: it should still read." },
  "3": { name: "Construct", rule: "Place smaller shapes against the anchors, then the ones that overlap. Rank everything." },
  "4": { name: "Bold", rule: "Thick lines for what the picture is about, thin for the rest, nothing for what you leave back." },
  "5": { name: "Value and color", rule: "Light to dark first in five grays, then a small palette on the same blocks." },
  "6": { name: "Filters", rule: "See the same scene as only dots, facets or lines." }
};

VI.FRAMES = [
  { id: "1", step: "1", title: "Crop and frame", kind: "crop" },
  { id: "2a", step: "2", title: "Planes and horizon", kind: "planes" },
  { id: "2b", step: "2", title: "The big masses", kind: "masses" },
  { id: "2c", step: "2", title: "Pick three anchors", kind: "anchors" },
  { id: "3a", step: "3", title: "Secondary figures", kind: "secondary" },
  { id: "3b", step: "3", title: "Overlapping figures", kind: "overlap" },
  { id: "3c", step: "3", title: "Rank the priorities", kind: "priority" },
  { id: "4", step: "4", title: "Trace and bold", kind: "bold" },
  { id: "5a", step: "5", title: "Value blocks", kind: "value" },
  { id: "5b", step: "5", title: "A small palette", kind: "color" },
  { id: "6a", step: "6", title: "Round dots", kind: "dots" },
  { id: "6b", step: "6", title: "Octagon dots", kind: "octagons" },
  { id: "6c", step: "6", title: "Facets", kind: "facets" },
  { id: "6d", step: "6", title: "Lines only", kind: "lines" }
];

VI.GRAYS = ["#1c1c1c", "#555555", "#8c8c8c", "#c4c4c4", "#f4f4f4"];
const INK = "#1b1b1b", PAPER = "#fffdf7";

// ---- geometry helpers
function pts(l) {
  if (l.type === "rect") { const [x, y, w, h] = l.g; return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  if (l.type === "poly") return l.g;
  if (l.type === "oval") { const [cx, cy, rx, ry] = l.g; return [[cx - rx, cy - ry], [cx + rx, cy + ry]]; }
  const [cx, cy, r] = l.g; return [[cx - r, cy - r], [cx + r, cy + r]];
}
function centroid(l) {
  if (l.type === "oval") return [l.g[0], l.g[1]];
  if (l.type === "circle") return [l.g[0], l.g[1]];
  const p = pts(l); return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
}
function shape(l, a) {
  const at = Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ");
  if (l.type === "rect") return `<rect x="${l.g[0]}" y="${l.g[1]}" width="${l.g[2]}" height="${l.g[3]}" ${at}/>`;
  if (l.type === "poly") return `<polygon points="${l.g.map(p => p.join(",")).join(" ")}" ${at}/>`;
  if (l.type === "oval") return `<ellipse cx="${l.g[0]}" cy="${l.g[1]}" rx="${l.g[2]}" ry="${l.g[3]}" ${at}/>`;
  return `<circle cx="${l.g[0]}" cy="${l.g[1]}" r="${l.g[2]}" ${at}/>`;
}
function path2d(ctx, l) {
  ctx.beginPath();
  if (l.type === "rect") ctx.rect(...l.g);
  else if (l.type === "poly") l.g.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  else if (l.type === "oval") ctx.ellipse(l.g[0], l.g[1], l.g[2], l.g[3], 0, 0, 7);
  else ctx.arc(l.g[0], l.g[1], l.g[2], 0, 7);
  ctx.closePath();
}
const S = (sc) => sc.layers.filter(l => l.priority < 5);   // layers kept after step 4

// ---- sampling for filters: draw the kept layers small, read colors and values back
VI.sample = function (sc) {
  const k = 0.1, c = sc.crop, W = Math.round(c.w * k), H = Math.round(c.h * k);
  const make = (fill) => {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.setTransform(k, 0, 0, k, -c.x * k, -c.y * k); ctx.fillStyle = PAPER; ctx.fillRect(c.x, c.y, c.w, c.h);
    S(sc).forEach(l => { ctx.fillStyle = fill(l); path2d(ctx, l); ctx.fill(); });
    return ctx.getImageData(0, 0, W, H).data;
  };
  const col = make(l => l.color), val = make(l => VI.GRAYS[l.value]);
  const px = (d, x, y) => { x = Math.min(W - 1, Math.max(0, Math.floor((x - c.x) * k))); y = Math.min(H - 1, Math.max(0, Math.floor((y - c.y) * k))); const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  return {
    color: (x, y) => { const p = px(col, x, y); return `rgb(${p})`; },
    light: (x, y) => { const p = px(val, x, y); return (0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]) / 255; }
  };
};

// ---- frames
VI.frameSVG = function (sc, f, showPhoto) {
  const c = sc.crop, full = f.kind === "crop";
  const vb = full ? `0 0 ${sc.size[0]} ${sc.size[1]}` : `${c.x} ${c.y} ${c.w} ${c.h}`;
  const sw = full ? 4 : 3, out = [];
  const add = (s) => out.push(s);
  const horizon = () => sc.horizon.y < c.y ? add(`<text x="${c.x + 24}" y="${c.y + 60}" font-size="44" fill="#c0392b" font-family="sans-serif">↑ horizon is above the picture</text>`) : add(`<line x1="${c.x}" y1="${sc.horizon.y}" x2="${c.x + c.w}" y2="${sc.horizon.y}" stroke="#c0392b" stroke-width="5" stroke-dasharray="26 16"/><text x="${c.x + c.w - 14}" y="${sc.horizon.y - 14}" text-anchor="end" font-size="40" fill="#c0392b" font-family="sans-serif">horizon</text>`);
  const grey = (l, st) => shape(l, { fill: "none", stroke: st || "#b9b9b9", "stroke-width": sw });
  add(`<rect x="${full ? 0 : c.x}" y="${full ? 0 : c.y}" width="${full ? sc.size[0] : c.w}" height="${full ? sc.size[1] : c.h}" fill="${PAPER}"/>`);

  switch (f.kind) {
    case "crop": {
      if (showPhoto) add(`<image href="${sc.source}" x="0" y="0" width="${sc.size[0]}" height="${sc.size[1]}"/>`);
      else sc.layers.forEach(l => add(shape(l, { fill: l.color, opacity: .85 })));
      add(`<path fill-rule="evenodd" fill="#000" fill-opacity=".55" d="M0 0H${sc.size[0]}V${sc.size[1]}H0Z M${c.x} ${c.y}h${c.w}v${c.h}h${-c.w}Z"/>`);
      add(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="none" stroke="#fff" stroke-width="8"/>`);
      for (let i = 1; i < 3; i++) add(`<line x1="${c.x + c.w * i / 3}" y1="${c.y}" x2="${c.x + c.w * i / 3}" y2="${c.y + c.h}" stroke="#fff" stroke-opacity=".8" stroke-width="3"/><line x1="${c.x}" y1="${c.y + c.h * i / 3}" x2="${c.x + c.w}" y2="${c.y + c.h * i / 3}" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>`);
      sc.receding.forEach(r => add(`<line x1="${r[0][0]}" y1="${r[0][1]}" x2="${sc.vp[0]}" y2="${sc.vp[1]}" stroke="#ffe14d" stroke-width="5"/>`));
      horizon();
      add(`<circle cx="${sc.vp[0]}" cy="${sc.vp[1]}" r="16" fill="#ffe14d" stroke="#000" stroke-width="3"/>`);
      add(`<circle cx="${sc.contrast.x}" cy="${sc.contrast.y}" r="64" fill="none" stroke="#3aa7ff" stroke-width="8"/>`);
      break;
    }
    case "planes":
      sc.layers.filter(l => l.group === "plane").forEach(l => add(shape(l, { fill: "#efefef", stroke: INK, "stroke-width": sw, "stroke-dasharray": "14 10" })));
      horizon(); break;
    case "masses": case "anchors": {
      const st2 = sc.layers.filter(l => l.step === 2);
      st2.forEach(l => {
        const a = f.kind === "anchors" && l.anchor;
        add(shape(l, { fill: a ? "#fff" : "#f4f4f4", stroke: a ? INK : "#777", "stroke-width": a ? 9 : sw }));
      });
      if (f.kind === "anchors") st2.filter(l => l.anchor).forEach(l => { const [x, y] = centroid(l); add(`<circle cx="${x}" cy="${y}" r="46" fill="${INK}"/><text x="${x}" y="${y + 20}" text-anchor="middle" font-size="58" fill="#fff" font-family="sans-serif" font-weight="700">${l.anchor}</text>`); });
      horizon(); break;
    }
    case "secondary": case "overlap": case "priority": {
      sc.layers.filter(l => l.step === 2).forEach(l => add(shape(l, { fill: PAPER, stroke: "#c8c8c8", "stroke-width": sw })));
      const grp = f.kind === "secondary" ? ["secondary"] : ["secondary", "overlap"];
      sc.layers.filter(l => l.step === 3).forEach(l => {
        if (f.kind === "priority") add(shape(l, { fill: PAPER, stroke: "#c8c8c8", "stroke-width": sw }));
        else if (grp.includes(l.group)) add(shape(l, { fill: l.group === "overlap" ? PAPER : "none", stroke: l.group === "overlap" && f.kind === "overlap" ? "#c0392b" : INK, "stroke-width": sw }));
      });
      if (f.kind === "priority") sc.layers.forEach(l => {
        if (["wall", "floor", "dark", "yellow", "k1", "k2", "k3", "doorL", "doorR", "lip", "panh", "burnR", "oven", "drawer", "tileR"].includes(l.id)) return;
        const [x, y] = centroid(l), r = 40 - l.priority * 3;
        add(`<circle cx="${x}" cy="${y}" r="${r}" fill="${l.priority <= 2 ? INK : "#fff"}" stroke="${INK}" stroke-width="5"/><text x="${x}" y="${y + r * .36}" text-anchor="middle" font-size="${r * 1.05}" fill="${l.priority <= 2 ? "#fff" : INK}" font-family="sans-serif" font-weight="700">${l.priority}</text>`);
      });
      break;
    }
    case "bold": {
      const w = { 1: 14, 2: 9, 3: 5, 4: 2.5 };
      S(sc).filter(l => l.group !== "plane").forEach(l => add(shape(l, { fill: PAPER, stroke: INK, "stroke-width": w[l.priority], "stroke-linejoin": "round" })));
      break;
    }
    case "value": S(sc).forEach(l => add(shape(l, { fill: VI.GRAYS[l.value] }))); break;
    case "color": S(sc).forEach(l => add(shape(l, { fill: l.color, stroke: l.priority <= 2 ? INK : "none", "stroke-width": 5 }))); break;
    default: add(VI.filterSVG(sc, f.kind)); break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${f.title}">${out.join("")}</svg>`;
};

VI.filterSVG = function (sc, kind) {
  const c = sc.crop, s = VI.sample(sc), o = [];
  const cell = kind === "facets" ? 44 : kind === "lines" ? 22 : 30;
  if (kind === "facets") {
    for (let y = c.y; y < c.y + c.h; y += cell) for (let x = c.x; x < c.x + c.w; x += cell) {
      const A = [x, y], B = [x + cell, y], C = [x + cell, y + cell], D = [x, y + cell];
      [[A, B, C], [A, C, D]].forEach(t => {
        const col = s.color((t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3);
        o.push(`<polygon points="${t.map(p => p.join(",")).join(" ")}" fill="${col}" stroke="${col}" stroke-width="1.5"/>`);
      });
    }
    return o.join("");
  }
  o.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${PAPER}"/>`);
  for (let y = c.y + cell / 2; y < c.y + c.h; y += cell) for (let x = c.x + cell / 2; x < c.x + c.w; x += cell) {
    const d = 1 - s.light(x, y);
    if (kind === "dots") { const r = d * cell * .62; if (r > 1.5) o.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${INK}"/>`); }
    else if (kind === "octagons") {
      const r = d * cell * .66; if (r < 1.8) continue;
      const p = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return [(x + r * Math.cos(a)).toFixed(1), (y + r * Math.sin(a)).toFixed(1)].join(","); });
      o.push(`<polygon points="${p.join(" ")}" fill="${INK}"/>`);
    } else { const h = d * (cell - 2); if (h > 1.2) o.push(`<rect x="${x - cell / 2 - .5}" y="${(y - h / 2).toFixed(1)}" width="${cell + 1}" height="${h.toFixed(1)}" fill="${INK}"/>`); }
  }
  return o.join("");
};

// shared with the worksheet engine (js/ws.js)
VI.util = { shape, centroid, pts, S, INK, PAPER };
