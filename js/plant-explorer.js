/* =========================================================
   PHARMA 3D — Plant Explorer
   /plants.html        -> index of exactly 8 plants
   /plants/[slug].html -> one plant, with TRADITIONAL USE and
                          EXPERIMENTAL / SCIENTIFIC EVIDENCE kept
                          in two visually separate blocks.

   Separation is never colour-only: the two blocks differ in
   border style (dashed vs solid), icon (open vs filled), and an
   explicit text label, and each carries its own evidence tier.
   ========================================================= */
(function () {
  "use strict";

  var UI = window.P3DUI, esc = window.p3dEsc;
  var root = document.getElementById("plant-root");
  if (!root || !UI) return;
  var slug = document.documentElement.getAttribute("data-plant");

  var TOPICS = [
    { id: "identity", label: "Identity" },
    { id: "morphology", label: "Morphology & microscopy" },
    { id: "chemistry", label: "Constituents & extraction" },
    { id: "quality", label: "Identification & quality" },
    { id: "significance", label: "Significance & cautions" },
    { id: "evidence", label: "Traditional vs evidence" },
    { id: "references", label: "References" }
  ];

  function url(s) { return window.p3dUrl("plants/" + s + ".html"); }

  function renderIndex(data) {
    root.innerHTML =
      '<header class="mod-head"><span class="section-eyebrow">Plant Explorer</span>' +
      "<h1>Eight medicinal plants, two kinds of knowledge</h1>" +
      '<p class="lead">Every plant page keeps <strong>traditional use</strong> and <strong>experimental / scientific evidence</strong> in separate blocks, so a long history of use is never mistaken for proof.</p>' +
      '<div class="mod-limit" role="note"><strong>Not treatment advice.</strong> Nothing here recommends using a plant to treat any condition. Some plants covered are poisonous or legally controlled.</div></header>' +
      '<div class="field idx-search"><label for="plant-filter">Filter plants by name or family</label>' +
      '<input id="plant-filter" type="search" autocomplete="off" placeholder="e.g. Apocynaceae, digitalis"></div>' +
      '<p class="muted" id="plant-count" role="status" aria-live="polite"></p>' +
      '<ul class="idx-grid" id="plant-grid"></ul>';
    var grid = document.getElementById("plant-grid"), input = document.getElementById("plant-filter"), count = document.getElementById("plant-count");
    function draw() {
      var q = input.value.trim().toLowerCase();
      var list = data.plants.filter(function (p) { return !q || (p.name + " " + p.latin + " " + p.family).toLowerCase().indexOf(q) > -1; });
      count.textContent = list.length + " of " + data.plants.length + " plants shown";
      grid.innerHTML = list.length ? list.map(function (p) {
        return '<li><a class="idx-card" href="' + url(p.slug) + '">' +
          '<span class="idx-ico" data-icon="plant" aria-hidden="true"></span>' +
          '<span class="idx-body"><span class="idx-title">' + esc(p.name) + '</span><span class="idx-desc"><em>' + esc(p.latin) + "</em> · " + esc(p.family) + "</span></span>" +
          '<span class="idx-go" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
      }).join("") : '<li class="idx-empty">No plant matches that filter.</li>';
      UI.hydrate(grid);
    }
    input.addEventListener("input", draw); draw();
  }

  function evidenceBlock(p) {
    var t = p.traditional, s = p.scientific;
    return '<h2 class="mod-h2">Traditional use vs experimental / scientific evidence</h2>' +
      '<p class="mod-lead">These are two different kinds of knowledge. They are shown apart on purpose and are never merged.</p>' +
      '<div class="evi-split">' +
      '<section class="evi-box evi-trad" aria-labelledby="evi-t"><h3 id="evi-t"><span class="evi-ico" aria-hidden="true">○</span>' + esc(t.label) + "</h3>" +
      '<div class="evi-tier">' + window.p3dBadge(t.tier) + "</div>" +
      "<p>" + esc(t.statement) + "</p>" +
      '<p class="evi-limit"><strong>Limits:</strong> ' + esc(t.limits) + "</p></section>" +
      '<section class="evi-box evi-sci" aria-labelledby="evi-s"><h3 id="evi-s"><span class="evi-ico" aria-hidden="true">●</span>' + esc(s.label) + "</h3>" +
      '<div class="evi-tier">' + window.p3dBadge(s.tier) + "</div>" +
      "<p>" + esc(s.statement) + "</p>" +
      '<p class="evi-limit"><strong>Limits:</strong> ' + esc(s.limits) + "</p></section></div>";
  }

  function renderDetail(data) {
    var list = data.plants;
    var i = list.findIndex(function (x) { return x.slug === slug; });
    if (i < 0) { root.innerHTML = '<div class="state-block"><h3>Plant not found</h3><a class="btn btn-primary" href="' + window.p3dUrl("plants.html") + '">Back to the Plant Explorer</a></div>'; return; }
    var p = list[i];
    var b = {};
    b.identity = '<h2 class="mod-h2">Identity</h2>' + UI.accordion([
      { title: "Biological source", body: UI.para(p.biologicalSource), open: true },
      { title: "Family", body: UI.para(p.family), open: true },
      { title: "Geographical distribution", body: UI.para(p.distribution) },
      { title: "Part used", body: UI.para(p.partUsed) }
    ]);
    b.morphology = '<h2 class="mod-h2">Morphology and microscopy</h2>' + UI.accordion([
      { title: "Morphology (macroscopic characters)", body: UI.para(p.morphology), open: true },
      { title: "Microscopy", body: UI.para(p.microscopy), open: true }
    ], { tools: false });
    b.chemistry = '<h2 class="mod-h2">Chemical constituents and extraction</h2>' + UI.accordion([
      { title: "Chemical constituents", body: UI.bullets(p.constituents), open: true },
      { title: "General extraction method", body: UI.para(p.extraction) }
    ], { tools: false }) +
      '<div class="note-block" role="note"><strong>Overview only.</strong> The extraction description is general and is not a working procedure.</div>';
    b.quality = '<h2 class="mod-h2">Identification and quality</h2>' + UI.accordion([
      { title: "Identification", body: UI.bullets(p.identification), open: true },
      { title: "Adulteration and substitution", body: UI.para(p.adulteration) },
      { title: "Evaluation parameters", body: UI.bullets(p.evaluation) }
    ]);
    b.significance = '<h2 class="mod-h2">Significance and cautions</h2>' + UI.accordion([
      { title: "Pharmaceutical / therapeutic significance", body: UI.para(p.significance), open: true },
      { title: "Cautions", body: UI.bullets(p.cautions), open: true }
    ], { tools: false }) +
      '<div class="warn-block" role="note"><strong>Natural does not mean safe.</strong> Herbal products can cause harm and can interact with medicines. Speak to a pharmacist or clinician before use.</div>';
    b.evidence = evidenceBlock(p);
    b.references = '<h2 class="mod-h2">References</h2>' + UI.references(p.references);

    var head =
      '<header class="mod-head"><span class="section-eyebrow">Plant Explorer · ' + esc(p.family) + "</span>" +
      "<h1>" + esc(p.name) + "</h1>" +
      '<p class="muted" style="margin-top:4px;"><em>' + esc(p.latin) + "</em></p>" +
      '<div class="mod-meta"><span class="tag-chip">' + esc(p.family) + "</span>" +
      '<span class="tag-chip">Traditional: ' + esc(p.traditional.tier.toLowerCase()) + "</span>" +
      '<span class="tag-chip">Scientific: ' + esc(p.scientific.tier.toLowerCase()) + "</span></div>" +
      '<div class="mod-limit" role="note"><strong>Education only.</strong> This page does not recommend any plant for treating any condition. Traditional use and scientific evidence are shown separately.</div></header>';

    root.innerHTML = head + UI.topicNav(TOPICS, "Plant topics") + UI.panels(TOPICS, b) +
      UI.prevNext(list, i, function (x) { return url(x.slug); }, function (x) { return x.name; }, "plant");
    UI.wireAccordions(root); UI.wireTopics(root, TOPICS); UI.hydrate(root);
    document.title = p.name + " — Plant Explorer — PHARMA 3D";
  }

  UI.loadJson("plants.json").then(function (data) {
    if (slug) renderDetail(data); else renderIndex(data);
  }).catch(function () { root.innerHTML = UI.errorBlock("Could not load the Plant Explorer"); });
})();
