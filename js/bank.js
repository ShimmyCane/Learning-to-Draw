/* The sheet bank: the catalog minus retired sheets, with codes, lookups and the review reasons. */
(function (root) {
  "use strict";
  const all = () => (root.LTD_CATALOG || []).map(r => Object.assign({ code: root.LTD.codeOf(r) }, r));
  const bank = () => all().filter(r => !r.retired);
  const find = code => all().find(r => r.code === String(code || "").toUpperCase().replace(/^(?!LD-)/, "LD-")) || null;
  const REASONS = [["hard", "😣 Too hard"], ["easy", "😴 Too easy"], ["unclear", "🤔 Hard to understand"], ["ugly", "🎨 Doesn't look good"], ["print", "🖨️ Prints badly"], ["other", "📝 Something else"]];
  const FACES = [[1, "😴", "too easy"], [2, "😊", "just right"], [3, "😣", "too hard"]];
  const WHO = [["younger", "Younger"], ["older", "Older"]];
  root.BANK = { all, bank, find, REASONS, FACES, WHO };
})(window);
