/* =========================================================
   PHARMA 3D — Manufacturing module (/manufacturing.html)
   12 stages in order, each with: equipment, purpose, critical
   process parameters, common defects, in-process checks, GMP
   relevance. Plus a defect explorer (6 defects).
   ========================================================= */
(function () {
  "use strict";

  var UI = window.P3DUI, esc = window.p3dEsc;
  var root = document.getElementById("mfg-root");
  if (!root || !UI) return;

  function stageDetail(s, i, n) {
    return '<h3 class="mod-h2" style="font-size:var(--fs-h3)" id="stage-title" tabindex="-1">' + (i + 1) + ". " + esc(s.name) + "</h3>" +
      '<p class="mod-lead">' + esc(s.purpose) + "</p>" +
      UI.accordion([
        { title: "Purpose", body: UI.para(s.purpose), open: true },
        { title: "Equipment", body: UI.para(s.equipment), open: true },
        { title: "Critical process parameters", body: UI.bullets(s.cpp) },
        { title: "Common defects", body: UI.bullets(s.defects) },
        { title: "In-process checks", body: UI.bullets(s.inprocess) },
        { title: "GMP relevance", body: UI.para(s.gmp) }
      ]) +
      '<div class="calc-actions"><button type="button" class="btn btn-secondary" data-stage-step="-1"' + (i === 0 ? " disabled" : "") + '>← Previous stage</button>' +
      '<button type="button" class="btn btn-primary" data-stage-step="1"' + (i === n - 1 ? " disabled" : "") + ">Next stage →</button></div>";
  }

  function defectDetail(d) {
    return '<div class="struct def-detail" id="def-detail" tabindex="-1" role="region" aria-live="polite" aria-label="' + esc(d.name) + ' details">' +
      "<h3>" + esc(d.name) + "</h3>" +
      '<dl class="kv"><dt>Appearance</dt><dd>' + esc(d.appearance) + "</dd></dl>" +
      '<h4 style="margin-top:12px">Cause</h4>' + UI.bullets(d.cause) +
      '<h4 style="margin-top:12px">Prevention</h4>' + UI.bullets(d.prevention) +
      '<p class="muted" style="margin-top:12px;font-size:.85rem;">Textbook causes. Actual investigation of a real batch needs data, records and a quality-system process.</p></div>';
  }

  function render(data) {
    var stages = data.stages, defects = data.defects, meta = data.meta;
    var cur = 0, curDef = 0;

    var head =
      '<header class="mod-head"><span class="section-eyebrow">Manufacturing</span>' +
      "<h1>From raw material to released batch</h1>" +
      '<p class="lead">Twelve stages in order, for a typical oral solid dosage form. Each stage lists equipment, purpose, critical process parameters, common defects, in-process checks and why it matters for GMP.</p>' +
      '<div class="mod-meta">' + window.p3dBadge(meta.evidence) + "</div>" +
      '<div class="mod-limit" role="note"><strong>Overview, not a guarantee.</strong> ' + esc(meta.note) + "</div></header>";

    var flow = '<section aria-labelledby="flow-h"><h2 class="mod-h2" id="flow-h">The stages in order</h2>' +
      '<ol class="stage-flow" aria-label="Manufacturing stages in order">' +
      stages.map(function (s, i) { return "<li><span class=\"sf\">" + (i + 1) + ". " + esc(s.name) + "</span>" + (i < stages.length - 1 ? '<span class="arr" aria-hidden="true">→</span>' : "") + "</li>"; }).join("") +
      "</ol></section>";

    var explorer = '<section style="margin-top:var(--space-8)" aria-labelledby="stage-h"><h2 class="mod-h2" id="stage-h">Stage explorer</h2>' +
      '<p class="mod-lead">Choose a stage, then open the sections below.</p>' +
      '<div class="stage-rail" role="group" aria-label="Choose a manufacturing stage">' +
      stages.map(function (s, i) { return '<button type="button" class="stage-btn" data-stage="' + i + '"' + (i === 0 ? ' aria-current="true"' : "") + '><span class="sn">' + (i + 1) + '</span><span class="sl">' + esc(s.name) + "</span></button>"; }).join("") +
      '</div><div class="topic-progress"><div class="progress-bar" aria-hidden="true"><div class="progress-bar-fill" id="stage-fill"></div></div><span class="topic-progress-label" id="stage-label" role="status" aria-live="polite"></span></div>' +
      '<div id="stage-body" style="margin-top:var(--space-4)"></div></section>';

    var defs = '<section style="margin-top:var(--space-10)" aria-labelledby="def-h"><h2 class="mod-h2" id="def-h">Defect explorer</h2>' +
      '<p class="mod-lead" style="margin-bottom:var(--space-4)">Six common tablet defects. Select one to see its appearance, cause and prevention.</p>' +
      '<div class="def-grid" role="group" aria-label="Choose a defect">' +
      defects.map(function (d, i) { return '<button type="button" class="def-btn" data-def="' + i + '" aria-pressed="' + (i === 0) + '"><span>' + esc(d.name) + '</span><span class="idx-go" data-icon="arrowRight" aria-hidden="true"></span></button>'; }).join("") +
      '</div><div id="def-body"></div></section>';

    var refs = '<section style="margin-top:var(--space-10)" aria-labelledby="mref-h"><h2 class="mod-h2" id="mref-h">References</h2>' + UI.references(meta.references) + "</section>";
    var evid = '<div class="note-block" role="note" style="margin-top:var(--space-6)"><strong>Evidence tier:</strong> ' + esc(meta.evidence) + ". Real processes vary by product, equipment and regulator. Nothing here is a manufacturing, regulatory or GMP guarantee.</div>";

    root.innerHTML = head + flow + explorer + defs + evid + refs;

    function drawStage(focus) {
      var s = stages[cur];
      document.getElementById("stage-body").innerHTML = stageDetail(s, cur, stages.length);
      document.getElementById("stage-fill").style.width = ((cur + 1) / stages.length * 100) + "%";
      document.getElementById("stage-label").textContent = "Stage " + (cur + 1) + " of " + stages.length + ": " + s.name;
      root.querySelectorAll(".stage-btn").forEach(function (b, i) {
        if (i === cur) { b.setAttribute("aria-current", "true"); if (focus) b.scrollIntoView({ inline: "center", block: "nearest" }); }
        else b.removeAttribute("aria-current");
      });
      UI.hydrate(root);
    }
    function drawDef() {
      document.getElementById("def-body").innerHTML = defectDetail(defects[curDef]);
      root.querySelectorAll(".def-btn").forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === curDef)); });
    }
    drawStage(false); drawDef();
    UI.wireAccordions(root);

    root.addEventListener("click", function (e) {
      var sb = e.target.closest("[data-stage]");
      if (sb) { cur = Number(sb.getAttribute("data-stage")); drawStage(true); return; }
      var st = e.target.closest("[data-stage-step]");
      if (st && !st.disabled) {
        cur = Math.max(0, Math.min(stages.length - 1, cur + Number(st.getAttribute("data-stage-step"))));
        drawStage(true);
        var t = document.getElementById("stage-title"); if (t) t.focus({ preventScroll: true });
        return;
      }
      var db = e.target.closest("[data-def]");
      if (db) { curDef = Number(db.getAttribute("data-def")); drawDef(); }
    });
    UI.hydrate(root);
    document.title = "Manufacturing — PHARMA 3D";
  }

  UI.loadJson("manufacturing.json").then(render).catch(function () { root.innerHTML = UI.errorBlock("Could not load Manufacturing"); });
})();
