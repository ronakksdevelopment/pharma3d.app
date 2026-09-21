/* =========================================================
   PHARMA 3D — Pharmacovigilance module logic
   Chain, terminology, Naranjo scoring, PRR / ROR / chi-square.
   ========================================================= */
(function () {
  "use strict";
  var esc = P4.esc, fmt = P4.fmt;
  function $(id) { return document.getElementById(id); }

  /* ---------- Chain ---------- */
  var CHAIN = [
    ["Medicine", "A medicine is authorised and used by patients after evaluation of its benefits and risks. Pre-approval studies involve limited numbers of people for limited time, so some effects only become visible after wide use.", "The reason pharmacovigilance continues after approval."],
    ["Patient", "A patient takes the medicine in real-world conditions: different ages, other illnesses, other medicines, doses and adherence.", "Real use is broader and messier than a trial population."],
    ["Adverse event", "A patient (or a clinician) notices an unwanted medical event. An adverse event is any untoward occurrence during treatment, whether or not caused by the medicine; an adverse drug reaction is one where a causal link is at least a reasonable possibility.", "Events are recorded first; causality is judged later."],
    ["Data collection", "Reports are gathered from healthcare professionals, patients, manufacturers, literature and registries into safety databases, in structured formats with details such as drug, dose, dates, outcome and reporter.", "Data quality and completeness vary widely; follow-up is often needed."],
    ["Signal detection", "Reports are reviewed clinically and screened statistically (for example with PRR, ROR) to find drug–event pairs that appear more often than expected, or unusual cases.", "A signal is a hypothesis that needs further evaluation, not a conclusion."],
    ["Investigation", "Signals are assessed with all available evidence: case reviews (including causality tools such as Naranjo), clinical trials, epidemiological studies, mechanism, and the literature.", "This step decides whether the evidence supports a causal link and how important it is."],
    ["Regulatory action", "If a risk is confirmed and significant, regulators and companies may update product information, issue safety communications, add restrictions or risk-minimisation measures, or in rare cases suspend or withdraw a product.", "Action is proportionate to the risk and the benefit of the medicine; monitoring continues."]
  ];
  function buildChain() {
    $("pvFlow").innerHTML = CHAIN.map(function (c, i) {
      return '<button type="button" class="flow-step" data-i="' + i + '" aria-pressed="' + (i === 0) + '"><span class="n">' + (i + 1) + '</span><span class="l">' + esc(c[0]) + "</span></button>";
    }).join("");
    $("pvFlow").addEventListener("click", function (e) { var b = e.target.closest(".flow-step"); if (b) showChain(+b.getAttribute("data-i")); });
    showChain(0);
  }
  function showChain(i) {
    var c = CHAIN[i];
    document.querySelectorAll("#pvFlow .flow-step").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-i") === i)); });
    $("pvDetail").innerHTML = "<h3>" + (i + 1) + " of " + CHAIN.length + " · " + esc(c[0]) + "</h3><p>" + esc(c[1]) + '</p><p><strong>Keep in mind.</strong> ' + esc(c[2]) + "</p>" +
      '<div class="p4-nav-row"><button class="btn btn-secondary" type="button" data-nav="-1"' + (i === 0 ? " disabled" : "") + '>← Previous</button><button class="btn btn-primary" type="button" data-nav="1"' + (i === CHAIN.length - 1 ? " disabled" : "") + ">Next →</button></div>";
    $("pvDetail").onclick = function (e) { var b = e.target.closest("[data-nav]"); if (b && !b.disabled) showChain(i + parseInt(b.getAttribute("data-nav"), 10)); };
  }

  /* ---------- Terminology ---------- */
  var TERMS = [
    ["Adverse event (AE)", "Any untoward medical occurrence in a patient given a medicine, not necessarily caused by it."],
    ["Adverse drug reaction (ADR)", "A harmful, unintended response to a medicine at normal doses, where a causal relationship is at least a reasonable possibility."],
    ["Serious adverse event", "An event that results in death, is life-threatening, requires or prolongs hospitalisation, causes persistent disability, or a congenital anomaly, or is otherwise medically important."],
    ["Expected / labelled", "An effect already described in the approved product information."],
    ["Unexpected", "An effect not described in, or different in nature or severity from, the approved product information."],
    ["Signal", "Information suggesting a new potentially causal association, or a new aspect of a known one, that warrants further investigation."],
    ["Causality assessment", "A structured judgement of how likely it is that a medicine caused a specific event, using tools such as Naranjo."],
    ["Spontaneous reporting", "Voluntary reporting of suspected reactions by clinicians, patients or companies, the backbone of post-marketing surveillance."],
    ["Under-reporting", "The fact that only a fraction of real events are reported, so counts cannot be read as true incidence."],
    ["Risk–benefit balance", "The weighing of a medicine’s benefits against its risks for its approved use."],
    ["Risk minimisation", "Measures that reduce risk, such as label changes, warnings, restrictions or educational materials."],
    ["Medication error", "A preventable event leading to inappropriate medication use or patient harm while the medicine is under a professional’s, patient’s or consumer’s control."]
  ];
  function buildTerms() {
    function paint(q) {
      q = (q || "").toLowerCase().trim();
      var list = TERMS.filter(function (t) { return !q || (t[0] + " " + t[1]).toLowerCase().indexOf(q) >= 0; });
      $("termGrid").innerHTML = list.length ? list.map(function (t) { return '<div class="p4-card" style="margin:0"><h3>' + esc(t[0]) + "</h3><p>" + esc(t[1]) + "</p></div>"; }).join("") : '<p class="idx-empty">No matching terms.</p>';
    }
    $("termSearch").addEventListener("input", function (e) { paint(e.target.value); });
    paint("");
  }

  /* ---------- Naranjo (standard published 10 questions & weights) ---------- */
  var NQ = [
    ["Are there previous conclusive reports on this reaction?", 1, 0, 0, 1],
    ["Did the adverse event appear after the suspected drug was given?", 2, -1, 0, 2],
    ["Did the adverse reaction improve when the drug was discontinued or a specific antagonist was given?", 1, 0, 0, 1],
    ["Did the adverse reaction reappear when the drug was re-administered?", 2, -1, 0, 0],
    ["Are there alternative causes (other than the drug) that could on their own have caused the reaction?", -1, 2, 0, 2],
    ["Did the reaction reappear when a placebo was given?", -1, 1, 0, 0],
    ["Was the drug detected in blood (or other fluids) in concentrations known to be toxic?", 1, 0, 0, 0],
    ["Was the reaction more severe when the dose was increased, or less severe when the dose was decreased?", 1, 0, 0, 0],
    ["Did the patient have a similar reaction to the same or similar drugs in any previous exposure?", 1, 0, 0, 0],
    ["Was the adverse event confirmed by any objective evidence?", 1, 0, 0, 1]
  ];
  // NQ row: [text, scoreYes, scoreNo, scoreDontKnow, exampleIndex] ; exampleIndex: 0 = don't know, 1 = yes, 2 = no
  var narAns = [];
  function narDefaults() {
    var ex = [1, 1, 1, 0, 2, 0, 0, 0, 2, 1]; // 1=yes, 2=no, 0=don't know (fictional case)
    return NQ.map(function (q, i) { return ex[i]; });
  }
  function buildNar() {
    narAns = narDefaults();
    $("narQs").innerHTML = NQ.map(function (q, i) {
      return '<div class="nar-q"><p><span class="tag-chip" style="margin-right:8px">Q' + (i + 1) + "</span>" + esc(q[0]) + '</p><div class="seg" role="group" aria-label="Answer to question ' + (i + 1) + '">' +
        [[1, "Yes"], [2, "No"], [0, "Do not know"]].map(function (o) { return '<button type="button" data-q="' + i + '" data-a="' + o[0] + '" aria-pressed="false">' + o[1] + "</button>"; }).join("") + "</div></div>";
    }).join("");
    $("narQs").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-q]"); if (!b) return;
      narAns[+b.getAttribute("data-q")] = +b.getAttribute("data-a"); paintNar();
    });
    $("narReset").addEventListener("click", function () { narAns = narDefaults(); paintNar(); });
    $("narClear").addEventListener("click", function () { narAns = NQ.map(function () { return 0; }); paintNar(); });
    paintNar();
  }
  function paintNar() {
    var total = 0;
    document.querySelectorAll("#narQs button[data-q]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(narAns[+b.getAttribute("data-q")] === +b.getAttribute("data-a")));
    });
    narAns.forEach(function (a, i) {
      var q = NQ[i];
      total += a === 1 ? q[1] : a === 2 ? q[2] : q[3];
    });
    var cat = total >= 9 ? "Definite" : total >= 5 ? "Probable" : total >= 1 ? "Possible" : "Doubtful";
    $("narOut").innerHTML = '<div class="row"><div class="ok">USER CALCULATED · Naranjo score</div><div class="ov">' + total + ' / 13</div></div>' +
      '<div class="row"><div class="ok">Category</div><div class="ov">' + cat + '</div><div class="os">Score range in the published tool runs from −4 to +13.</div></div>';
  }

  /* ---------- Signal detection ---------- */
  function num(id) { var v = $(id).value; return v === "" ? NaN : Number(v); }
  function calcSig() {
    var e = $("sigErr"); e.hidden = true; $("sigOut").hidden = true;
    var a = num("sa"), b = num("sb"), c = num("sc"), d = num("sd");
    function err(m) { e.hidden = false; e.textContent = m; }
    if ([a, b, c, d].some(function (x) { return !isFinite(x); })) return err("Enter all four counts.");
    if ([a, b, c, d].some(function (x) { return x < 0 || Math.floor(x) !== x; })) return err("Counts must be whole numbers, zero or greater.");
    var N = a + b + c + d;
    if (N === 0) return err("Total reports cannot be zero.");
    if (a + b === 0 || c + d === 0) return err("Both the drug row (a+b) and other-drugs row (c+d) need at least one report.");
    var prr = c === 0 ? Infinity : (a / (a + b)) / (c / (c + d));
    var ror = (b === 0 || c === 0) ? Infinity : (a * d) / (b * c);
    var den = (a + b) * (c + d) * (a + c) * (b + d);
    var chi = den === 0 ? NaN : N * Math.pow(a * d - b * c, 2) / den;
    // 95% CI for ROR (log-normal) when finite and all cells > 0
    var ci = "";
    if (isFinite(ror) && a > 0 && b > 0 && c > 0 && d > 0) {
      var se = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d), lo = Math.exp(Math.log(ror) - 1.96 * se), hi = Math.exp(Math.log(ror) + 1.96 * se);
      ci = "95% CI for ROR: " + fmt(lo, 2) + " – " + fmt(hi, 2);
    }
    var flag = isFinite(prr) && prr >= 2 && isFinite(chi) && chi >= 4 && a >= 3;
    function show(x) { return x === Infinity ? "undefined (zero in denominator)" : isFinite(x) ? fmt(x, 3) : "—"; }
    $("sigOut").hidden = false;
    $("sigOut").innerHTML =
      '<div class="row"><div class="ok">USER CALCULATED · PRR</div><div class="ov">' + show(prr) + "</div></div>" +
      '<div class="row"><div class="ok">ROR</div><div class="ov">' + show(ror) + '</div><div class="os">' + esc(ci) + "</div></div>" +
      '<div class="row"><div class="ok">Chi-square (1 d.f., no correction)</div><div class="ov">' + show(chi) + '</div><div class="os">N = ' + N + "</div></div>" +
      '<div class="row"><div class="ok">Screening rule (PRR ≥ 2, χ² ≥ 4, a ≥ 3)</div><div class="ov">' + (flag ? "Meets rule" : "Does not meet rule") + '</div><div class="os">A statistical signal is not proof of causation. This flag only means the pair merits further investigation.</div></div>';
  }
  function wireSig() {
    $("sigGo").addEventListener("click", calcSig);
    $("sigEx").addEventListener("click", function () {
      $("sa").value = 12; $("sb").value = 88; $("sc").value = 60; $("sd").value = 9840; calcSig();
      $("sigOut").insertAdjacentHTML("afterbegin", '<div class="ok" style="margin-bottom:8px">ILLUSTRATIVE example counts — invented, not from any database</div>');
    });
    ["sa", "sb", "sc", "sd"].forEach(function (i) { $(i).addEventListener("keydown", function (e) { if (e.key === "Enter") calcSig(); }); });
  }

  buildChain(); buildTerms(); buildNar(); wireSig();
})();
