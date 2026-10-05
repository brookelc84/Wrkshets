/* Code Breaker: decode secret messages.
 * Levels 1–2 use A=1, B=2 … with the full key. Level 3 uses a mixed-up number code with the key.
 * Levels 4–6 are true cryptograms: each letter stands for a different letter, with fewer hints. */
(function (root) {
  var WS = (root.WS = root.WS || {});
  var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  var SAYINGS = [
    "ONE STEP AT A TIME", "PRACTICE MAKES PROGRESS", "SLOW AND STEADY WINS THE RACE",
    "EVERY DAY IS A FRESH START", "KINDNESS IS NEVER WASTED", "TWO HEADS ARE BETTER THAN ONE",
    "BETTER LATE THAN NEVER", "ACTIONS SPEAK LOUDER THAN WORDS", "TAKE A DEEP BREATH",
    "SMALL STEPS STILL MOVE YOU FORWARD", "WHERE THERE IS A WILL THERE IS A WAY",
    "DO NOT JUDGE A BOOK BY ITS COVER", "THE EARLY BIRD CATCHES THE WORM", "REST IS PART OF THE WORK",
    "ROME WAS NOT BUILT IN A DAY", "EVERY EXPERT WAS ONCE A BEGINNER", "IT IS OKAY TO ASK FOR HELP",
    "A JOURNEY OF A THOUSAND MILES BEGINS WITH A SINGLE STEP", "KNOWLEDGE IS POWER",
    "YOU ARE ALLOWED TO TAKE A BREAK", "DIFFERENT IS NOT LESS", "HONESTY IS THE BEST POLICY",
    "PATIENCE IS A VIRTUE", "THE BEST WAY OUT IS ALWAYS THROUGH", "MISTAKES HELP US LEARN",
    "EASY DOES IT", "GOOD THINGS TAKE TIME", "MANY HANDS MAKE LIGHT WORK",
    "LOOK BEFORE YOU LEAP", "THE QUIET MIND HEARS THE MOST", "LEARNING NEVER EXHAUSTS THE MIND",
    "WELL DONE IS BETTER THAN WELL SAID", "AN APPLE A DAY KEEPS THE DOCTOR AWAY",
    "ALL THE WORLD IS A STAGE", "THE PEN IS MIGHTIER THAN THE SWORD",
    "WHAT WE THINK WE BECOME", "STILL WATERS RUN DEEP", "BE YOURSELF EVERYONE ELSE IS TAKEN",
    "CURIOSITY IS THE WICK IN THE CANDLE OF LEARNING", "FORTUNE FAVORS THE PREPARED MIND",
    "NO ACT OF KINDNESS IS EVER TOO SMALL", "THE SECRET OF GETTING AHEAD IS GETTING STARTED",
    "IT ALWAYS SEEMS IMPOSSIBLE UNTIL IT IS DONE", "DO WHAT YOU CAN WITH WHAT YOU HAVE WHERE YOU ARE"
  ];

  var LEVELS = [
    { kind: "abc", items: 6 },        // single words, A=1 key
    { kind: "abc", items: 2 },        // short sayings, A=1 key
    { kind: "num", items: 2 },        // mixed-up numbers, full key
    { kind: "sub", items: 2, hints: 6, maxLen: 34 },
    { kind: "sub", items: 2, hints: 3, maxLen: 44 },
    { kind: "sub", items: 1, hints: 1, minLen: 34 }
  ];

  function generate(settings, rng, pageIndex) {
    var L = settings.level, lv = LEVELS[L - 1];
    var messages;
    if (L === 1) {
      messages = WS.pickWords(WS.wordPool(settings), settings.largePrint ? 4 : lv.items, 3, 5, rng);
    } else {
      var pool = SAYINGS.filter(function (s) {
        return (L <= 3 ? s.length <= 24 : true) && (!lv.maxLen || s.length <= lv.maxLen) && (!lv.minLen || s.length >= lv.minLen);
      });
      var order = WS.makeRng((settings.seed ^ 0xc0de) >>> 0).shuffle(pool);
      messages = [];
      for (var i = 0; i < lv.items; i++) messages.push(order[(pageIndex * lv.items + i) % order.length]);
    }
    var code = {};
    if (lv.kind === "abc") A.split("").forEach(function (c, i) { code[c] = String(i + 1); });
    else if (lv.kind === "num") rng.shuffle(A.split("").map(function (_, i) { return i + 1; })).forEach(function (n, i) { code[A[i]] = String(n); });
    else {
      // Shuffle until no letter maps to itself.
      var perm;
      do { perm = rng.shuffle(A.split("")); } while (perm.some(function (c, i) { return c === A[i]; }));
      A.split("").forEach(function (c, i) { code[c] = perm[i]; });
    }
    var hints = [];
    if (lv.kind === "sub") {
      var letters = {};
      messages.join("").replace(/[^A-Z]/g, "").split("").forEach(function (c) { letters[c] = (letters[c] || 0) + 1; });
      hints = rng.shuffle(Object.keys(letters)).slice(0, lv.hints);
    }
    return { kind: lv.kind, messages: messages, code: code, hints: hints };
  }

  function draw(ctx, pz, answer) {
    var D = WS.draw, doc = ctx.doc, L = ctx.settings.level;
    var intro = pz.kind === "abc" ? ["Each number stands for a letter: A = 1, B = 2, C = 3 and so on.",
      "Use the key to find each letter. Write it in the box above the number."]
      : pz.kind === "num" ? ["Each number stands for one letter. The numbers are mixed up.",
        "Use the key to find each letter. Write it in the box above the number."]
        : ["Each letter in the message stands for a different letter. The same code letter always means the same real letter.",
          "Some letters are filled in to start you off. Look for short words like A, I, THE and AND."];
    var y = D.header(ctx, "Code Breaker", intro, answer);

    // Key table for number codes.
    if (pz.kind !== "sub") {
      var kw = (ctx.W - 2 * ctx.M) / 13, kh = 8 * ctx.scale;
      for (var i = 0; i < 26; i++) {
        var kx = ctx.M + (i % 13) * kw, ky = y + Math.floor(i / 13) * kh * 2;
        D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.3);
        doc.rect(kx, ky, kw, kh * 2, "S");
        D.font(ctx, 11, "bold"); D.setText(doc, D.INK); D.textMid(doc, A[i], kx + kw / 2, ky + kh * 0.55);
        D.font(ctx, 11); D.setText(doc, D.ACCENT); D.textMid(doc, pz.code[A[i]], kx + kw / 2, ky + kh * 1.45);
      }
      y += kh * 4 + 8;
    }

    var x0 = ctx.M, maxX = ctx.W - ctx.M;
    var bottom = ctx.H - ctx.M - (pz.kind === "sub" && !answer ? 40 : 12);
    var labelled = pz.messages.length > 1;

    // Lay the letters out; returns the boxes' positions and the height used.
    function layout(box) {
      var cells = [], yy = y, rowH = box * 2.6;
      if (L === 1) {
        // Single short words: two columns.
        var colW = (maxX - x0) / 2;
        pz.messages.forEach(function (word, m) {
          var cx = x0 + (m % 2) * colW, cy = y + Math.floor(m / 2) * (rowH + 12);
          cells.push({ label: "Word " + (m + 1), x: cx, y: cy + 4 });
          word.split("").forEach(function (ch, k) { cells.push({ ch: ch, x: cx + k * (box + 1.2), y: cy + 7 }); });
        });
        return { cells: cells, end: y + Math.ceil(pz.messages.length / 2) * (rowH + 12) };
      }
      pz.messages.forEach(function (msg, m) {
        if (labelled) { cells.push({ label: (L === 1 ? "Word " : "Message ") + (m + 1), x: x0, y: yy + 4 }); yy += 7; }
        var x = x0;
        msg.split(" ").forEach(function (word) {
          if (x + word.length * (box + 1.2) > maxX) { x = x0; yy += rowH; }
          word.split("").forEach(function (ch) { cells.push({ ch: ch, x: x, y: yy }); x += box + 1.2; });
          x += box * 0.8;
        });
        yy += rowH + 4;
      });
      return { cells: cells, end: yy };
    }
    var box = Math.min((L === 1 ? 16 : 11) * ctx.scale, (ctx.W - 2 * ctx.M) / 16), lay = layout(box);
    while (lay.end > bottom && box > 5) { box -= 0.5; lay = layout(box); }

    lay.cells.forEach(function (c) {
      if (c.label) { D.font(ctx, 11, "bold"); D.setText(doc, D.SOFT); doc.text(c.label, c.x, c.y); return; }
      var show = answer || pz.hints.indexOf(c.ch) >= 0;
      D.setDraw(doc, D.SOFT); doc.setLineWidth(0.35);
      doc.roundedRect(c.x, c.y, box, box, 1, 1, "S");
      if (show) {
        doc.setFont("helvetica", "bold"); doc.setFontSize((box / D.PT) * 0.55);
        D.setText(doc, answer && pz.hints.indexOf(c.ch) < 0 ? D.ACCENT : D.INK);
        D.textMid(doc, c.ch, c.x + box / 2, c.y + box / 2 + 0.3);
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize((box / D.PT) * (pz.kind === "sub" ? 0.5 : 0.42));
      D.setText(doc, D.SOFT);
      D.textMid(doc, pz.code[c.ch], c.x + box / 2, c.y + box * 1.45);
    });

    if (pz.kind === "sub" && !answer) {
      // A tally strip for working out the code.
      var sy = ctx.H - ctx.M - 30, cw = (ctx.W - 2 * ctx.M) / 26;
      D.font(ctx, 10, "bold"); D.setText(doc, D.SOFT);
      doc.text("Your notes: write the real letter under each code letter as you work it out.", ctx.M, sy - 3);
      for (var j = 0; j < 26; j++) {
        D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.3);
        doc.rect(ctx.M + j * cw, sy, cw, 14, "S");
        D.font(ctx, 9, "bold"); D.setText(doc, D.INK); D.textMid(doc, A[j], ctx.M + (j + 0.5) * cw, sy + 3.5);
      }
    }
    D.footer(ctx, "Level " + L);
  }

  WS.registerType("cryptogram", {
    label: "Code Breaker", generate: generate, draw: draw,
    key: function () { return true; },
    describe: function (L) {
      return ["Short words, A = 1 code with key", "Short sayings, A = 1 code with key", "Mixed-up number code with key",
        "Letter code, 6 letters given", "Letter code, 3 letters given", "Long quote, only 1 letter given"][L - 1];
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
