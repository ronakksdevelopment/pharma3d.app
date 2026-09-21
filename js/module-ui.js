/* =========================================================
   PHARMA 3D — Shared UI helpers for explorer modules
   Accordion, topic navigation, references, prev/next, JSON loader.
   No frameworks. Uses the existing p3dEsc / p3dBadge / p3dUrl helpers.
   ========================================================= */
(function () {
  "use strict";

  var esc = window.p3dEsc;
  var ICON = function (n) { return (window.PHARMA3D_ICONS && window.PHARMA3D_ICONS[n]) || ""; };

  var cache = {};
  function loadJson(file) {
    if (!cache[file]) {
      cache[file] = fetch(window.p3dUrl("data/" + file)).then(function (r) {
        if (!r.ok) throw new Error("Failed " + file);
        return r.json();
      }).catch(function (e) { delete cache[file]; throw e; });
    }
    return cache[file];
  }

  function bullets(arr) {
    return '<ul class="bul">' + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }
  function para(s) { return "<p>" + esc(s) + "</p>"; }

  function kv(pairs) {
    return '<dl class="kv">' + pairs.map(function (p) {
      return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
    }).join("") + "</dl>";
  }

  /* ---------- Accordion ---------- */
  var accCount = 0;
  function accordion(items, opts) {
    opts = opts || {};
    var id = "acc" + (++accCount);
    var html = '<div class="acc" data-acc="' + id + '">';
    if (opts.tools !== false && items.length > 1) {
      html += '<div class="acc-tools"><button type="button" class="btn btn-secondary btn-sm" data-acc-all="open" data-for="' + id + '">Expand all</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-acc-all="close" data-for="' + id + '">Collapse all</button></div>';
    }
    html += items.map(function (it, i) {
      var bid = id + "-b" + i, hid = id + "-h" + i;
      var open = it.open ? "true" : "false";
      return '<div class="acc-item">' +
        '<h3 style="margin:0;font-family:inherit;font-size:inherit;">' +
        '<button type="button" class="acc-btn" id="' + hid + '" aria-expanded="' + open + '" aria-controls="' + bid + '">' +
        "<span>" + esc(it.title) + '</span><span class="acc-chev" aria-hidden="true">' + ICON("chevronDown") + "</span></button></h3>" +
        '<div class="acc-body" id="' + bid + '" role="region" aria-labelledby="' + hid + '"' + (it.open ? "" : " hidden") + ">" + it.body + "</div></div>";
    }).join("");
    return html + "</div>";
  }

  function wireAccordions(scope) {
    scope.addEventListener("click", function (e) {
      var b = e.target.closest(".acc-btn");
      if (b) {
        var open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", open ? "false" : "true");
        var body = document.getElementById(b.getAttribute("aria-controls"));
        if (body) body.hidden = open;
        return;
      }
      var all = e.target.closest("[data-acc-all]");
      if (all) {
        var want = all.getAttribute("data-acc-all") === "open";
        var wrap = scope.querySelector('[data-acc="' + all.getAttribute("data-for") + '"]');
        if (!wrap) return;
        wrap.querySelectorAll(".acc-btn").forEach(function (btn) {
          btn.setAttribute("aria-expanded", want ? "true" : "false");
          var body = document.getElementById(btn.getAttribute("aria-controls"));
          if (body) body.hidden = !want;
        });
      }
    });
  }

  /* ---------- Topic navigation (progress-style, doubles as tabs) ---------- */
  function topicNav(topics, label) {
    return '<div class="topic-nav" role="navigation" aria-label="' + esc(label || "Topics") + '">' +
      '<div class="topic-track" role="tablist" aria-label="' + esc(label || "Topics") + '">' +
      topics.map(function (t, i) {
        return '<button type="button" role="tab" class="topic-btn" id="tab-' + t.id + '" data-topic="' + t.id + '" aria-controls="panel-' + t.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? "0" : "-1") + '"' + (i === 0 ? ' aria-current="true"' : "") + '>' +
          '<span class="tn" aria-hidden="true">' + (i + 1) + "</span><span>" + esc(t.label) + "</span></button>";
      }).join("") + "</div>" +
      '<div class="topic-progress"><div class="progress-bar" aria-hidden="true"><div class="progress-bar-fill" id="topic-fill" style="width:' + (100 / topics.length) + '%"></div></div>' +
      '<span class="topic-progress-label" id="topic-label" role="status" aria-live="polite">Topic 1 of ' + topics.length + "</span></div></div>";
  }

  function wireTopics(root, topics) {
    var seen = {};
    function show(id, focus) {
      var idx = topics.findIndex(function (t) { return t.id === id; });
      if (idx < 0) return;
      topics.forEach(function (t) {
        var p = document.getElementById("panel-" + t.id);
        if (p) p.hidden = t.id !== id;
      });
      root.querySelectorAll(".topic-btn").forEach(function (b) {
        var on = b.getAttribute("data-topic") === id;
        if (on) { b.setAttribute("aria-current", "true"); seen[id] = true; } else b.removeAttribute("aria-current");
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
        if (seen[b.getAttribute("data-topic")]) b.classList.add("is-seen");
        if (on && focus) { b.focus(); b.scrollIntoView({ inline: "center", block: "nearest" }); }
      });
      var fill = document.getElementById("topic-fill");
      var lab = document.getElementById("topic-label");
      if (fill) fill.style.width = ((idx + 1) / topics.length * 100) + "%";
      if (lab) lab.textContent = "Topic " + (idx + 1) + " of " + topics.length + ": " + topics[idx].label;
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".topic-btn");
      if (b) show(b.getAttribute("data-topic"), false);
    });
    root.addEventListener("keydown", function (e) {
      var b = e.target.closest(".topic-btn");
      if (!b) return;
      var ids = topics.map(function (t) { return t.id; });
      var i = ids.indexOf(b.getAttribute("data-topic"));
      var n = null;
      if (e.key === "ArrowRight") n = ids[(i + 1) % ids.length];
      else if (e.key === "ArrowLeft") n = ids[(i - 1 + ids.length) % ids.length];
      else if (e.key === "Home") n = ids[0];
      else if (e.key === "End") n = ids[ids.length - 1];
      if (n) { e.preventDefault(); show(n, true); }
    });
    var start = (location.hash || "").replace("#", "");
    show(topics.some(function (t) { return t.id === start; }) ? start : topics[0].id, false);
    return show;
  }

  function panels(topics, bodies) {
    return topics.map(function (t, i) {
      return '<section class="mod-panel" role="tabpanel" id="panel-' + t.id + '" aria-labelledby="tab-' + t.id + '"' + (i === 0 ? "" : " hidden") + ">" + bodies[t.id] + "</section>";
    }).join("");
  }

  /* ---------- References ---------- */
  function references(refs) {
    return '<div class="ref-notice" role="note"><strong>Verify before citing.</strong> These entries point to the kind of source to consult. They are not full citations. Confirm exact titles, editions, versions and access dates from the source itself.</div>' +
      '<ul class="ref-list">' + refs.map(function (r) {
        return '<li class="ref-item"><dl class="kv">' +
          "<dt>Source</dt><dd>" + esc(r.source) + "</dd><dt>Type</dt><dd>" + esc(r.type) + "</dd>" +
          "<dt>Purpose</dt><dd>" + esc(r.purpose) + "</dd><dt>Verify before citing</dt><dd>" + esc(r.verify) + "</dd></dl></li>";
      }).join("") + "</ul>";
  }

  /* ---------- Prev / next ---------- */
  function prevNext(list, i, urlFn, nameFn, noun) {
    var p = list[(i - 1 + list.length) % list.length];
    var n = list[(i + 1) % list.length];
    return '<nav class="mod-pn" aria-label="Previous and next ' + esc(noun) + '">' +
      '<a class="prev" rel="prev" href="' + urlFn(p) + '"><span class="dir">← Previous</span><span class="nm">' + esc(nameFn(p)) + "</span></a>" +
      '<a class="next" rel="next" href="' + urlFn(n) + '"><span class="dir">Next →</span><span class="nm">' + esc(nameFn(n)) + "</span></a></nav>" +
      '<p class="muted" style="text-align:center;margin-top:var(--space-4);font-size:.75rem;">' + esc(noun.charAt(0).toUpperCase() + noun.slice(1)) + " " + (i + 1) + " of " + list.length + "</p>";
  }

  function hydrate(scope) {
    if (window.PHARMA3D_RELATED) window.PHARMA3D_RELATED.hydrateIcons(scope);
  }

  function errorBlock(title) {
    return '<div class="state-block"><h3>' + esc(title) + "</h3><p>The data file could not be loaded. If you opened this page directly from your file system, serve the project over HTTP (for example <code>python3 -m http.server</code>) so the browser can read the JSON files.</p></div>";
  }

  /* Copy to clipboard with a polite status message */
  function wireCopy(scope) {
    scope.addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]");
      if (!b) return;
      var txt = b.getAttribute("data-copy");
      var done = function (ok) {
        var old = b.getAttribute("data-label") || b.textContent;
        b.setAttribute("data-label", old);
        b.textContent = ok ? "Copied" : "Copy failed";
        setTimeout(function () { b.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
      } else {
        try {
          var ta = document.createElement("textarea");
          ta.value = txt; document.body.appendChild(ta); ta.select();
          var ok = document.execCommand("copy"); document.body.removeChild(ta); done(ok);
        } catch (er) { done(false); }
      }
    });
  }

  window.P3DUI = {
    loadJson: loadJson, bullets: bullets, para: para, kv: kv,
    accordion: accordion, wireAccordions: wireAccordions,
    topicNav: topicNav, wireTopics: wireTopics, panels: panels,
    references: references, prevNext: prevNext, hydrate: hydrate,
    errorBlock: errorBlock, wireCopy: wireCopy, icon: ICON
  };
})();
