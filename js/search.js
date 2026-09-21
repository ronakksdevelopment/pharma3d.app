/* =========================================================
   PHARMA 3D — Site-wide search
   - Fuse.js (CDN script tag, no build step) with typo tolerance
   - Graceful substring fallback if the CDN is unreachable
   - Indexes ONLY content that exists: domains, concepts, live modules.
     Drugs, plants, instruments, AI section and learning have no
     content yet, so their chips are shown disabled rather than
     implying results.
   - Upgrades the existing #search-modal (Ctrl/Cmd+K + header icon).
     app.js is untouched; this file takes over the modal's contents
     and results rendering.
   - Also powers /search.html (results list + answer page).
   Answer page order: SHORT ANSWER -> DEEPER EXPLANATION -> VISUAL ->
                      RELATED TOPICS -> REFERENCES
   ========================================================= */
(function () {
  "use strict";

  var esc = window.p3dEsc;
  var ALL_CATEGORIES = [
    { id: "all", label: "All" },
    { id: "concept", label: "Concepts" },
    { id: "drug", label: "Drugs" },
    { id: "plant", label: "Plants" },
    { id: "instrument", label: "Instruments" },
    { id: "domain", label: "Domains" },
    { id: "ai", label: "AI" },
    { id: "module", label: "Modules" },
    { id: "learning", label: "Learning" }
  ];

  var corpus = null;        // loaded entries
  var fuse = null;
  var usingFallback = false;
  var loadPromise = null;
  var presentCategories = new Set();

  /* ---------- Load corpus + build index ---------- */
  function ensureIndex() {
    if (loadPromise) return loadPromise;
    loadPromise = window.PHARMA3D_STORE.corpus().then(function (data) {
      corpus = data.entries;
      corpus.forEach(function (e) { presentCategories.add(e.category); });
      buildFuse();
      return corpus;
    });
    return loadPromise;
  }

  function buildFuse() {
    if (typeof window.Fuse === "function") {
      fuse = new window.Fuse(corpus, {
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true,
        threshold: 0.36,          // tolerant of typos without becoming noisy
        minMatchCharLength: 2,
        keys: [
          { name: "title", weight: 0.55 },
          { name: "keywords", weight: 0.2 },
          { name: "shortAnswer", weight: 0.15 },
          { name: "deeper", weight: 0.1 }
        ]
      });
      usingFallback = false;
    } else {
      fuse = null;
      usingFallback = true;
    }
  }

  // Fuse loads with `defer`; if it arrives after the corpus, rebuild.
  window.addEventListener("load", function () {
    if (corpus && !fuse && typeof window.Fuse === "function") buildFuse();
  });

  function fallbackSearch(q) {
    var s = q.toLowerCase();
    return corpus
      .filter(function (e) {
        return (e.title + " " + e.keywords.join(" ") + " " + e.shortAnswer + " " + e.deeper).toLowerCase().indexOf(s) > -1;
      })
      .map(function (e) { return { item: e, score: 0.2 }; });
  }

  function search(q, category) {
    q = (q || "").trim();
    var results;
    if (!q) {
      results = corpus.map(function (e) { return { item: e, score: 0 }; });
    } else if (fuse) {
      results = fuse.search(q);
    } else {
      results = fallbackSearch(q);
    }
    if (category && category !== "all") {
      results = results.filter(function (r) { return r.item.category === category; });
    }
    return results;
  }

  /** Simple "did you mean": closest title when there are no hits. */
  function suggest(q) {
    if (!fuse || !q) return null;
    var loose = new window.Fuse(corpus, { keys: ["title"], threshold: 0.6, includeScore: true, ignoreLocation: true });
    var r = loose.search(q);
    return r.length ? r[0].item.title : null;
  }

  function highlight(text, q) {
    var safe = esc(text);
    q = (q || "").trim();
    if (q.length < 2) return safe;
    try {
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      return safe.replace(re, "<mark>$1</mark>");
    } catch (e) { return safe; }
  }

  function catLabel(c) {
    var f = ALL_CATEGORIES.filter(function (x) { return x.id === c; })[0];
    return f ? f.label.replace(/s$/, "") : c;
  }

  /* Where does an entry link? Domains/modules go to their page; concepts go to the answer page. */
  function entryUrl(e) {
    return window.p3dUrl(e.url);
  }
  function answerUrl(e) {
    return window.p3dUrl("search.html?entry=" + encodeURIComponent(e.id));
  }

  function resultCard(r, q, opts) {
    var e = r.item;
    var href = opts && opts.answer ? answerUrl(e) : entryUrl(e);
    return (
      '<a class="rcard" href="' + href + '">' +
      '<span class="rcard-top"><span class="rcard-title">' + highlight(e.title, q) + '</span><span class="rcard-cat">' + esc(catLabel(e.category)) + "</span></span>" +
      '<span class="rcard-short">' + highlight(e.shortAnswer, q) + "</span>" +
      "</a>"
    );
  }

  /* =========================================================
     MODAL (Ctrl/Cmd+K + header search icon)
     ========================================================= */
  function upgradeModal() {
    var modal = document.getElementById("search-modal");
    if (!modal || modal.classList.contains("is-p3d-search")) return;
    modal.classList.add("is-p3d-search");

    var box = modal.querySelector(".modal");
    var oldHeader = box.querySelector(".modal-header");
    var oldField = box.querySelector(".field");
    var list = box.querySelector("#search-results");
    if (oldHeader) oldHeader.remove();

    // app.js attached its own substring-search "input" listener to this node at boot.
    // Cloning the node drops every listener bound to it, so only Fuse-driven rendering
    // (below) responds to typing. app.js itself is not modified.
    var legacyInput = modal.querySelector("#search-input");
    var input = legacyInput.cloneNode(true);
    legacyInput.parentNode.replaceChild(input, legacyInput);
    input.setAttribute("placeholder", "Search domains, concepts, modules…");
    input.setAttribute("enterkeyhint", "search");

    // New top bar: back button + prominent input + close
    var top = document.createElement("div");
    top.className = "sm-top";
    top.innerHTML =
      '<button type="button" class="sm-back" data-action="close-search" aria-label="Back">' + (window.PHARMA3D_ICONS.arrowRight || "") + "</button>" +
      '<div class="sm-inputwrap"><span class="sm-glass" aria-hidden="true">' + (window.PHARMA3D_ICONS.search || "") + "</span></div>";
    top.querySelector(".sm-inputwrap").appendChild(oldField);
    oldField.style.margin = "0";
    box.insertBefore(top, box.firstChild);

    // Chips
    var chips = document.createElement("div");
    chips.className = "sm-chips";
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Filter results by category");
    box.insertBefore(chips, list);

    var status = document.createElement("p");
    status.className = "sm-status";
    status.id = "sm-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    box.insertBefore(status, list);

    var state = { category: "all" };

    function renderChips() {
      chips.innerHTML = ALL_CATEGORIES.map(function (c) {
        var has = c.id === "all" || presentCategories.has(c.id);
        return (
          '<button type="button" class="chip" data-c="' + c.id + '" aria-pressed="' + (state.category === c.id) + '"' +
          (has ? "" : ' disabled title="No content in this category exists yet"') + ">" + c.label + "</button>"
        );
      }).join("");
    }

    function renderResults() {
      var q = input.value;
      var res = search(q, state.category);
      var n = res.length;
      var extra = usingFallback && q
        ? '<p class="sm-fallback-note">Typo-tolerant search is unavailable (offline or blocked). Showing exact matches only.</p>'
        : "";
      status.textContent = q ? n + (n === 1 ? " result" : " results") + " for “" + q.trim() + "”" : "Browse everything, or start typing.";

      if (!n) {
        var s = suggest(q);
        list.innerHTML =
          extra +
          '<div class="search-empty" role="status">No matches for “' + esc(q) + "”." +
          (s ? ' <span class="sm-didyoumean">Did you mean <button type="button" data-suggest="' + esc(s) + '">' + esc(s) + "</button>?</span>" : "") +
          "</div>";
        return;
      }
      list.innerHTML = extra + res.slice(0, 12).map(function (r) { return resultCard(r, q, { answer: false }); }).join("") +
        (q ? '<a class="btn btn-secondary" style="margin-top:var(--space-2)" href="' + window.p3dUrl("search.html?q=" + encodeURIComponent(q.trim())) + '">See all results</a>' : "");
    }

    // Back button: app.js closes the modal when the overlay itself is clicked.
    // Dispatching that click reuses app.js's close() (incl. focus restore) without editing it.
    top.querySelector(".sm-back").addEventListener("click", function () {
      modal.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]");
      if (!b || b.disabled) return;
      state.category = b.getAttribute("data-c");
      renderChips();
      renderResults();
    });
    list.addEventListener("click", function (e) {
      var s = e.target.closest("[data-suggest]");
      if (s) { input.value = s.getAttribute("data-suggest"); renderResults(); input.focus(); }
    });
    input.addEventListener("input", renderResults);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && input.value.trim()) {
        window.location.href = window.p3dUrl("search.html?q=" + encodeURIComponent(input.value.trim()));
      }
      if (e.key === "ArrowDown") {
        var first = list.querySelector("a");
        if (first) { e.preventDefault(); first.focus(); }
      }
    });

    // app.js's own open/close reset the input and call its (now-unused) renderResults.
    // Re-render whenever the modal is shown so our content wins.
    var obs = new MutationObserver(function () {
      if (!modal.hidden) {
        state.category = "all";
        input.value = "";
        input.focus();
        ensureIndex().then(function () { renderChips(); renderResults(); });
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ["hidden"] });

    ensureIndex().then(function () { renderChips(); renderResults(); }).catch(function () {
      list.innerHTML = '<div class="search-empty" role="status">Search data could not be loaded. Serve the site over HTTP and try again.</div>';
    });
  }

  /* =========================================================
     /search.html — results list + answer page
     ========================================================= */
  function initSearchPage() {
    var root = document.getElementById("search-page");
    if (!root) return;

    var params = new URLSearchParams(location.search);
    var entryId = params.get("entry");
    var conceptId = params.get("concept");
    var q = params.get("q") || "";
    var category = params.get("cat") || "all";

    ensureIndex().then(function () {
      if (conceptId) entryId = "concept:" + conceptId;
      if (entryId) return renderAnswer(entryId, root);
      renderResultsPage(root, q, category);
    }).catch(function () {
      root.innerHTML = '<div class="state-block"><h3>Search data could not be loaded</h3><p>Serve the site over HTTP (for example <code>python3 -m http.server</code>) and reload.</p></div>';
    });
  }

  function renderResultsPage(root, q, category) {
    root.innerHTML =
      '<div class="container sp-head">' +
        '<span class="section-eyebrow">Search</span><h1>Search PHARMA 3D</h1>' +
        '<form class="sp-form" role="search" id="sp-form">' +
          '<label for="sp-input" class="visually-hidden">Search domains, concepts and modules</label>' +
          '<input id="sp-input" class="sp-input" type="search" autocomplete="off" enterkeyhint="search" placeholder="Search domains, concepts, modules…" value="' + esc(q) + '">' +
        "</form>" +
        '<div class="sp-chips" id="sp-chips" role="group" aria-label="Filter results by category"></div>' +
        '<p class="sp-count" id="sp-count" role="status" aria-live="polite"></p>' +
        '<div class="sp-results" id="sp-results"></div>' +
      "</div>";

    var input = document.getElementById("sp-input");
    var chipsEl = document.getElementById("sp-chips");
    var countEl = document.getElementById("sp-count");
    var resEl = document.getElementById("sp-results");
    var st = { category: category };

    function chips() {
      chipsEl.innerHTML = ALL_CATEGORIES.map(function (c) {
        var has = c.id === "all" || presentCategories.has(c.id);
        return '<button type="button" class="chip" data-c="' + c.id + '" aria-pressed="' + (st.category === c.id) + '"' +
          (has ? "" : ' disabled title="No content in this category exists yet"') + ">" + c.label + "</button>";
      }).join("");
    }
    function draw() {
      var val = input.value;
      var res = search(val, st.category);
      countEl.textContent = val.trim()
        ? res.length + (res.length === 1 ? " result" : " results") + " for “" + val.trim() + "”"
        : "Showing all " + res.length + " indexed entries.";
      if (!res.length) {
        var s = suggest(val);
        resEl.innerHTML = '<div class="search-empty">No matches.' +
          (s ? ' <span class="sm-didyoumean">Did you mean <button type="button" data-suggest="' + esc(s) + '">' + esc(s) + "</button>?</span>" : "") + "</div>";
      } else {
        resEl.innerHTML = res.map(function (r) { return resultCard(r, val, { answer: true }); }).join("");
      }
      try { history.replaceState(null, "", location.pathname + "?q=" + encodeURIComponent(val.trim()) + (st.category !== "all" ? "&cat=" + st.category : "")); } catch (e) {}
    }
    chips(); draw();
    input.addEventListener("input", draw);
    document.getElementById("sp-form").addEventListener("submit", function (e) { e.preventDefault(); draw(); });
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]");
      if (!b || b.disabled) return;
      st.category = b.getAttribute("data-c"); chips(); draw();
    });
    resEl.addEventListener("click", function (e) {
      var s = e.target.closest("[data-suggest]");
      if (s) { input.value = s.getAttribute("data-suggest"); draw(); input.focus(); }
    });
    if (window.PHARMA3D_ICONS) input.focus({ preventScroll: true });
  }

  /* ---------- Answer page: SHORT -> DEEPER -> VISUAL -> RELATED -> REFERENCES ---------- */
  function renderAnswer(id, root) {
    var entry = corpus.filter(function (e) { return e.id === id; })[0];
    if (!entry) {
      root.innerHTML = '<div class="container rpage"><div class="state-block"><h3>Entry not found</h3><p>That entry is not in the search index.</p><a class="btn btn-primary" href="' + window.p3dUrl("search.html") + '">Back to search</a></div></div>';
      return;
    }
    return window.PHARMA3D_STORE.all().then(function (ctx) {
      var visual = renderVisual(entry, ctx);
      var related = renderRelatedEntries(entry, ctx);
      var refs = entry.references.map(function (r) {
        return '<li class="ref-item"><dl class="ref-dl"><dt>Source</dt><dd>' + esc(r.source) + "</dd><dt>Type</dt><dd>" + esc(r.type) + "</dd><dt>Purpose</dt><dd>" + esc(r.purpose) + "</dd><dt>Verify before citing</dt><dd>" + esc(r.verify) + "</dd></dl></li>";
      }).join("");

      root.innerHTML =
        '<div class="container rpage">' +
          '<a class="rpage-back" href="javascript:history.length>1?history.back():location.assign(\'' + window.p3dUrl("search.html") + '\')">' + (window.PHARMA3D_ICONS.arrowRight || "") + " Back</a>" +
          '<span class="section-eyebrow">' + esc(catLabel(entry.category)) + "</span>" +
          "<h1>" + esc(entry.title) + "</h1>" +
          '<div style="margin-top:var(--space-2)">' + window.p3dBadge(entry.evidence) + "</div>" +
          '<section class="rsec" aria-labelledby="r-short"><h2 class="rsec-h" id="r-short">Short answer</h2><p class="rshort">' + esc(entry.shortAnswer) + "</p></section>" +
          '<section class="rsec" aria-labelledby="r-deep"><h2 class="rsec-h" id="r-deep">Deeper explanation</h2><p>' + esc(entry.deeper) + "</p></section>" +
          '<section class="rsec" aria-labelledby="r-vis"><h2 class="rsec-h" id="r-vis">Visual</h2><div class="rvisual">' + visual + "</div></section>" +
          '<section class="rsec" aria-labelledby="r-rel"><h2 class="rsec-h" id="r-rel">Related topics</h2>' + related + "</section>" +
          '<section class="rsec" aria-labelledby="r-ref"><h2 class="rsec-h" id="r-ref">References</h2>' +
            '<div class="ref-notice" role="note"><strong>Verify before citing.</strong> These entries point to the kind of source to consult and are not full citations.</div>' +
            '<ul class="ref-list">' + refs + "</ul></section>" +
        "</div>";
      document.title = entry.title + " — Search — PHARMA 3D";
      if (window.PHARMA3D_RELATED) window.PHARMA3D_RELATED.hydrateIcons(root);
    });
  }

  function renderVisual(entry, ctx) {
    var v = entry.visual || { type: "none" };
    if (v.type === "chain") {
      // Draw every chain that contains this concept, straight from the relationship graph.
      var chains = ctx.rel.chains.filter(function (c) { return c.nodes.indexOf(v.concept) > -1; });
      if (!chains.length) return '<p class="none">No visual is defined for this entry yet.</p>';
      return chains.map(function (c) {
        return '<div class="chain-block" style="margin-top:0"><h4 class="chain-title">' + esc(c.label) + "</h4>" +
          '<ol class="chain-track" aria-label="' + esc(c.label) + '">' +
          c.nodes.map(function (n, i) {
            var cc = ctx.rel.concepts[n];
            var here = n === v.concept;
            var label = cc ? cc.label : n;
            return "<li><span class=\"chain-node" + (here ? " is-here" : "") + "\"" + (here ? ' aria-current="true"' : "") + ">" + esc(label) + "</span>" +
              (i < c.nodes.length - 1 ? '<span class="chain-sep" aria-hidden="true">↔</span>' : "") + "</li>";
          }).join("") + "</ol></div>";
      }).join("");
    }
    if (v.type === "domain-node") {
      var d = ctx.bySlug[v.slug];
      if (!d) return '<p class="none">No visual is defined for this entry yet.</p>';
      var pcts = [["Foundation", d.progress.foundation], ["Applied", d.progress.applied], ["Frontier", d.progress.frontier]];
      return '<div class="dp-meter" role="group" aria-label="Domain depth indicators (illustrative, not a score)">' +
        pcts.map(function (r) {
          var s = ""; for (var i = 1; i <= 5; i++) s += '<span class="seg' + (i <= r[1] ? " on" : "") + '"></span>';
          return '<div class="dp-meter-row"><span class="dp-meter-label">' + r[0] + '</span><span class="dp-meter-segs" aria-hidden="true">' + s + '</span><span class="visually-hidden">' + r[1] + " out of 5</span></div>";
        }).join("") + "</div>" +
        '<p class="none" style="margin-top:var(--space-3)">Illustrative depth indicators, not a score or ranking.</p>';
    }
    return '<p class="none">No visual is defined for this entry.</p>';
  }

  function renderRelatedEntries(entry, ctx) {
    if (!entry.related || !entry.related.length) return '<p class="muted">No related topics recorded.</p>';
    var seen = {};
    var items = entry.related.filter(function (r) {
      var key = r.kind + ":" + r.id;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).map(function (r) {
      if (r.kind === "domain" && ctx.bySlug[r.id]) {
        var d = ctx.bySlug[r.id];
        return '<li><a class="related-item" href="' + window.p3dDomainUrl(d.slug) + '"><span class="related-item-main"><span class="related-item-title">' + esc(d.name) + '</span><span class="related-item-why">Domain</span></span><span class="related-item-arrow" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
      }
      if (r.kind === "concept" && ctx.rel.concepts[r.id]) {
        var c = ctx.rel.concepts[r.id];
        var exists = corpus.some(function (e) { return e.id === "concept:" + r.id; });
        if (!exists) {
          var dm = ctx.rel.concepts[r.id].domains[0];
          if (dm && ctx.bySlug[dm]) {
            return '<li><a class="related-item" href="' + window.p3dDomainUrl(dm) + '"><span class="related-item-main"><span class="related-item-title">' + esc(c.label) + '</span><span class="related-item-why">Concept · see ' + esc(ctx.bySlug[dm].name) + '</span></span><span class="related-item-arrow" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
          }
          return "";
        }
        return '<li><a class="related-item" href="' + window.p3dUrl("search.html?entry=" + encodeURIComponent("concept:" + r.id)) + '"><span class="related-item-main"><span class="related-item-title">' + esc(c.label) + '</span><span class="related-item-why">Concept</span></span><span class="related-item-arrow" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
      }
      return "";
    }).join("");
    return '<ul class="related-list">' + items + "</ul>";
  }

  /* ---------- Boot ---------- */
  function boot() {
    upgradeModal();
    initSearchPage();
  }
  // Modal markup is injected by partials.js; wait for it.
  document.addEventListener("pharma3d:partials-ready", upgradeModal);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.PHARMA3D_SEARCH = { search: search, ensureIndex: ensureIndex };
})();
