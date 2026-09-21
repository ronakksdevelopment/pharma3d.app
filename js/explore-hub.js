/* =========================================================
   PHARMA 3D — Explore hub (data-driven parts)
   Planned modules and relationship chains are rendered from
   data/relationships.json via the reusable related.js component.
   ========================================================= */
(function () {
  "use strict";

  var modulesEl = document.getElementById("hub-modules");
  var chainsEl = document.getElementById("hub-chains");
  if (!modulesEl && !chainsEl) return;
  if (!window.PHARMA3D_STORE) return;

  var esc = window.p3dEsc;

  function renderPlanned(ctx) {
    var planned = ctx.rel.modules.items.filter(function (m) { return m.status === "planned"; });
    if (!planned.length) { modulesEl.innerHTML = '<p class="muted">Nothing planned is recorded.</p>'; return; }
    modulesEl.innerHTML =
      '<ul class="related-list">' +
      planned.map(function (m) {
        var scope = m.domains.indexOf("*") > -1
          ? "All domains"
          : m.domains.map(function (s) { return ctx.bySlug[s] ? ctx.bySlug[s].name : s; }).join(", ");
        return (
          '<li><div class="related-item is-planned" role="group" aria-label="' + esc(m.label) + ', planned">' +
          '<span class="related-item-main"><span class="related-item-title">' + esc(m.label) + "</span>" +
          '<span class="related-item-why">Relates to: ' + esc(scope) + "</span></span>" +
          '<span class="planned-tag">Planned</span></div></li>'
        );
      }).join("") +
      "</ul>";
  }

  function renderChains(ctx) {
    // Standalone chain view: nodes link to the first domain the concept maps to.
    chainsEl.innerHTML = ctx.rel.chains.map(function (c) {
      var nodes = c.nodes.map(function (n, i) {
        var cc = ctx.rel.concepts[n];
        var label = cc ? cc.label : n;
        var target = cc && cc.domains.length ? cc.domains[0] : null;
        var node = target && ctx.bySlug[target]
          ? '<a class="chain-node" href="' + window.p3dDomainUrl(target) + '">' + esc(label) + "</a>"
          : '<span class="chain-node">' + esc(label) + "</span>";
        return "<li>" + node + (i < c.nodes.length - 1 ? '<span class="chain-sep" aria-hidden="true">↔</span>' : "") + "</li>";
      }).join("");
      return (
        '<div class="chain-block">' +
        '<h3 class="chain-title" style="font-size:1rem">' + esc(c.label) + "</h3>" +
        '<p class="chain-desc">' + esc(c.description) + "</p>" +
        '<ol class="chain-track" aria-label="' + esc(c.label) + '">' + nodes + "</ol></div>"
      );
    }).join("");
  }

  window.PHARMA3D_STORE.all().then(function (ctx) {
    if (modulesEl) renderPlanned(ctx);
    if (chainsEl) renderChains(ctx);
    if (window.PHARMA3D_RELATED) window.PHARMA3D_RELATED.hydrateIcons(document);
  }).catch(function () {
    var msg = '<p class="muted">Could not load the data files. Serve the project over HTTP (for example <code>python3 -m http.server</code>).</p>';
    if (modulesEl) modulesEl.innerHTML = msg;
    if (chainsEl) chainsEl.innerHTML = msg;
  });
})();
