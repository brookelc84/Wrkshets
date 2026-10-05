// Builds every worksheet type / activity / level combination and checks basic invariants.
// Run with: node tests/smoke.js
const assert = require("assert");
const { jsPDF } = require("../js/vendor/jspdf.umd.min.js");
["data", "shapes", "puzzles", "pdf"].forEach((f) => require("../js/" + f + ".js"));
const WS = globalThis.WS;

const base = { theme: "kitchen", customWords: "", pages: 2, answerKey: true, nameLine: true,
  paper: "letter", abcActivity: "trace", numActivity: "trace", shape: "", dotLabels: "numbers", seed: 42 };
const variants = [
  { type: "wordsearch" }, { type: "scramble" }, { type: "bundle" },
  ...["trace", "missing", "order", "match"].map((a) => ({ type: "abc", abcActivity: a })),
  ...["trace", "missing", "count", "math"].map((a) => ({ type: "numbers", numActivity: a })),
  { type: "dots" }, { type: "dots", dotLabels: "letters" },
  { type: "scramble", customWords: "coffee, bus, library, Sam" },
];
let built = 0;
for (const v of variants)
  for (const difficulty of ["easy", "medium", "hard"])
    for (const largePrint of [false, true])
      for (const paper of ["letter", "a4"]) {
        const s = { ...base, ...v, difficulty, largePrint, paper };
        const doc = WS.buildPdf(jsPDF, s);
        assert(doc.getNumberOfPages() >= 1, JSON.stringify(s));
        built++;
      }

// Puzzle-level checks over many seeds.
for (let seed = 1; seed <= 200; seed++) {
  for (const difficulty of ["easy", "medium", "hard"]) {
    const s = { ...base, difficulty };
    const ws = WS.puzzles.wordsearch(s, WS.makeRng(seed));
    assert(ws.words.length >= 5, "word search has too few words");
    for (const p of ws.placed) {
      const dx = Math.sign(p.x1 - p.x0), dy = Math.sign(p.y1 - p.y0);
      const read = [...p.word].map((_, k) => ws.grid[p.y0 + dy * k][p.x0 + dx * k]).join("");
      assert.strictEqual(read, p.word, "placed word not readable in grid");
    }
    const sc = WS.puzzles.scramble(s, WS.makeRng(seed));
    for (const it of sc.items) {
      assert.strictEqual([...it.scrambled].sort().join(""), [...it.word].sort().join(""));
      assert.notStrictEqual(it.scrambled, it.word, "scramble left a word unchanged");
    }
    const m = WS.puzzles.numbers({ ...s, numActivity: "math" }, WS.makeRng(seed));
    for (const p of m.problems) assert(p.ans >= 0, "negative answer");
    const d = WS.puzzles.dots({ ...s, dotLabels: "letters" }, WS.makeRng(seed), seed, Object.keys(WS.SHAPES));
    assert(d.points.length <= 26, "too many lettered dots");
  }
}
console.log("ok: built " + built + " PDFs and checked 600 puzzle sets");
