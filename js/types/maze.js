/* Mazes: from a small 6 × 7 maze (level 1) to a 28 × 36 maze (level 6). */
(function (root) {
  var WS = (root.WS = root.WS || {});

  var SIZES = [[6, 7], [9, 11], [12, 15], [16, 20], [22, 28], [28, 36]]; // [columns, rows]
  var N = 1, E = 2, S = 4, W = 8;
  var STEP = { 1: [0, -1], 2: [1, 0], 4: [0, 1], 8: [-1, 0] };
  var OPP = { 1: 4, 2: 8, 4: 1, 8: 2 };

  function generate(settings, rng) {
    var sz = SIZES[settings.level - 1];
    var cols = sz[0], rows = sz[1];
    if (settings.largePrint) { cols = Math.max(5, Math.round(cols * 0.75)); rows = Math.max(6, Math.round(rows * 0.75)); }
    // open[i] holds a bitmask of the passages out of cell i.
    var open = new Array(cols * rows).fill(0), seen = new Array(cols * rows).fill(false);
    var stack = [0];
    seen[0] = true;
    while (stack.length) {
      var cur = stack[stack.length - 1], x = cur % cols, y = Math.floor(cur / cols);
      var dirs = rng.shuffle([N, E, S, W]).filter(function (d) {
        var nx = x + STEP[d][0], ny = y + STEP[d][1];
        return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny * cols + nx];
      });
      if (!dirs.length) { stack.pop(); continue; }
      var d = dirs[0], next = (y + STEP[d][1]) * cols + x + STEP[d][0];
      open[cur] |= d; open[next] |= OPP[d];
      seen[next] = true;
      stack.push(next);
    }
    return { cols: cols, rows: rows, open: open, path: solvePath(open, cols, rows) };
  }

  // Breadth-first search from the top-left cell to the bottom-right cell.
  function solvePath(open, cols, rows) {
    var end = cols * rows - 1, prev = new Array(cols * rows).fill(-1), q = [0];
    prev[0] = 0;
    while (q.length) {
      var c = q.shift();
      if (c === end) break;
      [N, E, S, W].forEach(function (d) {
        if (!(open[c] & d)) return;
        var n = c + STEP[d][1] * cols + STEP[d][0];
        if (prev[n] < 0) { prev[n] = c; q.push(n); }
      });
    }
    var path = [end];
    while (path[0] !== 0) path.unshift(prev[path[0]]);
    return path;
  }

  function draw(ctx, pz, answer) {
    var D = WS.draw, doc = ctx.doc;
    var y = D.header(ctx, "Maze", [
      "Start at the arrow at the top left. Find a path through the maze to the finish at the bottom right.",
      "You cannot cross the lines. Use a pencil so you can rub out and try again."
    ], answer);
    var areaW = ctx.W - 2 * ctx.M - 24, areaH = ctx.H - ctx.M - 22 - y;
    var cell = Math.min(areaW / pz.cols, areaH / pz.rows, 22);
    var mw = cell * pz.cols, mh = cell * pz.rows;
    var ox = (ctx.W - mw) / 2, oy = y + 6 + (areaH - mh) / 2;

    if (answer) {
      D.setDraw(doc, D.HILITE); doc.setLineWidth(Math.max(1.5, cell * 0.45)); doc.setLineCap("round"); doc.setLineJoin("round");
      var pts = pz.path.map(function (i) { return [ox + (i % pz.cols + 0.5) * cell, oy + (Math.floor(i / pz.cols) + 0.5) * cell]; });
      pts.unshift([ox - cell * 0.6, pts[0][1]]);
      pts.push([ox + mw + cell * 0.6, pts[pts.length - 1][1]]);
      var deltas = [];
      for (var k = 1; k < pts.length; k++) deltas.push([pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]]);
      doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "S", false);
      doc.setLineCap("butt"); doc.setLineJoin("miter");
    }

    D.setDraw(doc, D.INK); doc.setLineWidth(cell > 8 ? 0.8 : 0.55); doc.setLineCap("square");
    for (var i = 0; i < pz.open.length; i++) {
      var cx = ox + (i % pz.cols) * cell, cy = oy + Math.floor(i / pz.cols) * cell, o = pz.open[i];
      var first = i === 0, last = i === pz.open.length - 1;
      if (!(o & N)) doc.line(cx, cy, cx + cell, cy);
      if (!(o & W) && !first) doc.line(cx, cy, cx, cy + cell);
      if (i % pz.cols === pz.cols - 1 && !last) doc.line(cx + cell, cy, cx + cell, cy + cell);
      if (Math.floor(i / pz.cols) === pz.rows - 1) doc.line(cx, cy + cell, cx + cell, cy + cell);
    }
    doc.setLineCap("butt");

    // Start and finish markers.
    D.setFill(doc, D.ACCENT); D.setDraw(doc, D.ACCENT);
    var sy = oy + cell / 2, ey = oy + mh - cell / 2, a = Math.min(cell * 0.35, 4);
    doc.triangle(ox - 2, sy, ox - 2 - a * 1.6, sy - a, ox - 2 - a * 1.6, sy + a, "F");
    doc.triangle(ox + mw + 2 + a * 1.6, ey, ox + mw + 2, ey - a, ox + mw + 2, ey + a, "F");
    D.font(ctx, 10, "bold"); D.setText(doc, D.ACCENT);
    doc.text("START", ox - 3, oy - 2.5, { align: "left" });
    doc.text("FINISH", ox + mw + 3, oy + mh + 5, { align: "right" });
    D.footer(ctx, "Level " + ctx.settings.level + " · " + pz.cols + " × " + pz.rows);
  }

  WS.registerType("maze", {
    label: "Maze", generate: generate, draw: draw,
    key: function () { return true; },
    describe: function (L) { var s = SIZES[L - 1]; return s[0] + " × " + s[1] + " maze" + (L <= 2 ? " with wide paths" : L >= 5 ? " with many dead ends" : ""); }
  });
})(typeof window !== "undefined" ? window : globalThis);
