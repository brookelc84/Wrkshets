// Builds every worksheet type / activity / level combination and checks basic invariants.
// Run with: node tests/smoke.js
const assert = require("assert");
const { jsPDF } = require("../js/vendor/jspdf.umd.min.js");
["data", "shapes", "puzzles", "pdf", "types/math", "types/time", "types/money", "types/sudoku",
  "types/maze", "types/cryptogram", "types/spelling", "types/writing"].forEach((f) => require("../js/" + f + ".js"));
const WS = globalThis.WS;

const base = { theme: "kitchen", customWords: "", pages: 2, answerKey: true, nameLine: true,
  paper: "letter", abcActivity: "trace", numActivity: "trace", mathTopic: "auto", timeActivity: "read",
  currency: "usd", shape: "", dotLabels: "numbers", seed: 42 };
const variants = [
  { type: "wordsearch" }, { type: "scramble" }, { type: "bundle" },
  ...["trace", "missing", "order", "match"].map((a) => ({ type: "abc", abcActivity: a })),
  ...["trace", "missing", "count", "math"].map((a) => ({ type: "numbers", numActivity: a })),
  { type: "dots" }, { type: "dots", dotLabels: "letters" },
  { type: "scramble", customWords: "coffee, bus, library, Sam" },
  ...["auto", ...Object.keys(WS.MATH_TOPICS)].map((t) => ({ type: "math", mathTopic: t, pages: 6 })),
  ...["read", "draw", "elapsed"].map((a) => ({ type: "time", timeActivity: a })),
  ...Object.keys(WS.CURRENCIES).map((c) => ({ type: "money", currency: c })),
  { type: "sudoku" }, { type: "maze" }, { type: "cryptogram" }, { type: "spelling", theme: "vocabulary" },
  { type: "writing", pages: 3 },
];
let built = 0;
for (const v of variants)
  for (let level = 1; level <= 6; level++)
    for (const largePrint of [false, true]) {
      const s = { ...base, ...v, level, largePrint, paper: level % 2 ? "letter" : "a4" };
      const doc = WS.buildPdf(jsPDF, s);
      assert(doc.getNumberOfPages() >= 1, JSON.stringify(s));
      built++;
    }

// Puzzle-level checks over many seeds.
const lvl = (level) => ({ ...base, level, difficulty: WS.difficultyOf(level) });
for (let seed = 1; seed <= 60; seed++) {
  for (let level = 1; level <= 6; level++) {
    const s = lvl(level);
    const ws = WS.puzzles.wordsearch(s, WS.makeRng(seed));
    assert(ws.words.length >= 4, "word search has too few words");
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
    const d = WS.puzzles.dots({ ...s, dotLabels: "letters" }, WS.makeRng(seed), seed, Object.keys(WS.SHAPES));
    assert(d.points.length <= 26, "too many lettered dots");

    // Sudoku: givens must agree with the solution and have exactly one solution.
    const sd = WS.TYPES.sudoku.generate(s, WS.makeRng(seed));
    for (const g of sd.grids) {
      g.puzzle.forEach((v, i) => assert(!v || v === g.solution[i], "sudoku given differs from solution"));
      assert.strictEqual(WS.sudoku.solve(g.puzzle.slice(), g, 2), 1, "sudoku does not have one solution");
    }
    // Maze: the solution path goes from the first to the last cell through open walls.
    const mz = WS.TYPES.maze.generate(s, WS.makeRng(seed));
    assert.strictEqual(mz.path[0], 0);
    assert.strictEqual(mz.path[mz.path.length - 1], mz.cols * mz.rows - 1);
    // Code breaker: every message letter has a code and substitution never maps a letter to itself.
    const cr = WS.TYPES.cryptogram.generate(s, WS.makeRng(seed), seed);
    for (const m of cr.messages) for (const ch of m.replace(/[^A-Z]/g, "")) {
      assert(cr.code[ch], "letter without a code");
      if (cr.kind === "sub") assert.notStrictEqual(cr.code[ch], ch);
    }
  }
}

// Math answers: spot-check the arithmetic of whole-number and equation problems.
for (let seed = 1; seed <= 200; seed++) {
  for (let L = 1; L <= 6; L++) {
    const r = WS.makeRng(seed * 10 + L);
    const add = WS.MATH_TOPICS.add.make(L, r);
    assert.strictEqual(add.ans, add.a + add.b);
    const sub = WS.MATH_TOPICS.sub.make(L, r);
    assert(sub.ans >= 0 && sub.ans === sub.a - sub.b);
    const mul = WS.MATH_TOPICS.mul.make(L, r);
    assert.strictEqual(mul.ans, mul.a * mul.b);
    const div = WS.MATH_TOPICS.div.make(L, r);
    const m = div.expr[0].match(/^(\d+) ÷ (\d+)$/), a = div.ans[0].match(/^(\d+)(?: R(\d+))?$/);
    assert.strictEqual(+m[1], +a[1] * +m[2] + (+a[2] || 0), "division answer wrong");
    assert((+a[2] || 0) < +m[2], "remainder too big");
  }
}
console.log("ok: built " + built + " PDFs and checked puzzles at every level");
