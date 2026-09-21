/* =========================================================
   PHARMA 3D — Learn page logic
   Tabs, MCQ practice, Leitner flashcards, viva chains,
   dashboard, timed exam. All progress in localStorage only.
   ========================================================= */
(function () {
  "use strict";
  var esc = P4.esc;
  function $(id) { return document.getElementById(id); }
  var Q = window.P4_MCQ, CARDS = window.P4_CARDS, VIVA = window.P4_VIVA;
  var LEVELS = ["Beginner", "Intermediate", "Advanced", "Research"];
  var DOMAINS = Array.from(new Set(Q.map(function (q) { return q.domain; }))).sort();
  var LETTERS = ["A", "B", "C", "D", "E"];

  /* ---------- Storage ---------- */
  var sAns = P4.store("pharma3d:learn:answers", {});     // id -> {ok:bool, n:int}
  var sBox = P4.store("pharma3d:learn:leitner", {});     // card idx -> {box:1..5, due:ts}
  var sDays = P4.store("pharma3d:learn:days", []);       // ["YYYY-MM-DD", ...]
  var sViva = P4.store("pharma3d:learn:viva", {});       // chain idx -> true
  var sExams = P4.store("pharma3d:learn:exams", []);     // [{ts, score, total, level, domain}]
  var answers = sAns.get() || {}, boxes = sBox.get() || {}, days = sDays.get() || [], vivaDone = sViva.get() || {}, exams = sExams.get() || [];

  function today(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function markDay() { var t = today(); if (days.indexOf(t) < 0) { days.push(t); sDays.set(days); } }
  function saveAns() { sAns.set(answers); }

  /* ---------- Tabs ---------- */
  var TABS = ["dash", "mcq", "fc", "viva", "exam"];
  function showTab(id, focus) {
    TABS.forEach(function (t) {
      $("p-" + t).hidden = t !== id;
      var b = $("t-" + t); b.setAttribute("aria-selected", String(t === id)); b.setAttribute("tabindex", t === id ? "0" : "-1");
      if (t === id && focus) b.focus();
    });
    if (id === "dash") paintDash();
    if (id === "fc") paintFc();
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }
  function wireTabs() {
    $("lrnTabs").addEventListener("click", function (e) { var b = e.target.closest(".lrn-tab"); if (b) showTab(b.getAttribute("data-t"), false); });
    $("lrnTabs").addEventListener("keydown", function (e) {
      var b = e.target.closest(".lrn-tab"); if (!b) return;
      var i = TABS.indexOf(b.getAttribute("data-t")), n = null;
      if (e.key === "ArrowRight") n = TABS[(i + 1) % TABS.length]; else if (e.key === "ArrowLeft") n = TABS[(i - 1 + TABS.length) % TABS.length];
      else if (e.key === "Home") n = TABS[0]; else if (e.key === "End") n = TABS[TABS.length - 1];
      if (n) { e.preventDefault(); showTab(n, true); }
    });
    var h = (location.hash || "").replace("#", "");
    showTab(TABS.indexOf(h) >= 0 ? h : "dash", false);
  }

  /* ---------- Selects ---------- */
  function fillSelects() {
    function fill(id, first, list) { $(id).innerHTML = '<option value="all">' + first + "</option>" + list.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join(""); }
    fill("mcqLevel", "All levels", LEVELS); fill("mcqDomain", "All domains", DOMAINS);
    fill("exLevel", "All difficulties", LEVELS); fill("exDomain", "All domains", DOMAINS);
    $("vivaSel").innerHTML = VIVA.map(function (v, i) { return '<option value="' + i + '">' + esc(v.title) + "</option>"; }).join("");
  }
  function pool(level, domain) {
    return Q.filter(function (q) { return (level === "all" || q.level === level) && (domain === "all" || q.domain === domain); });
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- MCQ practice ---------- */
  var mcq = { list: [], i: 0, score: 0, done: 0 };
  function mcqStart() {
    var list = pool($("mcqLevel").value, $("mcqDomain").value);
    if (!list.length) { $("mcqArea").innerHTML = '<div class="p4-err">No questions match that combination. Try another level or domain.</div>'; return; }
    mcq = { list: shuffle(list), i: 0, score: 0, done: 0 }; mcqShow();
  }
  function optHtml(q, chosen, reveal) {
    return q.opts.map(function (o, i) {
      var cls = "q-opt";
      if (reveal) { if (i === q.a) cls += " is-correct"; else if (i === chosen) cls += " is-wrong"; }
      return '<button type="button" class="' + cls + '" data-o="' + i + '"' + (reveal ? " disabled" : "") + ' aria-pressed="' + (chosen === i) + '"><span class="k">' + LETTERS[i] + "</span><span>" + esc(o) + "</span></button>";
    }).join("");
  }
  function mcqShow() {
    var q = mcq.list[mcq.i];
    if (!q) return mcqEnd();
    $("mcqArea").innerHTML = '<div class="q-card"><div class="q-top"><span class="tag-chip">' + esc(q.level) + '</span><span class="tag-chip">' + esc(q.domain) + '</span><span class="tag-chip">' + (mcq.i + 1) + " / " + mcq.list.length + '</span></div>' +
      '<p class="q-text">' + esc(q.q) + '</p><div class="q-opts" id="mcqOpts">' + optHtml(q, -1, false) + '</div><div class="q-expl" id="mcqExpl" hidden role="status"></div>' +
      '<div class="q-actions"><button class="btn btn-primary" id="mcqNext" type="button" hidden>Next question →</button><button class="btn btn-secondary" id="mcqStop" type="button">End practice</button></div></div>';
    $("mcqOpts").addEventListener("click", function (e) {
      var b = e.target.closest(".q-opt"); if (!b || b.disabled) return;
      var c = +b.getAttribute("data-o"), ok = c === q.a;
      $("mcqOpts").innerHTML = optHtml(q, c, true);
      $("mcqExpl").hidden = false;
      $("mcqExpl").innerHTML = "<strong>" + (ok ? "Correct." : "Not quite. Correct answer: " + LETTERS[q.a] + ".") + "</strong> " + esc(q.e);
      var r = answers[q.id] || { n: 0, ok: false }; r.n++; r.ok = ok; answers[q.id] = r; saveAns(); markDay();
      mcq.done++; if (ok) mcq.score++;
      $("mcqNext").hidden = false; $("mcqNext").textContent = mcq.i + 1 >= mcq.list.length ? "See summary" : "Next question →"; $("mcqNext").focus();
    });
    $("mcqNext").addEventListener("click", function () { mcq.i++; mcqShow(); });
    $("mcqStop").addEventListener("click", mcqEnd);
  }
  function mcqEnd() {
    $("mcqArea").innerHTML = '<div class="q-card"><h3>Practice summary</h3><p class="result-big">' + mcq.score + " / " + mcq.done + '</p><p>Questions answered this round: ' + mcq.done + '. This is practice performance only.</p><div class="q-actions"><button class="btn btn-primary" id="mcqAgain" type="button">Start again</button></div></div>';
    $("mcqAgain").addEventListener("click", mcqStart);
  }

  /* ---------- Leitner flashcards ---------- */
  var INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };
  var fc = { idx: null, flipped: false };
  function cardState(i) { return boxes[i] || { box: 1, due: 0 }; }
  function paintLeitner() {
    var counts = [0, 0, 0, 0, 0, 0], now = Date.now();
    CARDS.forEach(function (c, i) { counts[cardState(i).box]++; });
    $("leitner").innerHTML = [1, 2, 3, 4, 5].map(function (b) {
      return '<div class="lbox' + (fc.idx !== null && cardState(fc.idx).box === b ? " is-active" : "") + '"><span class="bn">BOX ' + b + '</span><span class="bc">' + counts[b] + "</span></div>";
    }).join("");
  }
  function dueList() {
    var now = Date.now();
    return CARDS.map(function (c, i) { return i; }).filter(function (i) { return cardState(i).due <= now; })
      .sort(function (a, b) { return cardState(a).box - cardState(b).box || cardState(a).due - cardState(b).due; });
  }
  function paintFc() {
    paintLeitner();
    var due = dueList();
    if (!due.length) {
      var next = Math.min.apply(null, CARDS.map(function (c, i) { return cardState(i).due; }));
      $("fcArea").innerHTML = '<div class="p4-card"><h3>All caught up</h3><p>No cards are due right now. The next card comes due on ' + esc(new Date(next).toLocaleString()) + '.</p><div class="q-actions"><button class="btn btn-secondary" id="fcForce" type="button">Review a random card anyway</button></div></div>';
      $("fcForce").addEventListener("click", function () { fc.idx = Math.floor(Math.random() * CARDS.length); fc.flipped = false; fcShow(); });
      return;
    }
    if (fc.idx === null || due.indexOf(fc.idx) < 0) fc.idx = due[0];
    fc.flipped = false; fcShow(due.length);
  }
  function fcShow(dueCount) {
    var c = CARDS[fc.idx], st = cardState(fc.idx);
    paintLeitner();
    var d = dueCount !== undefined ? dueCount : dueList().length;
    $("fcArea").innerHTML = '<div class="q-top"><span class="tag-chip">' + esc(c[0]) + '</span><span class="tag-chip">Box ' + st.box + '</span><span class="tag-chip">' + d + ' due</span></div>' +
      '<button type="button" class="fc' + (fc.flipped ? " is-back" : "") + '" id="fcCard" aria-label="' + (fc.flipped ? "Answer side. Activate to see the question." : "Question side. Activate to reveal the answer.") + '"><span class="side">' + (fc.flipped ? "Answer" : "Question") + '</span><span class="txt">' + esc(fc.flipped ? c[2] : c[1]) + "</span></button>" +
      (fc.flipped ? '<div class="q-actions"><button class="btn btn-primary" id="fcYes" type="button">I remembered ✓</button><button class="btn btn-secondary" id="fcNo" type="button">I missed it ✕</button></div>' : '<div class="q-actions"><button class="btn btn-secondary" id="fcFlip" type="button">Show answer</button></div>');
    $("fcCard").addEventListener("click", function () { fc.flipped = !fc.flipped; fcShow(d); $("fcCard").focus(); });
    if (!fc.flipped) $("fcFlip").addEventListener("click", function () { fc.flipped = true; fcShow(d); $("fcCard").focus(); });
    else {
      $("fcYes").addEventListener("click", function () { fcGrade(true); });
      $("fcNo").addEventListener("click", function () { fcGrade(false); });
    }
  }
  function fcGrade(ok) {
    var st = cardState(fc.idx), box = ok ? Math.min(5, st.box + 1) : 1;
    boxes[fc.idx] = { box: box, due: Date.now() + INTERVAL_DAYS[box] * 86400000 };
    sBox.set(boxes); markDay();
    fc.idx = null; paintFc();
  }

  /* ---------- Viva ---------- */
  function paintViva() {
    var i = +$("vivaSel").value, v = VIVA[i];
    $("vivaArea").innerHTML = '<div style="margin-top:var(--space-4)">' + v.steps.map(function (s, k) {
      return '<div class="viva-step"><p class="vq"><span class="tag-chip" style="margin-right:8px">Q' + (k + 1) + "</span>" + esc(s[0]) + '</p><button class="btn btn-secondary btn-sm" type="button" data-r="' + k + '" aria-expanded="false">Reveal model answer</button><div class="va" id="va-' + k + '" hidden>' + esc(s[1]) + "</div></div>";
    }).join("") + '<div class="q-actions"><button class="btn btn-primary" id="vivaDone" type="button">' + (vivaDone[i] ? "Completed ✓ (tap to unmark)" : "Mark chain as completed") + "</button></div></div>";
    $("vivaArea").onclick = function (e) {
      var b = e.target.closest("[data-r]");
      if (b) { var k = b.getAttribute("data-r"), el = $("va-" + k), open = !el.hidden; el.hidden = open; b.setAttribute("aria-expanded", String(!open)); b.textContent = open ? "Reveal model answer" : "Hide model answer"; return; }
      if (e.target.closest("#vivaDone")) { if (vivaDone[i]) delete vivaDone[i]; else { vivaDone[i] = true; markDay(); } sViva.set(vivaDone); paintViva(); }
    };
  }

  /* ---------- Dashboard ---------- */
  function domainStats() {
    var map = {};
    DOMAINS.forEach(function (d) { map[d] = { total: 0, seen: 0, right: 0, wrong: 0 }; });
    Q.forEach(function (q) {
      var m = map[q.domain]; m.total++;
      var a = answers[q.id]; if (a) { m.seen++; if (a.ok) m.right++; else m.wrong++; }
    });
    return map;
  }
  function streakInfo() {
    var set = {}; days.forEach(function (d) { set[d] = 1; });
    var cur = 0, d = new Date();
    if (!set[today(d)]) d.setDate(d.getDate() - 1); // allow streak to survive until today ends
    while (set[today(d)]) { cur++; d.setDate(d.getDate() - 1); }
    var best = 0, run = 0, sorted = days.slice().sort(), prev = null;
    sorted.forEach(function (s) {
      var dt = new Date(s + "T00:00:00");
      if (prev && Math.round((dt - prev) / 86400000) === 1) run++; else run = 1;
      if (run > best) best = run; prev = dt;
    });
    return { cur: cur, best: best };
  }
  function paintDash() {
    var seen = Q.filter(function (q) { return answers[q.id]; }).length, right = Q.filter(function (q) { return answers[q.id] && answers[q.id].ok; }).length;
    var acc = seen ? Math.round(right / seen * 100) : 0;
    var mastered = CARDS.filter(function (c, i) { return cardState(i).box >= 4; }).length;
    var vdone = Object.keys(vivaDone).length;
    var st = streakInfo();
    $("dashStats").innerHTML = [
      [seen + " / " + Q.length, "Questions attempted"], [acc + "%", "Accuracy on attempted"],
      [mastered + " / " + CARDS.length, "Cards in box 4–5"], [vdone + " / " + VIVA.length, "Viva chains completed"]
    ].map(function (s) { return '<div class="stat"><div class="sv">' + s[0] + '</div><div class="sl">' + s[1] + "</div></div>"; }).join("");

    // Overall completion = average of three parts
    var pQ = seen / Q.length, pC = mastered / CARDS.length, pV = vdone / VIVA.length, overall = Math.round((pQ + pC + pV) / 3 * 100);
    var R = 50, C = 2 * Math.PI * R, off = C * (1 - overall / 100);
    $("ring").innerHTML = '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="var(--bg-surface-alt)" stroke-width="12"/><circle cx="60" cy="60" r="' + R + '" fill="none" stroke="var(--accent-strong)" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="700" fill="var(--text-primary)">' + overall + '%</text>';
    $("ring").setAttribute("aria-label", "Overall practice completion " + overall + " percent");

    var ds = domainStats();
    $("domBars").innerHTML = DOMAINS.map(function (d) {
      var m = ds[d], pc = m.total ? Math.round(m.seen / m.total * 100) : 0;
      return '<div class="dom-bar"><div class="top"><span>' + esc(d) + '</span><span class="pc">' + m.seen + "/" + m.total + '</span></div><div class="progress-bar" role="progressbar" aria-valuenow="' + pc + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(d) + ' attempted"><div class="progress-bar-fill" style="width:' + pc + '%"></div></div></div>';
    }).join("");

    $("streakTxt").textContent = "Current streak: " + st.cur + " day" + (st.cur === 1 ? "" : "s") + " · Best: " + st.best + " day" + (st.best === 1 ? "" : "s");
    var html = "", set = {}; days.forEach(function (x) { set[x] = 1; });
    for (var k = 13; k >= 0; k--) { var dt = new Date(); dt.setDate(dt.getDate() - k); var on = !!set[today(dt)]; html += '<div class="day' + (on ? " on" : "") + '" title="' + today(dt) + '"><b>' + dt.getDate() + "</b><span>" + (on ? "✓" : "·") + "</span></div>"; }
    $("streak").innerHTML = html;

    weakBox(ds);
  }
  function weakBox(ds) {
    var weak = DOMAINS.map(function (d) { var m = ds[d], att = m.right + m.wrong; return { d: d, att: att, acc: att ? m.right / att : null, m: m }; })
      .filter(function (x) { return x.att >= 3 && x.acc < 0.7; }).sort(function (a, b) { return a.acc - b.acc; });
    if (!weak.length) {
      var any = DOMAINS.some(function (d) { return ds[d].right + ds[d].wrong >= 3; });
      $("weakBox").innerHTML = "<p>" + (any ? "No domain is below 70% accuracy among domains with at least 3 attempts." : "Answer at least 3 questions in a domain to see whether it needs more practice.") + "</p>";
      return;
    }
    $("weakBox").innerHTML = '<ul class="bul">' + weak.map(function (w) { return "<li><strong>" + esc(w.d) + "</strong> — " + Math.round(w.acc * 100) + "% correct (" + w.m.right + " of " + w.att + " attempts)</li>"; }).join("") + '</ul><p class="p4-caption" style="margin-top:var(--space-3)">Shown for domains with at least 3 attempts and under 70% accuracy.</p>';
  }
  function wireReset() {
    $("resetAll").addEventListener("click", function () {
      if (!confirm("Reset all Learn progress stored on this device? This cannot be undone.")) return;
      answers = {}; boxes = {}; days = []; vivaDone = {}; exams = [];
      sAns.set(answers); sBox.set(boxes); sDays.set(days); sViva.set(vivaDone); sExams.set(exams);
      fc.idx = null; paintDash();
    });
  }

  /* ---------- Timed exam ---------- */
  var ex = null, timer = null;
  function examStart() {
    var list = pool($("exLevel").value, $("exDomain").value);
    if (!list.length) { alert("No questions match that combination."); return; }
    var n = Math.min(+$("exN").value, list.length), mins = +$("exMin").value;
    ex = { list: shuffle(list).slice(0, n), sel: [], i: 0, end: Date.now() + mins * 60000, mins: mins, level: $("exLevel").value, domain: $("exDomain").value };
    ex.sel = ex.list.map(function () { return -1; });
    $("examSetup").hidden = true; $("examResult").hidden = true; $("examRun").hidden = false;
    examShow(); clearInterval(timer); timer = setInterval(tick, 1000); tick();
  }
  function fmtTime(ms) { var s = Math.max(0, Math.round(ms / 1000)), m = Math.floor(s / 60); return ("0" + m).slice(-2) + ":" + ("0" + (s % 60)).slice(-2); }
  function tick() {
    var left = ex.end - Date.now(), el = $("exTimer");
    if (el) el.textContent = fmtTime(left);
    if (left <= 0) { clearInterval(timer); examFinish(true); }
  }
  function examShow() {
    var q = ex.list[ex.i], answered = ex.sel.filter(function (x) { return x >= 0; }).length;
    $("examRun").innerHTML = '<div class="exam-bar"><span class="exam-timer" id="exTimer" role="timer" aria-label="Time remaining">' + fmtTime(ex.end - Date.now()) + '</span><span class="tag-chip">Question ' + (ex.i + 1) + " / " + ex.list.length + '</span><span class="tag-chip">' + answered + " answered</span></div>" +
      '<div class="q-card" style="margin-top:var(--space-4)"><div class="q-top"><span class="tag-chip">' + esc(q.level) + '</span><span class="tag-chip">' + esc(q.domain) + '</span></div><p class="q-text">' + esc(q.q) + '</p><div class="q-opts" id="exOpts">' +
      q.opts.map(function (o, i) { return '<button type="button" class="q-opt" data-o="' + i + '" aria-pressed="' + (ex.sel[ex.i] === i) + '"><span class="k">' + LETTERS[i] + "</span><span>" + esc(o) + "</span></button>"; }).join("") +
      '</div><p class="p4-caption" style="margin-top:var(--space-3)">Answers and explanations are shown after you submit.</p>' +
      '<div class="q-actions"><button class="btn btn-secondary" id="exPrev" type="button"' + (ex.i === 0 ? " disabled" : "") + '>← Previous</button><button class="btn btn-secondary" id="exNext" type="button"' + (ex.i === ex.list.length - 1 ? " disabled" : "") + '>Next →</button><button class="btn btn-primary" id="exSubmit" type="button">Submit exam</button></div></div>';
    $("exOpts").addEventListener("click", function (e) {
      var b = e.target.closest(".q-opt"); if (!b) return;
      ex.sel[ex.i] = +b.getAttribute("data-o");
      $("exOpts").querySelectorAll(".q-opt").forEach(function (x) { x.setAttribute("aria-pressed", String(+x.getAttribute("data-o") === ex.sel[ex.i])); });
      var chips = $("examRun").querySelectorAll(".exam-bar .tag-chip"); chips[1].textContent = ex.sel.filter(function (x) { return x >= 0; }).length + " answered";
    });
    $("exPrev").addEventListener("click", function () { ex.i--; examShow(); });
    $("exNext").addEventListener("click", function () { ex.i++; examShow(); });
    $("exSubmit").addEventListener("click", function () {
      var un = ex.sel.filter(function (x) { return x < 0; }).length;
      if (un && !confirm(un + " question(s) unanswered. Submit anyway?")) return;
      clearInterval(timer); examFinish(false);
    });
  }
  function examFinish(timeUp) {
    var right = 0, per = {}, wrong = [];
    ex.list.forEach(function (q, i) {
      per[q.domain] = per[q.domain] || { r: 0, t: 0 }; per[q.domain].t++;
      var ok = ex.sel[i] === q.a;
      if (ok) { right++; per[q.domain].r++; } else wrong.push({ q: q, chosen: ex.sel[i] });
      var r = answers[q.id] || { n: 0, ok: false }; r.n++; r.ok = ok; answers[q.id] = r;
    });
    saveAns(); markDay();
    exams.push({ ts: Date.now(), score: right, total: ex.list.length, level: ex.level, domain: ex.domain }); sExams.set(exams.slice(-30));
    var pct = Math.round(right / ex.list.length * 100);
    var weak = Object.keys(per).map(function (d) { return { d: d, pc: Math.round(per[d].r / per[d].t * 100), r: per[d].r, t: per[d].t }; }).sort(function (a, b) { return a.pc - b.pc; });
    var flagged = weak.filter(function (w) { return w.pc < 70; });
    $("examRun").hidden = true; $("examResult").hidden = false;
    $("examResult").innerHTML = '<div class="q-card"><h3>Exam finished' + (timeUp ? " — time is up" : "") + '</h3><p class="result-big">' + right + " / " + ex.list.length + " (" + pct + '%)</p><p class="p4-caption">Practice score only. No certificate, rank or reward is attached.</p>' +
      '<h4 style="margin:var(--space-4) 0 var(--space-2)">By domain</h4><div class="dom-bars">' + weak.map(function (w) { return '<div class="dom-bar"><div class="top"><span>' + esc(w.d) + '</span><span class="pc">' + w.r + "/" + w.t + " · " + w.pc + '%</span></div><div class="progress-bar" role="progressbar" aria-valuenow="' + w.pc + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(w.d) + ' score"><div class="progress-bar-fill" style="width:' + w.pc + '%"></div></div></div>'; }).join("") + "</div>" +
      '<h4 style="margin:var(--space-4) 0 var(--space-2)">Weak-domain identification</h4><p>' + (flagged.length ? "Consider revisiting: <strong>" + flagged.map(function (w) { return esc(w.d); }).join(", ") + "</strong> (below 70% in this exam). With few questions per domain this is only a rough guide." : "No domain fell below 70% in this exam.") + "</p>" +
      '<div class="q-actions"><button class="btn btn-primary" id="exAgain" type="button">New exam</button></div></div>' +
      '<h3 style="margin:var(--space-6) 0 var(--space-3)">Incorrect-question review (' + wrong.length + ')</h3>' +
      (wrong.length ? wrong.map(function (w) {
        return '<div class="review-item"><div class="q-top"><span class="tag-chip">' + esc(w.q.level) + '</span><span class="tag-chip">' + esc(w.q.domain) + '</span></div><p style="font-weight:600;margin-bottom:6px">' + esc(w.q.q) + '</p><p class="yours">Your answer: ' + (w.chosen >= 0 ? LETTERS[w.chosen] + ". " + esc(w.q.opts[w.chosen]) : "No answer") + '</p><p class="right">Correct: ' + LETTERS[w.q.a] + ". " + esc(w.q.opts[w.q.a]) + '</p><p style="margin-top:6px;color:var(--text-secondary);font-size:.93rem">' + esc(w.q.e) + "</p></div>";
      }).join("") : '<p>You answered every question correctly.</p>');
    $("exAgain").addEventListener("click", function () { $("examResult").hidden = true; $("examSetup").hidden = false; });
    $("examResult").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- init ---------- */
  fillSelects(); wireTabs(); wireReset();
  $("mcqStart").addEventListener("click", mcqStart);
  $("vivaSel").addEventListener("change", paintViva); paintViva();
  $("exStart").addEventListener("click", examStart);
  window.addEventListener("beforeunload", function () { clearInterval(timer); });
})();
