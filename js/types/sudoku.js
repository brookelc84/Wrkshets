/* Sudoku: 4×4 (levels 1–2), 6×6 (levels 3–4) and 9×9 (levels 5–6).
 * Every puzzle is checked to have exactly one solution. */
(function (root) {
  var WS = (root.WS = root.WS || {});

  var LEVELS = [
    { n: 4, br: 2, bc: 2, givens: 10 },
    { n: 4, br: 2, bc: 2, givens: 6 },
    { n: 6, br: 2, bc: 3, givens: 22 },
    { n: 6, br: 2, bc: 3, givens: 14 },
    { n: 9, br: 3, bc: 3, givens: 36 },
    { n: 9, br: 3, bc: 3, givens: 26 }
  ];

  function candidates(g, spec, i) {
    var n = spec.n, r = Math.floor(i / n), c = i % n, used = {};
    for (var k = 0; k < n; k++) { used[g[r * n + k]] = 1; used[g[k * n + c]] = 1; }
    var r0 = r - (r % spec.br), c0 = c - (c % spec.bc);
    for (var a = 0; a < spec.br; a++) for (var b = 0; b < spec.bc; b++) used[g[(r0 + a) * n + c0 + b]] = 1;
    var out = [];
    for (var v = 1; v <= n; v++) if (!used[v]) out.push(v);
    return out;
  }

  // Counts solutions up to `limit`; fills `g` in place when `rng` is given (to build a full grid).
  function solve(g, spec, limit, rng) {
    var best = -1, bestC = null;
    for (var i = 0; i < g.length; i++) {
      if (g[i]) continue;
      var cs = candidates(g, spec, i);
      if (cs.length === 0) return 0;
      if (!bestC || cs.length < bestC.length) { best = i; bestC = cs; if (cs.length === 1) break; }
    }
    if (best < 0) return 1;
    if (rng) bestC = rng.shuffle(bestC);
    var count = 0;
    for (var k = 0; k < bestC.length; k++) {
      g[best] = bestC[k];
      count += solve(g, spec, limit - count, rng);
      if (count >= limit) { if (!rng) g[best] = 0; return count; }
    }
    g[best] = 0;
    return count;
  }

  function makeOne(spec, rng) {
    var full = new Array(spec.n * spec.n).fill(0);
    solve(full, spec, 1, rng);
    var puzzle = full.slice();
    var filled = puzzle.length;
    var order = rng.shuffle(puzzle.map(function (_, i) { return i; }));
    for (var k = 0; k < order.length && filled > spec.givens; k++) {
      var i = order[k], keep = puzzle[i];
      puzzle[i] = 0;
      if (solve(puzzle.slice(), spec, 2) !== 1) puzzle[i] = keep;
      else filled--;
    }
    return { n: spec.n, br: spec.br, bc: spec.bc, puzzle: puzzle, solution: full };
  }

  function generate(settings, rng) {
    var spec = LEVELS[settings.level - 1];
    var per = spec.n === 4 ? 6 : spec.n === 6 ? 4 : 2;
    if (settings.largePrint) per = spec.n === 4 ? 4 : spec.n === 6 ? 2 : 1;
    var list = [];
    for (var i = 0; i < per; i++) list.push(makeOne(spec, rng));
    return { grids: list, n: spec.n };
  }

  function drawGrid(ctx, g, x, y, size, answer) {
    var D = WS.draw, doc = ctx.doc, n = g.n, cell = size / n;
    for (var i = 0; i < n * n; i++) {
      var r = Math.floor(i / n), c = i % n;
      var given = g.puzzle[i];
      if (given) { D.setFill(doc, [242, 240, 235]); doc.rect(x + c * cell, y + r * cell, cell, cell, "F"); }
      var v = given || (answer ? g.solution[i] : 0);
      if (v) {
        doc.setFont("helvetica", given ? "bold" : "normal");
        doc.setFontSize((cell / D.PT) * 0.55);
        D.setText(doc, given ? D.INK : D.ACCENT);
        D.textMid(doc, String(v), x + (c + 0.5) * cell, y + (r + 0.5) * cell + 0.3);
      }
    }
    D.setDraw(doc, D.SOFT); doc.setLineWidth(0.25);
    for (var k = 1; k < n; k++) {
      doc.line(x + k * cell, y, x + k * cell, y + size);
      doc.line(x, y + k * cell, x + size, y + k * cell);
    }
    D.setDraw(doc, D.INK); doc.setLineWidth(0.9);
    for (var a = g.bc; a < n; a += g.bc) doc.line(x + a * cell, y, x + a * cell, y + size);
    for (var b = g.br; b < n; b += g.br) doc.line(x, y + b * cell, x + size, y + b * cell);
    doc.rect(x, y, size, size, "S");
  }

  function draw(ctx, pz, answer) {
    var D = WS.draw, doc = ctx.doc, n = pz.n;
    var y = D.header(ctx, "Sudoku " + n + " × " + n, [
      "Fill every empty square with a number from 1 to " + n + ".",
      "Each row, each column and each thick-lined box must have every number from 1 to " + n + " exactly once."
    ], answer);
    var count = pz.grids.length;
    var cols = count >= 4 ? 2 : 1, rows = Math.ceil(count / cols);
    var areaW = ctx.W - 2 * ctx.M, areaH = ctx.H - ctx.M - 12 - y;
    var size = Math.min(areaW / cols - 12, areaH / rows - 10, 150);
    pz.grids.forEach(function (g, i) {
      var cx = ctx.M + areaW / cols * (i % cols + 0.5);
      var cy = y + areaH / rows * (Math.floor(i / cols) + 0.5);
      if (count > 1) {
        D.font(ctx, 10, "bold"); D.setText(doc, D.SOFT);
        doc.text("Puzzle " + (i + 1), cx - size / 2, cy - size / 2 - 2);
      }
      drawGrid(ctx, g, cx - size / 2, cy - size / 2 + 1, size, answer);
    });
    D.footer(ctx, "Level " + ctx.settings.level);
  }

  WS.registerType("sudoku", {
    label: "Sudoku", generate: generate, draw: draw,
    key: function () { return true; },
    describe: function (L) {
      var s = LEVELS[L - 1];
      return s.n + " × " + s.n + " grids, " + s.givens + " numbers given" + (L % 2 ? " (gentler)" : " (harder)");
    }
  });
  WS.sudoku = { makeOne: makeOne, solve: solve, LEVELS: LEVELS };
})(typeof window !== "undefined" ? window : globalThis);
