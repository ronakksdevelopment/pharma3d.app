/* =========================================================
   PHARMA 3D — Calculators
   Real equations, real arithmetic, labelled units. The pure math
   lives in window.P3DCalc.math so each formula can be checked
   independently of the interface.

   Cards:
     uvvis        Beer-Lambert law          A = ε · c · l
     dissolution  Noyes-Whitney             dC/dt = (D·A/h)(Cs − C)
     centrifuge   RCF = 1.118e-5 · r · RPM²
     microscope   resolution d ≈ 0.61 · λ / NA
     hplc         CONCEPTUAL illustration only (no numeric retention)
     qualitative-press / qualitative-filler: explanation only, no numbers

   These are learning tools. They are not validated analytical,
   manufacturing, clinical or regulatory calculators.
   ========================================================= */
(function () {
  "use strict";

  var esc = window.p3dEsc;

  /* ---------------- PURE MATH ---------------- */
  var math = {
    /** Beer-Lambert. A dimensionless; eps L/(mol·cm); c mol/L; l cm. */
    absorbance: function (eps, c, l) { return eps * c * l; },
    /** Solve concentration: c = A / (eps · l), mol/L. */
    concentration: function (A, eps, l) { return A / (eps * l); },
    /** Percent transmittance from absorbance: %T = 100 · 10^(−A). */
    percentT: function (A) { return 100 * Math.pow(10, -A); },

    /** Noyes-Whitney instantaneous rate. D cm²/s; A cm²; h cm; Cs, C in mg/mL. Returns mg/(mL·s). */
    dissolutionRate: function (D, A, h, Cs, C) { return (D * A / h) * (Cs - C); },
    /** Sink condition ratio Cs / C. */
    sinkRatio: function (Cs, C) { return Cs / C; },

    /** RCF in ×g. r cm; rpm rev/min. */
    rcf: function (rCm, rpm) { return 1.118e-5 * rCm * rpm * rpm; },
    /** Inverse: RPM needed for a target RCF at radius r. */
    rpmForRcf: function (rcf, rCm) { return Math.sqrt(rcf / (1.118e-5 * rCm)); },

    /** Lateral resolution d ≈ 0.61 λ / NA. λ nm; result nm. */
    resolution: function (lambdaNm, na) { return 0.61 * lambdaNm / na; }
  };

  /* ---------------- HELPERS ---------------- */
  function fmt(x, sig) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    var a = Math.abs(x);
    if (a >= 1e6 || a < 1e-3) return x.toExponential((sig || 4) - 1);
    return String(Number(x.toPrecision(sig || 4)));
  }
  function num(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    var v = el.value.trim();
    if (v === "") return NaN;
    return Number(v);
  }
  function field(id, label, unit, opts) {
    opts = opts || {};
    return '<div class="field"><label for="' + id + '">' + esc(label) + "</label>" +
      '<input id="' + id + '" type="number" inputmode="decimal" step="' + (opts.step || "any") + '"' +
      (opts.min != null ? ' min="' + opts.min + '"' : "") +
      (opts.value != null ? ' value="' + opts.value + '"' : "") +
      ' aria-describedby="' + id + '-u"><span class="unit-hint" id="' + id + '-u">Unit: ' + esc(unit) + "</span></div>";
  }
  function shell(id, title, eq, intro, inner, vars, explain, extra) {
    return '<article class="calc-card" id="calc-' + id + '" aria-labelledby="calc-' + id + '-h">' +
      '<h3 id="calc-' + id + '-h">' + esc(title) + "</h3>" +
      '<p class="mod-lead">' + esc(intro) + "</p>" +
      '<div class="calc-eq" role="math" aria-label="' + esc(eq.aria) + '">' + esc(eq.text) + "</div>" +
      '<dl class="calc-vars">' + vars.map(function (v) { return "<dt>" + esc(v[0]) + "</dt><dd>" + esc(v[1]) + "</dd>"; }).join("") + "</dl>" +
      inner +
      '<div class="calc-err" id="calc-' + id + '-err" role="alert" hidden></div>' +
      '<div class="calc-out" id="calc-' + id + '-out" role="status" aria-live="polite" hidden></div>' +
      (extra || "") +
      '<div class="calc-explain">' + explain.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
      '<div class="note-block" role="note" style="margin-top:12px;"><strong>Learning tool.</strong> Not a validated analytical, manufacturing, clinical or regulatory calculation. Values depend on the quality of the numbers you enter.</div>' +
      "</article>";
  }
  function actions(id) {
    return '<div class="calc-actions"><button type="button" class="btn btn-primary" data-calc="' + id + '">Calculate</button>' +
      '<button type="button" class="btn btn-secondary" data-reset="' + id + '">Reset</button></div>';
  }
  function showErr(id, msg) {
    var e = document.getElementById("calc-" + id + "-err"), o = document.getElementById("calc-" + id + "-out");
    e.textContent = msg; e.hidden = false; o.hidden = true;
  }
  function showOut(id, rows) {
    var e = document.getElementById("calc-" + id + "-err"), o = document.getElementById("calc-" + id + "-out");
    e.hidden = true;
    o.innerHTML = rows.map(function (r) {
      return '<div class="out-row"><div class="out-label">' + esc(r[0]) + '</div><div><span class="out-val">' + esc(r[1]) + '</span><span class="out-unit">' + esc(r[2]) + "</span></div></div>";
    }).join("");
    o.hidden = false;
  }
  function positive(id, vals, names) {
    for (var i = 0; i < vals.length; i++) {
      if (!isFinite(vals[i])) { showErr(id, "Enter a number for " + names[i] + "."); return false; }
      if (vals[i] <= 0) { showErr(id, names[i] + " must be greater than zero."); return false; }
    }
    return true;
  }

  /* ---------------- CARDS ---------------- */

  function uvvis() {
    var inner =
      '<div class="calc-grid">' +
      '<div class="field"><label for="uv-mode">Solve for</label><select id="uv-mode"><option value="A">Absorbance (A)</option><option value="c">Concentration (c)</option></select><span class="unit-hint">Choose what to calculate</span></div>' +
      field("uv-eps", "Molar absorptivity ε", "L·mol⁻¹·cm⁻¹", { min: 0, value: "15000" }) +
      field("uv-l", "Path length l", "cm", { min: 0, value: "1" }) +
      '<div id="uv-c-wrap">' + field("uv-c", "Concentration c", "mol·L⁻¹", { min: 0, value: "0.00004" }) + "</div>" +
      '<div id="uv-A-wrap" hidden>' + field("uv-A", "Absorbance A", "dimensionless", { min: 0, value: "0.6" }) + "</div>" +
      "</div>" + actions("uvvis");
    return shell("uvvis", "UV-Vis: Beer-Lambert law",
      { text: "A = ε · c · l", aria: "A equals epsilon times c times l" },
      "Relates absorbance to concentration for a dilute solution at one wavelength.",
      inner,
      [["A", "Absorbance (dimensionless)."], ["ε", "Molar absorptivity in L·mol⁻¹·cm⁻¹, specific to the compound and wavelength."], ["c", "Concentration in mol·L⁻¹."], ["l", "Path length of the cuvette in cm (often 1 cm)."]],
      ["Absorbance is proportional to concentration only within the linear range of the method. Very concentrated solutions, stray light, or interfering substances can break this.",
       "Percent transmittance is also shown: %T = 100 × 10^(−A). An absorbance of 1 means 10 % of the light is transmitted."]);
  }
  function runUvvis() {
    var mode = document.getElementById("uv-mode").value;
    var eps = num("uv-eps"), l = num("uv-l");
    if (mode === "A") {
      var c = num("uv-c");
      if (!positive("uvvis", [eps, l, c], ["Molar absorptivity", "Path length", "Concentration"])) return;
      var A = math.absorbance(eps, c, l);
      var rows = [["Absorbance A", fmt(A), "(dimensionless)"], ["Percent transmittance", fmt(math.percentT(A)), "%T"]];
      showOut("uvvis", rows);
      if (A > 1.5) document.getElementById("calc-uvvis-out").insertAdjacentHTML("beforeend", '<div class="out-row"><div class="out-label">Caution</div><div>A above about 1.5 is often outside a method\'s linear range. Consider diluting the sample.</div></div>');
    } else {
      var A2 = num("uv-A");
      if (!positive("uvvis", [eps, l, A2], ["Molar absorptivity", "Path length", "Absorbance"])) return;
      var cc = math.concentration(A2, eps, l);
      showOut("uvvis", [["Concentration c", fmt(cc), "mol·L⁻¹"], ["Percent transmittance", fmt(math.percentT(A2)), "%T"]]);
    }
  }

  function dissolution() {
    var inner =
      '<div class="calc-grid">' +
      field("nw-D", "Diffusion coefficient D", "cm²·s⁻¹", { min: 0, value: "0.00001" }) +
      field("nw-A", "Surface area A", "cm²", { min: 0, value: "2" }) +
      field("nw-h", "Diffusion layer thickness h", "cm", { min: 0, value: "0.005" }) +
      field("nw-Cs", "Saturation solubility Cs", "mg·mL⁻¹", { min: 0, value: "1" }) +
      field("nw-C", "Bulk concentration C", "mg·mL⁻¹", { min: 0, value: "0.05" }) +
      "</div>" + actions("dissolution");
    return shell("dissolution", "Dissolution: Noyes-Whitney equation",
      { text: "dC/dt = (D · A / h) · (Cs − C)", aria: "dC by dt equals D times A over h times Cs minus C" },
      "Gives the instantaneous dissolution rate of a solid from a diffusion-layer model.",
      inner,
      [["dC/dt", "Rate of change of bulk concentration, here in mg·mL⁻¹·s⁻¹."], ["D", "Diffusion coefficient of the drug, cm²·s⁻¹."], ["A", "Surface area of the dissolving solid, cm²."], ["h", "Thickness of the diffusion layer, cm."], ["Cs", "Saturation solubility of the drug in the medium, mg·mL⁻¹."], ["C", "Concentration of drug in the bulk medium, mg·mL⁻¹."]],
      ["The rate rises with larger surface area (finer particles), higher solubility and a thinner diffusion layer (better agitation), and falls as the bulk concentration approaches Cs.",
       "Sink condition: the medium is said to be under sink conditions when it can dissolve much more drug than the dose contains, so C stays small relative to Cs and does not slow dissolution. A commonly used rule of thumb is that Cs should be at least 3 times, and often 5 to 10 times, the concentration reached if the whole dose dissolves. The ratio Cs/C below is a quick check. Follow the requirement in the relevant pharmacopoeia or guidance for real testing.",
       "This is an idealised model. It treats area and layer thickness as constant, which real dissolving solids do not."]);
  }
  function runDissolution() {
    var D = num("nw-D"), A = num("nw-A"), h = num("nw-h"), Cs = num("nw-Cs"), C = num("nw-C");
    if (!isFinite(C) || C < 0) { showErr("dissolution", "Bulk concentration must be zero or greater."); return; }
    if (!positive("dissolution", [D, A, h, Cs], ["Diffusion coefficient", "Surface area", "Layer thickness", "Saturation solubility"])) return;
    if (C > Cs) { showErr("dissolution", "Bulk concentration C cannot exceed saturation solubility Cs in this model. Enter C ≤ Cs."); return; }
    var rate = math.dissolutionRate(D, A, h, Cs, C);
    var rows = [["Dissolution rate dC/dt", fmt(rate), "mg·mL⁻¹·s⁻¹"]];
    if (C > 0) {
      var r = math.sinkRatio(Cs, C);
      rows.push(["Ratio Cs / C", fmt(r), "(dimensionless)"]);
      rows.push(["Sink-condition check", r >= 3 ? "Cs is at least 3 × C (meets the common rule of thumb)" : "Cs is less than 3 × C (sink conditions are not clearly met)", ""]);
    } else {
      rows.push(["Sink-condition check", "C = 0, so the driving force is at its maximum", ""]);
    }
    showOut("dissolution", rows);
  }

  function centrifuge() {
    var inner =
      '<div class="calc-grid">' +
      '<div class="field"><label for="cf-mode">Solve for</label><select id="cf-mode"><option value="rcf">RCF from RPM</option><option value="rpm">RPM from target RCF</option></select><span class="unit-hint">Choose what to calculate</span></div>' +
      field("cf-r", "Rotor radius r", "cm (axis to sample)", { min: 0, value: "10" }) +
      '<div id="cf-rpm-wrap">' + field("cf-rpm", "Speed", "RPM (rev·min⁻¹)", { min: 0, value: "3000" }) + "</div>" +
      '<div id="cf-rcf-wrap" hidden>' + field("cf-rcf", "Target RCF", "×g", { min: 0, value: "1000" }) + "</div>" +
      "</div>" + actions("centrifuge");
    return shell("centrifuge", "Centrifuge: relative centrifugal force",
      { text: "RCF = 1.118 × 10⁻⁵ × r × RPM²", aria: "RCF equals 1.118 times ten to the minus five times r times RPM squared" },
      "Converts rotor speed and radius into relative centrifugal force, in multiples of gravity.",
      inner,
      [["RCF", "Relative centrifugal force, expressed in ×g (multiples of standard gravity)."], ["1.118 × 10⁻⁵", "Constant that applies when r is in centimetres and speed is in RPM."], ["r", "Radius from the rotor axis to the sample, in cm."], ["RPM", "Rotor speed in revolutions per minute."]],
      ["RCF grows with the square of the speed, so doubling RPM gives four times the force. The same RPM gives a different RCF in a rotor with a different radius, which is why methods should quote RCF.",
       "Use the radius the manufacturer specifies (often the maximum radius, at the bottom of the tube). Never exceed the rated speed of the rotor or tubes."]);
  }
  function runCentrifuge() {
    var mode = document.getElementById("cf-mode").value, r = num("cf-r");
    if (mode === "rcf") {
      var rpm = num("cf-rpm");
      if (!positive("centrifuge", [r, rpm], ["Rotor radius", "Speed"])) return;
      showOut("centrifuge", [["Relative centrifugal force", fmt(math.rcf(r, rpm)), "×g"]]);
    } else {
      var g = num("cf-rcf");
      if (!positive("centrifuge", [r, g], ["Rotor radius", "Target RCF"])) return;
      showOut("centrifuge", [["Required speed", fmt(math.rpmForRcf(g, r)), "RPM"]]);
    }
  }

  function microscope() {
    var inner =
      '<div class="calc-grid">' +
      field("mi-l", "Wavelength λ", "nm (e.g. green light ≈ 550)", { min: 0, value: "550" }) +
      field("mi-na", "Numerical aperture NA", "dimensionless", { min: 0, value: "1.25", step: "0.01" }) +
      "</div>" + actions("microscope");
    return shell("microscope", "Microscope: resolution limit",
      { text: "d ≈ 0.61 × λ / NA", aria: "d approximately equals 0.61 times lambda over NA" },
      "Estimates the smallest distance between two points that can still be seen as separate.",
      inner,
      [["d", "Smallest resolvable distance, in nm (approximate; based on the Rayleigh criterion)."], ["0.61", "Constant from the Rayleigh criterion for a circular aperture."], ["λ", "Wavelength of the light, in nm."], ["NA", "Numerical aperture of the objective (a property of the lens, dimensionless)."]],
      ["A shorter wavelength and a larger numerical aperture give a smaller d, meaning finer detail can be resolved.",
       "Magnification alone does not improve resolution. Beyond the limit, extra magnification only makes a blurred image larger.",
       "This is an approximation for an ideal system. Real resolution is affected by the whole optical set-up and the specimen."]);
  }
  function runMicroscope() {
    var l = num("mi-l"), na = num("mi-na");
    if (!positive("microscope", [l, na], ["Wavelength", "Numerical aperture"])) return;
    var d = math.resolution(l, na);
    showOut("microscope", [["Approximate resolution d", fmt(d), "nm"], ["Same value", fmt(d / 1000), "µm"]]);
  }

  /* HPLC: conceptual only. Uses a QUALITATIVE ordering (not real retention times). */
  function hplc() {
    var inner =
      '<div class="calc-grid">' +
      '<div class="field"><label for="hp-org">Organic solvent in mobile phase</label><div class="range-row"><input id="hp-org" type="range" min="10" max="90" step="5" value="50" aria-describedby="hp-org-u"><output for="hp-org" id="hp-org-o">50 %</output></div><span class="unit-hint" id="hp-org-u">Unit: % of the mobile phase</span></div>' +
      '<div class="field"><label for="hp-flow">Flow rate</label><div class="range-row"><input id="hp-flow" type="range" min="0.5" max="2" step="0.1" value="1" aria-describedby="hp-flow-u"><output for="hp-flow" id="hp-flow-o">1.0 mL/min</output></div><span class="unit-hint" id="hp-flow-u">Unit: mL·min⁻¹</span></div>' +
      "</div>" +
      '<div class="calc-actions"><span class="label-conceptual">CONCEPTUAL</span><button type="button" class="btn btn-secondary" data-reset="hplc">Reset</button></div>';
    var extra = '<div id="hp-fig"></div><details class="alt-text"><summary>Text description of the illustration</summary><div id="hp-alt" role="status" aria-live="polite"></div></details>';
    return shell("hplc", "HPLC: conceptual retention and resolution",
      { text: "Conceptual trend only: more organic solvent and faster flow → earlier peaks, less separation", aria: "Conceptual trend: more organic solvent and higher flow rate move peaks earlier and reduce separation" },
      "Shows how two settings tend to change the appearance of a chromatogram. This is an illustration of a trend, not a prediction.",
      inner,
      [["% organic", "Share of organic solvent in a reversed-phase mobile phase. More organic solvent generally makes typical analytes elute sooner."], ["Flow rate", "Volume of mobile phase per minute. A higher flow rate generally shortens run time, and often reduces efficiency."]],
      ["The peaks drawn are schematic. No retention time, resolution value or column performance is calculated, because those depend on the specific column, analytes, system and method.",
       "In reversed-phase HPLC a more polar (weaker) mobile phase holds analytes longer, and a stronger (more organic) one releases them sooner. Two peaks can also crowd together as they move earlier, so resolution often falls.",
       "Real method development uses a validated method and measured data."],
      extra);
  }
  function drawHplc() {
    var org = num("hp-org"), flow = num("hp-flow");
    document.getElementById("hp-org-o").textContent = org + " %";
    document.getElementById("hp-flow-o").textContent = flow.toFixed(1) + " mL/min";
    // Qualitative mapping onto a 0..1 "earliness" scale; NOT retention time.
    var e = Math.min(1, Math.max(0, ((org - 10) / 80) * 0.65 + ((flow - 0.5) / 1.5) * 0.35));
    var W = 640, H = 240, x0 = 50, x1 = 610, yb = 190, yt = 40;
    var span = x1 - x0;
    // peak 1 and 2 positions shift earlier with e; the gap shrinks with e.
    var p1 = x0 + span * (0.30 - 0.22 * e), gap = span * (0.24 - 0.14 * e), p2 = p1 + gap;
    var w = 16 + 8 * (1 - e) * 0 + 6 * (e); // slight broadening at high "earliness" to suggest lower efficiency
    function peak(cx, h, wd) {
      var pts = [];
      for (var x = x0; x <= x1; x += 4) {
        var y = yb - h * Math.exp(-Math.pow((x - cx) / wd, 2));
        pts.push(x + "," + y.toFixed(1));
      }
      return pts;
    }
    var a = peak(p1, 120, w), b = peak(p2, 90, w);
    // Sum trace
    var trace = [];
    for (var x = x0; x <= x1; x += 4) {
      var y = yb - (120 * Math.exp(-Math.pow((x - p1) / w, 2)) + 90 * Math.exp(-Math.pow((x - p2) / w, 2)));
      trace.push(x + "," + Math.max(yt, y).toFixed(1));
    }
    var svg =
      '<svg class="calc-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="hp-t hp-d">' +
      '<title id="hp-t">Conceptual chromatogram</title><desc id="hp-d">Schematic chromatogram with two peaks. Not calculated data.</desc>' +
      '<line x1="' + x0 + '" y1="' + yb + '" x2="' + x1 + '" y2="' + yb + '" stroke="#1F2E2C" stroke-width="2"/>' +
      '<line x1="' + x0 + '" y1="' + yt + '" x2="' + x0 + '" y2="' + yb + '" stroke="#1F2E2C" stroke-width="2"/>' +
      '<polyline points="' + trace.join(" ") + '" fill="none" stroke="#2F7E6A" stroke-width="3" stroke-linejoin="round"/>' +
      '<line x1="' + p1 + '" y1="' + (yb + 4) + '" x2="' + p1 + '" y2="' + (yb + 12) + '" stroke="#1F2E2C" stroke-width="2"/>' +
      '<line x1="' + p2 + '" y1="' + (yb + 4) + '" x2="' + p2 + '" y2="' + (yb + 12) + '" stroke="#1F2E2C" stroke-width="2"/>' +
      '<text x="' + p1 + '" y="' + (yb + 28) + '" text-anchor="middle" font-size="14" fill="#63C6A7" stroke="#1F2E2C" stroke-width=".4">A</text>' +
      '<text x="' + p2 + '" y="' + (yb + 28) + '" text-anchor="middle" font-size="14" fill="#63C6A7" stroke="#1F2E2C" stroke-width=".4">B</text>' +
      '<text x="' + ((x0 + x1) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12" fill="#5C726E">Time (schematic, no scale)</text>' +
      '<text x="14" y="' + ((yt + yb) / 2) + '" font-size="12" fill="#5C726E" transform="rotate(-90 14 ' + ((yt + yb) / 2) + ')" text-anchor="middle">Detector response (schematic)</text>' +
      '<rect x="' + (x1 - 150) + '" y="' + (yt - 4) + '" width="150" height="24" rx="12" fill="#E9F7F2" stroke="#2F7E6A" stroke-dasharray="4 3"/>' +
      '<text x="' + (x1 - 75) + '" y="' + (yt + 12) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#1F2E2C">CONCEPTUAL</text></svg>';
    document.getElementById("hp-fig").innerHTML = svg;
    var earlyWord = e < 0.33 ? "late" : e < 0.66 ? "middle" : "early";
    var sepWord = e < 0.33 ? "well separated" : e < 0.66 ? "moderately separated" : "close together";
    document.getElementById("hp-alt").innerHTML = "<p>With " + org + " % organic solvent and a flow rate of " + flow.toFixed(1) + " mL/min, the two schematic peaks A and B appear " + earlyWord + " on the time axis and are " + sepWord + ". This is a conceptual trend, not a calculated result.</p>";
    var e2 = document.getElementById("calc-hplc-err"); if (e2) e2.hidden = true;
  }

  function qualitative(kind) {
    if (kind === "press") {
      return shell("press", "Tablet press: how the process works",
        { text: "Fill → Compress → Eject", aria: "Fill, then compress, then eject" },
        "A qualitative walk-through. No numeric output is given, because settings depend on the formulation, tooling and equipment.",
        "",
        [["Fill", "Powder flows into the die cavity. Fill depth sets the tablet weight."], ["Compress", "Upper and lower punches move together and apply force, so particles bond."], ["Eject", "The lower punch rises and pushes the tablet out of the die."]],
        ["If flow is poor, tablet weight varies. If there is too little lubricant, tablets can stick to the punches. Too much lubricant can weaken tablets. If air is trapped or the compression force or speed is too high, tablets may cap or laminate.",
         "Tablet weight, hardness, thickness, friability and disintegration are measured separately to confirm the settings are working. See the Manufacturing module for the full stage list and the defect explorer."]);
    }
    return shell("filler", "Capsule filler: how the process works",
      { text: "Separate → Fill → Close", aria: "Separate, then fill, then close" },
      "A qualitative walk-through. No numeric output is given, because settings depend on the fill material, capsule size and equipment.",
      "",
      [["Separate", "Empty capsules are oriented and split into body and cap."], ["Fill", "A measured dose of powder, pellets or liquid is placed in the body."], ["Close", "The cap is rejoined and the capsule is locked or sealed."]],
      ["Fill-weight variation is usually linked to powder flow and how consistently the dose is formed. Static, stickiness and wrong capsule size cause problems. Humidity can make shells brittle or soft.",
       "Fill weight and closure are checked in-process. See the Manufacturing module for the wider process."]);
  }

  /* ---------------- MOUNT ---------------- */
  var BUILDERS = {
    uvvis: uvvis, dissolution: dissolution, centrifuge: centrifuge, microscope: microscope, hplc: hplc,
    "qualitative-press": function () { return qualitative("press"); },
    "qualitative-filler": function () { return qualitative("filler"); }
  };
  var RUNNERS = { uvvis: runUvvis, dissolution: runDissolution, centrifuge: runCentrifuge, microscope: runMicroscope };

  function mount(el, id) {
    var b = BUILDERS[id];
    if (!b) { el.innerHTML = ""; return; }
    el.innerHTML = b();
    if (id === "hplc") {
      drawHplc();
      ["hp-org", "hp-flow"].forEach(function (i) { document.getElementById(i).addEventListener("input", drawHplc); });
    }
    if (id === "uvvis") {
      var m = document.getElementById("uv-mode");
      m.addEventListener("change", function () {
        document.getElementById("uv-c-wrap").hidden = m.value !== "A";
        document.getElementById("uv-A-wrap").hidden = m.value !== "c";
        document.getElementById("calc-uvvis-out").hidden = true;
      });
    }
    if (id === "centrifuge") {
      var m2 = document.getElementById("cf-mode");
      m2.addEventListener("change", function () {
        document.getElementById("cf-rpm-wrap").hidden = m2.value !== "rcf";
        document.getElementById("cf-rcf-wrap").hidden = m2.value !== "rpm";
        document.getElementById("calc-centrifuge-out").hidden = true;
      });
    }
    el.addEventListener("click", function (e) {
      var go = e.target.closest("[data-calc]");
      if (go && RUNNERS[go.getAttribute("data-calc")]) RUNNERS[go.getAttribute("data-calc")]();
      var rs = e.target.closest("[data-reset]");
      if (rs) mount(el, id);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type === "number") {
        var card = e.target.closest(".calc-card");
        var b2 = card && card.querySelector("[data-calc]");
        if (b2) { e.preventDefault(); b2.click(); }
      }
    });
    if (window.PHARMA3D_RELATED) window.PHARMA3D_RELATED.hydrateIcons(el);
  }

  window.P3DCalc = { mount: mount, math: math, builders: Object.keys(BUILDERS) };
})();
