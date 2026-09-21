/* =========================================================
   PHARMA 3D — Formulation module (/formulation.html)
   1. Exploded 2D tablet diagram (SVG): API, diluent, binder,
      disintegrant, lubricant, optional coating.
   2. Comparison of immediate, sustained and enteric release.
   Accessible equivalents: a button list that drives the same
   detail panel, a text description, and a real HTML table.
   Colours: only the five brand colours.
   ========================================================= */
(function () {
  "use strict";

  var UI = window.P3DUI, esc = window.p3dEsc;
  var root = document.getElementById("formu-root");
  if (!root || !UI) return;

  // Layer paint: five brand colours only. Distinct fills + distinct patterns so meaning is never colour-only.
  var PAINT = {
    coating: { fill: "#E9F7F2", pat: "none" },
    lubricant: { fill: "#BFE8D6", pat: "dots" },
    disintegrant: { fill: "#63C6A7", pat: "lines" },
    binder: { fill: "#BFE8D6", pat: "cross" },
    diluent: { fill: "#E9F7F2", pat: "dots" },
    api: { fill: "#2F7E6A", pat: "none" }
  };
  // Stack order, top to bottom in the exploded view.
  var ORDER = ["coating", "lubricant", "disintegrant", "binder", "diluent", "api"];

  function patternDefs() {
    return "<defs>" +
      '<pattern id="p-dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill="#1F2E2C"/></pattern>' +
      '<pattern id="p-lines" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#1F2E2C" stroke-width="2"/></pattern>' +
      '<pattern id="p-cross" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0L10 10M10 0L0 10" stroke="#1F2E2C" stroke-width="1.2"/></pattern>' +
      "</defs>";
  }

  function svg(layers, activeId) {
    var W = 560, H = 470, cx = 220, rx = 120, ry = 24, top = 46, gap = 68;
    var byId = {}; layers.forEach(function (l) { byId[l.id] = l; });
    var out = '<svg class="formu-svg" viewBox="0 0 ' + W + " " + H + '" role="group" aria-labelledby="fs-t fs-d">' +
      '<title id="fs-t">Exploded view of a tablet</title>' +
      '<desc id="fs-d">A flat diagram of six layers drawn apart from each other: coating, lubricant, disintegrant, binder, diluent and active ingredient. This is a simplified teaching diagram, not a formulation. A list of the same layers is provided below the diagram.</desc>' +
      patternDefs();
    // vertical guide
    out += '<line x1="' + cx + '" y1="' + (top - 20) + '" x2="' + cx + '" y2="' + (H - 20) + '" stroke="#63C6A7" stroke-width="2" stroke-dasharray="6 6"/>';
    ORDER.forEach(function (id, i) {
      var l = byId[id]; if (!l) return;
      var y = top + i * gap, p = PAINT[id], on = id === activeId;
      var short = id === "api" ? "API" : id === "coating" ? "Coating (optional)" : l.name.split(" (")[0];
      out += '<g class="layer" data-layer="' + id + '" tabindex="0" role="button" aria-pressed="' + on + '" aria-label="' + esc(l.name) + '">';
      out += '<ellipse cx="' + cx + '" cy="' + (y + 18) + '" rx="' + rx + '" ry="' + ry + '" fill="' + p.fill + '" stroke="#1F2E2C" stroke-width="' + (on ? 5 : 2.5) + '"/>';
      if (p.pat !== "none") out += '<ellipse cx="' + cx + '" cy="' + (y + 18) + '" rx="' + rx + '" ry="' + ry + '" fill="url(#p-' + p.pat + ')" opacity=".55"/>';
      if (id === "coating") out += '<ellipse cx="' + cx + '" cy="' + (y + 18) + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#2F7E6A" stroke-width="2" stroke-dasharray="7 5"/>';
      out += '<line x1="' + (cx + rx + 6) + '" y1="' + (y + 18) + '" x2="' + (cx + rx + 44) + '" y2="' + (y + 18) + '" stroke="#1F2E2C" stroke-width="2"/>';
      out += '<text x="' + (cx + rx + 52) + '" y="' + (y + 23) + '" font-size="15" font-weight="' + (on ? 700 : 600) + '" fill="#1F2E2C">' + esc(short) + "</text></g>";
    });
    out += "</svg>";
    return out;
  }

  function layerDetail(l) {
    return '<div class="struct layer-detail" role="region" aria-live="polite" aria-label="' + esc(l.name) + ' details"><h3>' + esc(l.name) + "</h3>" +
      '<dl class="kv"><dt>Role</dt><dd>' + esc(l.role) + "</dd><dt>Why it matters</dt><dd>" + esc(l.why) + "</dd><dt>Typical examples</dt><dd>" + esc(l.examples) + "</dd></dl></div>";
  }

  function compareTable(systems) {
    var rows = [["Principle", "principle"], ["How it works", "how"], ["Advantages", "good"], ["Limits", "limits"], ["Examples", "examples"]];
    return '<div class="compare-wrap"><table class="compare"><caption class="visually-hidden">Comparison of immediate, sustained and enteric release</caption><thead><tr><th scope="col">Feature</th>' +
      systems.map(function (s) { return '<th scope="col">' + esc(s.name) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + "</th>" + systems.map(function (s) { return "<td>" + esc(s[r[1]]) + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div>";
  }
  function compareCards(systems) {
    return '<div class="sys-grid">' + systems.map(function (s) {
      return '<article class="sys-card"><h3>' + esc(s.name) + "</h3>" +
        '<dl class="kv"><dt>Principle</dt><dd>' + esc(s.principle) + "</dd><dt>How it works</dt><dd>" + esc(s.how) + "</dd><dt>Advantages</dt><dd>" + esc(s.good) + "</dd><dt>Limits</dt><dd>" + esc(s.limits) + "</dd><dt>Examples</dt><dd>" + esc(s.examples) + "</dd></dl></article>";
    }).join("") + "</div>";
  }

  function render(data) {
    var layers = data.layers, systems = data.systems, meta = data.meta;
    var cur = "api", view = "cards";

    var head =
      '<header class="mod-head"><span class="section-eyebrow">Formulation</span><h1>What is inside a tablet?</h1>' +
      '<p class="lead">A tablet is a designed mixture. Each ingredient has a job. Select a layer in the diagram, or use the list beneath it.</p>' +
      '<div class="mod-meta">' + window.p3dBadge(meta.evidence) + "</div>" +
      '<div class="mod-limit" role="note"><strong>Simplified teaching diagram.</strong> ' + esc(meta.note) + "</div></header>";

    var alt = '<details class="alt-text"><summary>Text description of the diagram</summary><p style="margin-top:8px">Six layers are drawn apart in a vertical stack, top to bottom: optional coating, lubricant, disintegrant, binder, diluent, and active pharmaceutical ingredient (API). Each layer has a distinct pattern and a label.</p><ul class="bul">' +
      ORDER.map(function (id) { var l = layers.filter(function (x) { return x.id === id; })[0]; return "<li><strong>" + esc(l.name) + ":</strong> " + esc(l.role) + "</li>"; }).join("") + "</ul></details>";

    var tabletSec = '<section aria-labelledby="tab-h"><h2 class="mod-h2" id="tab-h">Exploded tablet</h2>' +
      '<div class="formu-wrap"><div><div id="formu-svg-mount"></div>' + alt + "</div>" +
      '<div><div class="layer-list" role="group" aria-label="Choose a tablet layer" id="layer-list">' +
      ORDER.map(function (id) { var l = layers.filter(function (x) { return x.id === id; })[0]; var p = PAINT[id];
        return '<button type="button" class="layer-btn" data-layer="' + id + '" aria-pressed="' + (id === cur) + '"><span class="sw" aria-hidden="true" style="background:' + p.fill + '"></span><span class="lt">' + esc(l.name) + "</span></button>"; }).join("") +
      '</div><div id="layer-detail-mount"></div></div></div></section>';

    var cmp = '<section style="margin-top:var(--space-10)" aria-labelledby="cmp-h"><h2 class="mod-h2" id="cmp-h">Release systems compared</h2>' +
      '<p class="mod-lead" style="margin-bottom:var(--space-4)">Immediate, sustained and enteric release designs differ in when and where the drug is released.</p>' +
      '<div class="view-toggle" role="group" aria-label="Choose comparison view"><button type="button" class="btn btn-secondary btn-sm" data-view="cards" aria-pressed="true">Cards</button><button type="button" class="btn btn-secondary btn-sm" data-view="table" aria-pressed="false">Table</button></div>' +
      '<div id="cmp-mount"></div>' +
      '<div class="warn-block" role="note" style="margin-top:var(--space-4)"><strong>Do not crush.</strong> Sustained-release and enteric-coated tablets generally must not be crushed or chewed unless the label says so, because that can defeat the release design.</div></section>';

    var refs = '<section style="margin-top:var(--space-10)" aria-labelledby="fref-h"><h2 class="mod-h2" id="fref-h">References</h2>' + UI.references(meta.references) + "</section>";
    var evid = '<div class="note-block" role="note" style="margin-top:var(--space-6)"><strong>Evidence tier:</strong> ' + esc(meta.evidence) + ". General textbook-level content. Not a formulation recipe or a claim about any specific product.</div>";

    root.innerHTML = head + tabletSec + cmp + evid + refs;

    function drawTablet() {
      document.getElementById("formu-svg-mount").innerHTML = svg(layers, cur);
      var l = layers.filter(function (x) { return x.id === cur; })[0];
      document.getElementById("layer-detail-mount").innerHTML = layerDetail(l);
      root.querySelectorAll(".layer-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-layer") === cur)); });
    }
    function drawCmp() {
      document.getElementById("cmp-mount").innerHTML = view === "table" ? compareTable(systems) : compareCards(systems);
      root.querySelectorAll("[data-view]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === view)); });
    }
    drawTablet(); drawCmp();

    root.addEventListener("click", function (e) {
      var g = e.target.closest("[data-layer]");
      if (g) { cur = g.getAttribute("data-layer"); drawTablet(); return; }
      var v = e.target.closest("[data-view]");
      if (v) { view = v.getAttribute("data-view"); drawCmp(); }
    });
    root.addEventListener("keydown", function (e) {
      var g = e.target.closest && e.target.closest("g.layer");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cur = g.getAttribute("data-layer"); drawTablet(); var again = root.querySelector('g.layer[data-layer="' + cur + '"]'); if (again) again.focus(); }
    });
    document.title = "Formulation — PHARMA 3D";
  }

  UI.loadJson("formulation.json").then(render).catch(function () { root.innerHTML = UI.errorBlock("Could not load Formulation"); });
})();
