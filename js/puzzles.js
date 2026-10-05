/* Puzzle generators for Wrkshets.
 * Everything here is pure logic (no drawing) and driven by a seeded random
 * number generator, so the same seed always produces the same worksheet. */
(function (root) {
  var WS = (root.WS = root.WS || {});
  var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // ---------- Levels ----------

  // Settings carry a level from 1 to 6. Older generators think in easy/medium/hard.
  function levelOf(settings) {
    var n = parseInt(settings.level, 10);
    if (n >= 1 && n <= 6) return n;
    return { easy: 2, medium: 4, hard: 6 }[settings.difficulty] || 2;
  }
  function difficultyOf(level) {
    return level <= 2 ? "easy" : level <= 4 ? "medium" : "hard";
  }

  // ---------- Random helpers ----------

  // mulberry32: tiny, fast, seedable PRNG.
  function makeRng(seed) {
    var a = seed >>> 0;
    var rng = function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.int = function (min, max) { return min + Math.floor(rng() * (max - min + 1)); };
    rng.pick = function (arr) { return arr[Math.floor(rng() * arr.length)]; };
    rng.shuffle = function (arr) {
      var a2 = arr.slice();
      for (var i = a2.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var tmp = a2[i]; a2[i] = a2[j]; a2[j] = tmp;
      }
      return a2;
    };
    return rng;
  }

  function cleanWords(list) {
    var seen = {};
    var out = [];
    list.forEach(function (w) {
      var c = String(w).toUpperCase().replace(/[^A-Z]/g, "");
      if (c.length >= 2 && !seen[c]) { seen[c] = true; out.push(c); }
    });
    return out;
  }

  // Pick `count` words, preferring lengths in [minLen, maxLen].
  function pickWords(pool, count, minLen, maxLen, rng) {
    var fit = rng.shuffle(pool.filter(function (w) { return w.length >= minLen && w.length <= maxLen; }));
    if (fit.length >= count) return fit.slice(0, count);
    var rest = rng.shuffle(pool.filter(function (w) { return fit.indexOf(w) < 0; }));
    return fit.concat(rest).slice(0, count);
  }

  function wordPool(settings) {
    var custom = cleanWords((settings.customWords || "").split(/[\s,;]+/));
    if (custom.length) return custom;
    var theme = WS.THEMES[settings.theme] || WS.THEMES.kitchen;
    return cleanWords(theme.words);
  }

  // ---------- Word scramble ----------

  function scrambleWord(word, rng) {
    if (new Set(word.split("")).size < 2) return word;
    var s = word;
    for (var tries = 0; tries < 50 && s === word; tries++) s = rng.shuffle(word.split("")).join("");
    return s;
  }

  // Index = level - 1 (level 1 = Pre-K/K ... level 6 = high school and adult).
  var SCRAMBLE_LEVELS = [
    { count: 6, min: 3, max: 4, hint: true, bank: true },
    { count: 8, min: 3, max: 5, hint: true, bank: true },
    { count: 10, min: 4, max: 6, hint: false, bank: true },
    { count: 10, min: 5, max: 8, hint: false, bank: true },
    { count: 12, min: 6, max: 10, hint: false, bank: false },
    { count: 12, min: 8, max: 14, hint: false, bank: false }
  ];

  function makeScramble(settings, rng) {
    var lv = SCRAMBLE_LEVELS[levelOf(settings) - 1];
    var count = settings.largePrint ? Math.max(5, Math.round(lv.count * 0.7)) : lv.count;
    var words = pickWords(wordPool(settings), count, lv.min, lv.max, rng);
    return {
      items: words.map(function (w) { return { word: w, scrambled: scrambleWord(w, rng) }; }),
      hint: lv.hint,
      bank: lv.bank ? words.slice().sort() : null
    };
  }

  // ---------- Word search ----------

  var DIRS = {
    right: [1, 0], down: [0, 1], downRight: [1, 1], upRight: [1, -1],
    left: [-1, 0], up: [0, -1], upLeft: [-1, -1], downLeft: [-1, 1]
  };

  var SEARCH_LEVELS = [
    { size: 7, count: 5, dirs: ["right", "down"], maxLen: 6 },
    { size: 9, count: 7, dirs: ["right", "down"], maxLen: 8 },
    { size: 11, count: 9, dirs: ["right", "down", "downRight"], maxLen: 9 },
    { size: 13, count: 11, dirs: ["right", "down", "downRight", "upRight"], maxLen: 11 },
    { size: 15, count: 14, dirs: Object.keys(DIRS), maxLen: 12 },
    { size: 18, count: 18, dirs: Object.keys(DIRS), maxLen: 15 }
  ];

  function makeWordSearch(settings, rng) {
    var lv = SEARCH_LEVELS[levelOf(settings) - 1];
    var size = lv.size;
    var count = settings.largePrint ? Math.max(5, Math.round(lv.count * 0.75)) : lv.count;
    if (settings.largePrint && size > 10) size -= 2;
    var pool = wordPool(settings).filter(function (w) { return w.length <= size; });
    var candidates = pickWords(pool, Math.min(pool.length, count + 6), 3, lv.maxLen, rng);
    candidates.sort(function (a, b) { return b.length - a.length; });

    var grid = [];
    for (var y = 0; y < size; y++) grid.push(new Array(size).fill(""));
    var placed = [];

    for (var i = 0; i < candidates.length && placed.length < count; i++) {
      var word = candidates[i];
      for (var attempt = 0; attempt < 300; attempt++) {
        var d = DIRS[rng.pick(lv.dirs)];
        var x0 = rng.int(0, size - 1), y0 = rng.int(0, size - 1);
        var x1 = x0 + d[0] * (word.length - 1), y1 = y0 + d[1] * (word.length - 1);
        if (x1 < 0 || x1 >= size || y1 < 0 || y1 >= size) continue;
        var ok = true;
        for (var k = 0; k < word.length && ok; k++) {
          var c = grid[y0 + d[1] * k][x0 + d[0] * k];
          if (c && c !== word[k]) ok = false;
        }
        if (!ok) continue;
        for (k = 0; k < word.length; k++) grid[y0 + d[1] * k][x0 + d[0] * k] = word[k];
        placed.push({ word: word, x0: x0, y0: y0, x1: x1, y1: y1 });
        break;
      }
    }
    for (y = 0; y < size; y++)
      for (var x = 0; x < size; x++)
        if (!grid[y][x]) grid[y][x] = ALPHABET[rng.int(0, 25)];

    return {
      size: size,
      grid: grid,
      placed: placed,
      words: placed.map(function (p) { return p.word; }).sort(),
      dirsNote: lv.dirs.length === 2 ? "Words go across (left to right) or down (top to bottom)."
        : lv.dirs.length <= 4 ? "Words go across, down, or on a slant."
          : "Words can go in any direction, including backwards."
    };
  }

  // ---------- ABC activities ----------

  function makeAbc(settings, rng, pageIndex) {
    var level = settings.difficulty;
    var act = settings.abcActivity || "trace";

    if (act === "trace") {
      var perPage = settings.largePrint ? 5 : 7;
      var start = (pageIndex * perPage) % 26;
      var letters = [];
      for (var i = 0; i < perPage && start + i < 26; i++) letters.push(ALPHABET[start + i]);
      var pool = wordPool(settings).concat(cleanWords(WS.THEMES_ALL_WORDS()));
      return {
        activity: "trace",
        rows: letters.map(function (L) {
          if (level === "easy") return { model: L, trace: L };
          if (level === "medium") return { model: L + L.toLowerCase(), trace: L + L.toLowerCase() };
          var word = pool.filter(function (w) { return w[0] === L && w.length <= 7; })[0];
          var w = word ? word[0] + word.slice(1).toLowerCase() : L + L.toLowerCase();
          return { model: w, trace: w };
        })
      };
    }

    if (act === "missing") {
      var blanks = { easy: 1, medium: 2, hard: 3 }[level] || 1;
      var rows = settings.largePrint ? 7 : 10;
      var seqLen = 6;
      var items = [];
      for (var r = 0; r < rows; r++) {
        var s = rng.int(0, 26 - seqLen);
        var seq = ALPHABET.substr(s, seqLen).split("");
        if (level === "hard" && rng() < 0.5) seq = seq.map(function (c) { return c.toLowerCase(); });
        var idx = rng.shuffle([0, 1, 2, 3, 4, 5]).slice(0, blanks);
        items.push(seq.map(function (c, j) { return { ch: c, blank: idx.indexOf(j) >= 0 }; }));
      }
      return { activity: "missing", items: items };
    }

    if (act === "order") {
      var groupSize = { easy: 3, medium: 4, hard: 5 }[level] || 3;
      var groups = settings.largePrint ? 4 : 6;
      var words = rng.shuffle(wordPool(settings));
      var out = [];
      var used = {};
      for (var g = 0; g < groups; g++) {
        var grp = [];
        var firsts = {};
        for (var pass = 0; pass < 2 && grp.length < groupSize; pass++) {
          // Second pass: we ran out of fresh words, so allow repeats from earlier groups.
          if (pass === 1) used = {};
          for (var wi = 0; wi < words.length && grp.length < groupSize; wi++) {
            var w2 = words[wi];
            if (used[w2] || grp.indexOf(w2) >= 0) continue;
            // Easy/medium: every word starts with a different letter.
            if (level !== "hard" && firsts[w2[0]]) continue;
            grp.push(w2); firsts[w2[0]] = true; used[w2] = true;
          }
        }
        if (grp.length < 2) break;
        out.push({ shown: rng.shuffle(grp), sorted: grp.slice().sort() });
      }
      return { activity: "order", groups: out };
    }

    // match: uppercase to lowercase
    var n = { easy: 6, medium: 8, hard: 10 }[level] || 6;
    if (settings.largePrint) n = Math.min(n, 6);
    var picks = rng.shuffle(ALPHABET.split("")).slice(0, n);
    var right = rng.shuffle(picks);
    return { activity: "match", left: picks, right: right.map(function (c) { return c.toLowerCase(); }) };
  }

  // ---------- 1 2 3 4 (number) activities ----------

  var NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
    "eighteen", "nineteen", "twenty"];

  function makeNumbers(settings, rng, pageIndex) {
    var level = settings.difficulty;
    var act = settings.numActivity || "trace";

    if (act === "trace") {
      var perPage = settings.largePrint ? 5 : 7;
      var startAt = level === "easy" ? 0 : 1;
      var maxN = level === "easy" ? 9 : 20;
      var span = maxN - startAt + 1;
      var rows = [];
      for (var i = 0; i < perPage; i++) {
        var n = startAt + ((pageIndex * perPage + i) % span);
        rows.push({ model: String(n), trace: String(n), word: level === "hard" ? NUMBER_WORDS[n] : null });
      }
      return { activity: "trace", rows: rows };
    }

    if (act === "missing") {
      var count = settings.largePrint ? 7 : 10;
      var items = [];
      for (var r = 0; r < count; r++) {
        var step, start, desc = false;
        if (level === "easy") { step = 1; start = rng.int(1, 14); }
        else if (level === "medium") { step = rng.pick([1, 2, 5, 10]); start = step * rng.int(0, 5) + (step === 1 ? rng.int(1, 40) : 0); }
        else { step = rng.pick([2, 3, 4, 5, 10, 25]); start = step * rng.int(1, 8); desc = rng() < 0.4; }
        var seq = [];
        for (var k = 0; k < 6; k++) seq.push(start + step * k);
        if (desc) seq.reverse();
        var blanks = { easy: 1, medium: 2, hard: 3 }[level] || 1;
        // Never blank the first two numbers so the pattern is visible.
        var idx = rng.shuffle([2, 3, 4, 5]).slice(0, Math.min(blanks, 4));
        if (level === "easy") idx = [rng.int(1, 5)];
        items.push({ step: step, desc: desc, cells: seq.map(function (v, j) { return { v: v, blank: idx.indexOf(j) >= 0 }; }) });
      }
      return { activity: "missing", items: items };
    }

    if (act === "count") {
      var boxes = settings.largePrint ? 4 : 6;
      var range = { easy: [1, 5], medium: [3, 10], hard: [8, 20] }[level] || [1, 5];
      var shapes = rng.shuffle(["circle", "square", "triangle", "star", "diamond", "heart"]);
      var list = [];
      for (var b = 0; b < boxes; b++) list.push({ shape: shapes[b % shapes.length], n: rng.int(range[0], range[1]) });
      return { activity: "count", boxes: list };
    }

    // math
    var probs = settings.largePrint ? 12 : 20;
    var problems = [];
    var seen = {};
    for (var p = 0; p < probs; p++) {
      var a, b2, op;
      for (var t = 0; t < 30; t++) {
        if (level === "easy") { op = "+"; a = rng.int(0, 9); b2 = rng.int(0, 10 - a); }
        else if (level === "medium") {
          op = rng.pick(["+", "-"]);
          if (op === "+") { a = rng.int(1, 15); b2 = rng.int(1, 20 - a); }
          else { a = rng.int(5, 20); b2 = rng.int(1, a); }
        } else {
          op = rng.pick(["+", "-"]);
          if (op === "+") { a = rng.int(10, 79); b2 = rng.int(10, 99 - a); }
          else { a = rng.int(20, 99); b2 = rng.int(10, a); }
        }
        if (!seen[a + op + b2]) break;
      }
      seen[a + op + b2] = true;
      problems.push({ a: a, b: b2, op: op, ans: op === "+" ? a + b2 : a - b2 });
    }
    return { activity: "math", problems: problems };
  }

  // ---------- Connect the dots ----------

  var DOT_TARGET = [0, 0, 24, 32, 45, 60]; // 0 = use the picture's own corner points

  function makeDots(settings, rng, pageIndex, order) {
    var name = settings.shape && WS.SHAPES[settings.shape] ? settings.shape : order[pageIndex % order.length];
    var shape = WS.SHAPES[name];
    var pts = shape.points();
    var letters = settings.dotLabels === "letters";
    var target = DOT_TARGET[levelOf(settings) - 1];
    if (letters) target = Math.min(target || pts.length, 26);
    if (target > pts.length) pts = densify(pts, target);
    if (letters && pts.length > 26) pts = pts.slice(0, 26);
    var labels = pts.map(function (_, i) { return letters ? ALPHABET[i] : String(i + 1); });
    return { name: name, label: shape.label, points: pts, labels: labels, letters: letters };
  }

  // Insert midpoints into the longest edges until we have `target` points.
  function densify(points, target) {
    var pts = points.slice();
    while (pts.length < target) {
      var best = 0, bestLen = -1;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], q = pts[(i + 1) % pts.length];
        var len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        if (len > bestLen) { bestLen = len; best = i; }
      }
      var a = pts[best], b = pts[(best + 1) % pts.length];
      pts.splice(best + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    return pts;
  }

  WS.makeRng = makeRng;
  WS.levelOf = levelOf;
  WS.difficultyOf = difficultyOf;
  WS.pickWords = pickWords;
  WS.wordPool = wordPool;
  WS.cleanWords = cleanWords;
  WS.ALPHABET = ALPHABET;
  WS.THEMES_ALL_WORDS = function () {
    var all = [];
    Object.keys(WS.THEMES).forEach(function (k) { all = all.concat(WS.THEMES[k].words); });
    return all;
  };
  WS.puzzles = {
    scramble: makeScramble,
    wordsearch: makeWordSearch,
    abc: makeAbc,
    numbers: makeNumbers,
    dots: makeDots
  };
  WS.densify = densify;
})(typeof window !== "undefined" ? window : globalThis);
