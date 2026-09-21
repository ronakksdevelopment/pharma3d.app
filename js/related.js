/* =========================================================
   PHARMA 3D — Reusable related-topics component
   Everything here is derived from data/relationships.json.
   No page hardcodes its related links.

   API (window.PHARMA3D_RELATED):
     relatedDomains(ctx, slug)      -> [{domain, why}]   from edges
     chainsForDomain(ctx, slug)     -> [{chain, position, prev, next}]
     modulesForDomain(ctx, slug)    -> [{label, url, status}]
     renderRelatedDomains(ctx, slug)-> HTML string
     renderChains(ctx, slug)        -> HTML string
     renderModules(ctx, slug)       -> HTML string
     mount(el, ctx, slug)           -> fills element with all three
   ========================================================= */
(function () {
  "use strict";

  var esc = function (s) { return window.p3dEsc(s); };

  function relatedDomains(ctx, slug) {
    var out = [];
    var seen = {};
    ctx.rel.edges.forEach(function (e) {
      var other = e.a === slug ? e.b : e.b === slug ? e.a : null;
      if (!other || seen[other] || !ctx.bySlug[other]) return;
      seen[other] = true;
      out.push({ domain: ctx.bySlug[other], why: e.why });
    });
    return out;
  }

  /** Which concept nodes map to this domain, and where those sit in each chain. */
  function chainsForDomain(ctx, slug) {
    var conceptIds = Object.keys(ctx.rel.concepts).filter(function (id) {
      return ctx.rel.concepts[id].domains.indexOf(slug) > -1;
    });
    var results = [];
    ctx.rel.chains.forEach(function (chain) {
      var hits = chain.nodes.filter(function (n) { return conceptIds.indexOf(n) > -1; });
      if (!hits.length) return;
      results.push({ chain: chain, hits: hits });
    });
    return results;
  }

  function modulesForDomain(ctx, slug) {
    return ctx.rel.modules.items.filter(function (m) {
      return m.domains.indexOf("*") > -1 || m.domains.indexOf(slug) > -1;
    });
  }

  /* ---------- Renderers ---------- */

  function renderRelatedDomains(ctx, slug) {
    var list = relatedDomains(ctx, slug);
    if (!list.length) return '<p class="muted">No related domains recorded yet.</p>';
    return (
      '<ul class="related-list">' +
      list.map(function (r) {
        return (
          '<li><a class="related-item" href="' + window.p3dDomainUrl(r.domain.slug) + '">' +
          '<span class="related-item-main"><span class="related-item-title">' + esc(r.domain.name) + "</span>" +
          '<span class="related-item-why">' + esc(r.why) + "</span></span>" +
          '<span class="related-item-arrow" data-icon="arrowRight" aria-hidden="true"></span>' +
          "</a></li>"
        );
      }).join("") +
      "</ul>"
    );
  }

  function renderChains(ctx, slug) {
    var chains = chainsForDomain(ctx, slug);
    if (!chains.length) return "";
    return chains.map(function (c) {
      var nodes = c.chain.nodes.map(function (n, i) {
        var concept = ctx.rel.concepts[n];
        var label = concept ? concept.label : n;
        var active = c.hits.indexOf(n) > -1;
        // A node links to its domain page when it maps to exactly one non-self domain.
        var targets = concept ? concept.domains.filter(function (d) { return d !== slug; }) : [];
        var inner = esc(label);
        var cls = "chain-node" + (active ? " is-here" : "");
        var node;
        if (active) {
          node = '<span class="' + cls + '" aria-current="true">' + inner + "</span>";
        } else if (targets.length) {
          node = '<a class="' + cls + '" href="' + window.p3dDomainUrl(targets[0]) + '">' + inner + "</a>";
        } else {
          node = '<span class="' + cls + '">' + inner + "</span>";
        }
        return "<li>" + node + (i < c.chain.nodes.length - 1 ? '<span class="chain-sep" aria-hidden="true">↔</span>' : "") + "</li>";
      }).join("");
      return (
        '<div class="chain-block">' +
        '<h4 class="chain-title">' + esc(c.chain.label) + "</h4>" +
        '<p class="chain-desc">' + esc(c.chain.description) + "</p>" +
        '<ol class="chain-track" aria-label="' + esc(c.chain.label) + '">' + nodes + "</ol>" +
        "</div>"
      );
    }).join("");
  }

  function renderModules(ctx, slug) {
    var mods = modulesForDomain(ctx, slug);
    var live = mods.filter(function (m) { return m.status === "live"; });
    var planned = mods.filter(function (m) { return m.status !== "live"; });
    var html = '<ul class="related-list">';
    live.forEach(function (m) {
      html +=
        '<li><a class="related-item" href="' + window.p3dUrl(m.url) + '">' +
        '<span class="related-item-main"><span class="related-item-title">' + esc(m.label) + "</span>" +
        '<span class="related-item-why">Available now</span></span>' +
        '<span class="related-item-arrow" data-icon="arrowRight" aria-hidden="true"></span></a></li>';
    });
    planned.forEach(function (m) {
      html +=
        '<li><div class="related-item is-planned" role="group" aria-label="' + esc(m.label) + ', planned">' +
        '<span class="related-item-main"><span class="related-item-title">' + esc(m.label) + "</span>" +
        '<span class="related-item-why">Planned. Not built yet.</span></span>' +
        '<span class="planned-tag">Planned</span></div></li>';
    });
    return html + "</ul>";
  }

  function mount(el, ctx, slug) {
    el.innerHTML =
      renderRelatedDomains(ctx, slug) +
      renderChains(ctx, slug);
    hydrateIcons(el);
  }

  function hydrateIcons(scope) {
    if (!window.PHARMA3D_ICONS) return;
    scope.querySelectorAll("[data-icon]").forEach(function (n) {
      var name = n.getAttribute("data-icon");
      if (window.PHARMA3D_ICONS[name] && !n.dataset.iconLoaded) {
        n.innerHTML = window.PHARMA3D_ICONS[name];
        n.dataset.iconLoaded = "true";
      }
    });
  }

  window.PHARMA3D_RELATED = {
    relatedDomains: relatedDomains,
    chainsForDomain: chainsForDomain,
    modulesForDomain: modulesForDomain,
    renderRelatedDomains: renderRelatedDomains,
    renderChains: renderChains,
    renderModules: renderModules,
    mount: mount,
    hydrateIcons: hydrateIcons
  };
})();
