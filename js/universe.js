/* =========================================================
   PHARMA 3D — Pharmacy Universe
   - Flat 2D SVG network (nodes = 18 domains, lines = relationships)
   - Category filters: DISCOVERY, DEVELOPMENT, DELIVERY, SAFETY, CARE
   - Desktop hover tooltip; tap/click opens bottom sheet (side panel >=1024px)
   - Keyboard-accessible LIST mode as a complete alternative view
   All data comes from data/*.json. Nothing about domains or their
   connections is hardcoded here.
   ========================================================= */
(function () {
  "use strict";

  var mount = document.getElementById("universe-app");
  if (!mount || !window.PHARMA3D_STORE) return;

  var esc = window.p3dEsc;
  var SVGNS = "http://www.w3.org/2000/svg";
  var CATS = ["DISCOVERY", "DEVELOPMENT", "DELIVERY", "SAFETY", "CARE"];

  var state = {
    ctx: null,
    layout: null,
    view: "map",              // "map" | "list"
    active: new Set(),        // active category filters (empty = all)
    selected: null            // selected slug (sheet open)
  };

  var els = {};
  var lastFocus = null;

  /* ---------- Helpers ---------- */
  function domainMatches(d) {
    if (!state.active.size) return true;
    return d.categories.some(function (c) { return state.active.has(c); });
  }
  function edgeKey(a, b) { return a + "|" + b; }

  function neighbours(slug) {
    var out = [];
    state.ctx.rel.edges.forEach(function (e) {
      if (e.a === slug) out.push(e.b);
      else if (e.b === slug) out.push(e.a);
    });
    return out;
  }

  function progressPct(d) {
    var p = d.progress;
    return Math.round(((p.foundation + p.applied + p.frontier) / 15) * 100);
  }

  function icon(name) {
    return (window.PHARMA3D_ICONS && window.PHARMA3D_ICONS[name]) || "";
  }

  /* ---------- Shell ---------- */
  function buildShell() {
    var counts = {};
    CATS.forEach(function (c) {
      counts[c] = state.ctx.domains.filter(function (d) { return d.categories.indexOf(c) > -1; }).length;
    });

    mount.innerHTML =
      '<div class="uni-toolbar">' +
        '<div class="view-toggle" role="group" aria-label="Choose view">' +
          '<button type="button" data-view="map" aria-pressed="true">Map view</button>' +
          '<button type="button" data-view="list" aria-pressed="false">List view</button>' +
        "</div>" +
        '<div class="filter-row" role="group" aria-label="Filter domains by category">' +
          CATS.map(function (c) {
            return '<button type="button" class="chip" data-cat="' + c + '" aria-pressed="false">' + c +
              ' <span class="chip-count">' + counts[c] + "</span></button>";
          }).join("") +
          '<button type="button" class="chip" data-clear hidden>Clear</button>' +
        "</div>" +
        '<p class="uni-status" id="uni-status" role="status" aria-live="polite"></p>' +
      "</div>" +

      '<div class="uni-stage" id="uni-stage">' +
        '<svg class="uni-svg" id="uni-svg" viewBox="0 0 ' + state.layout.viewBox[0] + " " + state.layout.viewBox[1] +
        '" role="group" aria-label="Network of 18 pharmacy domains. Each circle is a domain; lines connect related domains. Use the List view for a text alternative."></svg>' +
        '<div class="uni-tooltip" id="uni-tooltip" role="tooltip" hidden></div>' +
      "</div>" +

      '<div class="uni-list" id="uni-list" hidden></div>' +

      '<p class="uni-note">Lines show relationships recorded in the site’s relationship data, not a claim of strict hierarchy. Depth bars on cards are illustrative and are not a score, ranking or reward. ' +
      'Prefer text? Use <strong>List view</strong>.</p>' +

      '<div class="sheet-overlay" id="sheet-overlay" hidden></div>' +
      '<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" hidden></div>';

    els.svg = document.getElementById("uni-svg");
    els.stage = document.getElementById("uni-stage");
    els.tooltip = document.getElementById("uni-tooltip");
    els.list = document.getElementById("uni-list");
    els.status = document.getElementById("uni-status");
    els.sheet = document.getElementById("sheet");
    els.overlay = document.getElementById("sheet-overlay");
    els.clear = mount.querySelector("[data-clear]");
  }

  /* ---------- Map ---------- */
  function edgePath(a, b, bend) {
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;
    var mx = (ax + bx) / 2, my = (ay + by) / 2;
    var dx = bx - ax, dy = by - ay;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var cx = mx + nx * bend * len, cy = my + ny * bend * len;
    return "M" + ax + "," + ay + " Q" + cx + "," + cy + " " + bx + "," + by;
  }

  function wrapLabel(name) {
    // Break long names onto two lines at a natural space, near the middle.
    if (name.length <= 13) return [name];
    var words = name.split(" ");
    if (words.length === 1) return [name];
    var best = 1, bestDiff = 1e9;
    for (var i = 1; i < words.length; i++) {
      var l = words.slice(0, i).join(" ").length, r = words.slice(i).join(" ").length;
      if (Math.abs(l - r) < bestDiff) { bestDiff = Math.abs(l - r); best = i; }
    }
    return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function drawMap() {
    var svg = els.svg;
    svg.innerHTML = "";
    var R = state.layout.nodeRadius;
    var pos = state.layout.pos;

    // Journey axis (decorative)
    var axis = el("g", { "class": "uni-axis", "aria-hidden": "true" });
    var t1 = el("text", { x: 24, y: 30 }); t1.textContent = "DISCOVERY →";
    var t2 = el("text", { x: state.layout.viewBox[0] - 24, y: 30, "text-anchor": "end" }); t2.textContent = "→ CARE";
    axis.appendChild(t1); axis.appendChild(t2);
    svg.appendChild(axis);

    // Edges first (so nodes sit on top)
    var gEdges = el("g", { "aria-hidden": "true" });
    state.ctx.rel.edges.forEach(function (e) {
      var a = pos[e.a], b = pos[e.b];
      if (!a || !b) return;
      var bend = state.layout.bend[edgeKey(e.a, e.b)] || 0;
      var path = el("path", { "class": "uni-edge", d: edgePath(a, b, bend), "data-a": e.a, "data-b": e.b });
      gEdges.appendChild(path);
    });
    svg.appendChild(gEdges);

    // Nodes
    var gNodes = el("g");
    state.ctx.domains.forEach(function (d) {
      var p = pos[d.slug];
      var a = el("a", {
        "class": "uni-node",
        href: window.p3dDomainUrl(d.slug),
        "data-slug": d.slug,
        role: "link",
        "aria-label": d.name + ". " + d.categories.join(", ") + ". Press Enter to open the domain page."
      });
      // Invisible enlarged touch target (>= 44 CSS px even when the SVG is scaled down)
      a.appendChild(el("circle", { "class": "n-hit", cx: p.x, cy: p.y, r: R + 12 }));
      a.appendChild(el("circle", { "class": "n-ring", cx: p.x, cy: p.y, r: R + 7 }));
      a.appendChild(el("circle", { "class": "n-disc", cx: p.x, cy: p.y, r: R }));

      // Icon inside disc
      var svgIcon = icon(d.icon);
      if (svgIcon) {
        var fo = el("g", { "class": "n-icon", transform: "translate(" + (p.x - 14) + "," + (p.y - 24) + ")" });
        var wrap = el("svg", { viewBox: "0 0 24 24", width: 28, height: 28, fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" });
        var tmp = document.createElement("div");
        tmp.innerHTML = svgIcon;
        var inner = tmp.querySelector("svg");
        if (inner) wrap.innerHTML = inner.innerHTML;
        fo.appendChild(wrap);
        a.appendChild(fo);
      }

      // Label under the icon, inside the disc when short; below otherwise
      var lines = wrapLabel(d.name);
      var lab = el("text", { "class": "n-label", x: p.x, y: p.y + R + 18 });
      lines.forEach(function (ln, i) {
        var ts = el("tspan", { x: p.x, dy: i === 0 ? 0 : 15 });
        ts.textContent = ln;
        lab.appendChild(ts);
      });
      a.appendChild(lab);

      gNodes.appendChild(a);
    });
    svg.appendChild(gNodes);
  }

  /* ---------- Filtering (drives BOTH views from one state) ---------- */
  function applyFilters() {
    var domains = state.ctx.domains;
    var matchSet = new Set(domains.filter(domainMatches).map(function (d) { return d.slug; }));
    var filtering = state.active.size > 0;

    // Map
    els.svg.querySelectorAll(".uni-node").forEach(function (n) {
      var s = n.getAttribute("data-slug");
      var isMatch = matchSet.has(s);
      n.classList.toggle("is-dim", filtering && !isMatch);
      n.classList.toggle("is-match", filtering && isMatch);
    });
    els.svg.querySelectorAll(".uni-edge").forEach(function (p) {
      var a = p.getAttribute("data-a"), b = p.getAttribute("data-b");
      var both = matchSet.has(a) && matchSet.has(b);
      var one = matchSet.has(a) || matchSet.has(b);
      p.classList.toggle("is-lit", filtering && both);
      p.classList.toggle("is-dim", filtering && !one);
    });

    // List
    els.list.querySelectorAll("li[data-slug]").forEach(function (li) {
      li.hidden = !matchSet.has(li.getAttribute("data-slug"));
    });
    var empty = els.list.querySelector(".uni-empty");
    if (empty) empty.hidden = matchSet.size > 0;

    // Chips
    mount.querySelectorAll("[data-cat]").forEach(function (b) {
      b.setAttribute("aria-pressed", state.active.has(b.getAttribute("data-cat")) ? "true" : "false");
    });
    els.clear.hidden = !filtering;

    els.status.textContent = filtering
      ? "Showing " + matchSet.size + " of " + domains.length + " domains in " + Array.from(state.active).join(" + ") + "."
      : "Showing all " + domains.length + " domains.";
  }

  /* ---------- List mode ---------- */
  function drawList() {
    var html = "<ul>" + state.ctx.domains.map(function (d) {
      var pct = progressPct(d);
      return (
        '<li data-slug="' + esc(d.slug) + '">' +
        '<a class="dcard" href="' + window.p3dDomainUrl(d.slug) + '" aria-label="' + esc(d.name) + ", " + esc(d.categories.join(", ")) + '. Open domain page.">' +
          '<span class="dcard-badge" aria-hidden="true">' + icon(d.icon) + "</span>" +
          '<span class="dcard-body">' +
            '<span class="dcard-name">' + esc(d.name) + "</span>" +
            '<span class="dcard-short">' + esc(d.short) + "</span>" +
            '<span class="dcard-meter" aria-hidden="true"><span class="bar"><span style="width:' + pct + '%"></span></span><span class="pct">' + pct + "%</span></span>" +
          "</span>" +
          '<span class="dcard-go" aria-hidden="true">' + icon("arrowRight") + "</span>" +
        "</a></li>"
      );
    }).join("") + "</ul>" +
    '<p class="uni-empty" hidden>No domains match this filter.</p>';
    els.list.innerHTML = html;
  }

  /* ---------- View switching ---------- */
  function setView(v) {
    state.view = v;
    els.stage.hidden = v !== "map";
    els.list.hidden = v !== "list";
    mount.querySelectorAll("[data-view]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-view") === v ? "true" : "false");
    });
    hideTooltip();
    if (v === "list") closeSheet(true);
    try { history.replaceState(null, "", location.pathname + location.search + (v === "list" ? "#list" : "")); } catch (e) {}
  }

  /* ---------- Tooltip (desktop / fine pointer only) ---------- */
  function showTooltip(slug, evt) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var d = state.ctx.bySlug[slug];
    if (!d) return;
    els.tooltip.innerHTML =
      '<div class="tt-title">' + esc(d.name) + "</div>" + esc(d.short) +
      '<div class="tt-cats">' + esc(d.categories.join(" · ")) + "</div>";
    els.tooltip.hidden = false;
    positionTooltip(evt);
  }
  function positionTooltip(evt) {
    var stage = els.stage.getBoundingClientRect();
    var x = evt.clientX - stage.left + 16;
    var y = evt.clientY - stage.top + 16;
    var tw = els.tooltip.offsetWidth, th = els.tooltip.offsetHeight;
    if (x + tw > stage.width - 8) x = evt.clientX - stage.left - tw - 16;
    if (y + th > stage.height - 8) y = evt.clientY - stage.top - th - 16;
    els.tooltip.style.left = Math.max(8, x) + "px";
    els.tooltip.style.top = Math.max(8, y) + "px";
  }
  function hideTooltip() { if (els.tooltip) els.tooltip.hidden = true; }

  /* ---------- Highlight neighbours on hover/focus ---------- */
  function lightNeighbours(slug, on) {
    var nb = new Set(neighbours(slug));
    els.svg.querySelectorAll(".uni-edge").forEach(function (p) {
      var hit = p.getAttribute("data-a") === slug || p.getAttribute("data-b") === slug;
      p.classList.toggle("is-lit", on && hit);
      if (!on) applyFiltersEdgesOnly();
    });
    els.svg.querySelectorAll(".uni-node").forEach(function (n) {
      n.classList.toggle("is-neighbour", on && nb.has(n.getAttribute("data-slug")));
    });
  }
  function applyFiltersEdgesOnly() {
    var filtering = state.active.size > 0;
    var matchSet = new Set(state.ctx.domains.filter(domainMatches).map(function (d) { return d.slug; }));
    els.svg.querySelectorAll(".uni-edge").forEach(function (p) {
      var a = p.getAttribute("data-a"), b = p.getAttribute("data-b");
      p.classList.toggle("is-lit", filtering && matchSet.has(a) && matchSet.has(b));
    });
  }

  /* ---------- Bottom sheet ---------- */
  function openSheet(slug, trigger) {
    var d = state.ctx.bySlug[slug];
    if (!d) return;
    lastFocus = trigger || document.activeElement;
    state.selected = slug;

    els.svg.querySelectorAll(".uni-node").forEach(function (n) {
      n.classList.toggle("is-selected", n.getAttribute("data-slug") === slug);
    });

    var rel = neighbours(slug).map(function (s) { return state.ctx.bySlug[s]; }).filter(Boolean);
    els.sheet.innerHTML =
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<div class="sheet-head">' +
        '<h2 id="sheet-title">' + esc(d.name) + "</h2>" +
        '<button type="button" class="btn-icon" data-sheet-close aria-label="Close panel">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="sheet-cats">' + d.categories.map(function (c) { return '<span class="cat-chip">' + esc(c) + "</span>"; }).join("") + window.p3dBadge(d.evidence) + "</div>" +
      '<p class="sheet-summary">' + esc(d.short) + " " + esc(d.whatIsIt.split(". ")[0]) + ".</p>" +
      (rel.length
        ? '<p class="sheet-related-title">Connected to</p><div class="sheet-related">' +
          rel.map(function (r) { return '<a href="' + window.p3dDomainUrl(r.slug) + '">' + esc(r.name) + "</a>"; }).join("") + "</div>"
        : "") +
      '<a class="btn btn-primary sheet-cta" href="' + window.p3dDomainUrl(d.slug) + '">Open full ' + esc(d.name) + " page</a>";

    els.sheet.hidden = false;
    els.overlay.hidden = false;
    // On mobile the overlay blocks the page behind; on desktop it's transparent + non-blocking.
    if (window.innerWidth < 1024) document.body.style.overflow = "hidden";
    var closeBtn = els.sheet.querySelector("[data-sheet-close]");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onSheetKey);
  }

  function closeSheet(silent) {
    if (els.sheet.hidden) return;
    els.sheet.hidden = true;
    els.overlay.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onSheetKey);
    els.svg.querySelectorAll(".uni-node.is-selected").forEach(function (n) { n.classList.remove("is-selected"); });
    state.selected = null;
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onSheetKey(e) {
    if (e.key === "Escape") { closeSheet(); return; }
    if (e.key === "Tab") {
      var f = els.sheet.querySelectorAll("a[href], button:not([disabled])");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ---------- Events ---------- */
  function bind() {
    // View toggle
    mount.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () { setView(b.getAttribute("data-view")); });
    });

    // Filters
    mount.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-cat");
        if (state.active.has(c)) state.active.delete(c); else state.active.add(c);
        applyFilters();
      });
    });
    els.clear.addEventListener("click", function () { state.active.clear(); applyFilters(); });

    // Map interactions (delegated)
    els.svg.addEventListener("click", function (e) {
      var node = e.target.closest(".uni-node");
      if (!node) return;
      // Tap / click opens the sheet first; the sheet's CTA is the navigation.
      e.preventDefault();
      openSheet(node.getAttribute("data-slug"), node);
    });
    els.svg.addEventListener("keydown", function (e) {
      var node = e.target.closest && e.target.closest(".uni-node");
      if (!node) return;
      // Enter = open sheet (which holds the link). Shift+Enter = go straight to the page.
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (e.shiftKey) { window.location.href = node.getAttribute("href"); return; }
        openSheet(node.getAttribute("data-slug"), node);
      }
    });
    els.svg.addEventListener("mouseover", function (e) {
      var node = e.target.closest(".uni-node");
      if (!node) return;
      var s = node.getAttribute("data-slug");
      lightNeighbours(s, true);
      showTooltip(s, e);
    });
    els.svg.addEventListener("mousemove", function (e) {
      if (!els.tooltip.hidden) positionTooltip(e);
    });
    els.svg.addEventListener("mouseout", function (e) {
      var node = e.target.closest(".uni-node");
      if (!node) return;
      lightNeighbours(node.getAttribute("data-slug"), false);
      hideTooltip();
    });
    els.svg.addEventListener("focusin", function (e) {
      var node = e.target.closest && e.target.closest(".uni-node");
      if (node) lightNeighbours(node.getAttribute("data-slug"), true);
    });
    els.svg.addEventListener("focusout", function (e) {
      var node = e.target.closest && e.target.closest(".uni-node");
      if (node) lightNeighbours(node.getAttribute("data-slug"), false);
    });

    // Sheet close
    els.overlay.addEventListener("click", function () { closeSheet(); });
    els.sheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-sheet-close]")) closeSheet();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    Promise.all([
      window.PHARMA3D_STORE.all(),
      fetch(window.p3dUrl("data/universe-layout.json")).then(function (r) {
        if (!r.ok) throw new Error("layout");
        return r.json();
      })
    ]).then(function (res) {
      state.ctx = res[0];
      state.layout = res[1];
      buildShell();
      drawMap();
      drawList();
      bind();
      applyFilters();
      if (location.hash === "#list") setView("list");
    }).catch(function () {
      mount.innerHTML =
        '<div class="state-block"><h3>Could not load the Universe</h3>' +
        "<p>The data files could not be loaded. If you opened this page straight from your file system, serve the project over HTTP (for example <code>python3 -m http.server</code>).</p>" +
        '<a class="btn btn-primary" href="explore.html">Go to Explore</a></div>';
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
