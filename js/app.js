/* Page wiring: reads the form, builds the PDF, shows a preview and downloads it. */
(function () {
  var WS = window.WS;
  var form = document.getElementById("controls");
  var pagesEl = document.getElementById("previewPages");
  var pageCountEl = document.getElementById("pageCount");
  var MAX_PREVIEW_PAGES = 6;
  var renderToken = 0;
  var statusEl = document.getElementById("status");
  var STORE_KEY = "wrkshets-settings";
  var seed = (Math.random() * 1e9) >>> 0;
  var timer = null;

  // Activity cards, grouped by kind. Icons are decoration; names and descriptions carry the meaning.
  var CATALOG = [
    { group: "Word puzzles", items: [
      ["wordsearch", "\ud83d\udd0d", "Word Search", "Find hidden words in a grid"],
      ["scramble", "\ud83d\udd00", "Word Scramble", "Unmix the letters"],
      ["cryptogram", "\ud83d\udd10", "Code Breaker", "Decode a secret message"]] },
    { group: "Logic and drawing", items: [
      ["sudoku", "\ud83e\udde9", "Sudoku", "Number grid logic puzzle"],
      ["maze", "\ud83c\udf00", "Maze", "Find the way through"],
      ["dots", "\u270f\ufe0f", "Connect the Dots", "Join the dots to make a picture"]] },
    { group: "Math and life skills", items: [
      ["math", "\u2795", "Math Practice", "From adding to algebra"],
      ["numbers", "\ud83d\udd22", "1 2 3 4", "Tracing, counting, number patterns"],
      ["time", "\ud83d\udd52", "Telling Time", "Clocks and how long things take"],
      ["money", "\ud83d\udcb5", "Money", "Counting, change, budgets"]] },
    { group: "Reading and writing", items: [
      ["abc", "\ud83d\udd24", "ABC", "Letters and alphabet order"],
      ["spelling", "\ud83d\udcdd", "Spelling Practice", "Look, say, write, check"],
      ["writing", "\ud83d\udcd3", "Writing Prompts", "Sentences, paragraphs, essays"]] },
    { group: "Something of everything", items: [
      ["bundle", "\ud83d\udcda", "Mixed Pack", "Six different activities for your level"]] }
  ];
  var groupsEl = document.getElementById("typeGroups");
  CATALOG.forEach(function (g) {
    var wrap = document.createElement("div");
    wrap.className = "type-group";
    var h = document.createElement("p");
    h.className = "group-name";
    h.textContent = g.group;
    var grid = document.createElement("div");
    grid.className = "types";
    grid.setAttribute("role", "radiogroup");
    grid.setAttribute("aria-label", g.group);
    g.items.forEach(function (it, i) {
      var label = document.createElement("label");
      label.className = "type";
      label.innerHTML = '<input type="radio" name="type" id="type-' + it[0] + '" value="' + it[0] + '">' +
        '<span class="type-card"><span class="icon" aria-hidden="true"></span><span class="type-name"></span><span class="type-desc"></span></span>';
      label.querySelector(".icon").textContent = it[1];
      label.querySelector(".type-name").textContent = it[2];
      label.querySelector(".type-desc").textContent = it[3];
      grid.appendChild(label);
    });
    wrap.appendChild(h);
    wrap.appendChild(grid);
    groupsEl.appendChild(wrap);
  });
  document.getElementById("type-wordsearch").checked = true;

  // Fill dropdowns from data.
  var curSel = document.getElementById("currency");
  Object.keys(WS.CURRENCIES).forEach(function (k) { curSel.add(new Option(WS.CURRENCIES[k].label, k)); });
  var themeSel = document.getElementById("theme");
  Object.keys(WS.THEMES).forEach(function (k) {
    themeSel.add(new Option(WS.THEMES[k].label, k));
  });
  var shapeSel = document.getElementById("shape");
  Object.keys(WS.SHAPES).sort().forEach(function (k) {
    shapeSel.add(new Option(WS.SHAPES[k].label, k));
  });

  function readSettings() {
    var fd = new FormData(form);
    return {
      type: fd.get("type"),
      level: parseInt(fd.get("level"), 10) || 2,
      theme: fd.get("theme"),
      customWords: fd.get("customWords") || "",
      pages: parseInt(fd.get("pages"), 10) || 1,
      answerKey: fd.get("answerKey") === "on",
      largePrint: fd.get("largePrint") === "on",
      nameLine: fd.get("nameLine") === "on",
      paper: fd.get("paper"),
      abcActivity: fd.get("abcActivity"),
      numActivity: fd.get("numActivity"),
      mathTopic: fd.get("mathTopic"),
      timeActivity: fd.get("timeActivity"),
      currency: fd.get("currency"),
      shape: fd.get("shape"),
      dotLabels: fd.get("dotLabels"),
      seed: seed
    };
  }

  function saveSettings(s) {
    try {
      var copy = Object.assign({}, s);
      delete copy.seed;
      localStorage.setItem(STORE_KEY, JSON.stringify(copy));
    } catch (e) { /* storage unavailable: settings just won't be remembered */ }
  }

  function restoreSettings() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) { saved = null; }
    if (!saved) return;
    Object.keys(saved).forEach(function (name) {
      var els = form.elements[name];
      if (!els) return;
      var v = saved[name];
      if (els instanceof RadioNodeList && els.length && els[0].type === "radio") {
        Array.prototype.forEach.call(els, function (el) { el.checked = el.value === v; });
      } else if (els.type === "checkbox") {
        els.checked = !!v;
      } else {
        els.value = v;
      }
    });
  }

  // Only show the settings that matter for the chosen activity.
  var WORD_TYPES = ["wordsearch", "scramble", "spelling", "bundle"];
  function updateVisibility(s) {
    var usesWords = WORD_TYPES.indexOf(s.type) >= 0 || (s.type === "cryptogram" && s.level === 1) ||
      (s.type === "abc" && (s.abcActivity === "order" || s.abcActivity === "trace"));
    var shown = 0;
    document.querySelectorAll("[data-for]").forEach(function (el) {
      var f = el.getAttribute("data-for");
      el.hidden = !(f === "words" ? usesWords : f === s.type);
      if (!el.hidden) shown++;
    });
    document.querySelectorAll("[data-hide-for]").forEach(function (el) {
      el.hidden = el.getAttribute("data-hide-for") === s.type;
    });
    document.getElementById("noSettings").hidden = shown > 0;
    var t = WS.TYPES[s.type];
    document.getElementById("levelHint").textContent = s.type === "bundle"
      ? "Six activities chosen to suit level " + s.level + ", one page each."
      : t && t.describe ? t.label + " at level " + s.level + ": " + t.describe(s.level) : "";
  }

  function fileName(s) {
    var names = { wordsearch: "word-search", scramble: "word-scramble", abc: "abc-" + s.abcActivity,
      numbers: "numbers-" + s.numActivity, dots: "connect-the-dots", bundle: "mixed-pack",
      math: "math-" + s.mathTopic, time: "telling-time-" + s.timeActivity, money: "money",
      sudoku: "sudoku", maze: "maze", cryptogram: "code-breaker", spelling: "spelling", writing: "writing" };
    return "wrkshets-" + (names[s.type] || s.type) + "-level-" + s.level + ".pdf";
  }

  function build() {
    var s = readSettings();
    return { s: s, doc: WS.buildPdf(window.jspdf.jsPDF, s) };
  }

  function refreshPreview() {
    var s = readSettings();
    updateVisibility(s);
    saveSettings(s);
    try {
      var doc = WS.buildPdf(window.jspdf.jsPDF, s);
      var pages = doc.getNumberOfPages();
      pageCountEl.textContent = pages + (pages === 1 ? " page" : " pages");
      statusEl.textContent = "Ready: " + pages + (pages === 1 ? " page." : " pages.");
      renderPreview(doc);
    } catch (err) {
      statusEl.textContent = "Sorry, something went wrong making this worksheet. Try different settings.";
      if (window.console) console.error(err);
    }
  }

  // Draw the first few pages onto canvases with PDF.js. This works everywhere,
  // including phones and embedded viewers that cannot show a PDF in a frame.
  function renderPreview(doc) {
    var token = ++renderToken;
    var pdfjs = window.pdfjsLib;
    if (!pdfjs) {
      var url = URL.createObjectURL(doc.output("blob"));
      pagesEl.innerHTML = "";
      var fr = document.createElement("iframe");
      fr.title = "Worksheet preview";
      fr.src = url + "#view=FitH";
      pagesEl.appendChild(fr);
      return;
    }
    var data = new Uint8Array(doc.output("arraybuffer"));
    pdfjs.getDocument({ data: data, isEvalSupported: false }).promise.then(function (pdf) {
      if (token !== renderToken) return;
      var count = Math.min(pdf.numPages, MAX_PREVIEW_PAGES);
      var canvases = [];
      var chain = Promise.resolve();
      for (var n = 1; n <= count; n++) {
        (function (num) {
          chain = chain.then(function () {
            if (token !== renderToken) return;
            return pdf.getPage(num).then(function (page) {
              var width = Math.max(300, pagesEl.clientWidth - 32);
              var base = page.getViewport({ scale: 1 });
              var ratio = Math.min(window.devicePixelRatio || 1, 2);
              var vp = page.getViewport({ scale: (width / base.width) * ratio });
              var canvas = document.createElement("canvas");
              canvas.width = Math.floor(vp.width);
              canvas.height = Math.floor(vp.height);
              canvas.setAttribute("role", "img");
              canvas.setAttribute("aria-label", "Page " + num + " of the worksheet");
              canvases.push(canvas);
              return page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
            });
          });
        })(n);
      }
      return chain.then(function () {
        if (token !== renderToken) return;
        pagesEl.innerHTML = "";
        canvases.forEach(function (c) { pagesEl.appendChild(c); });
        if (pdf.numPages > count) {
          var note = document.createElement("p");
          note.className = "preview-note";
          note.textContent = "Showing the first " + count + " of " + pdf.numPages + " pages. The download has them all.";
          pagesEl.appendChild(note);
        }
      });
    }).catch(function (err) {
      if (window.console) console.error(err);
      pagesEl.textContent = "The preview could not be shown. Download PDF still works.";
    });
  }

  function schedulePreview() {
    clearTimeout(timer);
    timer = setTimeout(refreshPreview, 250);
  }

  form.addEventListener("change", schedulePreview);
  form.addEventListener("input", function (e) {
    if (e.target.name === "customWords" || e.target.name === "pages") schedulePreview();
  });

  // On claude.ai the page runs in a sandbox that only allows downloads through the
  // "downloads" capability, which asks the viewer to confirm. Everywhere else a
  // normal browser download is used.
  function getDownloads() {
    var c = window.claude;
    if (!c || typeof c.use !== "function") return Promise.resolve(null);
    return c.use("downloads").catch(function () { return null; });
  }
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var downloadBtn = document.getElementById("download");

  downloadBtn.addEventListener("click", function () {
    var r = build();
    var name = fileName(r.s);
    var bytes = new Uint8Array(r.doc.output("arraybuffer"));
    downloadBtn.disabled = true;
    statusEl.textContent = "Preparing " + name + " ...";
    getDownloads().then(function (dl) {
      if (!dl) {
        r.doc.save(name);
        statusEl.textContent = embedded
          ? "If nothing downloaded, this view blocks downloads. Open the page in your web browser and try again."
          : "Downloaded " + name + ". Check your Downloads folder.";
        return;
      }
      statusEl.textContent = "A box will ask you to confirm. Choose Save to download " + name + ".";
      return dl.save({ filename: name, data: bytes }).then(function (res) {
        statusEl.textContent = res && res.status === "delivered" ? "Sent " + name + "." : "Saved " + name + ". Check your Downloads folder.";
      }, function (err) {
        var code = (err && err.code) || "unknown";
        statusEl.textContent = code === "declined" ? "Download cancelled. Click Download PDF to try again."
          : code === "rate_limited" ? "A download is already waiting for you to confirm."
            : "The download did not work here (" + code + "). Try opening the page in a web browser.";
      });
    }).then(function () { downloadBtn.disabled = false; }, function (err) {
      downloadBtn.disabled = false;
      statusEl.textContent = "The download did not work: " + (err && err.message ? err.message : err);
    });
  });

  document.getElementById("shuffle").addEventListener("click", function () {
    seed = (Math.random() * 1e9) >>> 0;
    refreshPreview();
    statusEl.textContent += " New puzzles made.";
  });

  restoreSettings();
  refreshPreview();
})();
