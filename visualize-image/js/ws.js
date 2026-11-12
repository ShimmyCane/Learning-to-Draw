/* Visualize Image V2: the worksheet engine. One scene -> seven Letter portrait sheets (850 x 1100 units), black and white,
   in the Learning to Draw look: header, title, one line, a finished "Look" example, "Your turn" box, help that fades
   by level (1 ghost at 20%, 2 a few thin dashed lines on the largest shapes, 3 corner dots and a horizon dot), footer with "inspired by". Ink is black, lines to trace are grey dashes. */
(function () {
  "use strict";
  const W = 850, H = 1100, INK = "#111", TRACE = "#8c8c8c", GUIDE = "#c9c9c9";
  const NAME = "Visualize Image";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const fam = f => f === "hand" ? "'Patrick Hand', 'Comic Sans MS', cursive" : "Quicksand, Arial, sans-serif";
  const text = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || "start"}" font-family="${fam(o.font || "hand")}" font-size="${o.size || 28}" font-weight="${o.weight || 400}" fill="${o.fill || INK}">${esc(s)}</text>`;
  function wrap(s, n) { const out = []; let cur = ""; s.split(" ").forEach(w => { if ((cur + " " + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }); if (cur) out.push(cur); return out; }

  const STEPS = [
    { n: 1, f: "1", title: "Crop and frame", how: "Find the best part of the picture. Put what you love on a third.",
      by: "the rule of thirds (J. T. Smith, 1797)", about: "John Thomas Smith named the rule of thirds in 1797 while writing about landscape pictures." },
    { n: 2, f: "2c", title: "Big shapes first", how: "Draw the horizon, then only the biggest shapes. Squint to check.",
      by: "the studio block-in method", about: "Studio teachers have long said: draw the big shapes first and the details last." },
    { n: 3, f: "3b", title: "Add what sits on them", how: "Smaller shapes go on the big ones. Front shapes hide the ones behind.",
      by: "Paul Cézanne, cylinder, sphere and cone", about: "Paul Cézanne wrote that nature can be seen as cylinders, spheres and cones." },
    { n: 4, f: "4", title: "Make the lines bold", how: "Press hard on what matters. Go light on the rest. Leave some out.",
      by: "lost and found edges", about: "Painters keep some edges sharp and let others fade to guide the eye." },
    { n: 5, f: "5a", title: "Light to dark", how: "Squint. Fill each shape with light, middle or dark. Keep the lightest light.",
      by: "notan, a Japanese study of light and dark", about: "Notan is a Japanese idea of balancing light and dark shapes on a page." },
    { n: 6, f: "5b", title: "Pick a few colors", how: "Choose a small set of colors and give each shape one.",
      by: "Anders Zorn's four-color palette", about: "Anders Zorn painted portraits with only four colors: white, black, ochre and red." },
    { n: 7, f: "6a", title: "See it as dots", how: "Draw it with dots: big where it is dark, tiny where it is light.",
      by: "Ben-Day dots and Roy Lichtenstein", about: "Roy Lichtenstein copied the big printing dots of comic books in his 1960s paintings." }
  ];
  const COLORS = [["cream", "#ece6d2"], ["walnut", "#5a331e"], ["slate", "#8d93a1"], ["mustard", "#d6a64a"], ["yellow", "#d9a21f"], ["green", "#6fb04a"], ["white", "#eceeef"], ["black", "#1b1b1b"], ["gray", "#a8a29a"], ["brick", "#a5421f"]];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function colorName(h) { const c = hex(h); let best = COLORS[0][0], bd = 1e9; COLORS.forEach(([n, x]) => { const d = hex(x).reduce((s, v, i) => s + (v - c[i]) ** 2, 0); if (d < bd) { bd = d; best = n; } }); return best; }

  // a nested drawing area that shows the scene's crop inside a box (contain)
  function view(sc, box, inner) {
    const c = sc.crop, s = Math.min(box.w / c.w, box.h / c.h), w = c.w * s, h = c.h * s;
    return { k: s, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h,
      svg: `<svg x="${box.x + (box.w - w) / 2}" y="${box.y + (box.h - h) / 2}" width="${w}" height="${h}" viewBox="${c.x} ${c.y} ${c.w} ${c.h}" overflow="hidden">${inner}</svg>` };
  }
  const U = () => VI.util;
  // stroke widths are given in sheet units and scaled back into crop units
  const sw = (k, px) => (px / k).toFixed(2);
  const dash = (k, a, b) => `${(a / k).toFixed(1)} ${(b / k).toFixed(1)}`;
  const kept = sc => U().S(sc);
  const pad = (s, n) => String(s).padStart(n);

  function shapes(sc, k, list, o) {
    const u = U();
    return list.map(l => u.shape(l, { fill: o.fill ? (typeof o.fill === "function" ? o.fill(l) : o.fill) : "none", stroke: typeof o.stroke === "function" ? o.stroke(l) : o.stroke, "stroke-width": sw(k, typeof o.w === "function" ? o.w(l) : o.w), "stroke-linejoin": "round", ...(o.dash ? { "stroke-dasharray": dash(k, o.dash[0], o.dash[1]) } : {}) })).join("");
  }
  function thirds(c, k, col, w, dsh) {
    let s = "";
    for (let i = 1; i < 3; i++) s += `<line x1="${c.x + c.w * i / 3}" y1="${c.y}" x2="${c.x + c.w * i / 3}" y2="${c.y + c.h}" stroke="${col}" stroke-width="${sw(k, w)}" ${dsh ? `stroke-dasharray="${dash(k, 10, 9)}"` : ""}/><line x1="${c.x}" y1="${c.y + c.h * i / 3}" x2="${c.x + c.w}" y2="${c.y + c.h * i / 3}" stroke="${col}" stroke-width="${sw(k, w)}" ${dsh ? `stroke-dasharray="${dash(k, 10, 9)}"` : ""}/>`;
    return s;
  }
  function ticks(c, k) {   // little marks on the edges at each third: the least help
    let s = "";
    for (let i = 1; i < 3; i++) { const x = c.x + c.w * i / 3, y = c.y + c.h * i / 3, t = 26 / k;
      s += `<path d="M${x} ${c.y} v${t} M${x} ${c.y + c.h} v${-t} M${c.x} ${y} h${t} M${c.x + c.w} ${y} h${-t}" stroke="${INK}" stroke-width="${sw(k, 4)}"/>`; }
    return s;
  }
  const dots = (pts, k, r, col) => pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${(r / k).toFixed(1)}" fill="${col || TRACE}"/>`).join("");
  const badge = (x, y, n, k, filled) => { const r = 16 / k; return `<circle cx="${x}" cy="${y}" r="${r}" fill="${filled ? INK : "#fff"}" stroke="${INK}" stroke-width="${sw(k, 2.5)}"/><text x="${x}" y="${y + r * .38}" text-anchor="middle" font-family="${fam("ui")}" font-weight="700" font-size="${r * 1.15}" fill="${filled ? "#fff" : INK}">${n}</text>`; };
  const horizonLine = (sc, k, col, dsh) => sc.horizon.y >= sc.crop.y ? `<line x1="${sc.crop.x}" y1="${sc.horizon.y}" x2="${sc.crop.x + sc.crop.w}" y2="${sc.horizon.y}" stroke="${col}" stroke-width="${sw(k, 3.5)}" stroke-dasharray="${dash(k, dsh[0], dsh[1])}"/>` : "";
  const gray = l => VI.GRAYS[l.value];

  // ---------- what each sheet shows ----------
  function example(sc, st, area) {
    const c = sc.crop, v = view(sc, area, ""), k = v.k, u = U(), L = sc.layers, s2 = L.filter(l => l.step === 2), mid = L.filter(l => l.priority < 5);
    let g = "";
    switch (st.n) {
      case 1: g = L.map(l => u.shape(l, { fill: gray(l), opacity: .8 })).join("") + `<path fill-rule="evenodd" fill="#fff" fill-opacity=".8" d="M0 0H${sc.size[0]}V${sc.size[1]}H0Z M${c.x} ${c.y}h${c.w}v${c.h}h${-c.w}Z"/>` + thirds(c, k, "#fff", 2, false) + `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="none" stroke="${INK}" stroke-width="${sw(k, 5)}"/>` + horizonLine(sc, k, INK, [14, 8]) + `<circle cx="${sc.contrast.x}" cy="${sc.contrast.y}" r="${(22 / k).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="${sw(k, 4)}"/>`; 
        { const full = view(sc, area, ""), kk = Math.min(area.w / sc.size[0], area.h / sc.size[1]); const w = sc.size[0] * kk, h = sc.size[1] * kk;
          return `<svg x="${area.x + (area.w - w) / 2}" y="${area.y + (area.h - h) / 2}" width="${w}" height="${h}" viewBox="0 0 ${sc.size[0]} ${sc.size[1]}" overflow="hidden">${L.map(l => u.shape(l, { fill: gray(l), opacity: .8 })).join("")}<path fill-rule="evenodd" fill="#fff" fill-opacity=".75" d="M0 0H${sc.size[0]}V${sc.size[1]}H0Z M${c.x} ${c.y}h${c.w}v${c.h}h${-c.w}Z"/>${thirds(c, kk, "#fff", 2, false)}<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="none" stroke="${INK}" stroke-width="${sw(kk, 5)}"/>${sc.horizon.y >= 0 ? `<line x1="0" y1="${sc.horizon.y}" x2="${sc.size[0]}" y2="${sc.horizon.y}" stroke="${INK}" stroke-width="${sw(kk, 3)}" stroke-dasharray="${dash(kk, 12, 8)}"/>` : ""}<circle cx="${sc.contrast.x}" cy="${sc.contrast.y}" r="${(20 / kk).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="${sw(kk, 4)}"/></svg>`; }
      case 2: g = shapes(sc, k, s2, { stroke: l => l.anchor ? INK : TRACE, w: l => l.anchor ? 6 : 2.5, fill: "#fff" }) + horizonLine(sc, k, INK, [14, 8]) + s2.filter(l => l.anchor).map(l => { const p = u.centroid(l); return badge(p[0], p[1], l.anchor, k, true); }).join(""); break;
      case 3: g = shapes(sc, k, L.filter(l => l.step === 2), { stroke: GUIDE, w: 2.5, fill: "#fff" }) + shapes(sc, k, L.filter(l => l.step === 3), { stroke: INK, w: 3, fill: l => l.group === "overlap" ? "#fff" : "none" }); break;
      case 4: { const w = { 1: 9, 2: 6, 3: 3.5, 4: 1.6 }; g = shapes(sc, k, mid.filter(l => l.group !== "plane"), { stroke: INK, w: l => w[l.priority], fill: "#fff" }); break; }
      case 5: g = shapes(sc, k, mid, { stroke: "none", w: 0, fill: gray }); break;
      case 6: { const big5 = mid.filter(l => l.group === "mass").sort((a, b) => area2(b) - area2(a)).slice(0, 5); g = shapes(sc, k, mid, { stroke: l => l.priority <= 2 ? INK : "none", w: 3, fill: gray }) + mid.filter(l => (sc.labelIds ? sc.labelIds.indexOf(l.id) >= 0 : big5.indexOf(l) >= 0)).map(l => { const p = u.centroid(l); return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" font-family="${fam("hand")}" font-size="${(24 / k).toFixed(0)}" fill="${l.value > 2 ? INK : "#fff"}" stroke="${l.value > 2 ? "#fff" : INK}" stroke-width="${(1.2 / k).toFixed(1)}" paint-order="stroke">${esc(colorName(l.color))}</text>`; }).join(""); break; }
      case 7: g = VI.filterSVG(sc, "dots"); break;
    }
    return view(sc, area, g).svg;
  }

  // ---------- help, in rising abstraction: 1 ghost (20%), 2 a few thin dashes, 3 corner dots + horizon dot ----------
  const area2 = l => { const g = l.g; if (l.type === "rect") return g[2] * g[3]; if (l.type === "poly") { const xs = g.map(p => p[0]), ys = g.map(p => p[1]); return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); } return l.type === "oval" ? 4 * g[2] * g[3] : 4 * g[2] * g[2]; };
  function focus(sc, n) {   // the few largest shapes this step is about
    const L = sc.layers;
    const pool = n === 2 ? L.filter(l => l.step === 2 && l.group !== "plane" && l.priority < 5) : n === 3 ? L.filter(l => l.step === 3) : L.filter(l => l.priority < 5 && l.group !== "plane");
    return pool.slice().sort((a, b) => area2(b) - area2(a)).slice(0, 5);
  }
  function corners(l) {
    const g = l.g;
    if (l.type === "rect") return [[g[0], g[1]], [g[0] + g[2], g[1]], [g[0] + g[2], g[1] + g[3]], [g[0], g[1] + g[3]]];
    if (l.type === "poly") { if (g.length <= 6) return g; const xs = g.map(p => p[0]), ys = g.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; }
    if (l.type === "oval") return [[g[0] - g[2], g[1]], [g[0] + g[2], g[1]], [g[0], g[1] - g[3]], [g[0], g[1] + g[3]]];
    return [[g[0] - g[2], g[1]], [g[0] + g[2], g[1]], [g[0], g[1] - g[2]], [g[0], g[1] + g[2]]];
  }
  function turn(sc, st, lvl, area) {
    const c = sc.crop, k = view(sc, area, "").k, n = st.n;
    let g = `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="none" stroke="${GUIDE}" stroke-width="${sw(k, 2)}"/>`;
    if (lvl === 1) {   // a ghost of the finished example at 20% opacity, to trace over
      const ghost = n === 1 ? view(sc, area, sc.layers.map(l => U().shape(l, { fill: gray(l) })).join("")).svg : example(sc, st, area);
      return view(sc, area, g).svg + `<g opacity=".2">${ghost}</g>`;
    }
    if (lvl === 2) {   // a few thin dashed lines on the largest shapes (step 1: the thirds and the horizon)
      if (n === 1) { g += thirds(c, k, TRACE, 2, true) + horizonLine(sc, k, TRACE, [10, 9]); }
      else g += shapes(sc, k, focus(sc, n), { stroke: TRACE, w: 2, dash: [8, 8] });
      return view(sc, area, g).svg;
    }
    // 3: just dots at the corners, and a ring where the horizon meets the left edge (if it is in the picture)
    const pts = n === 1 ? [[c.x, c.y], [c.x + c.w, c.y], [c.x + c.w, c.y + c.h], [c.x, c.y + c.h], [sc.contrast.x, sc.contrast.y]] : focus(sc, n).flatMap(corners);
    const inside = p => p[0] >= c.x && p[0] <= c.x + c.w && p[1] >= c.y && p[1] <= c.y + c.h;   // corners outside the picture are not shown
    g += dots(pts.filter(inside), k, 6, INK);
    if (sc.horizon.y >= c.y && sc.horizon.y <= c.y + c.h) g += `<circle cx="${c.x}" cy="${sc.horizon.y}" r="${(10 / k).toFixed(1)}" fill="#fff" stroke="${INK}" stroke-width="${sw(k, 3.5)}"/>`;
    return view(sc, area, g).svg.replace('overflow="hidden"', 'overflow="visible"');   // dots on the edge stay whole
  }

  const lvlDots = n => "●".repeat(n) + "○".repeat(3 - n);
  const turnBox = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="${INK}" stroke-width="3"/><rect x="${x + 18}" y="${y - 18}" width="${label.length * 13 + 30}" height="36" rx="12" fill="#fff" stroke="${INK}" stroke-width="2.5"/>${text(x + 33, y + 9, label, { size: 26 })}`;
  const lookBox = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="none" stroke="${INK}" stroke-width="2"/><rect x="${x + 16}" y="${y - 16}" width="76" height="32" rx="11" fill="#fff" stroke="${INK}" stroke-width="2"/>${text(x + 30, y + 8, "Look", { size: 24 })}`;

  // one sheet: n = 1..7, lvl = 1..3
  function sheet(sc, n, lvl) {
    const st = STEPS[n - 1], code = sc.id + "-" + n, footer = [NAME + " #" + code, sc.title.replace(/\s*\(.*\)$/, ""), "inspired by " + st.by].join(" · ");
    const tips = [sc.notes[st.f] || ""].filter(Boolean);
    const lines = wrap(tips[0], 30).slice(0, 5);
    const ex = { x: 70, y: 205, w: 250, h: 240 };
    const side = [["Rule", wrap(st.how, 32)]];
    let tx = 350, ty = 224, body = "";
    body += lookBox(50, 190, 290, 270) + example(sc, st, { x: 62, y: 202, w: 266, h: 246 });
    body += text(tx, ty, "In this picture:", { size: 26 });
    lines.forEach((ln, i) => body += text(tx, ty + 34 + i * 30, ln, { size: 22, font: "ui", fill: "#333", weight: 600 }));
    body += turnBox(50, 530, 750, 480, "Your turn") + turn(sc, st, lvl, { x: 70, y: 548, w: 710, h: 446 });
    const note = n === 1 ? "Draw the horizon as a dashed line. Put what you love most on a dot." : n === 2 ? "Draw the horizon and the big shapes. Anchors first." : n === 3 ? "Add the smaller shapes on top of the big ones." : n === 4 ? "Go over the important lines again, pressing harder." : n === 5 ? "Fill each shape: light, middle or dark. Stripes are fine." : n === 6 ? "Write or color a name in each shape." : "Make dots. Bigger dots where it is darker.";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="8.5in" height="11in">
<rect width="${W}" height="${H}" fill="#fff"/>
${text(60, 62, NAME + " #" + code, { size: 22, font: "ui", weight: 700 })}${text(790, 62, "Name ____________", { size: 24, anchor: "end" })}
${text(60, 118, st.title, { size: 46 })}${text(790, 112, lvlDots(lvl), { size: 22, anchor: "end", font: "ui" })}
${text(60, 156, st.how, { size: 26, fill: "#333" })}
${body}
${text(425, 1044, st.about, { size: 15, anchor: "middle", font: "ui", fill: "#333", weight: 600 })}
${text(425, 1068, footer, { size: Math.min(19, Math.floor(1500 / footer.length)), anchor: "middle", font: "ui", fill: "#333" })}
</svg>`;
  }

  window.WS = { STEPS, sheet, colorName };
})();
