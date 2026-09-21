/* =========================================================
   PHARMA 3D — Pharmacokinetic laboratory
   Models: one-compartment (IV or oral input), oral Bateman,
   IV bolus. All values computed from the displayed equations.
   ========================================================= */
(function () {
  "use strict";
  var esc = P4.esc, fmt = P4.fmt;
  function $(id) { return document.getElementById(id); }
  var GRAPH_LABEL = "ILLUSTRATIVE — COMPUTED FROM THE DISPLAYED MODEL.";
  var LN2 = Math.LN2;

  /* ---------- Model definitions ----------
     Each model has: params [key,label,min,max,step,default,unit], compute(p) -> {conc(t), Cmax,Tmax,AUC,thalf,CL,Vd,F,tEnd} */
  function ivBolus(p) {
    var D = p.dose, Vd = p.vd, k = p.k;
    var C0 = D / Vd, CL = k * Vd;
    return {
      conc: function (t) { return C0 * Math.exp(-k * t); },
      Cmax: C0, Tmax: 0, AUC: D / CL, thalf: LN2 / k, CL: CL, Vd: Vd, F: 1,
      tEnd: Math.max(6 * LN2 / k, 1)
    };
  }
  function bateman(p) {
    var D = p.dose, Vd = p.vd, k = p.k, ka = p.ka, F = p.f;
    var CL = k * Vd;
    // Flip-flop / ka == k safe handling
    var same = Math.abs(ka - k) < 1e-9;
    function conc(t) {
      if (same) return (F * D / Vd) * ka * t * Math.exp(-k * t);
      return (F * D * ka) / (Vd * (ka - k)) * (Math.exp(-k * t) - Math.exp(-ka * t));
    }
    var Tmax = same ? 1 / k : Math.log(ka / k) / (ka - k);
    return { conc: conc, Cmax: conc(Tmax), Tmax: Tmax, AUC: F * D / CL, thalf: LN2 / k, CL: CL, Vd: Vd, F: F,
      tEnd: Math.max(6 * LN2 / Math.min(k, ka), Tmax * 3, 1), flip: ka < k };
  }
  function oneComp(p) {
    // One-compartment, first-order elimination; route selectable (1 = IV bolus, 2 = oral)
    return p.route === 1 ? ivBolus({ dose: p.dose, vd: p.vd, k: p.k }) : bateman(p);
  }

  var MODELS = [
    {
      id: "one", name: "One-compartment", compute: oneComp,
      eq: "IV:   C(t) = (Dose / Vd) · e^(−k·t)\nOral: C(t) = (F·Dose·ka) / (Vd·(ka − k)) · (e^(−k·t) − e^(−ka·t))",
      about: "The body is treated as one well-mixed volume with first-order elimination. Choose IV or oral input to see how the route changes the curve.",
      assume: "Instant distribution; first-order elimination; linear kinetics; single dose; constant parameters.",
      params: [
        ["route", "Route (1 = IV bolus, 2 = oral)", 1, 2, 1, 2, ""],
        ["dose", "Dose", 10, 1000, 10, 200, "mg"],
        ["vd", "Volume of distribution, Vd", 5, 200, 1, 40, "L"],
        ["k", "Elimination rate constant, k", 0.02, 0.8, 0.01, 0.15, "1/h"],
        ["ka", "Absorption rate constant, ka (oral)", 0.1, 3, 0.05, 1.2, "1/h"],
        ["f", "Bioavailability fraction, F (oral)", 0.1, 1, 0.05, 0.7, ""]
      ]
    },
    {
      id: "oral", name: "Oral (Bateman)", compute: bateman,
      eq: "C(t) = (F·Dose·ka) / (Vd·(ka − k)) · (e^(−k·t) − e^(−ka·t))\nTmax = ln(ka/k) / (ka − k)\nAUC(0–∞) = F·Dose / CL   ·   CL = k·Vd   ·   t½ = ln2 / k",
      about: "First-order absorption from the gut followed by first-order elimination. The curve rises, peaks at Tmax, then declines.",
      assume: "First-order absorption; no lag time; complete dissolution; linear kinetics; single dose; constant F.",
      params: [
        ["dose", "Dose", 10, 1000, 10, 200, "mg"],
        ["vd", "Volume of distribution, Vd", 5, 200, 1, 40, "L"],
        ["k", "Elimination rate constant, k", 0.02, 0.8, 0.01, 0.15, "1/h"],
        ["ka", "Absorption rate constant, ka", 0.1, 3, 0.05, 1.2, "1/h"],
        ["f", "Bioavailability fraction, F", 0.1, 1, 0.05, 0.7, ""]
      ]
    },
    {
      id: "iv", name: "IV bolus", compute: ivBolus,
      eq: "C(t) = C0 · e^(−k·t)   ·   C0 = Dose / Vd\nCL = k·Vd   ·   t½ = ln2 / k   ·   AUC(0–∞) = Dose / CL",
      about: "The whole dose enters the circulation at time zero, so F = 1 by definition and the concentration is highest at t = 0.",
      assume: "Instant mixing in one compartment; first-order elimination; linear kinetics; F = 1 by definition.",
      params: [
        ["dose", "Dose", 10, 1000, 10, 200, "mg"],
        ["vd", "Volume of distribution, Vd", 5, 200, 1, 40, "L"],
        ["k", "Elimination rate constant, k", 0.02, 0.8, 0.01, 0.15, "1/h"]
      ]
    }
  ];

  var state = {};
  MODELS.forEach(function (m) { state[m.id] = {}; m.params.forEach(function (p) { state[m.id][p[0]] = p[5]; }); });

  function trapAUC(conc, tEnd) {
    var n = 400, dt = tEnd / n, a = 0, i;
    for (i = 0; i < n; i++) a += (conc(i * dt) + conc((i + 1) * dt)) / 2 * dt;
    return a;
  }

  function build() {
    $("pkTabs").innerHTML = MODELS.map(function (m, i) {
      return '<button type="button" class="model-tab" role="tab" id="pt-' + m.id + '" aria-controls="pp-' + m.id + '" aria-selected="' + (i === 0) + '" data-m="' + m.id + '">' + esc(m.name) + "</button>";
    }).join("");
    $("pkPanels").innerHTML = MODELS.map(function (m, i) {
      var sl = m.params.map(function (p) {
        return '<div class="field"><label for="ps-' + m.id + "-" + p[0] + '">' + esc(p[1]) + (p[6] ? " (" + esc(p[6]) + ")" : "") + '</label><div class="range-row"><input type="range" id="ps-' + m.id + "-" + p[0] + '" data-m="' + m.id + '" data-k="' + p[0] + '" min="' + p[2] + '" max="' + p[3] + '" step="' + p[4] + '" value="' + p[5] + '"><output id="po-' + m.id + "-" + p[0] + '">' + p[5] + "</output></div></div>";
      }).join("");
      return '<section class="model-panel" role="tabpanel" id="pp-' + m.id + '" aria-labelledby="pt-' + m.id + '"' + (i ? " hidden" : "") + ">" +
        '<div class="model-body"><div><h3>' + esc(m.name) + '</h3><p style="margin-top:var(--space-2)">' + esc(m.about) + '</p><div class="eq">' + esc(m.eq) + "</div>" + sl +
        '<div class="assump"><div class="a"><strong>Assumptions.</strong> ' + esc(m.assume) + "</div></div></div>" +
        '<div><span class="p4-graph-label">' + GRAPH_LABEL + '</span><div class="p4-canvas-wrap"><canvas id="pc-' + m.id + '" role="img" aria-label="' + esc(m.name) + ' plasma concentration versus time"></canvas></div>' +
        '<p class="visually-hidden" id="psum-' + m.id + '"></p>' +
        '<div class="result-grid" id="pr-' + m.id + '"></div>' +
        '<p class="p4-caption" id="pn-' + m.id + '" style="margin-top:var(--space-3)"></p>' +
        '<h4 style="margin:var(--space-4) 0 var(--space-2)">Data table</h4><div id="pd-' + m.id + '"></div></div></div></section>';
    }).join("");

    $("pkTabs").addEventListener("click", function (e) { var b = e.target.closest(".model-tab"); if (b) select(b.getAttribute("data-m")); });
    $("pkTabs").addEventListener("keydown", function (e) {
      var b = e.target.closest(".model-tab"); if (!b) return;
      var ids = MODELS.map(function (m) { return m.id; }), i = ids.indexOf(b.getAttribute("data-m")), n = null;
      if (e.key === "ArrowRight") n = ids[(i + 1) % ids.length]; else if (e.key === "ArrowLeft") n = ids[(i - 1 + ids.length) % ids.length];
      if (n) { e.preventDefault(); select(n); $("pt-" + n).focus(); }
    });
    $("pkPanels").addEventListener("input", function (e) {
      var r = e.target.closest("input[type=range]"); if (!r) return;
      var id = r.getAttribute("data-m"), k = r.getAttribute("data-k");
      state[id][k] = parseFloat(r.value); $("po-" + id + "-" + k).textContent = r.value; draw(id);
    });
    draw("one");
  }

  function select(id) {
    MODELS.forEach(function (m) { var on = m.id === id; $("pp-" + m.id).hidden = !on; $("pt-" + m.id).setAttribute("aria-selected", String(on)); });
    draw(id);
  }

  function draw(id) {
    var m = MODELS.find(function (x) { return x.id === id; }), p = state[id];
    var r = m.compute(p);
    var tEnd = r.tEnd, pts = [], i, n = 200;
    for (i = 0; i <= n; i++) { var t = tEnd * i / n; pts.push([t, r.conc(t)]); }
    var units = "mg/L";
    P4.lineChart($("pc-" + id), [{ name: m.name, pts: pts }], {
      xLabel: "Time (h)", yLabel: "Concentration (" + units + ")", xMin: 0, xMax: tEnd, yMin: 0, w: 560, h: 340,
      marks: [{ x: r.Tmax, y: r.Cmax, label: "Cmax" }]
    });
    var cells = [
      ["Cmax", fmt(r.Cmax), "mg/L"], ["Tmax", fmt(r.Tmax), "h"], ["AUC 0–∞", fmt(r.AUC), "mg·h/L"], ["Half-life", fmt(r.thalf), "h"],
      ["Clearance", fmt(r.CL), "L/h"], ["Vd", fmt(r.Vd), "L"], ["F", fmt(r.F, 2), "fraction"]
    ];
    $("pr-" + id).innerHTML = cells.map(function (c) {
      return '<div class="result-cell"><div class="k">' + esc(c[0]) + '</div><div class="v">' + esc(c[1]) + '</div><div class="u">' + esc(c[2]) + "</div></div>";
    }).join("") + '<div class="result-cell"><div class="k">Check</div><div class="v">' + fmt(trapAUC(r.conc, Math.max(tEnd * 4, 1)), 2) + '</div><div class="u">AUC by trapezoid</div></div>';
    var note = "Values computed from the displayed model with your chosen inputs.";
    if (r.flip) note += " Here ka < k (flip-flop): the terminal slope reflects absorption, not elimination, so the apparent half-life shown is that of elimination only.";
    if (id === "one" && p.route === 1) note += " Route set to IV bolus, so F = 1 and ka, F sliders are not used.";
    $("pn-" + id).textContent = note;
    var ts = [0, 0.5, 1, 2, 4, 6, 8, 12, 24].filter(function (t) { return t <= tEnd * 1.5; });
    var rows = ts.map(function (t) { return [fmt(t, 1), fmt(r.conc(t), 3)]; });
    $("pd-" + id).innerHTML = P4.tableHtml(["Time (h)", "Conc (mg/L)"], rows);
    $("psum-" + id).textContent = m.name + " curve. Cmax about " + fmt(r.Cmax, 2) + " mg per litre at " + fmt(r.Tmax, 2) + " hours. Half-life " + fmt(r.thalf, 2) + " hours.";
  }

  /* ---------- Definitions ---------- */
  var DEFS = [
    ["Cmax", "The highest concentration reached in plasma after a dose."],
    ["Tmax", "The time at which Cmax occurs. For an IV bolus in one compartment it is zero."],
    ["AUC", "Area under the concentration–time curve; a measure of total exposure. Here AUC(0–∞) is computed analytically as F·Dose/CL."],
    ["Half-life (t½)", "Time for the concentration to fall by half during first-order elimination, t½ = ln2 / k."],
    ["Clearance (CL)", "Volume of plasma from which drug is completely removed per unit time; CL = k·Vd."],
    ["Volume of distribution (Vd)", "A proportionality constant linking amount of drug in the body to plasma concentration. It is not a real anatomical volume."],
    ["Bioavailability (F)", "Fraction of the dose that reaches the systemic circulation unchanged. By definition F = 1 for an IV bolus."],
    ["Elimination rate constant (k)", "Fraction of the drug in the body removed per unit time in first-order elimination."]
  ];
  function buildDefs() {
    $("defsGrid").innerHTML = DEFS.map(function (d) { return '<div class="p4-card" style="margin:0"><h3>' + esc(d[0]) + "</h3><p>" + esc(d[1]) + "</p></div>"; }).join("");
  }

  build(); buildDefs();
  P4.redrawOnTheme(function () { var a = MODELS.find(function (m) { return !$("pp-" + m.id).hidden; }); draw(a ? a.id : "one"); });
})();
