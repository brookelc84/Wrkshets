/* Draws worksheets into a jsPDF document.
 * Layout uses millimetres. Pages are designed to be calm and uncluttered:
 * one clear title, short literal instructions, plenty of white space. */
(function (root) {
  var WS = (root.WS = root.WS || {});
  var PT = 0.3528; // 1 pt in mm
  var INK = [34, 34, 34];
  var SOFT = [120, 120, 120];
  var LIGHT = [200, 200, 200];
  var TRACE = [175, 175, 175];
  var ACCENT = [47, 111, 115];
  var HILITE = [255, 226, 140];

  function setText(doc, rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
  function setDraw(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
  function setFill(doc, rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
  function font(ctx, size, style) {
    ctx.doc.setFont("helvetica", style || "normal");
    ctx.doc.setFontSize(size * ctx.scale);
  }
  function solid(doc) { doc.setLineDashPattern([], 0); }

  // ---------- Page furniture ----------

  function header(ctx, title, lines, answer) {
    var doc = ctx.doc, x = ctx.M, y = ctx.M;
    if (ctx.settings.nameLine && !answer) {
      // Name and date sit on their own row so long titles never collide with them.
      font(ctx, 12); setText(doc, SOFT);
      var dateX = ctx.W - ctx.M - 55;
      doc.text("Name:", x, y + 4);
      doc.text("Date:", dateX, y + 4);
      setDraw(doc, LIGHT); doc.setLineWidth(0.3);
      doc.line(x + doc.getTextWidth("Name:") + 2, y + 5, dateX - 10, y + 5);
      doc.line(dateX + doc.getTextWidth("Date:") + 2, y + 5, ctx.W - ctx.M, y + 5);
      y += 10;
    }
    if (answer) {
      font(ctx, 11, "bold"); setText(doc, ACCENT);
      doc.text("ANSWER KEY", x, y + 3);
      y += 6;
    }
    font(ctx, 22, "bold"); setText(doc, INK);
    doc.text(title, x, y + 7);
    y += 7 + 4;

    setDraw(doc, ACCENT); doc.setLineWidth(0.6);
    doc.line(x, y, ctx.W - ctx.M, y);
    y += 7;

    font(ctx, 13); setText(doc, INK);
    lines.forEach(function (line) {
      var wrapped = doc.splitTextToSize(line, ctx.W - 2 * ctx.M);
      wrapped.forEach(function (w) {
        doc.text(w, x, y);
        y += 13 * ctx.scale * PT * 1.45;
      });
    });
    return y + 3;
  }

  function footer(ctx, note) {
    var doc = ctx.doc;
    font(ctx, 9); setText(doc, LIGHT);
    doc.setFontSize(9);
    doc.text("Wrkshets - free printable worksheets", ctx.M, ctx.H - 9);
    if (note) doc.text(note, ctx.W - ctx.M, ctx.H - 9, { align: "right" });
  }

  function textMid(doc, str, x, y, opts) {
    var o = { align: "center", baseline: "middle" };
    if (opts) for (var k in opts) o[k] = opts[k];
    doc.text(str, x, y, o);
  }

  // ---------- Word scramble ----------

  function drawScramble(ctx, pz, answer) {
    var doc = ctx.doc;
    var y = header(ctx, "Word Scramble", [
      "The letters in each word are mixed up.",
      "Put the letters in the right order. Write the word on the line."
    ].concat(pz.bank ? ["Use the Word Bank at the bottom of the page if you need help."] : []), answer);

    var bankH = pz.bank ? 34 * ctx.scale : 0;
    var bottom = ctx.H - ctx.M - 6 - bankH;
    var rowH = Math.min(22 * ctx.scale, (bottom - y) / pz.items.length);
    var maxLen = Math.max.apply(null, pz.items.map(function (i) { return i.word.length; }));
    var contentW = ctx.W - 2 * ctx.M;
    var box = Math.min(10 * ctx.scale, rowH * 0.62, (contentW * 0.52 - 14) / maxLen);
    var lettersX = ctx.M + 12;
    var lineX = lettersX + maxLen * box + 10;

    pz.items.forEach(function (it, n) {
      var cy = y + rowH / 2;
      font(ctx, 14, "bold"); setText(doc, SOFT);
      textMid(doc, n + 1 + ".", ctx.M + 4, cy);

      doc.setLineWidth(0.35); setDraw(doc, SOFT);
      for (var i = 0; i < it.scrambled.length; i++) {
        var bx = lettersX + i * box;
        doc.roundedRect(bx + 0.6, cy - box / 2 + 0.6, box - 1.2, box - 1.2, 1.2, 1.2, "S");
        font(ctx, Math.min(18, box / PT / ctx.scale * 0.62), "bold"); setText(doc, INK);
        textMid(doc, it.scrambled[i], bx + box / 2, cy + 0.3);
      }

      setDraw(doc, INK); doc.setLineWidth(0.4);
      var baseY = cy + box / 2 - 0.5;
      doc.line(lineX, baseY, ctx.W - ctx.M, baseY);
      if (answer) {
        font(ctx, 16, "bold"); setText(doc, ACCENT);
        doc.text(it.word, lineX + 3, baseY - 2);
      } else if (pz.hint) {
        font(ctx, 10); setText(doc, SOFT);
        doc.text("Starts with " + it.word[0], ctx.W - ctx.M, baseY + 4, { align: "right" });
      }
      y += rowH;
    });

    if (pz.bank) drawWordBank(ctx, "Word Bank", pz.bank, ctx.H - ctx.M - 6 - bankH + 4, bankH - 4, false);
    footer(ctx);
  }

  function drawWordBank(ctx, title, words, top, h, checkboxes) {
    var doc = ctx.doc;
    var w = ctx.W - 2 * ctx.M;
    setDraw(doc, LIGHT); doc.setLineWidth(0.4);
    doc.roundedRect(ctx.M, top, w, h, 3, 3, "S");
    font(ctx, 11, "bold"); setText(doc, ACCENT);
    doc.text(title, ctx.M + 5, top + 6.5 * ctx.scale);
    var cols = ctx.scale > 1 ? 3 : 4;
    var colW = (w - 10) / cols;
    var lineH = 7 * ctx.scale;
    var startY = top + 7 * ctx.scale + lineH;
    font(ctx, 12); setText(doc, INK);
    words.forEach(function (word, i) {
      var cx = ctx.M + 5 + (i % cols) * colW;
      var cy = startY + Math.floor(i / cols) * lineH;
      if (checkboxes) {
        setDraw(doc, SOFT); doc.setLineWidth(0.3);
        doc.rect(cx, cy - 3.6 * ctx.scale, 3.8 * ctx.scale, 3.8 * ctx.scale, "S");
        doc.text(word, cx + 6 * ctx.scale, cy);
      } else {
        doc.text(word, cx, cy);
      }
    });
  }

  // ---------- Word search ----------

  function drawWordSearch(ctx, pz, answer) {
    var doc = ctx.doc;
    var y = header(ctx, "Word Search", [
      "Find each word from the list in the grid of letters. Circle it.",
      pz.dirsNote + " Tick the box next to each word you find."
    ], answer);

    var cols = ctx.scale > 1 ? 3 : 4;
    var listH = (7 * ctx.scale + 7 * ctx.scale * Math.ceil(pz.words.length / cols)) + 8;
    var availH = ctx.H - ctx.M - 8 - listH - y - 4;
    var contentW = ctx.W - 2 * ctx.M;
    var cell = Math.min(contentW / pz.size, availH / pz.size, 14);
    var gw = cell * pz.size;
    var gx = (ctx.W - gw) / 2, gy = y;

    if (answer) {
      doc.setLineCap("round");
      doc.setLineWidth(cell * 0.72);
      setDraw(doc, HILITE);
      pz.placed.forEach(function (p) {
        doc.line(gx + (p.x0 + 0.5) * cell, gy + (p.y0 + 0.5) * cell, gx + (p.x1 + 0.5) * cell, gy + (p.y1 + 0.5) * cell);
      });
      doc.setLineCap("butt");
    }

    // Faint guide lines help keep your place when scanning.
    setDraw(doc, [228, 228, 228]); doc.setLineWidth(0.2);
    for (var i = 1; i < pz.size; i++) {
      doc.line(gx + i * cell, gy, gx + i * cell, gy + gw);
      doc.line(gx, gy + i * cell, gx + gw, gy + i * cell);
    }
    setDraw(doc, SOFT); doc.setLineWidth(0.5);
    doc.roundedRect(gx, gy, gw, gw, 2, 2, "S");

    var onPath = {};
    pz.placed.forEach(function (p) {
      var dx = Math.sign(p.x1 - p.x0), dy = Math.sign(p.y1 - p.y0);
      for (var k = 0; k < p.word.length; k++) onPath[(p.x0 + dx * k) + "," + (p.y0 + dy * k)] = true;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(Math.min(20, (cell / PT) * 0.55));
    for (var r = 0; r < pz.size; r++) {
      for (var c = 0; c < pz.size; c++) {
        setText(doc, answer && !onPath[c + "," + r] ? LIGHT : INK);
        textMid(doc, pz.grid[r][c], gx + (c + 0.5) * cell, gy + (r + 0.5) * cell + 0.2);
      }
    }

    drawWordBank(ctx, "Words to find (" + pz.words.length + ")", pz.words, gy + gw + 6, listH, true);
    footer(ctx);
  }

  // ---------- Handwriting guide lines + tracing ----------

  // Draws a writing row: top line, dashed middle, baseline. Returns cap height in mm.
  function guideRow(ctx, x0, x1, base, capH) {
    var doc = ctx.doc;
    setDraw(doc, LIGHT); doc.setLineWidth(0.3);
    doc.line(x0, base - capH, x1, base - capH);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(x0, base - capH / 2, x1, base - capH / 2);
    solid(doc);
    setDraw(doc, SOFT); doc.setLineWidth(0.45);
    doc.line(x0, base, x1, base);
  }

  function traceText(ctx, str, x, base, sizePt, model) {
    var doc = ctx.doc;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(sizePt);
    if (model) {
      setText(doc, INK);
      doc.text(str, x, base);
    } else {
      // Dotted outline letters to trace over.
      setDraw(doc, TRACE); setText(doc, TRACE);
      doc.setLineWidth(0.35);
      doc.setLineDashPattern([0.6, 0.7], 0);
      doc.text(str, x, base, { renderingMode: "stroke" });
      solid(doc);
    }
    return doc.getTextWidth(str);
  }

  function drawTracePage(ctx, title, intro, rows) {
    var doc = ctx.doc;
    var y = header(ctx, title, intro, false);
    var bottom = ctx.H - ctx.M - 8;
    var rowH = (bottom - y) / rows.length;
    var longest = Math.max.apply(null, rows.map(function (r) { return r.trace.length; }));
    // Whole words need smaller letters so a few practice copies fit on each row.
    var capH = Math.min(rowH * 0.5, (longest > 2 ? 11 : 18) * ctx.scale);
    var sizePt = capH / 0.718 / PT; // Helvetica cap height is ~0.718 em
    var x0 = ctx.M, x1 = ctx.W - ctx.M;

    rows.forEach(function (row, i) {
      var base = y + rowH * i + rowH * 0.5 + capH / 2;
      guideRow(ctx, x0, x1, base, capH);
      var x = x0 + 3;
      var wModel = traceText(ctx, row.model, x, base, sizePt, true);
      x += wModel + 6;
      setDraw(doc, LIGHT); doc.setLineWidth(0.3);
      doc.line(x - 3, base - capH - 2, x - 3, base + 2);
      var gap = Math.max(5, capH * 0.5);
      while (true) {
        doc.setFontSize(sizePt);
        var w = doc.getTextWidth(row.trace);
        if (x + w > x1 - 2) break;
        traceText(ctx, row.trace, x, base, sizePt, false);
        x += w + gap;
      }
      if (row.word) {
        font(ctx, 11); setText(doc, SOFT);
        doc.text(row.word, x1, base - capH - 2.5, { align: "right" });
      }
    });
    footer(ctx);
  }

  // ---------- ABC ----------

  function drawAbc(ctx, pz, answer) {
    var doc = ctx.doc;
    if (pz.activity === "trace") {
      return drawTracePage(ctx, "ABC - Trace the Letters", [
        "Look at the dark letter at the start of each row.",
        "Trace over the dotted letters with a pencil. Go from left to right."
      ], pz.rows);
    }

    if (pz.activity === "missing") {
      var y = header(ctx, "ABC - Missing Letters", [
        "Each row is part of the alphabet in order (A, B, C ...).",
        "Some letters are missing. Write the missing letter in each empty box."
      ], answer);
      drawSequenceRows(ctx, y, pz.items.map(function (row) {
        return row.map(function (c) { return { text: c.ch, blank: c.blank }; });
      }), answer);
      return footer(ctx, "Tip: say the alphabet out loud");
    }

    if (pz.activity === "order") {
      var y2 = header(ctx, "ABC Order", [
        "Put each group of words in ABC order (alphabetical order).",
        "Look at the first letter of each word. Write the words on the lines, from A to Z."
      ], answer);
      var cols = 2;
      var colW = (ctx.W - 2 * ctx.M - 8) / cols;
      var rowsN = Math.ceil(pz.groups.length / cols);
      var cellH = (ctx.H - ctx.M - 10 - y2) / rowsN;
      pz.groups.forEach(function (g, i) {
        var gx = ctx.M + (i % cols) * (colW + 8);
        var gy = y2 + Math.floor(i / cols) * cellH;
        setDraw(doc, LIGHT); doc.setLineWidth(0.4);
        doc.roundedRect(gx, gy, colW, cellH - 6, 3, 3, "S");
        font(ctx, 11, "bold"); setText(doc, ACCENT);
        doc.text("Group " + (i + 1), gx + 5, gy + 7);
        font(ctx, 13, "bold"); setText(doc, INK);
        doc.text(g.shown.join("   "), gx + 5, gy + 7 + 8 * ctx.scale, { maxWidth: colW - 10 });
        var lineTop = gy + 7 + 14 * ctx.scale;
        var lh = (gy + cellH - 9 - lineTop) / g.sorted.length;
        g.sorted.forEach(function (w, k) {
          var by = lineTop + lh * (k + 1) - 1;
          font(ctx, 12); setText(doc, SOFT);
          doc.text(k + 1 + ".", gx + 5, by);
          setDraw(doc, SOFT); doc.setLineWidth(0.3);
          doc.line(gx + 13, by, gx + colW - 6, by);
          if (answer) { font(ctx, 13, "bold"); setText(doc, ACCENT); doc.text(w, gx + 15, by - 1.5); }
        });
      });
      return footer(ctx);
    }

    // match
    var y3 = header(ctx, "ABC - Match the Letters", [
      "Each big letter (uppercase) has a small letter (lowercase) partner.",
      "Draw a line from each big letter to its matching small letter."
    ], answer);
    drawMatch(ctx, y3, pz.left, pz.right, answer);
    footer(ctx);
  }

  function drawMatch(ctx, y, left, right, answer) {
    var doc = ctx.doc;
    var rowH = Math.min(22 * ctx.scale, (ctx.H - ctx.M - 10 - y) / left.length);
    var lx = ctx.M + 30, rx = ctx.W - ctx.M - 30;
    var r = Math.min(9 * ctx.scale, rowH * 0.4);
    var pos = function (i) { return y + rowH * (i + 0.5); };
    if (answer) {
      setDraw(doc, ACCENT); doc.setLineWidth(0.8);
      left.forEach(function (L, i) {
        var j = right.indexOf(L.toLowerCase());
        doc.line(lx + r + 4, pos(i), rx - r - 4, pos(j));
      });
    }
    left.forEach(function (L, i) {
      setDraw(doc, SOFT); doc.setLineWidth(0.4);
      doc.circle(lx, pos(i), r, "S");
      font(ctx, 20, "bold"); setText(doc, INK);
      textMid(doc, L, lx, pos(i) + 0.3);
      setFill(doc, INK); doc.circle(lx + r + 4, pos(i), 1.3, "F");
    });
    right.forEach(function (l, i) {
      setDraw(doc, SOFT); doc.setLineWidth(0.4);
      doc.circle(rx, pos(i), r, "S");
      font(ctx, 20, "bold"); setText(doc, INK);
      textMid(doc, l, rx, pos(i) - 0.3);
      setFill(doc, INK); doc.circle(rx - r - 4, pos(i), 1.3, "F");
    });
  }

  // Rows of boxes where some are blank (used for missing letters / numbers).
  function drawSequenceRows(ctx, y, rows, answer) {
    var doc = ctx.doc;
    var maxCells = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var contentW = ctx.W - 2 * ctx.M - 12;
    var rowH = Math.min(24 * ctx.scale, (ctx.H - ctx.M - 12 - y) / rows.length);
    var gap = 3.5;
    var box = Math.min(rowH * 0.78, (contentW - gap * (maxCells - 1)) / maxCells);
    rows.forEach(function (row, i) {
      var cy = y + rowH * (i + 0.5);
      font(ctx, 12, "bold"); setText(doc, SOFT);
      textMid(doc, i + 1 + ".", ctx.M + 4, cy);
      row.forEach(function (c, j) {
        var bx = ctx.M + 12 + j * (box + gap);
        doc.setLineWidth(c.blank ? 0.6 : 0.3);
        setDraw(doc, c.blank ? INK : LIGHT);
        if (c.blank) setFill(doc, [255, 255, 255]);
        doc.roundedRect(bx, cy - box / 2, box, box, 2, 2, "S");
        var sz = Math.min(24, (box / PT) * (c.text.length > 2 ? 0.38 : 0.5));
        doc.setFont("helvetica", "bold"); doc.setFontSize(sz);
        if (!c.blank) { setText(doc, INK); textMid(doc, c.text, bx + box / 2, cy + 0.3); }
        else if (answer) { setText(doc, ACCENT); textMid(doc, c.text, bx + box / 2, cy + 0.3); }
      });
    });
  }

  // ---------- 1 2 3 4 ----------

  function drawShape(doc, shape, cx, cy, s) {
    var r = s / 2;
    switch (shape) {
      case "circle": doc.circle(cx, cy, r, "S"); break;
      case "square": doc.rect(cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7, "S"); break;
      case "triangle": doc.triangle(cx, cy - r, cx + r, cy + r * 0.8, cx - r, cy + r * 0.8, "S"); break;
      case "diamond": polygon(doc, [[cx, cy - r], [cx + r * 0.75, cy], [cx, cy + r], [cx - r * 0.75, cy]]); break;
      case "star":
        var pts = [];
        for (var i = 0; i < 10; i++) {
          var rr = i % 2 ? r * 0.42 : r;
          var a = ((-90 + i * 36) * Math.PI) / 180;
          pts.push([cx + rr * Math.cos(a), cy + 0.08 * r + rr * Math.sin(a)]);
        }
        polygon(doc, pts); break;
      case "heart":
        var hp = [];
        for (var k = 0; k < 24; k++) {
          var t = (k / 24) * 2 * Math.PI;
          hp.push([cx + (r / 17) * 16 * Math.pow(Math.sin(t), 3),
            cy - (r / 17) * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - r * 0.1]);
        }
        polygon(doc, hp); break;
    }
  }

  function polygon(doc, pts, style) {
    var deltas = [];
    for (var i = 1; i < pts.length; i++) deltas.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
    doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], style || "S", true);
  }

  var SHAPE_NAMES = { circle: "circles", square: "squares", triangle: "triangles", star: "stars", diamond: "diamonds", heart: "hearts" };

  function drawNumbers(ctx, pz, answer) {
    var doc = ctx.doc;
    if (pz.activity === "trace") {
      return drawTracePage(ctx, "1 2 3 - Trace the Numbers", [
        "Look at the dark number at the start of each row.",
        "Trace over the dotted numbers with a pencil. Go from left to right."
      ], pz.rows);
    }

    if (pz.activity === "missing") {
      var y = header(ctx, "1 2 3 - Missing Numbers", [
        "Each row of numbers follows a pattern. Some numbers are missing.",
        "Find the pattern. Write the missing number in each empty box."
      ], answer);
      drawSequenceRows(ctx, y, pz.items.map(function (row) {
        return row.cells.map(function (c) { return { text: String(c.v), blank: c.blank }; });
      }), answer);
      return footer(ctx, "Tip: check how much each number goes up or down");
    }

    if (pz.activity === "count") {
      var y2 = header(ctx, "1 2 3 - Count the Shapes", [
        "Count the shapes in each box. Touch or tick each shape as you count it.",
        "Write how many shapes there are in the answer box."
      ], answer);
      var cols = 2;
      var gap = 8;
      var bw = (ctx.W - 2 * ctx.M - gap) / cols;
      var rowsN = Math.ceil(pz.boxes.length / cols);
      var bh = (ctx.H - ctx.M - 10 - y2) / rowsN - gap;
      pz.boxes.forEach(function (b, i) {
        var bx = ctx.M + (i % cols) * (bw + gap);
        var by = y2 + Math.floor(i / cols) * (bh + gap);
        setDraw(doc, LIGHT); doc.setLineWidth(0.4);
        doc.roundedRect(bx, by, bw, bh, 3, 3, "S");
        var perRow = 5;
        var shapeRows = Math.ceil(b.n / perRow);
        var ansH = 14 * ctx.scale;
        var area = bh - ansH - 6;
        var s = Math.min((bw - 12) / perRow * 0.72, area / Math.max(shapeRows, 2) * 0.72);
        var stepX = (bw - 12) / perRow, stepY = area / Math.max(shapeRows, 2);
        setDraw(doc, INK); doc.setLineWidth(0.5);
        for (var k = 0; k < b.n; k++) {
          var cx = bx + 6 + stepX * (k % perRow + 0.5);
          var cy = by + 3 + (area - stepY * shapeRows) / 2 + stepY * (Math.floor(k / perRow) + 0.5);
          drawShape(doc, b.shape, cx, cy, s);
        }
        var ay = by + bh - ansH / 2 - 3;
        font(ctx, 12); setText(doc, INK);
        doc.text("How many " + SHAPE_NAMES[b.shape] + "?", bx + 6, ay + 1.5);
        var abW = 18 * ctx.scale;
        setDraw(doc, INK); doc.setLineWidth(0.5);
        doc.roundedRect(bx + bw - abW - 6, ay - ansH / 2 + 1, abW, ansH - 2, 2, 2, "S");
        if (answer) { font(ctx, 16, "bold"); setText(doc, ACCENT); textMid(doc, String(b.n), bx + bw - abW / 2 - 6, ay); }
      });
      return footer(ctx);
    }

    // math
    var y3 = header(ctx, pz.problems.some(function (p) { return p.op === "-"; }) ? "1 2 3 - Add and Subtract" : "1 2 3 - Addition", [
      "Solve each problem. Write the answer under the line.",
      "+ means add (put together).   - means subtract (take away)."
    ], answer);
    var cols2 = 4;
    var rows2 = Math.ceil(pz.problems.length / cols2);
    var cw = (ctx.W - 2 * ctx.M) / cols2;
    var ch = (ctx.H - ctx.M - 10 - y3) / rows2;
    var fs = Math.min(26, ch / PT * 0.2) * Math.min(ctx.scale, 1.15);
    pz.problems.forEach(function (p, i) {
      var col = i % cols2, row = Math.floor(i / cols2);
      var right = ctx.M + col * cw + cw * 0.68;
      var top = y3 + row * ch + ch * 0.1;
      var lh = fs * PT * 1.25;
      font(ctx, 10, "bold"); setText(doc, LIGHT);
      doc.text("(" + (i + 1) + ")", ctx.M + col * cw + 2, top + lh * 0.6);
      doc.setFont("helvetica", "bold"); doc.setFontSize(fs); setText(doc, INK);
      doc.text(String(p.a), right, top + lh, { align: "right" });
      doc.text(String(p.b), right, top + lh * 2, { align: "right" });
      doc.text(p.op === "-" ? "\u2013" : "+", right - doc.getTextWidth("00") - 7, top + lh * 2, { align: "right" });
      setDraw(doc, INK); doc.setLineWidth(0.6);
      doc.line(right - doc.getTextWidth("00") - 10, top + lh * 2 + 2.5, right + 2, top + lh * 2 + 2.5);
      if (answer) { setText(doc, ACCENT); doc.text(String(p.ans), right, top + lh * 3.1, { align: "right" }); }
    });
    footer(ctx);
  }

  // ---------- Connect the dots ----------

  function drawDots(ctx, pz, answer) {
    var doc = ctx.doc;
    var first = pz.labels[0], last = pz.labels[pz.labels.length - 1];
    var y = header(ctx, answer ? "Connect the Dots - " + pz.label : "Connect the Dots", [
      "Start at the dot marked " + first + ". Draw a line to " + pz.labels[1] + ", then " + pz.labels[2] +
        (pz.letters ? ", and keep going in ABC order." : ", and keep counting up."),
      "When you reach " + last + ", draw a line back to " + first + ". What picture did you make?"
    ], answer);

    var bottom = ctx.H - ctx.M - 22;
    var size = Math.min(ctx.W - 2 * ctx.M - 24, bottom - y - 16);
    // Scale the picture to fill the drawing area, keeping its proportions.
    var xs = pz.points.map(function (p) { return p[0]; }), ys = pz.points.map(function (p) { return p[1]; });
    var minX = Math.min.apply(null, xs), minY = Math.min.apply(null, ys);
    var bw = Math.max.apply(null, xs) - minX, bh = Math.max.apply(null, ys) - minY;
    var k = size / Math.max(bw, bh);
    var ox = (ctx.W - bw * k) / 2, oy = y + 6 + (bottom - y - 10 - bh * k) / 2;
    var P = pz.points.map(function (p) { return [ox + (p[0] - minX) * k, oy + (p[1] - minY) * k]; });
    var cx = 0, cy = 0;
    P.forEach(function (p) { cx += p[0]; cy += p[1]; });
    cx /= P.length; cy /= P.length;

    if (answer) {
      setDraw(doc, ACCENT); doc.setLineWidth(0.9);
      polygon(doc, P);
    }

    var many = P.length > 30;
    var dotR = (many ? 1.1 : 1.4) * Math.min(ctx.scale, 1.2);
    var fsz = (many ? 10 : 12) * ctx.scale;
    P.forEach(function (p, i) {
      setFill(doc, INK);
      doc.circle(p[0], p[1], i === 0 ? dotR * 1.6 : dotR, "F");
      // Place the label just outside the shape, away from the centre.
      var prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
      var nx = -(next[1] - prev[1]), ny = next[0] - prev[0]; // edge normal
      var len = Math.hypot(nx, ny) || 1;
      nx /= len; ny /= len;
      if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) { nx = -nx; ny = -ny; }
      var off = 3 + fsz * PT * 0.45;
      doc.setFont("helvetica", i === 0 ? "bold" : "normal");
      doc.setFontSize(fsz);
      setText(doc, i === 0 ? ACCENT : INK);
      textMid(doc, pz.labels[i], p[0] + nx * off, p[1] + ny * off);
    });

    if (!answer) {
      font(ctx, 13); setText(doc, INK);
      doc.text("My picture is a:", ctx.M, ctx.H - ctx.M - 6);
      setDraw(doc, SOFT); doc.setLineWidth(0.4);
      doc.line(ctx.M + doc.getTextWidth("My picture is a:") + 4, ctx.H - ctx.M - 5, ctx.M + 110, ctx.H - ctx.M - 5);
    } else {
      font(ctx, 13, "bold"); setText(doc, ACCENT);
      doc.text("The picture is a " + pz.label.toLowerCase() + ".", ctx.M, ctx.H - ctx.M - 6);
    }
    footer(ctx, pz.points.length + " dots");
  }

  // ---------- Document assembly ----------

  var TYPES = {
    scramble: { label: "Word Scramble", draw: drawScramble, key: function () { return true; } },
    wordsearch: { label: "Word Search", draw: drawWordSearch, key: function () { return true; } },
    abc: { label: "ABC", draw: drawAbc, key: function (s) { return s.abcActivity !== "trace"; } },
    numbers: { label: "1 2 3 4", draw: drawNumbers, key: function (s) { return s.numActivity !== "trace"; } },
    dots: { label: "Connect the Dots", draw: drawDots, key: function () { return true; } }
  };

  /* settings: { type, difficulty, theme, customWords, pages, answerKey, largePrint,
   *             nameLine, paper, abcActivity, numActivity, shape, dotLabels, seed }
   * type may be "bundle" for one page of each worksheet type. */
  function buildPdf(JsPDF, settings) {
    var doc = new JsPDF({ unit: "mm", format: settings.paper === "a4" ? "a4" : "letter" });
    var ctx = {
      doc: doc,
      W: doc.internal.pageSize.getWidth(),
      H: doc.internal.pageSize.getHeight(),
      M: 16,
      scale: settings.largePrint ? 1.3 : 1,
      settings: settings
    };
    var seed = settings.seed >>> 0;
    var shapeOrder = WS.makeRng(seed ^ 0x5eed).shuffle(Object.keys(WS.SHAPES));

    var jobs = [];
    if (settings.type === "bundle") {
      ["wordsearch", "scramble", "abc", "numbers", "dots"].forEach(function (t, i) {
        jobs.push({ type: t, page: 0, rngSeed: seed + i * 7919 });
      });
    } else {
      var pages = Math.max(1, Math.min(20, settings.pages | 0 || 1));
      for (var i = 0; i < pages; i++) jobs.push({ type: settings.type, page: i, rngSeed: seed + i * 7919 });
    }

    var keys = [];
    jobs.forEach(function (job, n) {
      var rng = WS.makeRng(job.rngSeed);
      var pz = WS.puzzles[job.type](settings, rng, job.page, shapeOrder);
      if (n > 0) doc.addPage();
      TYPES[job.type].draw(ctx, pz, false);
      if (settings.answerKey && TYPES[job.type].key(settings)) keys.push({ type: job.type, pz: pz });
    });
    keys.forEach(function (k) {
      doc.addPage();
      TYPES[k.type].draw(ctx, k.pz, true);
    });
    return doc;
  }

  WS.TYPES = TYPES;
  WS.buildPdf = buildPdf;
})(typeof window !== "undefined" ? window : globalThis);
