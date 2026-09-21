/* =========================================================
   PHARMA 3D — Instruments module
   /instruments.html        -> index of 7 instruments + calculator hub
   /instruments/[id].html   -> six fixed sections per instrument:
     WHAT IT MEASURES, HOW IT WORKS, SAMPLE, OUTPUT,
     APPLICATION, COMMON ERRORS  (+ calculator card, references)
   ========================================================= */
(function () {
  "use strict";

  var UI = window.P3DUI, esc = window.p3dEsc;
  var root = document.getElementById("inst-root");
  if (!root || !UI) return;
  var id = document.documentElement.getAttribute("data-instrument");

  var TOPICS = [
    { id: "measures", label: "What it measures" },
    { id: "how", label: "How it works" },
    { id: "sample", label: "Sample" },
    { id: "output", label: "Output" },
    { id: "application", label: "Application" },
    { id: "errors", label: "Common errors" },
    { id: "calculator", label: "Calculator" },
    { id: "references", label: "References" }
  ];
  var CALC_LABEL = {
    hplc: "HPLC conceptual illustration", uvvis: "Beer-Lambert calculator", dissolution: "Noyes-Whitney calculator",
    centrifuge: "RCF calculator", microscope: "Resolution calculator",
    "qualitative-press": "Process explanation (no numbers)", "qualitative-filler": "Process explanation (no numbers)"
  };
  function url(i) { return window.p3dUrl("instruments/" + i + ".html"); }

  function renderIndex(data) {
    root.innerHTML =
      '<header class="mod-head"><span class="section-eyebrow">Instruments</span>' +
      "<h1>Seven instruments, six questions each</h1>" +
      '<p class="lead">Every instrument page answers the same six questions: what it measures, how it works, what sample it needs, what output it gives, where it is applied, and what commonly goes wrong.</p>' +
      '<div class="mod-limit" role="note"><strong>Learning tools.</strong> The calculators here use real equations, but they are not validated analytical, manufacturing or regulatory methods. The tablet press and capsule filler are explained qualitatively and produce no numeric output.</div></header>' +
      '<div class="field idx-search"><label for="inst-filter">Filter instruments</label><input id="inst-filter" type="search" autocomplete="off" placeholder="e.g. chromatography, spin"></div>' +
      '<p class="muted" id="inst-count" role="status" aria-live="polite"></p>' +
      '<ul class="idx-grid" id="inst-grid"></ul>' +
      '<h2 class="mod-h2" style="margin-top:var(--space-10)">Try the calculators</h2>' +
      '<p class="mod-lead" style="margin-bottom:var(--space-4)">Each calculator also appears on its instrument page. They work by touch, mouse or keyboard.</p>' +
      '<div class="hub-strip" id="calc-hub"></div>';
    var grid = document.getElementById("inst-grid"), input = document.getElementById("inst-filter"), count = document.getElementById("inst-count");
    function draw() {
      var q = input.value.trim().toLowerCase();
      var list = data.instruments.filter(function (x) { return !q || (x.name + " " + x.short).toLowerCase().indexOf(q) > -1; });
      count.textContent = list.length + " of " + data.instruments.length + " instruments shown";
      grid.innerHTML = list.length ? list.map(function (x) {
        return '<li><a class="idx-card" href="' + url(x.id) + '"><span class="idx-ico" data-icon="' + esc(x.icon) + '" aria-hidden="true"></span>' +
          '<span class="idx-body"><span class="idx-title">' + esc(x.name) + '</span><span class="idx-desc">' + esc(x.short) + "</span></span>" +
          '<span class="idx-go" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
      }).join("") : '<li class="idx-empty">No instrument matches that filter.</li>';
      UI.hydrate(grid);
    }
    input.addEventListener("input", draw); draw();
    document.getElementById("calc-hub").innerHTML = data.instruments.map(function (x) {
      return '<a class="idx-card" style="grid-template-columns:1fr 44px" href="' + url(x.id) + '#calculator"><span class="idx-body"><span class="idx-title">' + esc(x.name) + '</span><span class="idx-desc">' + esc(CALC_LABEL[x.calc] || "") + '</span></span><span class="idx-go" data-icon="arrowRight" aria-hidden="true"></span></a>';
    }).join("");
    UI.hydrate(document.getElementById("calc-hub"));
  }

  function renderDetail(data) {
    var list = data.instruments;
    var i = list.findIndex(function (x) { return x.id === id; });
    if (i < 0) { root.innerHTML = '<div class="state-block"><h3>Instrument not found</h3><a class="btn btn-primary" href="' + window.p3dUrl("instruments.html") + '">Back to Instruments</a></div>'; return; }
    var x = list[i];
    var b = {};
    b.measures = '<h2 class="mod-h2">What it measures</h2><p class="mod-lead">' + esc(x.measures) + "</p>";
    b.how = '<h2 class="mod-h2">How it works</h2><p class="mod-lead">' + esc(x.how) + "</p>";
    b.sample = '<h2 class="mod-h2">Sample</h2><p class="mod-lead">' + esc(x.sample) + "</p>";
    b.output = '<h2 class="mod-h2">Output</h2><p class="mod-lead">' + esc(x.output) + "</p>";
    b.application = '<h2 class="mod-h2">Application</h2><p class="mod-lead">' + esc(x.application) + '</p><div class="note-block" role="note"><strong>Limitations.</strong> ' + esc(x.limitations) + "</div>";
    b.errors = '<h2 class="mod-h2">Common errors</h2>' + UI.bullets(x.errors);
    b.calculator = '<h2 class="mod-h2">Calculator</h2><div id="calc-mount"></div>';
    b.references = '<h2 class="mod-h2">References</h2>' + UI.references(x.references);

    var head =
      '<header class="mod-head"><span class="section-eyebrow">Instruments</span><h1>' + esc(x.name) + "</h1>" +
      '<p class="lead">' + esc(x.short) + "</p>" +
      '<div class="mod-meta">' + window.p3dBadge(x.evidence) + "</div>" +
      '<div class="mod-limit" role="note"><strong>Education only.</strong> Not a validated method or a manufacturing or regulatory guarantee.</div></header>';

    root.innerHTML = head + UI.topicNav(TOPICS, "Instrument sections") + UI.panels(TOPICS, b) +
      UI.prevNext(list, i, function (y) { return url(y.id); }, function (y) { return y.name; }, "instrument");
    UI.wireAccordions(root);
    var show = UI.wireTopics(root, TOPICS);
    if (window.P3DCalc) window.P3DCalc.mount(document.getElementById("calc-mount"), x.calc);
    UI.hydrate(root);
    document.title = x.name + " — Instruments — PHARMA 3D";
  }

  UI.loadJson("instruments.json").then(function (data) {
    if (id) renderDetail(data); else renderIndex(data);
  }).catch(function () { root.innerHTML = UI.errorBlock("Could not load Instruments"); });
})();
