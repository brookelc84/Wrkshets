/* Spelling Practice: look, say, write, check — with harder words at higher levels. */
(function (root) {
  var WS = (root.WS = root.WS || {});

  var LEVELS = [
    { count: 6, min: 3, max: 4 }, { count: 8, min: 3, max: 5 }, { count: 10, min: 4, max: 6 },
    { count: 10, min: 5, max: 8 }, { count: 10, min: 7, max: 11 }, { count: 10, min: 9, max: 15 }
  ];

  function generate(settings, rng) {
    var lv = LEVELS[settings.level - 1];
    var count = settings.largePrint ? Math.max(5, Math.round(lv.count * 0.7)) : lv.count;
    return { words: WS.pickWords(WS.wordPool(settings), count, lv.min, lv.max, rng) };
  }

  function draw(ctx, pz) {
    var D = WS.draw, doc = ctx.doc, L = ctx.settings.level;
    var sentence = L >= 5;
    var y = D.header(ctx, "Spelling Practice", [
      L <= 2 ? "Look at the word and say it out loud. Trace it, then write it two more times."
        : "Look at the word and say it. Write it, then fold the page to cover the word and write it from memory.",
      sentence ? "Then use the word in a sentence of your own." : "Check your spelling against the word in the first column."
    ], false);
    var heads = L <= 2 ? ["Word", "Trace", "Write", "Write again"] : ["Word", "Write", "Write again", "Cover and write"];
    var colW = (ctx.W - 2 * ctx.M) / 4;
    D.font(ctx, 10, "bold"); D.setText(doc, D.ACCENT);
    heads.forEach(function (h, i) { doc.text(h.toUpperCase(), ctx.M + i * colW + 2, y + 2); });
    y += 5;
    var rowH = (ctx.H - ctx.M - 10 - y) / pz.words.length;
    pz.words.forEach(function (w, i) {
      var top = y + i * rowH;
      var writeH = sentence ? rowH * 0.55 : rowH;
      var capH = Math.min(writeH * 0.36, 9 * ctx.scale);
      var base = top + writeH * 0.5 + capH / 2 + 1;
      var word = L <= 2 ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase();
      var sizePt = Math.min(capH / 0.718 / D.PT, (colW - 6) / (word.length * 0.6) / D.PT);
      for (var c = 1; c < 4; c++) D.guideRow(ctx, ctx.M + c * colW + 2, ctx.M + (c + 1) * colW - 2, base, capH);
      doc.setFont("helvetica", "bold"); doc.setFontSize(sizePt); D.setText(doc, D.INK);
      doc.text(word, ctx.M + 2, base);
      if (L <= 2) D.traceText(ctx, word, ctx.M + colW + 4, base, sizePt, false);
      if (sentence) {
        var sy = top + rowH - 4;
        D.font(ctx, 10); D.setText(doc, D.SOFT); doc.text("Sentence:", ctx.M + 2, sy);
        D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.3);
        doc.line(ctx.M + 22, sy + 0.5, ctx.W - ctx.M, sy + 0.5);
      }
      D.setDraw(doc, [230, 228, 222]); doc.setLineWidth(0.25);
      doc.line(ctx.M, top + rowH, ctx.W - ctx.M, top + rowH);
    });
    D.footer(ctx, "Level " + L);
  }

  WS.registerType("spelling", {
    label: "Spelling Practice", generate: generate, draw: draw,
    key: function () { return false; },
    describe: function (L) {
      var lv = LEVELS[L - 1];
      return lv.count + " words of " + lv.min + "–" + lv.max + " letters" + (L <= 2 ? ", with tracing" : L >= 5 ? ", plus a sentence for each" : "");
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
