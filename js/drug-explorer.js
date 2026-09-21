/* =========================================================
   PHARMA 3D — Drug Explorer
   /drug.html        -> index of exactly 12 drugs, with filter
   /drug/[slug].html -> one drug, 10 topics with progress-style nav

   Molecular formula, molecular weight and SMILES are rendered
   ONLY when data/drugs.json marks the structure VERIFIED.
   Otherwise the field shows DATA PENDING VERIFICATION.
   Nothing is approximated or estimated here.
   ========================================================= */
(function () {
  "use strict";

  var UI = window.P3DUI, esc = window.p3dEsc;
  var root = document.getElementById("drug-root");
  if (!root || !UI) return;
  var slug = document.documentElement.getAttribute("data-drug");

  var TOPICS = [
    { id: "class", label: "Class & uses" },
    { id: "mechanism", label: "Mechanism" },
    { id: "dosage", label: "Forms & routes" },
    { id: "pk", label: "Pharmacokinetics" },
    { id: "safety", label: "Safety" },
    { id: "interactions", label: "Interactions" },
    { id: "monitoring", label: "Monitoring & counselling" },
    { id: "pharmaceutical", label: "Pharmaceutical" },
    { id: "structure", label: "Structure data" },
    { id: "references", label: "References" }
  ];

  function url(s) { return window.p3dUrl("drug/" + s + ".html"); }

  /* ---------------- INDEX ---------------- */
  function renderIndex(data) {
    var drugs = data.drugs;
    root.innerHTML =
      '<header class="mod-head"><span class="section-eyebrow">Drug Explorer</span>' +
      "<h1>Twelve drugs, one consistent layout</h1>" +
      '<p class="lead">Each drug page uses the same ten topics, so you can compare like with like. Content is general, textbook-level education.</p>' +
      '<div class="mod-limit" role="note"><strong>Not clinical advice.</strong> These pages give no patient-specific dosing. Always check a current formulary, pharmacopoeia or the product label before any clinical or dispensing decision.</div></header>' +
      '<div class="field idx-search"><label for="drug-filter">Filter drugs by name or class</label>' +
      '<input id="drug-filter" type="search" autocomplete="off" placeholder="e.g. antibiotic, statin, warfarin"></div>' +
      '<p class="muted" id="drug-count" role="status" aria-live="polite"></p>' +
      '<ul class="idx-grid" id="drug-grid"></ul>';

    var grid = document.getElementById("drug-grid");
    var input = document.getElementById("drug-filter");
    var count = document.getElementById("drug-count");
    function draw() {
      var q = input.value.trim().toLowerCase();
      var list = drugs.filter(function (d) {
        return !q || (d.name + " " + d.alsoKnownAs + " " + d.family + " " + d["class"]).toLowerCase().indexOf(q) > -1;
      });
      count.textContent = list.length + " of " + drugs.length + " drugs shown";
      grid.innerHTML = list.length ? list.map(function (d) {
        return '<li><a class="idx-card" href="' + url(d.slug) + '">' +
          '<span class="idx-ico" aria-hidden="true">' + esc(d.name.charAt(0)) + "</span>" +
          '<span class="idx-body"><span class="idx-title">' + esc(d.name) + '</span><span class="idx-desc">' + esc(d.family) + "</span></span>" +
          '<span class="idx-go" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
      }).join("") : '<li class="idx-empty">No drug matches that filter.</li>';
      UI.hydrate(grid);
    }
    input.addEventListener("input", draw);
    draw();
  }

  /* ---------------- DETAIL ---------------- */
  function structureBlock(d) {
    var s = d.structure;
    if (s && s.status === "VERIFIED") {
      return '<div class="struct"><h3>Structure data <span class="badge badge-established" style="margin-left:8px;">Verified</span></h3>' +
        '<dl class="kv">' +
        "<dt>Molecular formula</dt><dd><code>" + esc(s.formula) + "</code></dd>" +
        "<dt>Molecular weight</dt><dd><code>" + esc(s.mw) + "</code> g/mol (average, computed from standard atomic weights)</dd>" +
        "<dt>SMILES</dt><dd><div class=\"copy-row\"><div class=\"mono-block\" tabindex=\"0\" role=\"group\" aria-label=\"SMILES string for " + esc(d.name) + "\">" + esc(s.smiles) +
        '</div><button type="button" class="btn btn-secondary btn-sm" data-copy="' + esc(s.smiles) + '">Copy</button></div></dd>' +
        "<dt>Notes</dt><dd>" + esc(s.note) + "</dd></dl>" +
        '<p class="muted" style="margin-top:12px;font-size:.85rem;">' + esc(s.method) + ". Molecular weight refers to the neutral form shown, not to any salt or hydrate.</p></div>";
    }
    return '<div class="struct struct-pending"><h3>Structure data <span class="badge badge-pending" style="margin-left:8px;">Data pending verification</span></h3>' +
      "<dl class=\"kv\"><dt>Molecular formula</dt><dd>DATA PENDING VERIFICATION</dd><dt>Molecular weight</dt><dd>DATA PENDING VERIFICATION</dd><dt>SMILES</dt><dd>DATA PENDING VERIFICATION</dd></dl>" +
      '<p class="muted" style="margin-top:12px;font-size:.85rem;">These values are not shown until they have been verified. They are never approximated.</p></div>';
  }

  function renderDetail(data) {
    var list = data.drugs;
    var i = list.findIndex(function (x) { return x.slug === slug; });
    if (i < 0) { root.innerHTML = '<div class="state-block"><h3>Drug not found</h3><a class="btn btn-primary" href="' + window.p3dUrl("drug.html") + '">Back to the Drug Explorer</a></div>'; return; }
    var d = list[i];

    var bodies = {};
    bodies["class"] =
      '<h2 class="mod-h2">Class and uses</h2>' +
      UI.accordion([
        { title: "Class", body: UI.para(d["class"]), open: true },
        { title: "Uses", body: UI.bullets(d.uses), open: true }
      ], { tools: false });
    bodies.mechanism =
      '<h2 class="mod-h2">Mechanism of action</h2>' +
      UI.accordion([{ title: "How it works", body: UI.bullets(d.mechanism), open: true }], { tools: false });
    bodies.dosage =
      '<h2 class="mod-h2">Dosage forms and routes</h2>' +
      UI.accordion([
        { title: "Dosage forms", body: UI.bullets(d.dosageForms), open: true },
        { title: "Routes of administration", body: UI.bullets(d.routes), open: true }
      ], { tools: false }) +
      '<div class="note-block" role="note"><strong>No dose given.</strong> Dose depends on the patient and indication. Use a current formulary or the product label.</div>';
    bodies.pk =
      '<h2 class="mod-h2">Pharmacokinetics</h2>' +
      UI.accordion([
        { title: "Absorption", body: UI.para(d.pk.absorption), open: true },
        { title: "Distribution", body: UI.para(d.pk.distribution) },
        { title: "Metabolism", body: UI.para(d.pk.metabolism) },
        { title: "Excretion", body: UI.para(d.pk.excretion) },
        { title: "Half-life", body: UI.para(d.pk.halfLife) }
      ]);
    bodies.safety =
      '<h2 class="mod-h2">Safety</h2>' +
      UI.accordion([
        { title: "Adverse effects", body: UI.bullets(d.adverse), open: true },
        { title: "Contraindications", body: UI.bullets(d.contraindications) },
        { title: "Precautions", body: UI.bullets(d.precautions) }
      ]);
    bodies.interactions =
      '<h2 class="mod-h2">Interactions</h2>' +
      UI.accordion([{ title: "Key interaction themes", body: UI.bullets(d.interactions), open: true }], { tools: false }) +
      '<div class="note-block" role="note"><strong>Not exhaustive.</strong> Always check a current interactions reference before adding, changing or stopping any medicine.</div>';
    bodies.monitoring =
      '<h2 class="mod-h2">Monitoring and patient counselling</h2>' +
      UI.accordion([
        { title: "Monitoring", body: UI.bullets(d.monitoring), open: true },
        { title: "Patient counselling points", body: UI.bullets(d.counselling), open: true }
      ], { tools: false });
    bodies.pharmaceutical =
      '<h2 class="mod-h2">Pharmaceutical considerations and storage</h2>' +
      UI.accordion([
        { title: "Pharmaceutical considerations", body: UI.bullets(d.pharmaceutical), open: true },
        { title: "Storage", body: UI.para(d.storage), open: true }
      ], { tools: false });
    bodies.structure =
      '<h2 class="mod-h2">Structure data</h2>' + structureBlock(d);
    bodies.references =
      '<h2 class="mod-h2">References</h2>' + UI.references(d.references);

    var head =
      '<header class="mod-head"><span class="section-eyebrow">Drug Explorer · ' + esc(d.family) + "</span>" +
      "<h1>" + esc(d.name) + "</h1>" +
      (d.alsoKnownAs ? '<p class="muted" style="margin-top:4px;">Also known as: ' + esc(d.alsoKnownAs) + "</p>" : "") +
      '<p class="lead">' + esc(d.summary) + "</p>" +
      '<div class="mod-meta"><span class="tag-chip">' + esc(d.family) + "</span>" + window.p3dBadge(d.evidence) + "</div>" +
      '<div class="mod-limit" role="note"><strong>Education only.</strong> No patient-specific dosing is given. Confirm every detail against a current formulary, pharmacopoeia or the product label.</div></header>';

    root.innerHTML =
      head + UI.topicNav(TOPICS, "Drug topics") + UI.panels(TOPICS, bodies) +
      UI.prevNext(list, i, function (x) { return url(x.slug); }, function (x) { return x.name; }, "drug");

    UI.wireAccordions(root);
    UI.wireTopics(root, TOPICS);
    UI.wireCopy(root);
    UI.hydrate(root);
    document.title = d.name + " — Drug Explorer — PHARMA 3D";
  }

  UI.loadJson("drugs.json").then(function (data) {
    if (slug) renderDetail(data); else renderIndex(data);
  }).catch(function () { root.innerHTML = UI.errorBlock("Could not load the Drug Explorer"); });
})();
