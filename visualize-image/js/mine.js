/* Visualize Image: your own worksheets. VM keeps them on this device (localStorage) and builds a scene from a photo
   in code: it looks for big regions of light and dark, turns each into a simple shape (rectangle or a few-sided
   polygon), ranks them, picks values and a small palette. The result is the same scene format as the hand-built
   kitchen, so the sheets and gallery draw it. The shapes are rough: a note for Claude can ask for a hand-built one. */
(function () {
  "use strict";
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hexOf = c => "#" + c.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");

  function hull(pts) {   // monotone chain
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    pts.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    pts.slice().reverse().forEach(p => { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function simplify(poly, max) {   // drop the corner that changes the area least until few remain
    poly = poly.slice();
    while (poly.length > max) {
      let bi = 0, ba = 1e18;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[(i + poly.length - 1) % poly.length], b = poly[i], c = poly[(i + 1) % poly.length];
        const ar = Math.abs((a[0] - b[0]) * (c[1] - b[1]) - (a[1] - b[1]) * (c[0] - b[0])) / 2;
        if (ar < ba) { ba = ar; bi = i; }
      }
      poly.splice(bi, 1);
    }
    return poly;
  }
  function kmeans(items, k) {   // items: [{c:[r,g,b], w}] -> centers
    if (items.length <= k) return items.map(i => i.c);
    let cs = [items.slice().sort((a, b) => b.w - a.w)[0].c];
    while (cs.length < k) { let best = null, bd = -1; items.forEach(it => { const d = Math.min(...cs.map(c => c.reduce((s, v, i) => s + (v - it.c[i]) ** 2, 0))); if (d > bd) { bd = d; best = it; } }); cs.push(best.c); }
    for (let it = 0; it < 8; it++) {
      const sum = cs.map(() => [0, 0, 0, 0]);
      items.forEach(x => { let bi = 0, bd = 1e18; cs.forEach((c, i) => { const d = c.reduce((s, v, j) => s + (v - x.c[j]) ** 2, 0); if (d < bd) { bd = d; bi = i; } }); sum[bi][0] += x.c[0] * x.w; sum[bi][1] += x.c[1] * x.w; sum[bi][2] += x.c[2] * x.w; sum[bi][3] += x.w; });
      cs = cs.map((c, i) => sum[i][3] ? [sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]] : c);
    }
    return cs;
  }

  // f: { crop:{x,y,w,h} as fractions, hy, cp:{x,y} as fractions }   o: { masses 4-8, values 3|5, colors 3-5 }
  function build(img, f, o) {
    o = Object.assign({ masses: 6, values: 5, colors: 5 }, o || {});
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cr = { x: Math.round(f.crop.x * iw), y: Math.round(f.crop.y * ih), w: Math.round(f.crop.w * iw), h: Math.round(f.crop.h * ih) };
    const GW = 48, GH = clamp(Math.round(GW * cr.h / cr.w), 12, 84), N = GW * GH;
    const cv = document.createElement("canvas"); cv.width = GW; cv.height = GH;
    const g = cv.getContext("2d", { willReadFrequently: true }); g.drawImage(img, cr.x, cr.y, cr.w, cr.h, 0, 0, GW, GH);
    const d = g.getImageData(0, 0, GW, GH).data, ch = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) for (let c = 0; c < 3; c++) {   // 3 x 3 blur
      let s = 0, n = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && xx < GW && yy >= 0 && yy < GH) { s += d[(yy * GW + xx) * 4 + c]; n++; } }
      ch[c][y * GW + x] = s / n;
    }
    const L = new Float32Array(N); for (let i = 0; i < N; i++) L[i] = .3 * ch[0][i] + .59 * ch[1][i] + .11 * ch[2][i];
    const sorted = Array.from(L).sort((a, b) => a - b), th = [.2, .4, .6, .8].map(p => sorted[Math.floor(p * (N - 1))]);
    const lv = new Uint8Array(N); for (let i = 0; i < N; i++) lv[i] = L[i] > th[3] ? 4 : L[i] > th[2] ? 3 : L[i] > th[1] ? 2 : L[i] > th[0] ? 1 : 0;
    const valOf = l => o.values === 3 ? (l <= 1 ? 0 : l === 2 ? 2 : 4) : l;
    // connected regions of the same level
    const id = new Int32Array(N).fill(-1), comps = [];
    for (let s = 0; s < N; s++) {
      if (id[s] >= 0) continue; const q = [s], cell = []; id[s] = comps.length;
      while (q.length) { const p = q.pop(); cell.push(p); const x = p % GW, y = (p / GW) | 0;
        [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(([xx, yy]) => { if (xx < 0 || yy < 0 || xx >= GW || yy >= GH) return; const n = yy * GW + xx; if (id[n] < 0 && lv[n] === lv[s]) { id[n] = comps.length; q.push(n); } }); }
      comps.push({ cell, level: lv[s] });
    }
    comps.forEach(c => {
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, r = 0, gg = 0, b = 0, sx = 0, sy = 0;
      c.cell.forEach(p => { const x = p % GW, y = (p / GW) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); r += ch[0][p]; gg += ch[1][p]; b += ch[2][p]; sx += x; sy += y; });
      const n = c.cell.length; Object.assign(c, { area: n, x0, y0, x1: x1 + 1, y1: y1 + 1, rgb: [r / n, gg / n, b / n], cx: sx / n, cy: sy / n });
    });
    const big = comps.filter(c => c.area >= Math.max(6, .006 * N)).sort((a, b) => b.area - a.area);
    const X = gx => Math.round(cr.x + gx * cr.w / GW), Y = gy => Math.round(cr.y + gy * cr.h / GH);
    const geom = c => {
      const fill = c.area / ((c.x1 - c.x0) * (c.y1 - c.y0));
      if (fill > .8) return { type: "rect", g: [X(c.x0), Y(c.y0), X(c.x1) - X(c.x0), Y(c.y1) - Y(c.y0)] };
      const pts = []; c.cell.forEach(p => { const x = p % GW, y = (p / GW) | 0; pts.push([x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]); });
      return { type: "poly", g: simplify(hull(pts), 6).map(p => [X(p[0]), Y(p[1])]) };
    };
    const cpx = { x: Math.round(f.cp.x * iw), y: Math.round(f.cp.y * ih) };
    const near = c => 1 - Math.min(1, Math.hypot((cr.x + c.cx * cr.w / GW) - cpx.x, (cr.y + c.cy * cr.h / GH) - cpx.y) / Math.hypot(cr.w, cr.h) * 2);
    const score = c => c.area / N + .6 * near(c);

    const planes = big.filter(c => c.area > .3 * N).slice(0, 2), rest = big.filter(c => planes.indexOf(c) < 0);
    const masses = rest.slice(0, o.masses), sec = rest.slice(o.masses, o.masses + 10);
    const mean = [0, 1, 2].map(i => ch[i].reduce((a, b) => a + b, 0) / N);
    const layers = [{ id: "wall", name: "Background", step: 2, group: "plane", type: "rect", g: [cr.x, cr.y, cr.w, cr.h], priority: 4, value: valOf(2), rgb: mean, area: N }];
    planes.forEach((c, i) => layers.push(Object.assign({ id: "plane" + i, name: "Large area " + (i + 1), step: 2, group: "plane", priority: 4, value: valOf(c.level), rgb: c.rgb, area: c.area }, geom(c))));
    const byScore = masses.slice().sort((a, b) => score(b) - score(a)), pri = [1, 2, 2, 3, 3, 4, 4, 4];
    const anchors = masses.slice().sort((a, b) => b.area - a.area).slice(0, 3);
    masses.forEach((c, i) => layers.push(Object.assign({ id: "m" + i, name: "Shape " + (i + 1), step: 2, group: "mass", priority: pri[byScore.indexOf(c)], value: valOf(c.level), rgb: c.rgb, area: c.area }, geom(c), anchors.indexOf(c) >= 0 ? { anchor: "ABC"[anchors.indexOf(c)] } : {})));
    const bb = c => ({ x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 });
    const secScore = sec.slice().sort((a, b) => score(b) - score(a));
    sec.forEach((c, i) => {
      const inter = masses.some(m => m.x0 < c.x1 && c.x0 < m.x1 && m.y0 < c.y1 && c.y0 < m.y1 && !(c.x0 >= m.x0 && c.x1 <= m.x1 && c.y0 >= m.y0 && c.y1 <= m.y1));
      const r = secScore.indexOf(c);
      layers.push(Object.assign({ id: "s" + i, name: "Detail " + (i + 1), step: 3, group: inter ? "overlap" : "secondary", priority: r < 3 ? 3 : r < 7 ? 4 : 5, value: valOf(c.level), rgb: c.rgb, area: c.area }, geom(c)));
    });
    // a small palette: group the layer colors into k
    const cs = kmeans(layers.map(l => ({ c: l.rgb, w: l.area })), clamp(o.colors, 2, 6));
    layers.forEach(l => { let bi = 0, bd = 1e18; cs.forEach((c, i) => { const dd = c.reduce((s, v, j) => s + (v - l.rgb[j]) ** 2, 0); if (dd < bd) { bd = dd; bi = i; } }); l.color = hexOf(cs[bi]); delete l.rgb; delete l.area; });

    const pc = Math.round(f.cp.x * 100) + "% across, " + Math.round(f.cp.y * 100) + "% down", nm = masses.length;
    return {
      id: "MY-draft", pass: 1, mine: true, title: "My picture", source: "", size: [iw, ih],
      nice: ["The strongest contrast is " + pc + ".", nm + " big shapes were found by looking at light and dark.", "Look for where the lightest and darkest shapes touch: that is where the eye goes."],
      crop: { x: cr.x, y: cr.y, w: cr.w, h: cr.h, why: "Chosen so the strongest contrast sits on a third." },
      contrast: { x: cpx.x, y: cpx.y, why: "The busiest, sharpest place in the photo." },
      horizon: { y: Math.round(f.hy * ih), how: "The strongest horizontal edge in the photo. Move it if it is wrong." },
      vp: [cr.x, Math.round(f.hy * ih)], receding: [],
      moves: ["Hold the camera level.", "Step closer so the best contrast sits on a third.", "Move anything that distracts out of the shot."],
      vision: "Make the shape nearest the strongest contrast the hero; the rest supports it.",
      leftOut: ["The smallest shapes (priority 5)", "Texture and detail inside each shape"],
      notes: {
        "1": "Crop, thirds, horizon (dashed) and the strongest contrast (ring).", "2a": "A flat background first, then any very large area.",
        "2b": nm + " big shapes, back to front. Squint: does it still read?", "2c": "The three biggest shapes are the anchors (A, B, C).",
        "3a": "Smaller shapes, placed against the anchors.", "3b": "Shapes that cross the edge of a bigger one are drawn over it.",
        "3c": "1 = nearest the contrast and big; 5 = small and far away (left out).", "4": "Thick for priority 1, thinner down to 4. Priority 5 is left out.",
        "5a": o.values === 3 ? "Three values: dark, middle, light." : "Five values, light to dark.", "5b": "A palette of " + o.colors + " colors taken from the photo.",
        "6a": "Round dots.", "6b": "Octagon dots.", "6c": "Triangle facets.", "6d": "Lines only."
      },
      layers
    };
  }

  const VM = {
    build,
    list: () => get("vi.my", []).filter(id => get("vi.my." + id, null)),
    load: id => get("vi.my." + id, null),
    save(sc) {
      const ids = get("vi.my", []), n = ids.reduce((m, x) => Math.max(m, +x.replace("MY-", "") || 0), 0) + 1, id = "MY-" + n;
      sc = Object.assign({}, sc, { id }); if (!set("vi.my." + id, sc)) return null;
      set("vi.my", ids.concat(id)); return sc;
    },
    // load a scene by id: MY-n from this device, anything else from data/scenes/<id>.js
    loadScene(id, ok, fail) {
      if (/^MY-/.test(id)) { const sc = VM.load(id); if (!sc) return fail(); window.VI = window.VI || { scenes: {} }; VI.scenes[id] = sc; return ok(sc); }
      const s = document.createElement("script"); s.src = "data/scenes/" + id + ".js"; s.onload = () => ok(VI.scenes[id]); s.onerror = fail; document.head.appendChild(s);
    },
    claudeNote(sc) {
      const c = sc.crop;
      return "Visualize Image, " + sc.id + " (my photo)\ncrop: x " + c.x + ", y " + c.y + ", w " + c.w + ", h " + c.h + " of " + sc.size[0] + " x " + sc.size[1] +
        "\nhorizon: y " + sc.horizon.y + "\ncontrast point: x " + sc.contrast.x + ", y " + sc.contrast.y +
        "\nThe shapes in " + sc.id + " were found by code and are rough. Please build a hand-made scene for this photo the way VI-002 was made (truer shapes, a real vision, what to leave out), then I will print the sheets.";
    }
  };
  window.VM = VM;
})();
