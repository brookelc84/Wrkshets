/* Math Practice: from counting sums (level 1) to algebra, exponents and roots (level 6). */
(function (root) {
  var WS = (root.WS = root.WS || {});

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function neg(n) { return n < 0 ? "(–" + Math.abs(n) + ")" : String(n); }
  function num(n) { return n < 0 ? "–" + Math.abs(n) : String(n); }
  function dec(scaled, places) {
    var sign = scaled < 0 ? "–" : "";
    var s = String(Math.abs(scaled));
    while (s.length <= places) s = "0" + s;
    return places ? sign + s.slice(0, -places) + "." + s.slice(-places) : sign + s;
  }
  function coef(a) { return a === 1 ? "" : String(a); } // 1x is written as x
  function frac(n, d) { return { f: [String(n), String(d)] }; }
  // Simplified fraction answer; improper fractions also shown as mixed numbers.
  function fracAnswer(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d); n /= g; d /= g;
    if (d === 1) return [num(n)];
    if (Math.abs(n) > d) {
      var w = Math.trunc(n / d), r = Math.abs(n % d);
      return [frac(num(n), d), " = " + num(w) + " ", frac(r, d)];
    }
    return [frac(num(n), d)];
  }

  // ---------- Topic generators. Each returns a problem for the given level. ----------
  // {v: true, a, b, op, ans} is written in columns; otherwise {expr, lead, after, ans} on one line.

  var TOPICS = {
    add: {
      title: "Addition", line: "Add the numbers. Write the answer under the line.",
      make: function (L, r) {
        var a, b;
        if (L === 1) { a = r.int(0, 5); b = r.int(0, 5); }
        else if (L === 2) { a = r.int(2, 15); b = r.int(1, 20 - a); }
        else { var lo = Math.pow(10, L - 1), hi = Math.pow(10, L) - 1; a = r.int(lo, hi); b = r.int(lo, hi); }
        return { v: true, a: a, b: b, op: "+", ans: a + b };
      }
    },
    sub: {
      title: "Subtraction", line: "Subtract the bottom number from the top number. Write the answer under the line.",
      make: function (L, r) {
        var a, b;
        if (L === 1) { a = r.int(1, 10); b = r.int(0, a); }
        else if (L === 2) { a = r.int(5, 20); b = r.int(1, a); }
        else { var lo = Math.pow(10, L - 1), hi = Math.pow(10, L) - 1; a = r.int(lo, hi); b = r.int(Math.floor(lo / 2), a); }
        return { v: true, a: a, b: b, op: "–", ans: a - b };
      }
    },
    mul: {
      title: "Multiplication", line: "Multiply the numbers. Use the space to show your work.",
      make: function (L, r) {
        var a, b;
        if (L <= 2) { a = r.int(1, 5); b = r.int(1, L === 1 ? 3 : 5); }
        else if (L === 3) { a = r.int(2, 10); b = r.int(2, 10); }
        else if (L === 4) { a = r.int(12, 99); b = r() < 0.5 ? r.int(3, 9) : r.int(11, 49); }
        else if (L === 5) { a = r.int(100, 999); b = r.int(11, 99); }
        else { a = r.int(100, 999); b = r.int(101, 999); }
        return { v: true, a: a, b: b, op: "×", ans: a * b };
      }
    },
    div: {
      title: "Division", line: "Divide. If a number is left over, write it as a remainder (R).",
      make: function (L, r) {
        var b, q, rem = 0;
        if (L <= 2) { b = r.int(1, 5); q = r.int(1, 5); }
        else if (L === 3) { b = r.int(2, 10); q = r.int(1, 10); }
        else if (L === 4) { b = r.int(2, 9); q = r.int(11, 120); rem = r.int(0, b - 1); }
        else if (L === 5) { b = r.int(11, 49); q = r.int(21, 250); rem = r.int(0, b - 1); }
        else { b = r.int(12, 99); q = r.int(101, 999); rem = r.int(0, b - 1); }
        var a = b * q + rem;
        return { expr: [a + " ÷ " + b], ans: [q + (rem ? " R" + rem : "")], work: L >= 4 };
      }
    },
    fractions: {
      title: "Fractions", line: "Work out each answer. Write it in simplest form.",
      make: function (L, r) {
        var a, b, c, d, op, n, m;
        if (L <= 3) {
          d = r.int(3, 10); a = r.int(1, d - 1); c = r.int(1, d - 1); b = d;
          op = r() < 0.5 || a === c ? "+" : "–";
          if (op === "–" && a < c) { var t = a; a = c; c = t; }
          if (op === "+" && a + c > d) c = d - a || 1;
        } else if (L === 4) {
          b = r.pick([2, 3, 4, 5]); d = b * r.pick([2, 3]); a = r.int(1, b - 1); c = r.int(1, d - 1);
          op = r.pick(["+", "–"]);
          if (op === "–" && a * d < c * b) op = "+";
        } else {
          b = r.int(2, 9); d = r.int(2, 9); while (d === b) d = r.int(2, 9);
          a = r.int(1, b - 1); c = r.int(1, d - 1);
          op = r.pick(L === 5 ? ["+", "–", "×"] : ["+", "–", "×", "÷"]);
          if (L === 6 && r() < 0.4) a += b * r.int(1, 3); // an improper first fraction
        }
        if (op === "+") { n = a * d + c * b; m = b * d; }
        else if (op === "–") { n = a * d - c * b; m = b * d; }
        else if (op === "×") { n = a * c; m = b * d; }
        else { n = a * d; m = b * c; }
        return { expr: [frac(a, b), " " + op + " ", frac(c, d)], ans: fracAnswer(n, m), tall: true };
      }
    },
    decimals: {
      title: "Decimals", line: "Work out each answer. Line up the decimal points when you add or subtract.",
      make: function (L, r) {
        var p = L <= 4 ? 1 : 2, a, b, op = r.pick(["+", "–"]);
        if (L >= 5 && r() < 0.45) {
          if (L === 5) { a = r.int(11, 999); b = r.int(2, 9); return { expr: [dec(a, 1) + " × " + b], ans: [dec(a * b, 1)] }; }
          if (r() < 0.5) { a = r.int(11, 99); b = r.int(11, 99); return { expr: [dec(a, 1) + " × " + dec(b, 1)], ans: [dec(a * b, 2)] }; }
          b = r.int(2, 9); var q = r.int(101, 999); return { expr: [dec(q * b, 2) + " ÷ " + b], ans: [dec(q, 2)] };
        }
        var max = Math.pow(10, p) * 100;
        a = r.int(Math.pow(10, p), max - 1); b = r.int(Math.pow(10, p), max - 1);
        if (op === "–" && b > a) { var t = a; a = b; b = t; }
        return { expr: [dec(a, p) + " " + op + " " + dec(b, p)], ans: [dec(op === "+" ? a + b : a - b, p)] };
      }
    },
    percents: {
      title: "Percents", line: "Percent means \"out of 100\". 25% of 80 means 25 out of every 100 parts of 80.",
      make: function (L, r) {
        var pct = r.pick(L <= 4 ? [10, 25, 50, 100] : [5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
        var unit = 100 / gcd(pct, 100);
        var y = unit * r.int(1, L <= 4 ? 10 : 20);
        var part = (pct * y) / 100;
        var kind = L <= 4 ? 0 : r.int(0, L === 5 ? 1 : 3);
        if (kind === 0) return { expr: [pct + "% of " + y], ans: [String(part)] };
        if (kind === 1) return { expr: [part + " is what percent of " + y + "?"], lead: [""], after: "%", ans: [String(pct)] };
        if (kind === 2) {
          var up = r() < 0.5;
          return { expr: ["From " + y + " to " + (up ? y + part : y - part) + " is a"], lead: [""], after: "% " + (up ? "increase" : "decrease"), ans: [String(pct)] };
        }
        return { expr: ["$" + y + " with " + pct + "% off costs"], lead: ["$"], ans: [String(y - part)] };
      }
    },
    integers: {
      title: "Negative Numbers", line: "Some numbers are below zero. Think of a number line or a thermometer.",
      make: function (L, r) {
        var ops = L >= 6 ? ["+", "–", "×", "÷"] : ["+", "–"];
        var op = r.pick(ops), a, b, ans;
        if (op === "×" || op === "÷") {
          b = r.int(-12, 12) || -3; var q = r.int(-12, 12) || 4;
          if (b > 0 && q > 0) q = -q;
          if (op === "×") { a = q; ans = a * b; } else { a = q * b; ans = q; }
        } else {
          a = r.int(-20, 20); b = r.int(-20, 20);
          if (a >= 0 && b >= 0) a = -a - 1;
          ans = op === "+" ? a + b : a - b;
        }
        return { expr: [num(a) + " " + op + " " + neg(b)], ans: [num(ans)] };
      }
    },
    order: {
      title: "Order of Operations", line: "Work inside brackets first, then powers, then × and ÷, then + and –.",
      make: function (L, r) {
        var a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(1, 9);
        var forms = [
          function () { return [a + " + " + b + " × " + c, a + b * c]; },
          function () { return [a + " × " + b + " – " + d, a * b - d]; },
          function () { return ["(" + a + " + " + b + ") × " + c, (a + b) * c]; }
        ];
        if (L >= 5) forms.push(
          function () { return [a + " + " + b + " × " + c + " – " + d, a + b * c - d]; },
          function () { return [(a * c) + " ÷ " + c + " + " + b + " × " + d, a + b * d]; },
          function () { return [d + " × (" + (a + b) + " – " + b + ") + " + c, d * a + c]; });
        if (L >= 6) forms.push(
          function () { return [[String(a), { sup: "2" }, " + " + b + " × " + c], a * a + b * c]; },
          function () { return [["(" + a + " + " + d + ")", { sup: "2" }, " – " + c], (a + d) * (a + d) - c]; },
          function () { return [[(b * b * c) + " ÷ " + b, { sup: "2" }, " + " + a], c + a]; });
        var f = r.pick(forms)();
        return { expr: [].concat(f[0]), ans: [String(f[1])] };
      }
    },
    equations: {
      title: "Equations", line: "Find the number that x stands for. Check by putting it back into the equation.",
      make: function (L, r) {
        var x = L >= 6 ? r.int(-9, 15) || 3 : r.int(1, 15);
        var a = r.int(2, 9), b = r.int(1, 20), kind;
        if (L <= 4) kind = r.int(0, 1);
        else if (L === 5) kind = r.int(0, 3);
        else kind = r.int(4, 6);
        var e;
        switch (kind) {
          case 0: e = ["x + " + b + " = " + (x + b)]; break;
          case 1: e = ["x – " + b + " = " + num(x - b)]; break;
          case 2: e = [a + "x = " + num(a * x)]; break;
          case 3: e = [{ f: ["x", String(a)] }, " = " + num(x)]; x = x * a; break;
          case 4: e = [a + "x + " + b + " = " + num(a * x + b)]; break;
          case 5: e = [a + "x – " + b + " = " + num(a * x - b)]; break;
          default:
            var c = r.int(1, a - 1);
            var d = a * x + b - c * x;
            e = [a + "x + " + b + " = " + coef(c) + "x " + (d < 0 ? "– " + -d : "+ " + d)];
        }
        return { expr: e, lead: ["x ="], ans: [num(x)], work: true, below: true };
      }
    },
    exponents: {
      title: "Exponents and Roots", line: "An exponent says how many times to multiply a number by itself: 4² = 4 × 4.",
      make: function (L, r) {
        var k = r.int(0, L >= 6 ? 5 : 2), n;
        if (k === 0) { n = r.int(2, 15); return { expr: [String(n), { sup: "2" }], ans: [String(n * n)] }; }
        if (k === 1) { n = r.int(2, 6); return { expr: [String(n), { sup: "3" }], ans: [String(n * n * n)] }; }
        if (k === 2) { n = r.int(2, 6); return { expr: ["10", { sup: String(n) }], ans: ["1" + new Array(n + 1).join("0")] }; }
        if (k === 3) { n = r.int(2, 20); return { expr: [{ root: String(n * n) }], ans: [String(n)] }; }
        if (k === 4) { n = r.int(2, 10); return { expr: ["2", { sup: String(n) }], ans: [String(Math.pow(2, n))] }; }
        n = r.int(2, 9);
        return { expr: ["(–" + n + ")", { sup: "2" }], ans: [String(n * n)] };
      }
    }
  };

  var AUTO = {
    1: ["add"], 2: ["add", "sub"], 3: ["add", "sub", "mul", "div"],
    4: ["mul", "div", "fractions", "decimals"],
    5: ["fractions", "decimals", "percents", "integers", "order", "equations"],
    6: ["equations", "exponents", "percents", "integers", "order", "fractions"]
  };

  function generate(settings, rng, pageIndex) {
    var L = settings.level;
    var topic = TOPICS[settings.mathTopic] ? settings.mathTopic : AUTO[L][pageIndex % AUTO[L].length];
    var T = TOPICS[topic];
    var probe = T.make(L, WS.makeRng(1));
    var count;
    if (probe.v) count = String(probe.ans).length >= 5 || (topic === "mul" && L >= 4) ? 12 : 20;
    else count = probe.tall || probe.work ? 12 : 16;
    if (settings.largePrint) count = Math.round(count * 0.6);
    var probs = [], seen = {};
    for (var i = 0; i < count; i++) {
      var p;
      for (var t = 0; t < 20; t++) {
        p = T.make(L, rng);
        var keyStr = JSON.stringify(p.expr || [p.a, p.op, p.b]);
        if (!seen[keyStr]) { seen[keyStr] = true; break; }
      }
      probs.push(p);
    }
    return { topic: topic, title: T.title, line: T.line, problems: probs, vertical: !!probe.v };
  }

  // ---------- Expression drawing ----------

  function measure(doc, tokens, size) {
    var PT = WS.draw.PT, w = 0;
    tokens.forEach(function (t) {
      if (typeof t === "string") { doc.setFontSize(size); w += doc.getTextWidth(t); }
      else if (t.f) { doc.setFontSize(size * 0.78); w += Math.max(doc.getTextWidth(t.f[0]), doc.getTextWidth(t.f[1])) + 1.6; }
      else if (t.sup) { doc.setFontSize(size * 0.62); w += doc.getTextWidth(t.sup) + 0.4; }
      else if (t.root) { doc.setFontSize(size); w += doc.getTextWidth(t.root) + size * PT * 0.75; }
    });
    doc.setFontSize(size);
    return w;
  }

  function drawExpr(doc, tokens, x, y, size) {
    var PT = WS.draw.PT, h = size * PT;
    tokens.forEach(function (t) {
      if (typeof t === "string") {
        doc.setFontSize(size); doc.text(t, x, y); x += doc.getTextWidth(t);
      } else if (t.f) {
        doc.setFontSize(size * 0.78);
        var w = Math.max(doc.getTextWidth(t.f[0]), doc.getTextWidth(t.f[1])) + 1.6;
        var mid = y - h * 0.3;
        doc.text(t.f[0], x + w / 2, mid - 1.2, { align: "center" });
        doc.text(t.f[1], x + w / 2, mid + h * 0.62, { align: "center" });
        doc.setLineWidth(0.35);
        doc.line(x + 0.3, mid, x + w - 0.3, mid);
        x += w;
      } else if (t.sup) {
        doc.setFontSize(size * 0.62); doc.text(t.sup, x + 0.2, y - h * 0.38); x += doc.getTextWidth(t.sup) + 0.4;
      } else if (t.root) {
        doc.setFontSize(size);
        var tw = doc.getTextWidth(t.root), top = y - h * 0.82;
        doc.setLineWidth(0.35);
        doc.lines([[h * 0.1, -h * 0.06], [h * 0.16, h * 0.4], [h * 0.22, -(h * 0.4 + (y - top) - h * 0.06 - 0.3)], [tw + h * 0.18, 0]],
          x, y - h * 0.34, [1, 1], "S", false);
        doc.text(t.root, x + h * 0.55, y);
        x += tw + h * 0.75;
      }
    });
    doc.setFontSize(size);
    return x;
  }

  // ---------- Page drawing ----------

  function draw(ctx, pz, answer) {
    var D = WS.draw, doc = ctx.doc;
    var y = D.header(ctx, "Math - " + pz.title, [pz.line,
      pz.vertical ? "Take your time. Check each answer when you finish." : "Write your answer on the line."], answer);
    if (pz.vertical) drawVertical(ctx, pz, y, answer);
    else drawLines(ctx, pz, y, answer);
    D.footer(ctx, "Level " + ctx.settings.level);
  }

  function drawVertical(ctx, pz, y0, answer) {
    var D = WS.draw, doc = ctx.doc;
    var maxDigits = Math.max.apply(null, pz.problems.map(function (p) { return String(p.ans).length; }));
    var cols = maxDigits >= 5 ? 3 : 4;
    var rows = Math.ceil(pz.problems.length / cols);
    var cw = (ctx.W - 2 * ctx.M) / cols, ch = (ctx.H - ctx.M - 12 - y0) / rows;
    var fs = Math.min(24 * Math.min(ctx.scale, 1.15), (ch / D.PT) * 0.2, (cw * 0.7 / (maxDigits + 2)) / D.PT / 0.56);
    doc.setFont("helvetica", "bold"); doc.setFontSize(fs);
    var digitW = doc.getTextWidth("0");
    pz.problems.forEach(function (p, i) {
      var col = i % cols, row = Math.floor(i / cols);
      var right = ctx.M + col * cw + cw * 0.72;
      var lh = fs * D.PT * 1.3;
      var top = y0 + row * ch + 2;
      D.font(ctx, 9, "bold"); D.setText(doc, D.LIGHT);
      doc.text("(" + (i + 1) + ")", ctx.M + col * cw + 1, top + 3);
      doc.setFont("helvetica", "bold"); doc.setFontSize(fs); D.setText(doc, D.INK);
      doc.text(String(p.a), right, top + lh, { align: "right" });
      doc.text(String(p.b), right, top + lh * 2, { align: "right" });
      var opX = right - digitW * Math.max(String(p.a).length, String(p.b).length) - 3;
      doc.text(p.op, opX, top + lh * 2, { align: "right" });
      D.setDraw(doc, D.INK); doc.setLineWidth(0.6);
      doc.line(opX - doc.getTextWidth(p.op) - 1, top + lh * 2 + 2.2, right + 1.5, top + lh * 2 + 2.2);
      if (answer) { D.setText(doc, D.ACCENT); doc.text(String(p.ans), right, top + lh * 3.15, { align: "right" }); }
    });
  }

  function drawLines(ctx, pz, y0, answer) {
    var D = WS.draw, doc = ctx.doc;
    var cols = 2, rows = Math.ceil(pz.problems.length / cols);
    var cw = (ctx.W - 2 * ctx.M) / cols, ch = (ctx.H - ctx.M - 12 - y0) / rows;
    var fs = Math.min(17 * ctx.scale, (ch / D.PT) * 0.42);
    pz.problems.forEach(function (p, i) {
      var col = i % cols, row = Math.floor(i / cols);
      var x = ctx.M + col * cw;
      var base = y0 + row * ch + Math.min(ch * 0.45, 12 * ctx.scale) + (p.tall ? 2 : 0);
      D.font(ctx, 10, "bold"); D.setText(doc, D.SOFT);
      doc.text((i + 1) + ".", x, base);
      doc.setFont("helvetica", "normal"); D.setText(doc, D.INK); D.setDraw(doc, D.INK);
      var startX = x + 8;
      var lead = p.lead || ["="];
      var exprW = measure(doc, p.expr, fs) + 2 + measure(doc, lead, fs);
      var lineW = Math.max(22, (p.after ? 20 : 28) * Math.min(ctx.scale, 1.15));
      doc.setFontSize(fs);
      var afterW = p.after ? doc.getTextWidth(p.after) + 2 : 0;
      if (p.below || exprW + lineW + afterW + 12 > cw - 6) {
        // Long expression: put the answer line underneath.
        drawExpr(doc, p.expr, startX, base, fs);
        base += fs * D.PT * 1.9;
        startX = x + 8;
      } else {
        startX = drawExpr(doc, p.expr, startX, base, fs) + 2;
      }
      var lx = drawExpr(doc, lead, startX, base, fs) + 2;
      D.setDraw(doc, D.SOFT); doc.setLineWidth(0.35);
      var lineY = base + (p.tall ? fs * D.PT * 0.75 : 1);
      doc.line(lx, lineY, lx + lineW, lineY);
      if (p.after) { D.setText(doc, D.INK); doc.setFontSize(fs); doc.text(p.after, lx + lineW + 1.5, base); }
      if (answer) {
        doc.setFont("helvetica", "bold"); D.setText(doc, D.ACCENT); D.setDraw(doc, D.ACCENT);
        drawExpr(doc, p.ans, lx + 2, base - 0.5, fs);
      }
      D.setDraw(doc, D.INK);
    });
  }

  function describe(L) {
    var names = AUTO[L].map(function (t) { return TOPICS[t].title.toLowerCase(); });
    return "Mixed for this level: " + names.join(", ") + " (one topic per page)";
  }

  WS.MATH_TOPICS = TOPICS;
  WS.registerType("math", {
    label: "Math Practice", generate: generate, draw: draw, describe: describe,
    key: function () { return true; }
  });
})(typeof window !== "undefined" ? window : globalThis);
