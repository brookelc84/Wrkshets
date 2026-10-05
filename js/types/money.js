/* Money: count coins and notes (levels 1–3), then real-life money problems (levels 4–6).
 * Amounts are kept in the smallest unit (cents/pence) to avoid rounding errors. */
(function (root) {
  var WS = (root.WS = root.WS || {});

  var CURRENCIES = {
    usd: { label: "US dollars ($)", sym: "$", small: "¢", coins: [1, 5, 10, 25], notes: [100, 500, 1000, 2000], noteWord: "bill" },
    cad: { label: "Canadian dollars ($)", sym: "$", small: "¢", coins: [5, 10, 25, 100, 200], notes: [500, 1000, 2000], noteWord: "bill" },
    gbp: { label: "British pounds (£)", sym: "£", small: "p", coins: [1, 2, 5, 10, 20, 50, 100, 200], notes: [500, 1000, 2000], noteWord: "note" },
    eur: { label: "Euros (€)", sym: "€", small: "c", coins: [1, 2, 5, 10, 20, 50, 100, 200], notes: [500, 1000, 2000], noteWord: "note" },
    aud: { label: "Australian dollars ($)", sym: "$", small: "c", coins: [5, 10, 20, 50, 100, 200], notes: [500, 1000, 2000], noteWord: "note" }
  };

  function cur(settings) { return CURRENCIES[settings.currency] || CURRENCIES.usd; }
  function money(c, v) {
    var s = String(Math.abs(Math.round(v)));
    while (s.length < 3) s = "0" + s;
    var whole = s.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (v < 0 ? "–" : "") + c.sym + whole + "." + s.slice(-2);
  }
  function label(c, v) { return v < 100 ? v + c.small : c.sym + v / 100; }
  function moneyOrSmall(c, v) { return v < 100 ? v + c.small : money(c, v); }

  var ITEMS = ["a sandwich", "a coffee", "a notebook", "a bus ticket", "a bag of apples", "a phone charger",
    "a pair of socks", "a book", "a house plant", "a box of tea", "a bottle of shampoo", "a pizza",
    "a movie ticket", "a pack of batteries", "a towel", "a bag of rice", "a T-shirt", "a puzzle book"];

  function price(r, lo, hi, step) { return step * r.int(Math.ceil(lo / step), Math.floor(hi / step)); }

  function wordProblem(L, c, r) {
    var item = r.pick(ITEMS), item2 = r.pick(ITEMS.filter(function (i) { return i !== item; }));
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    var k, p, p2, note;
    if (L === 4) {
      k = r.int(0, 2);
      if (k === 0) { note = r.pick([500, 1000, 2000]); p = price(r, 100, note - 5, 5); return { q: "You buy " + item + " for " + money(c, p) + ". You pay with a " + money(c, note) + " " + c.noteWord + ". How much change do you get?", a: money(c, note - p) }; }
      if (k === 1) { p = price(r, 100, 900, 5); p2 = price(r, 100, 900, 5); return { q: cap(item) + " costs " + money(c, p) + " and " + item2 + " costs " + money(c, p2) + ". What is the total?", a: money(c, p + p2) }; }
      p = price(r, 1000, 3000, 50); p2 = price(r, 100, p - 50, 5);
      return { q: "You have " + money(c, p) + ". You spend " + money(c, p2) + ". How much money is left?", a: money(c, p - p2) };
    }
    if (L === 5) {
      k = r.int(0, 3);
      if (k === 0) {
        var ps = [price(r, 99, 1500, 1), price(r, 99, 1500, 1), price(r, 99, 1500, 1)];
        return { q: "Your shopping list: " + item + " (" + money(c, ps[0]) + "), " + item2 + " (" + money(c, ps[1]) + ") and a snack (" + money(c, ps[2]) + "). What is the total?", a: money(c, ps[0] + ps[1] + ps[2]) };
      }
      if (k === 1) {
        p = price(r, 150, 1800, 1); p2 = price(r, 150, 1800, 1); note = p + p2 < 2000 ? 2000 : 5000;
        return { q: "You buy " + item + " for " + money(c, p) + " and " + item2 + " for " + money(c, p2) + ". You pay with " + money(c, note) + ". How much change do you get?", a: money(c, note - p - p2) };
      }
      if (k === 2) {
        var u4 = r.int(40, 150), u6 = u4 + r.pick([-15, -10, -5, 5, 10]);
        return { q: "A pack of 4 costs " + money(c, u4 * 4) + ". A pack of 6 costs " + money(c, u6 * 6) + ". Which pack costs less for each one?", a: (u6 < u4 ? "Pack of 6 (" : "Pack of 4 (") + money(c, Math.min(u4, u6)) + " each)" };
      }
      p = price(r, 500, 5000, 100); var t = r.pick([5, 6, 8, 10]);
      return { q: cap(item) + " costs " + money(c, p) + ". Tax is " + t + "%. What is the total with tax?", a: money(c, p + Math.round((p * t) / 100)) };
    }
    k = r.int(0, 4);
    if (k === 0) { p = price(r, 1000, 12000, 100); var d = r.pick([10, 15, 20, 25, 30, 40]); return { q: cap(item) + " usually costs " + money(c, p) + ". Today it is " + d + "% off. What is the sale price?", a: money(c, p - Math.round((p * d) / 100)) }; }
    if (k === 1) { p = price(r, 2000, 12000, 1); var tip = r.pick([10, 15, 18, 20]); return { q: "A restaurant bill is " + money(c, p) + ". You leave a " + tip + "% tip. How much is the tip? (Round to 2 decimal places.)", a: money(c, Math.round((p * tip) / 100)) }; }
    if (k === 2) { var inc = price(r, 150000, 400000, 5000); var pct = r.pick([25, 30, 35, 40]); return { q: "You earn " + money(c, inc) + " a month. Rent is " + pct + "% of your pay. How much is rent?", a: money(c, (inc * pct) / 100) }; }
    if (k === 3) { var P = price(r, 50000, 500000, 10000), rate = r.pick([2, 3, 4, 5]), yrs = r.int(2, 5); return { q: "You save " + money(c, P) + " at " + rate + "% simple interest per year. How much interest do you earn after " + yrs + " years?", a: money(c, (P * rate * yrs) / 100) }; }
    p = price(r, 2000, 10000, 100); var off = r.pick([10, 20, 25]), tax = r.pick([5, 8, 10]);
    var sale = p - Math.round((p * off) / 100);
    return { q: "A jacket costs " + money(c, p) + ". It is " + off + "% off, then " + tax + "% tax is added to the sale price. What do you pay?", a: money(c, sale + Math.round((sale * tax) / 100)) };
  }

  function generate(settings, rng) {
    var L = settings.level, c = cur(settings);
    if (L >= 4) {
      var qs = [];
      for (var i = 0; i < (settings.largePrint ? 5 : 8); i++) qs.push(wordProblem(L, c, rng));
      return { mode: "problems", questions: qs, currency: c };
    }
    var boxes = [];
    for (var b = 0; b < (settings.largePrint ? 4 : 6); b++) {
      var pieces = [];
      if (L === 1) {
        var two = c.coins.slice(0, 2);
        for (var n = rng.int(2, 6); n > 0; n--) pieces.push(rng.pick(two));
      } else if (L === 2) {
        var small = c.coins.filter(function (v) { return v < 100; });
        for (var m = rng.int(3, 7); m > 0; m--) pieces.push(rng.pick(small));
      } else {
        for (var k = rng.int(1, 2); k > 0; k--) pieces.push(rng.pick(c.notes.slice(0, 3)));
        for (var j = rng.int(2, 6); j > 0; j--) pieces.push(rng.pick(c.coins));
      }
      pieces.sort(function (x, y) { return y - x; });
      boxes.push({ pieces: pieces, total: pieces.reduce(function (s, v) { return s + v; }, 0) });
    }
    return { mode: "count", boxes: boxes, currency: c };
  }

  function drawPiece(ctx, c, v, x, y, unit) {
    var D = WS.draw, doc = ctx.doc;
    var isNote = c.notes.indexOf(v) >= 0;
    D.setDraw(doc, D.INK); doc.setLineWidth(0.45);
    if (isNote) {
      var w = unit * 2.2, h = unit * 1.1;
      doc.roundedRect(x, y - h / 2, w, h, 1, 1, "S");
      doc.setLineWidth(0.2); doc.rect(x + 1.2, y - h / 2 + 1.2, w - 2.4, h - 2.4, "S");
      doc.setFont("helvetica", "bold"); doc.setFontSize(unit * 0.5 / D.PT); D.setText(doc, D.INK);
      D.textMid(doc, label(c, v), x + w / 2, y);
      return w;
    }
    var rank = c.coins.indexOf(v), rr = unit * (0.36 + 0.07 * rank / Math.max(1, c.coins.length - 1) * 2);
    doc.circle(x + rr, y, rr, "S");
    doc.setLineWidth(0.2); doc.circle(x + rr, y, rr * 0.82, "S");
    doc.setFont("helvetica", "bold"); doc.setFontSize(Math.max(6, (rr * 0.75) / D.PT)); D.setText(doc, D.INK);
    D.textMid(doc, label(c, v), x + rr, y);
    return rr * 2;
  }

  function draw(ctx, pz, answer) {
    var D = WS.draw, doc = ctx.doc, c = pz.currency, L = ctx.settings.level;
    if (pz.mode === "problems") {
      var y = D.header(ctx, "Money - Real-Life Problems", [
        "Read each problem. Work out the amount of money.",
        "Use the space under each problem to show your working."
      ], answer);
      var rowH = (ctx.H - ctx.M - 12 - y) / pz.questions.length;
      pz.questions.forEach(function (q, i) {
        var top = y + i * rowH;
        D.font(ctx, 12.5, "bold"); D.setText(doc, D.SOFT); doc.text((i + 1) + ".", ctx.M, top + 6);
        D.font(ctx, 12.5); D.setText(doc, D.INK);
        var lines = doc.splitTextToSize(q.q, ctx.W - 2 * ctx.M - 10);
        doc.text(lines, ctx.M + 9, top + 6);
        var ly = top + rowH - 5;
        D.font(ctx, 12); D.setText(doc, D.SOFT); doc.text("Answer:", ctx.W - ctx.M - 82, ly);
        D.setDraw(doc, D.SOFT); doc.setLineWidth(0.35);
        doc.line(ctx.W - ctx.M - 62, ly + 1, ctx.W - ctx.M, ly + 1);
        if (answer) { D.font(ctx, 12.5, "bold"); D.setText(doc, D.ACCENT); doc.text(q.a, ctx.W - ctx.M - 60, ly - 0.5); }
      });
      return D.footer(ctx, "Level " + L + " · " + c.label);
    }

    var y2 = D.header(ctx, "Money - Count It Up", [
      "Add up the money in each box. Start with the biggest amount and count on.",
      "Write the total in the answer box."
    ], answer);
    var cols = 2, gap = 8;
    var bw = (ctx.W - 2 * ctx.M - gap) / cols;
    var rows = Math.ceil(pz.boxes.length / cols);
    var bh = (ctx.H - ctx.M - 10 - y2) / rows - gap;
    pz.boxes.forEach(function (b, i) {
      var bx = ctx.M + (i % cols) * (bw + gap), by = y2 + Math.floor(i / cols) * (bh + gap);
      D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.4);
      doc.roundedRect(bx, by, bw, bh, 3, 3, "S");
      var unit = Math.min(20 * ctx.scale, bh / 3.4);
      var x = bx + 5, rowY = by + 5 + unit * 0.6;
      b.pieces.forEach(function (v) {
        var w = c.notes.indexOf(v) >= 0 ? unit * 2.2 : unit * 0.86;
        if (x + w > bx + bw - 4) { x = bx + 5; rowY += unit * 1.3; }
        x += drawPiece(ctx, c, v, x, rowY, unit) + 3;
      });
      var ay = by + bh - 9 * ctx.scale;
      D.font(ctx, 12); D.setText(doc, D.INK); doc.text("Total:", bx + 5, ay + 1.5);
      var aw = 30 * ctx.scale, ah = 11 * ctx.scale;
      D.setDraw(doc, D.INK); doc.setLineWidth(0.5);
      doc.roundedRect(bx + bw - aw - 5, ay - ah / 2, aw, ah, 2, 2, "S");
      if (answer) { D.font(ctx, 14, "bold"); D.setText(doc, D.ACCENT); D.textMid(doc, moneyOrSmall(c, b.total), bx + bw - aw / 2 - 5, ay); }
    });
    D.footer(ctx, "Level " + L + " · " + c.label);
  }

  WS.CURRENCIES = CURRENCIES;
  WS.registerType("money", {
    label: "Money", generate: generate, draw: draw,
    key: function () { return true; },
    describe: function (L) {
      return ["Count the two smallest coins", "Count coins up to one dollar/pound/euro", "Count notes and coins together",
        "Make change, add two prices, money left over", "Shopping totals, best buy, sales tax",
        "Discounts, tips, budgets and interest"][L - 1];
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
