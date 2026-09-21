/* =========================================================
   PHARMA 3D — Chitosan module logic
   Learning path, ionic gelation, SVG parts, parameter panel,
   characterisation, EE% / DL% calculators, release-model lab,
   conceptual comparison. Vanilla JS.
   ========================================================= */
(function () {
  "use strict";
  var esc = P4.esc, fmt = P4.fmt;
  function $(id) { return document.getElementById(id); }

  /* ---------------- 1. Learning path ---------------- */
  var STAGES = [
    { id: "chitosan", label: "CHITOSAN" },
    { id: "ionic", label: "IONIC GELATION" },
    { id: "nano", label: "NANOPARTICLE FORMATION" },
    { id: "loading", label: "DRUG LOADING" },
    { id: "char", label: "CHARACTERISATION" },
    { id: "release", label: "DRUG RELEASE" },
    { id: "app", label: "POTENTIAL APPLICATION" }
  ];
  var seen = P4.store("pharma3d:chitosan:seen", {});
  var seenMap = seen.get() || {};

  function buildPath() {
    var tr = $("pathTrack");
    tr.innerHTML = STAGES.map(function (s, i) {
      return '<button type="button" class="p4-stage" role="tab" id="st-' + s.id + '" data-stage="' + s.id + '" aria-controls="stage-' + s.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '"' + (i === 0 ? ' aria-current="true"' : "") + '><span class="n">' + (i + 1) + '</span><span class="l">' + s.label + "</span></button>";
    }).join("");
  }
  function showStage(id, focus) {
    var idx = STAGES.findIndex(function (s) { return s.id === id; });
    if (idx < 0) return;
    STAGES.forEach(function (s) { $("stage-" + s.id).hidden = s.id !== id; });
    seenMap[id] = true; seen.set(seenMap);
    document.querySelectorAll(".p4-stage").forEach(function (b) {
      var on = b.getAttribute("data-stage") === id;
      if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      b.classList.toggle("is-seen", !!seenMap[b.getAttribute("data-stage")]);
      if (on) b.scrollIntoView({ inline: "center", block: "nearest" });
      if (on && focus) b.focus();
    });
    $("pathFill").style.width = ((idx + 1) / STAGES.length * 100) + "%";
    $("pathTxt").textContent = "Stage " + (idx + 1) + " of " + STAGES.length + ": " + STAGES[idx].label;
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
    if (id === "release") drawAllRelease();
  }
  function wirePath() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".p4-stage");
      if (b) { showStage(b.getAttribute("data-stage"), false); return; }
      var g = e.target.closest("[data-go]");
      if (g) { showStage(g.getAttribute("data-go"), false); window.scrollTo({ top: $("pathTrack").getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" }); }
    });
    $("pathTrack").addEventListener("keydown", function (e) {
      var b = e.target.closest(".p4-stage"); if (!b) return;
      var ids = STAGES.map(function (s) { return s.id; });
      var i = ids.indexOf(b.getAttribute("data-stage")), n = null;
      if (e.key === "ArrowRight") n = ids[(i + 1) % ids.length];
      else if (e.key === "ArrowLeft") n = ids[(i - 1 + ids.length) % ids.length];
      else if (e.key === "Home") n = ids[0];
      else if (e.key === "End") n = ids[ids.length - 1];
      if (n) { e.preventDefault(); showStage(n, true); }
    });
    var h = (location.hash || "").replace("#", "");
    showStage(STAGES.some(function (s) { return s.id === h; }) ? h : "chitosan", false);
  }

  /* ---------------- 2. Ionic gelation sequence ---------------- */
  var IONIC = [
    { t: "Chitosan", what: "Chitosan is dissolved in a dilute acidic solution, where its amino groups can carry a positive charge (–NH₃⁺).", how: "Acid supplies protons that attach to the free amino groups. The polymer chains then repel each other slightly and stay dissolved.", why: "A dissolved, positively charged polymer is the reactive starting point for electrostatic crosslinking.", lim: "If the pH is too high the amino groups lose charge and chitosan can precipitate. Acid can also affect some drugs." },
    { t: "Polyanionic agent (e.g. TPP)", what: "A small molecule carrying several negative charges, such as sodium tripolyphosphate (TPP), is prepared in water. TPP is a commonly cited example, not the only option.", how: "The negative groups on the polyanion are available to interact with positive groups on the chitosan chains.", why: "Multiple charges on one small molecule let it bridge more than one chain, which is the basis of crosslinking.", lim: "The charge on the polyanion depends on pH. Different polyanions behave differently, and TPP-based reports do not automatically apply to others." },
    { t: "Electrostatic interaction", what: "When the solutions meet, positive chitosan groups and negative polyanion groups attract each other.", how: "This is a non-covalent, ion-pair interaction. It forms under mild conditions, without organic solvents in the classic description.", why: "Mild aqueous conditions are attractive for handling sensitive molecules, and no covalent crosslinker is needed.", lim: "Electrostatic crosslinks are reversible and sensitive to pH and ionic strength. Particles may change or dissociate when conditions change." },
    { t: "Crosslinked particulate network", what: "Local crosslinking pulls chains together into small polymer-rich regions that can grow into dispersed particles.", how: "Under stirring, crosslinked domains form and remain suspended as a colloid when the ratio and concentrations are in a suitable range.", why: "This gives a nanoscale or submicron dispersion instead of a clear solution or a large gel mass.", lim: "Outside a suitable range the result can be a clear solution, a turbid aggregate or a gel. Whether a given batch is truly nanoscale is decided by measurement, not by description." },
    { t: "Conceptual drug association", what: "A drug present during mixing can become associated with the forming network.", how: "Drug may be entrapped in the network, held by charge or hydrogen bonding, or sit on the particle surface.", why: "Association can change how the drug is released and handled compared with the free drug.", lim: "Amount associated, location within the particle and benefit are drug-specific and must be measured. Some drug is always found free." }
  ];
  function buildIonic() {
    $("ionicFlow").innerHTML = IONIC.map(function (s, i) {
      return '<button type="button" class="flow-step" data-i="' + i + '" aria-pressed="' + (i === 0) + '"><span class="n">STEP ' + (i + 1) + '</span><span class="l">' + esc(s.t) + "</span></button>";
    }).join("");
    showIonic(0);
    $("ionicFlow").addEventListener("click", function (e) {
      var b = e.target.closest(".flow-step"); if (b) showIonic(+b.getAttribute("data-i"));
    });
  }
  function showIonic(i) {
    var s = IONIC[i];
    document.querySelectorAll("#ionicFlow .flow-step").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-i") === i)); });
    $("ionicDetail").innerHTML = '<h3>Step ' + (i + 1) + " of " + IONIC.length + " · " + esc(s.t) + "</h3>" +
      '<div class="whwl" style="margin-top:var(--space-3)">' +
      '<div class="cell"><h4>What</h4><p>' + esc(s.what) + "</p></div>" +
      '<div class="cell"><h4>How</h4><p>' + esc(s.how) + "</p></div>" +
      '<div class="cell"><h4>Why</h4><p>' + esc(s.why) + "</p></div>" +
      '<div class="cell lim"><h4>Limitations</h4><p>' + esc(s.lim) + "</p></div></div>";
  }

  /* ---------------- 3. SVG parts ---------------- */
  var PARTS = {
    polymer: ["Polymer network", "Chitosan chains drawn as curved lines. In reality chains are long, entangled and irregular, and their arrangement is not settled by a picture.", "Does not show real chain length, real density, or water content inside the particle."],
    xlink: ["Crosslinking concept", "Short dark bars represent polyanion molecules bridging neighbouring chains through electrostatic attraction.", "Real crosslinks are non-covalent, reversible and far more numerous and irregular. Bar positions here are illustrative."],
    drug: ["Schematic drug molecules", "Round dots stand for drug associated with the network. Some may be inside, some at the surface.", "Real drug location, amount and binding are measured, not drawn. Dot size and count are arbitrary."],
    env: ["Surrounding environment", "Faint dots outside the particle stand for ions in the aqueous medium. The medium's pH and ionic strength influence particle behaviour.", "Does not show water molecules, buffers, or biological components."],
    cut: ["Cutaway view", "The dashed wedge is removed so the inside can be shown. It has no physical meaning beyond teaching.", "Real particles are not cut open like this, and their interior is not necessarily uniform."]
  };
  function buildSvg() {
    var g = $("envDots"), s = "";
    var pts = [[40, 40], [90, 120], [30, 200], [60, 300], [120, 390], [210, 400], [360, 400], [470, 300], [490, 200], [470, 120], [420, 40], [300, 24], [180, 22], [100, 60], [460, 250], [50, 250]];
    pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5"/>'; });
    g.innerHTML = s;
    function show(part) {
      var d = PARTS[part]; if (!d) return;
      $("partDetail").innerHTML = "<h3>" + esc(d[0]) + "</h3><p>" + esc(d[1]) + '</p><p><strong>Not shown:</strong> ' + esc(d[2]) + "</p>";
    }
    $("nanoSvg").addEventListener("click", function (e) { var h = e.target.closest(".hit"); if (h) show(h.getAttribute("data-part")); });
    $("nanoSvg").addEventListener("keydown", function (e) {
      var h = e.target.closest(".hit"); if (h && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(h.getAttribute("data-part")); }
    });
    document.querySelectorAll("#nanoSvg .hit").forEach(function (h) { h.style.cursor = "pointer"; });
  }

  /* ---------------- 4. Parameter panel ---------------- */
  var PARAMS = [
    { id: "conc", name: "Chitosan concentration", unit: "mg/mL", min: 0.5, max: 5, step: 0.5, val: 2,
      bands: [
        [1.5, "Lower concentration", "Particles may tend to be smaller, but fewer polymer chains are available, so yield and drug capacity may be lower.", "Fewer chains per volume means less material to crosslink and fewer crosslink sites. Local network density can be lower.", "Very low concentration can give a clear solution or too little material to recover. Trends vary between studies."],
        [3.5, "Intermediate concentration", "Often reported as a workable range in which particle formation is reproducible, though optimum values differ by system.", "Enough chains are present for crosslinking without extreme viscosity.", "‘Intermediate’ is not a fixed number; it depends on molecular weight and DD."],
        [99, "Higher concentration", "Particles may tend to be larger, more polydisperse or aggregate; viscosity rises.", "More chains per volume and higher viscosity slow diffusion and mixing, favouring larger, less uniform domains.", "Not universal. At high concentration a gel or aggregates may form instead of a dispersion."]
      ] },
    { id: "tpp", name: "TPP / crosslinker condition", unit: "chitosan : TPP mass ratio", min: 2, max: 10, step: 1, val: 5, invert: false,
      bands: [
        [3.5, "Relatively more crosslinker", "May give more compact particles, or may cause aggregation and turbidity if crosslinker is in excess.", "More polyanion means more bridging and charge neutralisation. Surface charge can fall toward zero, reducing electrostatic stabilisation.", "Excess crosslinker can lead to aggregation. The optimum ratio is system-specific."],
        [7, "Intermediate ratio", "A range often explored for obtaining dispersed particles with net positive surface charge.", "Enough crosslinking to form particles while leaving positive charge on the surface for stability.", "Ratios are reported in different ways (mass, molar, volume). Compare only like with like."],
        [99, "Relatively less crosslinker", "May give looser, less well-formed particles or a solution rather than particles.", "Too few bridges to pull chains together into stable domains.", "Below a threshold no particles may form. Threshold depends on the whole system."]
      ] },
    { id: "ph", name: "pH of the chitosan solution", unit: "pH", min: 3, max: 6.5, step: 0.5, val: 4.5,
      bands: [
        [4, "More acidic", "Chitosan amino groups are more fully protonated, giving stronger positive charge and better solubility.", "Lower pH raises the fraction of –NH₃⁺ groups, increasing electrostatic attraction with polyanion.", "Very acidic conditions can degrade sensitive drugs and polyanion charge also changes with pH."],
        [5.2, "Mildly acidic", "Often used in reports. Balance between polymer charge and polyanion charge.", "Chitosan is still charged while the polyanion carries negative charge, so both partners are ionised.", "The window is narrow and drug-dependent."],
        [99, "Approaching neutral", "Chitosan loses charge and can precipitate; particle formation becomes less controlled.", "Deprotonation of amino groups (pKa around 6.5 is often cited) reduces the charge available to crosslink.", "The pKa depends on DD and conditions; values are approximate."]
      ] },
    { id: "dd", name: "Degree of deacetylation (DD)", unit: "%", min: 60, max: 98, step: 2, val: 85,
      bands: [
        [75, "Lower DD", "Fewer free amino groups per chain, so fewer sites for electrostatic crosslinking and generally lower charge density.", "DD sets the fraction of glucosamine units that can be protonated.", "DD is measured by methods that give somewhat different values. Effects on final particles are entangled with molecular weight."],
        [90, "Intermediate DD", "A commonly used commercial range. Reasonable charge density and solubility in dilute acid.", "Enough amino groups for crosslinking while maintaining chain properties.", "Commercial grades with the same nominal DD can still behave differently."],
        [99, "Higher DD", "Higher charge density, which may favour stronger interaction with polyanions and different surface charge.", "More amino groups per chain increases electrostatic capacity.", "Higher DD is not automatically better for a given application."]
      ] },
    { id: "ratio", name: "Drug : polymer ratio", unit: "drug : chitosan (mass)", min: 0.05, max: 1, step: 0.05, val: 0.2,
      bands: [
        [0.2, "Lower drug : polymer ratio", "Encapsulation efficiency may tend to be higher because polymer capacity is not saturated, but drug loading (per mass of particle) is lower.", "Polymer sites outnumber drug molecules, so a larger fraction of drug can associate.", "Poorly retained or highly soluble drugs may still be mostly free."],
        [0.5, "Intermediate ratio", "A trade-off between EE% and DL% is commonly reported.", "As drug increases, loading may rise while the fraction retained may start to fall.", "The curve shape differs from drug to drug."],
        [99, "Higher drug : polymer ratio", "Loading may rise while EE% may fall as available polymer capacity is used up. Drug can interfere with particle formation.", "Limited binding sites; excess drug remains in solution or on the surface.", "High drug content can change particle size and stability, and may burst-release."]
      ] }
  ];
  var curParam = 0;
  var pvals = {}; PARAMS.forEach(function (p) { pvals[p.id] = p.val; });
  function band(p, v) { for (var i = 0; i < p.bands.length; i++) if (v <= p.bands[i][0]) return p.bands[i]; return p.bands[p.bands.length - 1]; }
  function buildParams() {
    $("paramCtl").innerHTML = PARAMS.map(function (p, i) {
      return '<div><button type="button" class="param-btn" data-p="' + i + '" aria-pressed="' + (i === 0) + '"><span class="pn">' + esc(p.name) + '</span><span class="pv" id="pv-' + p.id + '">' + pvals[p.id] + " " + esc(p.unit.split(" ")[0]) + "</span></button>" +
        '<div class="param-slider"><label class="visually-hidden" for="sl-' + p.id + '">' + esc(p.name) + '</label><input type="range" id="sl-' + p.id + '" data-p="' + i + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + pvals[p.id] + '"></div></div>';
    }).join("");
    $("paramCtl").addEventListener("click", function (e) {
      var b = e.target.closest(".param-btn"); if (!b) return;
      curParam = +b.getAttribute("data-p"); paintParam();
    });
    $("paramCtl").addEventListener("input", function (e) {
      var r = e.target.closest("input[type=range]"); if (!r) return;
      var i = +r.getAttribute("data-p"), p = PARAMS[i];
      pvals[p.id] = parseFloat(r.value); curParam = i; paintParam();
    });
    paintParam();
  }
  function paintParam() {
    var p = PARAMS[curParam], v = pvals[p.id], b = band(p, v);
    document.querySelectorAll(".param-btn").forEach(function (x) { x.setAttribute("aria-pressed", String(+x.getAttribute("data-p") === curParam)); });
    PARAMS.forEach(function (q) { var el = $("pv-" + q.id); if (el) el.textContent = pvals[q.id] + " " + q.unit.split(" ")[0]; });
    $("paramOut").innerHTML = "<h3>" + esc(p.name) + " = " + esc(String(v)) + " " + esc(p.unit) + '</h3><span class="p4-label dash" style="margin-bottom:var(--space-3)">ILLUSTRATIVE TENDENCY — NOT A UNIVERSAL CLAIM</span>' +
      '<div class="chain"><div><h5>Parameter</h5><p>' + esc(b[0]) + "</p></div>" +
      "<div><h5>Possible effect</h5><p>" + esc(b[1]) + "</p></div>" +
      "<div><h5>Scientific reasoning</h5><p>" + esc(b[2]) + "</p></div>" +
      "<div><h5>Limitations</h5><p>" + esc(b[3]) + "</p></div></div>";
  }

  /* ---------------- 5. Characterisation ---------------- */
  var CHAR = [
    ["Particle size", "Hydrodynamic diameter, often by dynamic light scattering (DLS).", "Size influences stability, drug release and how particles interact with tissues.", "DLS reports an intensity-weighted average that overweights large particles; it measures hydrodynamic size in the medium, not dry size."],
    ["Polydispersity index (PDI)", "A dimensionless number from DLS describing the breadth of the size distribution.", "Lower values indicate a narrower distribution; it helps judge batch uniformity.", "There is no single universal cut-off for ‘good’ PDI; it depends on the method and purpose."],
    ["Zeta potential", "Electrical potential near the particle surface, an indicator of surface charge.", "Higher magnitude of charge can indicate stronger electrostatic repulsion and better colloidal stability.", "Depends on pH and ionic strength of the medium; it is not a direct proof of stability."],
    ["Encapsulation efficiency (EE%)", "Fraction of the initial drug associated with the particles.", "Shows how much drug is retained rather than lost in preparation.", "Indirect methods assume the assay is accurate; free-drug separation can itself disturb particles."],
    ["Drug loading (DL%)", "Drug mass relative to particle mass.", "Indicates how much drug each mass of particle carries, which affects the required particle amount.", "Definitions differ between papers; check the denominator."],
    ["Morphology", "Shape and surface, by SEM or TEM.", "Confirms shape, and that particles are discrete rather than aggregated films.", "Sample preparation (drying, staining, vacuum) can create artefacts; images show only a few particles."],
    ["FTIR", "Fourier-transform infrared spectroscopy of functional groups.", "Shifts in amine or phosphate bands can support interaction between chitosan and polyanion.", "Overlapping bands make assignment difficult; FTIR suggests interaction but does not prove a specific structure."],
    ["DSC", "Differential scanning calorimetry of thermal events.", "Changes in thermal transitions can hint at drug state (crystalline or dispersed) and polymer interaction.", "Interpretation depends on sample history and heating rate; thermal events can overlap."],
    ["XRD", "X-ray diffraction, probing crystalline versus amorphous character.", "Loss of drug crystalline peaks may suggest the drug is dispersed rather than crystalline.", "Low drug content can hide peaks even if drug is crystalline; absence of peaks is not proof of molecular dispersion."]
  ];
  function buildChar() {
    $("charGrid").innerHTML = CHAR.map(function (c) {
      return '<article class="p4-card" style="margin:0"><h3>' + esc(c[0]) + '</h3><p><strong>What it is.</strong> ' + esc(c[1]) + '</p><p><strong>Why it helps.</strong> ' + esc(c[2]) + '</p><p><strong>Limitation.</strong> ' + esc(c[3]) + "</p></article>";
    }).join("");
  }

  /* ---------------- 6. Calculators (real math) ---------------- */
  function num(id) { var v = $(id).value; return v === "" ? NaN : Number(v); }
  function showErr(id, msg) { var e = $(id); e.hidden = !msg; e.textContent = msg || ""; }
  function calcEE() {
    showErr("eeErr", ""); $("eeOut").hidden = true;
    var T = num("eeTot"), F = num("eeFree");
    if (!isFinite(T) || !isFinite(F)) return showErr("eeErr", "Enter both values as numbers.");
    if (T <= 0) return showErr("eeErr", "Initial drug must be greater than zero.");
    if (F < 0) return showErr("eeErr", "Free drug cannot be negative.");
    if (F > T) return showErr("eeErr", "Free drug cannot exceed the initial drug. Check your values and units.");
    var ee = (T - F) / T * 100;
    $("eeOut").hidden = false;
    $("eeOut").innerHTML = '<div class="row"><div class="ok">USER CALCULATED · EE%</div><div class="ov">' + fmt(ee, 2) + ' %</div></div>' +
      '<div class="row"><div class="ok">Working</div><div class="os">(' + fmt(T, 3) + " − " + fmt(F, 3) + ") / " + fmt(T, 3) + " × 100 = " + fmt(ee, 2) + " %<br>Encapsulated (by difference): " + fmt(T - F, 3) + " mg</div></div>";
  }
  function calcDL() {
    showErr("dlErr", ""); $("dlOut").hidden = true;
    var T = num("dlTot"), F = num("dlFree"), N = num("dlNp");
    if (!isFinite(T) || !isFinite(F) || !isFinite(N)) return showErr("dlErr", "Enter all three values as numbers.");
    if (T <= 0 || N <= 0) return showErr("dlErr", "Initial drug and nanoparticle mass must be greater than zero.");
    if (F < 0) return showErr("dlErr", "Free drug cannot be negative.");
    if (F > T) return showErr("dlErr", "Free drug cannot exceed the initial drug.");
    if ((T - F) > N) return showErr("dlErr", "Encapsulated drug cannot exceed total nanoparticle mass. Check your values.");
    var dl = (T - F) / N * 100;
    $("dlOut").hidden = false;
    $("dlOut").innerHTML = '<div class="row"><div class="ok">USER CALCULATED · DL%</div><div class="ov">' + fmt(dl, 2) + ' %</div></div>' +
      '<div class="row"><div class="ok">Working</div><div class="os">(' + fmt(T, 3) + " − " + fmt(F, 3) + ") / " + fmt(N, 3) + " × 100 = " + fmt(dl, 2) + " %</div></div>";
  }
  function wireCalc() {
    $("eeGo").addEventListener("click", calcEE);
    $("dlGo").addEventListener("click", calcDL);
    $("eeEx").addEventListener("click", function () { $("eeTot").value = 10; $("eeFree").value = 3.5; calcEE(); $("eeOut").insertAdjacentHTML("afterbegin", '<div class="ok" style="margin-bottom:8px">ILLUSTRATIVE example values — not experimental data</div>'); });
    $("dlEx").addEventListener("click", function () { $("dlTot").value = 10; $("dlFree").value = 3.5; $("dlNp").value = 60; calcDL(); $("dlOut").insertAdjacentHTML("afterbegin", '<div class="ok" style="margin-bottom:8px">ILLUSTRATIVE example values — not experimental data</div>'); });
    ["eeTot", "eeFree"].forEach(function (i) { $(i).addEventListener("keydown", function (e) { if (e.key === "Enter") calcEE(); }); });
    ["dlTot", "dlFree", "dlNp"].forEach(function (i) { $(i).addEventListener("keydown", function (e) { if (e.key === "Enter") calcDL(); }); });
  }

  /* ---------------- 7. Release-model laboratory ---------------- */
  var MODELS = [
    { id: "zero", name: "Zero-order",
      eq: "Qt = Q0 + k0·t", eqNote: "Qt: cumulative % released at time t · k0: zero-order rate constant (%/h)",
      params: [["k0", "Rate constant k0 (% per h)", 1, 20, 0.5, 5]],
      f: function (p, t) { return Math.min(100, p[0] * t); },
      plain: "Release proceeds at a constant amount per unit time, independent of how much drug remains.",
      assump: "Drug release rate does not depend on drug concentration; geometry and surface area stay constant; no burst; sink conditions.",
      limit: "Rarely matches nanoparticle data over the whole profile. Real systems often show an initial burst and a slowing rate. A straight line can appear over a short window for many mechanisms." },
    { id: "first", name: "First-order",
      eq: "Qt = 100·(1 − e^(−k1·t))", eqNote: "Qt: cumulative % released · k1: first-order rate constant (1/h)",
      params: [["k1", "Rate constant k1 (1/h)", 0.02, 0.6, 0.01, 0.15]],
      f: function (p, t) { return 100 * (1 - Math.exp(-p[0] * t)); },
      plain: "The release rate is proportional to the amount of drug still in the system, so release starts fast and slows as drug is depleted.",
      assump: "Rate proportional to remaining drug; homogeneous matrix; constant conditions; sink conditions; complete release at long times.",
      limit: "Fits many profiles but says little about mechanism; diffusion, erosion and dissolution can all give exponential-like curves." },
    { id: "higuchi", name: "Higuchi",
      eq: "Qt = kH·√t", eqNote: "Qt: cumulative % released · kH: Higuchi constant (% h^−½)",
      params: [["kH", "Higuchi constant kH (% h^-1/2)", 5, 40, 1, 18]],
      f: function (p, t) { return Math.min(100, p[0] * Math.sqrt(t)); },
      plain: "Release scales with the square root of time, as expected for diffusion out of a matrix whose drug supply is depleting from the surface inward.",
      assump: "Diffusion is rate-limiting; matrix does not swell or erode; drug initially uniformly dispersed at concentration well above its solubility; perfect sink; one-dimensional diffusion.",
      limit: "Derived for planar systems with specific assumptions. Chitosan particles swell and may erode, so applying Higuchi to them is an approximation. Often valid only to about 60% release." },
    { id: "kp", name: "Korsmeyer–Peppas",
      eq: "Mt/M∞ = k·tⁿ", eqNote: "Mt/M∞: fraction released · k: kinetic constant · n: release exponent",
      params: [["k", "Constant k (fraction per h^n)", 0.05, 0.4, 0.01, 0.15], ["n", "Release exponent n", 0.2, 1.0, 0.05, 0.5]],
      f: function (p, t) { return Math.min(100, 100 * p[0] * Math.pow(t, p[1])); },
      plain: "A flexible power law. The exponent n is used, with geometry-specific reference values, as a guide to whether release looks more diffusion-like or more relaxation/erosion-like.",
      assump: "Applies to the first ~60% of release; one-dimensional release from a system of defined geometry; constant diffusion coefficient; no burst effect. The n cut-offs (for example 0.43 and 0.85 for spheres) apply to monodisperse spheres.",
      limit: "Particle-size distribution, swelling and burst effects can shift n and make a mechanism call unreliable. n is a descriptive fitting parameter, not a proof of mechanism." }
  ];
  var relState = {};
  function buildRelease() {
    var tabs = $("relTabs"), panels = $("relPanels");
    tabs.innerHTML = MODELS.map(function (m, i) {
      return '<button type="button" class="model-tab" role="tab" id="rt-' + m.id + '" aria-controls="rp-' + m.id + '" aria-selected="' + (i === 0) + '" data-m="' + m.id + '">' + esc(m.name) + "</button>";
    }).join("");
    panels.innerHTML = MODELS.map(function (m, i) {
      relState[m.id] = m.params.map(function (p) { return p[5]; });
      var sl = m.params.map(function (p, pi) {
        return '<div class="field"><label for="rs-' + m.id + "-" + pi + '">' + esc(p[1]) + '</label><div class="range-row"><input type="range" id="rs-' + m.id + "-" + pi + '" data-m="' + m.id + '" data-pi="' + pi + '" min="' + p[2] + '" max="' + p[3] + '" step="' + p[4] + '" value="' + p[5] + '"><output id="ro-' + m.id + "-" + pi + '">' + p[5] + "</output></div></div>";
      }).join("");
      return '<section class="model-panel" role="tabpanel" id="rp-' + m.id + '" aria-labelledby="rt-' + m.id + '"' + (i ? " hidden" : "") + ">" +
        '<div class="model-body"><div>' +
        '<h3 style="margin-bottom:var(--space-1)">' + esc(m.name) + '</h3><div class="eq">' + esc(m.eq) + '</div><p class="p4-caption" style="margin-bottom:var(--space-3)">' + esc(m.eqNote) + "</p>" +
        "<p>" + esc(m.plain) + "</p>" + sl +
        '<div class="assump"><div class="a"><strong>Assumptions.</strong> ' + esc(m.assump) + '</div><div class="l"><strong>Limitations.</strong> ' + esc(m.limit) + "</div></div></div>" +
        '<div><span class="p4-graph-label">ILLUSTRATIVE — COMPUTED FROM THE DISPLAYED MODEL</span><div class="p4-canvas-wrap"><canvas id="rc-' + m.id + '" role="img" aria-label="' + esc(m.name) + ' release curve: cumulative percent released versus time"></canvas></div>' +
        '<p class="visually-hidden" id="rsum-' + m.id + '"></p>' +
        '<h4 style="margin:var(--space-4) 0 var(--space-2)">Data table</h4><div id="rtb-' + m.id + '"></div></div></div>' +
        '<div class="p4-banner" style="margin-top:var(--space-4)">Mathematical curve fit alone does not prove release mechanism.</div></section>';
    }).join("");
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".model-tab"); if (!b) return;
      selectModel(b.getAttribute("data-m"));
    });
    tabs.addEventListener("keydown", function (e) {
      var b = e.target.closest(".model-tab"); if (!b) return;
      var ids = MODELS.map(function (m) { return m.id; }), i = ids.indexOf(b.getAttribute("data-m")), n = null;
      if (e.key === "ArrowRight") n = ids[(i + 1) % ids.length]; else if (e.key === "ArrowLeft") n = ids[(i - 1 + ids.length) % ids.length];
      if (n) { e.preventDefault(); selectModel(n); $("rt-" + n).focus(); }
    });
    panels.addEventListener("input", function (e) {
      var r = e.target.closest("input[type=range]"); if (!r) return;
      var id = r.getAttribute("data-m"), pi = +r.getAttribute("data-pi");
      relState[id][pi] = parseFloat(r.value);
      $("ro-" + id + "-" + pi).textContent = r.value;
      drawRelease(id);
    });
  }
  function selectModel(id) {
    MODELS.forEach(function (m) {
      var on = m.id === id;
      $("rp-" + m.id).hidden = !on;
      $("rt-" + m.id).setAttribute("aria-selected", String(on));
    });
    drawRelease(id);
  }
  function drawRelease(id) {
    var m = MODELS.find(function (x) { return x.id === id; }), p = relState[id];
    var pts = [], i;
    for (i = 0; i <= 48; i += 0.5) pts.push([i, m.f(p, i)]);
    P4.lineChart($("rc-" + id), [{ name: m.name, pts: pts }], { xLabel: "Time (h)", yLabel: "Cumulative release (%)", xMin: 0, xMax: 48, yMin: 0, yMax: 100, w: 560, h: 340 });
    var rows = [0, 1, 2, 4, 6, 8, 12, 24, 36, 48].map(function (t) { return [String(t), fmt(m.f(p, t), 2)]; });
    $("rtb-" + id).innerHTML = P4.tableHtml(["Time (h)", "Released (%)"], rows);
    var t24 = m.f(p, 24);
    $("rsum-" + id).textContent = m.name + " curve. Released about " + fmt(m.f(p, 4), 1) + " percent at 4 hours, " + fmt(m.f(p, 12), 1) + " at 12 hours and " + fmt(t24, 1) + " at 24 hours.";
  }
  function drawAllRelease() {
    var active = MODELS.find(function (m) { return !$("rp-" + m.id).hidden; });
    drawRelease(active ? active.id : MODELS[0].id);
  }

  /* ---------------- 8. Comparison ---------------- */
  var CMP_HEAD = ["System", "What it is", "Typical composition", "Where it is often studied", "Conceptual strengths", "Conceptual limitations"];
  var CMP = [
    ["Chitosan nanoparticles", "Crosslinked polymer particles, typically formed by ionic gelation.", "Chitosan plus polyanion (e.g. TPP).", "Mucosal, nasal, ocular and oral research; delivery of peptides and other molecules.", "Mild aqueous preparation; positively charged surface; polymer-derived material.", "Grade variability; pH sensitivity; aggregation; mostly preclinical evidence."],
    ["Liposomes", "Vesicles with one or more lipid bilayers enclosing an aqueous core.", "Phospholipids, often with cholesterol.", "Parenteral delivery; some are in clinical use for specific drugs.", "Can carry both water-soluble (core) and lipid-soluble (bilayer) drugs.", "Stability and leakage; manufacturing complexity; storage conditions."],
    ["Polymeric nanoparticles", "Solid particles of synthetic or natural polymers, in a broad category that includes chitosan particles.", "e.g. PLGA, PLA, alginate, chitosan.", "Controlled release and targeted delivery research.", "Tunable polymer properties and release profiles.", "Residual solvents in some methods; polymer-specific toxicity and degradation questions."],
    ["Lipid nanoparticles", "Particles built from lipids, including solid lipid nanoparticles and ionisable-lipid systems.", "Solid and liquid lipids, surfactants, in some cases ionisable lipids.", "Oral and parenteral delivery; nucleic-acid delivery is a well-known example.", "Lipid-based, can carry lipophilic drugs; some systems have regulatory precedent.", "Formulation complexity; stability; drug expulsion on storage in some systems."],
    ["Nanoemulsions", "Fine oil-in-water or water-in-oil dispersions with small droplets stabilised by surfactants.", "Oil, water, surfactant, co-surfactant.", "Oral, topical and parenteral delivery of poorly water-soluble drugs.", "Can improve dispersion of lipophilic drugs; relatively simple to prepare.", "Thermodynamic issues; high surfactant content in some formulations; physical instability."],
    ["Nanocrystals", "Drug particles themselves reduced to nanoscale, stabilised with surfactant or polymer, without a carrier.", "Drug plus stabilisers.", "Poorly water-soluble drugs where dissolution rate limits absorption.", "Very high drug content; no carrier matrix needed.", "Only addresses dissolution; crystal growth and aggregation; not a carrier for targeting."]
  ];
  function buildCmp() {
    $("cmpTbl").innerHTML = "<thead><tr>" + CMP_HEAD.map(function (h) { return '<th scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      CMP.map(function (r) { return "<tr><th scope=\"row\">" + esc(r[0]) + "</th>" + r.slice(1).map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>";
  }

  /* ---------------- init ---------------- */
  buildPath(); buildIonic(); buildSvg(); buildParams(); buildChar(); wireCalc(); buildRelease(); buildCmp(); wirePath();
  P4.redrawOnTheme(drawAllRelease);
})();
