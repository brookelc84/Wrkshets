/* Telling Time: read analog clocks, draw the hands, or work out elapsed time. */
(function (root) {
  var WS = (root.WS = root.WS || {});

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  // minutes since midnight -> "3:05" (or "3:05 PM" / "15:05")
  function fmt(t, style) {
    t = ((t % 1440) + 1440) % 1440;
    var h = Math.floor(t / 60), m = t % 60;
    if (style === "24") return pad(h) + ":" + pad(m);
    var h12 = h % 12 || 12;
    return h12 + ":" + pad(m) + (style === "ampm" ? (h < 12 ? " AM" : " PM") : "");
  }
  function dur(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, parts = [];
    if (h) parts.push(h + (h === 1 ? " hour" : " hours"));
    if (m) parts.push(m + (m === 1 ? " minute" : " minutes"));
    return parts.join(" ");
  }

  // A clock time suited to the level: o'clock, half/quarter hours, 5-minute steps, or any minute.
  function clockTime(L, r) {
    var h = r.int(1, 12), m;
    if (L === 1) m = 0;
    else if (L === 2) m = r.pick([0, 15, 30, 45]);
    else if (L === 3) m = 5 * r.int(0, 11);
    else m = r.int(0, 59);
    return h * 60 + m;
  }

  var EVENTS = ["The movie", "The bus ride", "A work shift", "The laundry", "Baking the bread", "The walk",
    "The meeting", "The class", "The appointment", "The concert", "The train trip", "The game"];

  function elapsedQuestion(L, r) {
    var step = L <= 2 ? 30 : L === 3 ? 15 : L === 4 ? 5 : 1;
    var style = L >= 5 ? "ampm" : "plain";
    var start = L <= 2 ? 60 * r.int(1, 11) + (L === 2 ? r.pick([0, 30]) : 0)
      : L >= 5 ? r.int(6 * 60, 22 * 60) : 60 * r.int(7, 18) + step * r.int(0, 60 / step - 1);
    if (L >= 5) start -= start % step;
    var maxD = L === 1 ? 3 * 60 : L <= 3 ? 3 * 60 : 5 * 60;
    var d = L === 1 ? 60 * r.int(1, 3) : step * r.int(Math.ceil(30 / step), maxD / step);
    if (L === 6 && r() < 0.5) {
      if (r() < 0.5) {
        var t = r.int(0, 1439);
        return { q: "Write " + fmt(t, "ampm") + " in 24-hour time.", a: fmt(t, "24") };
      }
      var s = r.int(18 * 60, 23 * 60 + 59), e = s + r.int(90, 400);
      return { q: "A train leaves at " + fmt(s, "24") + " and arrives at " + fmt(e, "24") + ". How long is the trip?", a: dur(e - s) };
    }
    if (r() < 0.5) {
      return { q: "It is " + fmt(start, style) + ". What time will it be in " + dur(d) + "?", a: fmt(start + d, style) };
    }
    var ev = r.pick(EVENTS);
    return { q: ev + " starts at " + fmt(start, style) + " and ends at " + fmt(start + d, style) + ". How long does it last?", a: dur(d) };
  }

  function generate(settings, rng) {
    var L = settings.level, act = settings.timeActivity || "read";
    if (act === "elapsed") {
      var qs = [];
      for (var i = 0; i < (settings.largePrint ? 6 : 8); i++) qs.push(elapsedQuestion(L, rng));
      return { activity: act, questions: qs };
    }
    var n = settings.largePrint ? 6 : 9, times = [], seen = {};
    while (times.length < n) {
      var t = clockTime(L, rng);
      if (seen[t] && Object.keys(seen).length < (L === 1 ? 12 : 40)) continue;
      seen[t] = true; times.push(t);
    }
    return { activity: act, times: times };
  }

  function drawClock(ctx, cx, cy, r, t, hands, minorTicks) {
    var D = WS.draw, doc = ctx.doc;
    D.setDraw(doc, D.INK); doc.setLineWidth(0.7);
    doc.circle(cx, cy, r, "S");
    for (var k = 0; k < 60; k++) {
      var major = k % 5 === 0;
      if (!major && !minorTicks) continue;
      var a = (k * 6 * Math.PI) / 180, r1 = r * (major ? 0.88 : 0.93);
      doc.setLineWidth(major ? 0.5 : 0.2);
      doc.line(cx + r1 * Math.sin(a), cy - r1 * Math.cos(a), cx + r * 0.98 * Math.sin(a), cy - r * 0.98 * Math.cos(a));
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(Math.max(7, (r * 0.24) / D.PT)); D.setText(doc, D.INK);
    for (var n = 1; n <= 12; n++) {
      var an = (n * 30 * Math.PI) / 180;
      D.textMid(doc, String(n), cx + r * 0.72 * Math.sin(an), cy - r * 0.72 * Math.cos(an));
    }
    if (hands) {
      var h = Math.floor(t / 60) % 12, m = t % 60;
      var ha = ((h + m / 60) * 30 * Math.PI) / 180, ma = (m * 6 * Math.PI) / 180;
      doc.setLineCap("round");
      D.setDraw(doc, hands === "key" ? D.ACCENT : D.INK);
      doc.setLineWidth(1.4); doc.line(cx, cy, cx + r * 0.48 * Math.sin(ha), cy - r * 0.48 * Math.cos(ha));
      doc.setLineWidth(0.7); doc.line(cx, cy, cx + r * 0.8 * Math.sin(ma), cy - r * 0.8 * Math.cos(ma));
      doc.setLineCap("butt");
    }
    D.setFill(doc, D.INK); doc.circle(cx, cy, 1, "F");
  }

  function draw(ctx, pz, answer) {
    var D = WS.draw, doc = ctx.doc, L = ctx.settings.level;
    if (pz.activity === "elapsed") {
      var y = D.header(ctx, "Telling Time - How Long?", [
        "Read each question. Work out the time or how long something takes.",
        L >= 5 ? "AM is from midnight to noon. PM is from noon to midnight." : "You can draw a clock or a time line to help."
      ], answer);
      var rowH = (ctx.H - ctx.M - 12 - y) / pz.questions.length;
      pz.questions.forEach(function (q, i) {
        var top = y + i * rowH;
        D.font(ctx, 13, "bold"); D.setText(doc, D.SOFT); doc.text((i + 1) + ".", ctx.M, top + 6);
        D.font(ctx, 13); D.setText(doc, D.INK);
        var lines = doc.splitTextToSize(q.q, ctx.W - 2 * ctx.M - 10);
        doc.text(lines, ctx.M + 9, top + 6);
        var ly = top + 6 + lines.length * 13 * ctx.scale * D.PT * 1.5 + 4;
        D.font(ctx, 12); D.setText(doc, D.SOFT); doc.text("Answer:", ctx.M + 9, ly);
        D.setDraw(doc, D.SOFT); doc.setLineWidth(0.35);
        doc.line(ctx.M + 28, ly + 1, ctx.M + 110, ly + 1);
        if (answer) { D.font(ctx, 13, "bold"); D.setText(doc, D.ACCENT); doc.text(q.a, ctx.M + 30, ly - 0.5); }
      });
      return D.footer(ctx, "Level " + L);
    }

    var read = pz.activity === "read";
    var y2 = D.header(ctx, read ? "Telling Time - Read the Clock" : "Telling Time - Draw the Hands", read ? [
      "Look at each clock. The short hand shows the hour. The long hand shows the minutes.",
      "Write the time in the box under each clock."
    ] : [
      "Read the time under each clock. Draw the short hand for the hour.",
      "Draw the long hand for the minutes."
    ], answer);
    var cols = 3, rows = Math.ceil(pz.times.length / cols);
    var cw = (ctx.W - 2 * ctx.M) / cols, ch = (ctx.H - ctx.M - 10 - y2) / rows;
    var r = Math.min(cw * 0.4, (ch - 22 * ctx.scale) / 2);
    pz.times.forEach(function (t, i) {
      var cx = ctx.M + cw * (i % cols + 0.5), top = y2 + ch * Math.floor(i / cols);
      var cy = top + r + 2;
      drawClock(ctx, cx, cy, r, t, read ? true : answer ? "key" : false, L >= 3);
      var by = cy + r + 5;
      var bw = 34 * ctx.scale, bh = 11 * ctx.scale;
      if (read) {
        D.setDraw(doc, D.SOFT); doc.setLineWidth(0.4);
        doc.roundedRect(cx - bw / 2, by, bw, bh, 2, 2, "S");
        D.font(ctx, 16, "bold"); D.setText(doc, answer ? D.ACCENT : D.LIGHT);
        D.textMid(doc, answer ? fmt(t) : ":", cx, by + bh / 2 + 0.3);
      } else {
        D.font(ctx, 18, "bold"); D.setText(doc, D.INK);
        D.textMid(doc, fmt(t), cx, by + bh / 2);
      }
    });
    D.footer(ctx, "Level " + L);
  }

  WS.registerType("time", {
    label: "Telling Time", generate: generate, draw: draw,
    key: function () { return true; },
    describe: function (L) {
      return ["Times on the hour (3:00)", "Half and quarter hours (3:30, 3:15)", "Every 5 minutes (3:25)",
        "Any minute (3:27)", "Any minute, with AM and PM", "Any minute, plus 24-hour time"][L - 1];
    }
  });
  WS.timeFormat = fmt;
})(typeof window !== "undefined" ? window : globalThis);
