/* =========================================================
   PHARMA 3D — Domain page renderer
   One template, 18 domains. Renders, in this exact order:
     1 WHAT IS IT
     2 WHERE DOES IT FIT
     3 THREE KEY IDEAS
     4 WHAT DO PHARMACISTS DO HERE
     5 RELATED DOMAINS (linked)
     6 SITE MODULES (linked)
     7 PRACTISE THIS DOMAIN
     8 REFERENCES
     9 PREVIOUS / NEXT
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("domain-root");
  var slug = document.documentElement.getAttribute("data-domain");
  if (!root || !slug || !window.PHARMA3D_STORE) return;

  var esc = window.p3dEsc;

  function section(id, num, title, bodyHtml) {
    return (
      '<section class="domain-section" aria-labelledby="h-' + id + '">' +
      '<h2 id="h-' + id + '" class="domain-h2"><span class="domain-h2-num" aria-hidden="true">' + num + "</span>" + esc(title) + "</h2>" +
      bodyHtml +
      "</section>"
    );
  }

  function progressBars(d) {
    var rows = [
      ["Foundation", d.progress.foundation],
      ["Applied", d.progress.applied],
      ["Frontier", d.progress.frontier]
    ];
    return (
      '<div class="dp-meter" role="group" aria-label="Domain depth indicators (illustrative, not a score)">' +
      rows.map(function (r) {
        var segs = "";
        for (var i = 1; i <= 5; i++) segs += '<span class="seg' + (i <= r[1] ? " on" : "") + '"></span>';
        return '<div class="dp-meter-row"><span class="dp-meter-label">' + r[0] + '</span><span class="dp-meter-segs" aria-hidden="true">' + segs + '</span><span class="visually-hidden">' + r[1] + " out of 5</span></div>";
      }).join("") +
      "</div>"
    );
  }

  function renderPractice(d) {
    return (
      '<p class="muted practice-note">Try to answer each question before revealing the answer. These are self-check prompts, not an assessment.</p>' +
      '<ul class="practice-list">' +
      d.practice.map(function (p, i) {
        var pid = "practice-" + i;
        return (
          '<li class="practice-item">' +
          '<p class="practice-q"><span class="practice-q-num">Q' + (i + 1) + "</span> " + esc(p.q) + "</p>" +
          '<button type="button" class="btn btn-secondary practice-toggle" aria-expanded="false" aria-controls="' + pid + '">Show answer</button>' +
          '<div class="practice-a" id="' + pid + '" hidden><p>' + esc(p.a) + "</p></div>" +
          "</li>"
        );
      }).join("") +
      "</ul>"
    );
  }

  function renderReferences(d) {
    return (
      '<div class="ref-notice" role="note"><strong>Verify before citing.</strong> These entries point to the kind of source to consult. They are not full citations. Confirm exact titles, editions, versions and access dates from the source itself.</div>' +
      '<ul class="ref-list">' +
      d.references.map(function (r) {
        return (
          '<li class="ref-item"><dl class="ref-dl">' +
          "<dt>Source</dt><dd>" + esc(r.source) + "</dd>" +
          "<dt>Type</dt><dd>" + esc(r.type) + "</dd>" +
          "<dt>Purpose</dt><dd>" + esc(r.purpose) + "</dd>" +
          "<dt>Verify before citing</dt><dd>" + esc(r.verify) + "</dd>" +
          "</dl></li>"
        );
      }).join("") +
      "</ul>"
    );
  }

  function renderPrevNext(ctx, d) {
    var i = ctx.domains.findIndex(function (x) { return x.slug === d.slug; });
    var prev = ctx.domains[(i - 1 + ctx.domains.length) % ctx.domains.length];
    var next = ctx.domains[(i + 1) % ctx.domains.length];
    return (
      '<nav class="prevnext" aria-label="Previous and next domain">' +
      '<a class="prevnext-link prev" href="' + window.p3dDomainUrl(prev.slug) + '" rel="prev">' +
      '<span class="prevnext-dir">← Previous</span><span class="prevnext-name">' + esc(prev.name) + "</span></a>" +
      '<a class="prevnext-link next" href="' + window.p3dDomainUrl(next.slug) + '" rel="next">' +
      '<span class="prevnext-dir">Next →</span><span class="prevnext-name">' + esc(next.name) + "</span></a>" +
      "</nav>" +
      '<p class="prevnext-count mono">Domain ' + (i + 1) + " of " + ctx.domains.length + "</p>"
    );
  }

  function render(ctx) {
    var d = ctx.bySlug[slug];
    if (!d) {
      root.innerHTML =
        '<div class="state-block"><h3>Domain not found</h3><p>This domain does not exist in the data file.</p><a class="btn btn-primary" href="' +
        window.p3dUrl("universe.html") + '">Back to the Universe</a></div>';
      return;
    }

    var cats = d.categories.map(function (c) { return '<span class="cat-chip">' + esc(c) + "</span>"; }).join("");

    var head =
      '<header class="domain-hero">' +
      '<div class="domain-hero-icon" data-icon="' + esc(d.icon) + '" aria-hidden="true"></div>' +
      '<div class="domain-hero-text">' +
      '<span class="section-eyebrow">Domain</span>' +
      "<h1>" + esc(d.name) + "</h1>" +
      '<p class="domain-lead">' + esc(d.short) + "</p>" +
      '<div class="domain-meta">' + cats + window.p3dBadge(d.evidence) + "</div>" +
      "</div>" +
      progressBars(d) +
      "</header>";

    var whatIs = section("what", "1", "What is it", "<p>" + esc(d.whatIsIt) + "</p>");
    var fits = section("fit", "2", "Where does it fit", "<p>" + esc(d.whereItFits) + "</p>");

    var ideas = section(
      "ideas", "3", "Three key ideas",
      '<ol class="idea-list">' +
      d.keyIdeas.slice(0, 3).map(function (k, i) {
        return '<li class="idea-item"><span class="idea-num mono" aria-hidden="true">' + (i + 1) + "</span><div><h3 class=\"idea-title\">" + esc(k.title) + "</h3><p>" + esc(k.text) + "</p></div></li>";
      }).join("") +
      "</ol>"
    );

    var role = section(
      "role", "4", "What do pharmacists do here",
      '<ul class="role-list">' + d.pharmacistRole.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>"
    );

    var related = section("related", "5", "Related domains", window.PHARMA3D_RELATED.renderRelatedDomains(ctx, d.slug) + window.PHARMA3D_RELATED.renderChains(ctx, d.slug));
    var modules = section("modules", "6", "Site modules", window.PHARMA3D_RELATED.renderModules(ctx, d.slug));
    var practise = section("practise", "7", "Practise this domain", renderPractice(d));
    var refs = section("refs", "8", "References", renderReferences(d));
    var pn = '<section class="domain-section" aria-label="Navigate between domains">' + renderPrevNext(ctx, d) + "</section>";

    root.innerHTML = head + whatIs + fits + ideas + role + related + modules + practise + refs + pn;

    window.PHARMA3D_RELATED.hydrateIcons(root);
    if (window.PHARMA3D_ICONS && window.PHARMA3D_ICONS[d.icon]) {
      var heroIcon = root.querySelector(".domain-hero-icon");
      if (heroIcon) heroIcon.innerHTML = window.PHARMA3D_ICONS[d.icon];
    }

    // Practice toggles
    root.querySelectorAll(".practice-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        btn.textContent = open ? "Show answer" : "Hide answer";
        if (panel) panel.hidden = open;
      });
    });

    document.title = d.name + " — PHARMA 3D";
  }

  window.PHARMA3D_STORE.all().then(render).catch(function () {
    root.innerHTML =
      '<div class="state-block"><h3>Could not load this domain</h3><p>The data file could not be loaded. If you opened this page directly from your file system, serve the project over HTTP (for example <code>python3 -m http.server</code>) so the browser can read the JSON files.</p><a class="btn btn-primary" href="' +
      window.p3dUrl("universe.html") + '">Back to the Universe</a></div>';
  });
})();
