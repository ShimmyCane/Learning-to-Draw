/* Visualize Image: the ⚙️ settings button and drawer, on every page. Everything is kept on this device (localStorage).
   Delete means hide on this device: nothing is erased, and ⚙️ can bring it back. */
(function () {
  "use strict";
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const VS = {
    level: () => Math.min(3, Math.max(1, +get("vi.level", 1) || 1)),
    setLevel: n => set("vi.level", n),
    scenesOut: () => get("vi.deletedScenes", []),
    sheetsOut: () => get("vi.deletedSheets", []),
    sceneGone: id => VS.scenesOut().indexOf(id) >= 0,
    sheetGone: code => VS.sheetsOut().indexOf(code) >= 0 || VS.sceneGone(code.replace(/-\d$/, "")),
    hideScene: id => set("vi.deletedScenes", VS.scenesOut().filter(x => x !== id).concat(id)),
    hideSheet: code => set("vi.deletedSheets", VS.sheetsOut().filter(x => x !== code).concat(code)),
    restore: code => { set("vi.deletedScenes", VS.scenesOut().filter(x => x !== code)); set("vi.deletedSheets", VS.sheetsOut().filter(x => x !== code)); },
    // opts: { id, n, onChange(kind) }  (id and n only on pages that show one scene or sheet)
    mount(opts) {
      opts = opts || {};
      const nn = () => typeof opts.n === "function" ? opts.n() : opts.n;
      const gear = document.createElement("button"); gear.className = "gear noprint"; gear.type = "button"; gear.setAttribute("aria-label", "Settings"); gear.textContent = "⚙️";
      const dr = document.createElement("div"); dr.className = "drawer noprint"; dr.hidden = true;
      document.body.append(gear, dr);
      const changed = k => { if (opts.onChange) opts.onChange(k); render(); };
      function render() {
        const lv = VS.level(), out = VS.scenesOut().map(c => [c, "scene " + c]).concat(VS.sheetsOut().map(c => [c, "sheet " + c]));
        dr.innerHTML = `<h2>⚙️ Settings</h2>
<h3>Help on new sheets</h3>
<div class="row">${[1, 2, 3].map(n => `<button class="btn${n === lv ? " on" : ""}" data-lv="${n}" type="button">${n} ${["ghost", "dashes", "dots"][n - 1]}</button>`).join("")}</div>
<p><small>1 = a 20% ghost to trace. 2 = a few thin dashed lines. 3 = corner dots and a horizon dot.</small></p>
${opts.id ? `<h3>Delete</h3><div class="row">${nn() ? `<button class="btn" id="vsDelSheet" type="button">🗑️ This sheet</button>` : ""}<button class="btn" id="vsDelScene" type="button">🗑️ This scene</button></div><p><small>Hides it on this device. Nothing is erased; restore it below.</small></p>` : ""}
<h3>Deleted here</h3>${out.length ? `<ul>${out.map(([c, l]) => `<li>${esc(l)} <button class="tag" data-restore="${esc(c)}" type="button">Restore</button></li>`).join("")}</ul>` : "<p><small>Nothing deleted.</small></p>"}
<h3>My photo</h3><div class="row"><button class="btn" id="vsPhoto" type="button">Forget my saved photo</button></div>
<h3>More</h3><ul><li><a href="index.html">Visualize Image home</a></li><li><a href="archive/v1/index.html">V1 (archived)</a></li><li><a href="../index.html">← Learning to Draw</a></li></ul>
<p><small>Everything here stays on this device.</small></p>`;
        dr.querySelectorAll("[data-lv]").forEach(b => b.onclick = () => { VS.setLevel(+b.dataset.lv); changed("level"); });
        dr.querySelectorAll("[data-restore]").forEach(b => b.onclick = () => { VS.restore(b.dataset.restore); changed("restore"); });
        const ds = dr.querySelector("#vsDelSheet"), dc = dr.querySelector("#vsDelScene");
        if (ds) ds.onclick = () => { if (confirm("Delete this sheet on this device? You can restore it in ⚙️.")) { VS.hideSheet(opts.id + "-" + nn()); changed("sheet"); } };
        if (dc) dc.onclick = () => { if (confirm("Delete this scene on this device? You can restore it in ⚙️.")) { VS.hideScene(opts.id); changed("scene"); } };
        dr.querySelector("#vsPhoto").onclick = () => { try { localStorage.removeItem("vi.mycrop"); } catch (e) {} dr.querySelector("#vsPhoto").textContent = "Forgotten"; };
      }
      gear.onclick = () => { dr.hidden = !dr.hidden; if (!dr.hidden) render(); };
      render();
    }
  };
  window.VS = VS;
})();
