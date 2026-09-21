/* =========================================================
   PHARMA 3D — Data store
   Loads the JSON data files once and shares them across
   universe, domain pages, explore, search and related.js.
   ========================================================= */
(function () {
  "use strict";

  var cache = {};

  function load(file) {
    if (!cache[file]) {
      cache[file] = fetch(window.p3dUrl("data/" + file))
        .then(function (r) {
          if (!r.ok) throw new Error("Failed to load " + file + " (" + r.status + ")");
          return r.json();
        })
        .catch(function (err) {
          delete cache[file]; // allow retry
          throw err;
        });
    }
    return cache[file];
  }

  var Store = {
    domains: function () { return load("domains.json"); },
    relationships: function () { return load("relationships.json"); },
    corpus: function () { return load("search-corpus.json"); },

    /** Convenience: everything most pages need, in one promise. */
    all: function () {
      return Promise.all([Store.domains(), Store.relationships()]).then(function (r) {
        var domains = r[0].domains;
        var bySlug = {};
        domains.forEach(function (d) { bySlug[d.slug] = d; });
        return { meta: r[0].meta, domains: domains, bySlug: bySlug, rel: r[1] };
      });
    }
  };

  window.PHARMA3D_STORE = Store;

  /* ---------- Shared tiny helpers ---------- */
  window.p3dEsc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /** Evidence tier -> badge class (uses the existing components.css badges). */
  window.p3dBadge = function (tier) {
    var map = {
      "ESTABLISHED": ["badge-established", "Established"],
      "SUPPORTED": ["badge-supported", "Supported"],
      "EMERGING": ["badge-emerging", "Emerging"],
      "TRADITIONAL": ["badge-traditional", "Traditional"],
      "DATA PENDING VERIFICATION": ["badge-pending", "Data pending verification"]
    };
    var m = map[tier] || map["DATA PENDING VERIFICATION"];
    return '<span class="badge ' + m[0] + '" title="Evidence tier: ' + window.p3dEsc(tier) + '">' + m[1] + "</span>";
  };

  window.p3dDomainUrl = function (slug) {
    return window.p3dUrl("domain/" + slug + ".html");
  };
})();
