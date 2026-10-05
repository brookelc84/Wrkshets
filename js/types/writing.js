/* Writing Prompts: sentence starters (levels 1–2), short paragraphs (3–4), essays (5–6). */
(function (root) {
  var WS = (root.WS = root.WS || {});

  var PROMPTS = {
    starters: [
      ["My favorite food is", "I like it because"],
      ["Today I feel", "I feel this way because"],
      ["Something I am good at is", "I learned it by"],
      ["My favorite place to go is", "When I am there I"],
      ["On the weekend I like to", "It makes me feel"],
      ["One thing I want to learn is", "I want to learn it because"],
      ["My favorite animal is", "It can"],
      ["A song I like is", "I like it because"],
      ["The weather today is", "When it is like this I"],
      ["A person who helps me is", "They help me by"],
      ["My favorite thing to drink is", "I drink it when"],
      ["A job I would like to try is", "I would be good at it because"]
    ],
    paragraph: [
      "Describe your morning routine, step by step.",
      "Write about a place where you feel calm. What do you see, hear and smell there?",
      "Explain how to make your favorite snack so someone else could make it.",
      "Write about a hobby you enjoy. How did you start, and why do you like it?",
      "Describe a time you solved a problem. What happened, and what did you do?",
      "If you could visit anywhere in the world, where would you go and why?",
      "Write a letter to a friend telling them about your week.",
      "What makes a good friend? Give three examples.",
      "Describe your favorite season. What do you like to do then?",
      "Write about something new you tried. How did it go?",
      "Describe your perfect day, from waking up to going to bed.",
      "Explain the rules of a game you know to someone who has never played it."
    ],
    essay: [
      "Should everyone learn to cook? Give reasons for your opinion.",
      "Describe a goal you have for the next year and the steps you will take to reach it.",
      "Some people like routines and others like change. Which do you prefer, and why?",
      "Explain a topic you know a lot about to someone who knows nothing about it.",
      "Write about a book, film or show that changed how you think about something.",
      "What is one change that would make your town better? Explain how it could happen.",
      "Compare two hobbies. How are they alike, and how are they different?",
      "Is technology making daily life better or worse? Support your view with examples.",
      "Describe a skill that took you a long time to learn. What helped you keep going?",
      "Write a review of a place you have visited. Would you recommend it? Why or why not?",
      "Many workplaces now offer quiet rooms. Argue for or against this idea.",
      "What does independence mean to you? Use examples from your own life."
    ]
  };

  function generate(settings, rng, pageIndex) {
    var L = settings.level;
    var band = L <= 2 ? "starters" : L <= 4 ? "paragraph" : "essay";
    var order = WS.makeRng((settings.seed ^ 0x9e11) >>> 0).shuffle(PROMPTS[band]);
    return { band: band, prompt: order[pageIndex % order.length] };
  }

  function lines(ctx, top, bottom, gap) {
    var D = WS.draw, doc = ctx.doc;
    D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.3);
    for (var y = top + gap; y <= bottom; y += gap) doc.line(ctx.M, y, ctx.W - ctx.M, y);
  }

  function draw(ctx, pz) {
    var D = WS.draw, doc = ctx.doc, L = ctx.settings.level;
    var bottom = ctx.H - ctx.M - 8;
    if (pz.band === "starters") {
      var y = D.header(ctx, "Writing - Finish the Sentences", [
        "Read the start of each sentence. Finish it with your own words.",
        "You can draw a picture in the box too."
      ], false);
      var boxH = 60 * Math.min(ctx.scale, 1.1);
      D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.4);
      doc.roundedRect(ctx.M, y, ctx.W - 2 * ctx.M, boxH, 3, 3, "S");
      D.font(ctx, 10); D.setText(doc, D.SOFT); doc.text("My picture", ctx.M + 4, y + 6);
      y += boxH + 6;
      var capH = 9 * ctx.scale, rowGap = capH * 2.6;
      pz.prompt.forEach(function (start) {
        D.font(ctx, 15, "bold"); D.setText(doc, D.INK);
        doc.text(start, ctx.M, y + 6);
        y += 9;
        for (var k = 0; k < 2 && y + rowGap < bottom; k++) {
          D.guideRow(ctx, ctx.M, ctx.W - ctx.M, y + rowGap * 0.75, capH);
          y += rowGap;
        }
        y += 4;
      });
      return D.footer(ctx, "Level " + L);
    }

    var essay = pz.band === "essay";
    var y2 = D.header(ctx, essay ? "Writing - Essay" : "Writing - Paragraph", [
      essay ? "Read the prompt. Plan your ideas first, then write several paragraphs."
        : "Read the prompt. Jot down your ideas, then write a paragraph.",
      "There are no wrong answers. Write in full sentences."
    ], false);
    D.setFill(doc, [243, 246, 246]);
    D.font(ctx, 14, "bold");
    var pl = doc.splitTextToSize(pz.prompt, ctx.W - 2 * ctx.M - 12);
    var ph = pl.length * 14 * ctx.scale * D.PT * 1.4 + 8;
    doc.roundedRect(ctx.M, y2, ctx.W - 2 * ctx.M, ph, 3, 3, "F");
    D.setText(doc, D.INK); doc.text(pl, ctx.M + 6, y2 + 8);
    y2 += ph + 6;

    var plan = essay ? ["Main idea", "Reason or example 1", "Reason or example 2", "Conclusion"] : ["First", "Next", "Last"];
    var cw = (ctx.W - 2 * ctx.M - (plan.length - 1) * 4) / plan.length, planH = 30 * ctx.scale;
    plan.forEach(function (p, i) {
      var x = ctx.M + i * (cw + 4);
      D.setDraw(doc, D.LIGHT); doc.setLineWidth(0.4);
      doc.roundedRect(x, y2, cw, planH, 2, 2, "S");
      D.font(ctx, 9.5, "bold"); D.setText(doc, D.ACCENT); doc.text(p.toUpperCase(), x + 3, y2 + 5);
    });
    y2 += planH + 4;
    D.font(ctx, 10, "bold"); D.setText(doc, D.SOFT); doc.text("My writing", ctx.M, y2 + 3);
    lines(ctx, y2 + 2, bottom, (essay ? 8.5 : 10) * ctx.scale);
    D.footer(ctx, "Level " + L);
  }

  WS.registerType("writing", {
    label: "Writing Prompts", generate: generate, draw: draw,
    key: function () { return false; },
    describe: function (L) {
      return L <= 2 ? "Sentence starters with handwriting lines and a picture box"
        : L <= 4 ? "Paragraph prompts with a First / Next / Last plan"
          : "Opinion and explaining essays with a planning section";
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
