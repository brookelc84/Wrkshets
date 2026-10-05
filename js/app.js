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

  // Fill dropdowns from data.
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
      difficulty: fd.get("difficulty"),
      theme: fd.get("theme"),
      customWords: fd.get("customWords") || "",
      pages: parseInt(fd.get("pages"), 10) || 1,
      answerKey: fd.get("answerKey") === "on",
      largePrint: fd.get("largePrint") === "on",
      nameLine: fd.get("nameLine") === "on",
      paper: fd.get("paper"),
      abcActivity: fd.get("abcActivity"),
      numActivity: fd.get("numActivity"),
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
  function updateVisibility(s) {
    var usesWords = s.type === "wordsearch" || s.type === "scramble" || s.type === "bundle" ||
      (s.type === "abc" && (s.abcActivity === "order" || s.abcActivity === "trace"));
    document.querySelectorAll("[data-for]").forEach(function (el) {
      var f = el.getAttribute("data-for");
      var show = f === "words" ? usesWords : f === s.type || s.type === "bundle";
      el.hidden = !show;
    });
    document.querySelectorAll("[data-hide-for]").forEach(function (el) {
      el.hidden = el.getAttribute("data-hide-for") === s.type;
    });
  }

  function fileName(s) {
    var names = { wordsearch: "word-search", scramble: "word-scramble", abc: "abc-" + s.abcActivity,
      numbers: "numbers-" + s.numActivity, dots: "connect-the-dots", bundle: "mixed-pack" };
    return "wrkshets-" + names[s.type] + "-" + s.difficulty + ".pdf";
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

  // On claude.ai the page runs in a sandbox that only allows downloads through
  // the "downloads" capability; everywhere else a normal browser download is used.
  var downloadsCap = window.claude && window.claude.use
    ? window.claude.use("downloads").catch(function () { return null; })
    : Promise.resolve(null);

  document.getElementById("download").addEventListener("click", function () {
    var r = build();
    var name = fileName(r.s);
    downloadsCap.then(function (dl) {
      if (!dl) {
        r.doc.save(name);
        statusEl.textContent = "Downloaded " + name + ".";
        return;
      }
      statusEl.textContent = "Confirm the download to save " + name + ".";
      return dl.save({ filename: name, data: r.doc.output("blob") }).then(function () {
        statusEl.textContent = "Saved " + name + ".";
      }, function (err) {
        var code = err && err.code;
        statusEl.textContent = code === "declined" ? "Download cancelled."
          : code === "rate_limited" ? "A download is already waiting for you to confirm."
            : "This page could not save the file here. Try opening it in a web browser.";
      });
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
