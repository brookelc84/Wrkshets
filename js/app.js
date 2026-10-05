/* Page wiring: reads the form, builds the PDF, shows a preview and downloads it. */
(function () {
  var WS = window.WS;
  var form = document.getElementById("controls");
  var frame = document.getElementById("previewFrame");
  var statusEl = document.getElementById("status");
  var STORE_KEY = "wrkshets-settings";
  var seed = (Math.random() * 1e9) >>> 0;
  var previewUrl = null;
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
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(doc.output("blob"));
      frame.src = previewUrl + "#view=FitH";
      var pages = doc.getNumberOfPages();
      statusEl.textContent = "Ready: " + pages + (pages === 1 ? " page." : " pages.");
    } catch (err) {
      statusEl.textContent = "Sorry, something went wrong making this worksheet. Try different settings.";
      if (window.console) console.error(err);
    }
  }

  function schedulePreview() {
    clearTimeout(timer);
    timer = setTimeout(refreshPreview, 250);
  }

  form.addEventListener("change", schedulePreview);
  form.addEventListener("input", function (e) {
    if (e.target.name === "customWords" || e.target.name === "pages") schedulePreview();
  });

  document.getElementById("download").addEventListener("click", function () {
    var r = build();
    r.doc.save(fileName(r.s));
    statusEl.textContent = "Downloaded " + fileName(r.s) + ".";
  });

  document.getElementById("shuffle").addEventListener("click", function () {
    seed = (Math.random() * 1e9) >>> 0;
    refreshPreview();
    statusEl.textContent += " New puzzles made.";
  });

  document.getElementById("openTab").addEventListener("click", function () {
    if (previewUrl) window.open(previewUrl, "_blank", "noopener");
  });

  restoreSettings();
  refreshPreview();
})();
