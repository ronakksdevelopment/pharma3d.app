/* =========================================================
   PHARMA 3D — Path resolution for nested pages
   The completed partials.js emits root-relative URLs such as
   "index.html" and "assets/logo.png". Pages in /domain/ sit one
   level deep, so those URLs must be prefixed with "../".

   This file is loaded BEFORE partials.js on every page. It reads
   <html data-root="../"> (absent on top-level pages = no-op) and,
   after partials are injected, rewrites the injected chrome.
   partials.js itself is not modified.
   ========================================================= */
(function () {
  "use strict";

  var ROOT = document.documentElement.getAttribute("data-root") || "";
  window.PHARMA3D_ROOT = ROOT;

  /** Resolve a site-root-relative path for the current page depth. */
  window.p3dUrl = function (relPath) {
    return ROOT + String(relPath || "").replace(/^\.?\//, "");
  };

  if (!ROOT) return; // top-level page: nothing to rewrite

  function isRewritable(v) {
    if (!v) return false;
    if (v.charAt(0) === "#") return false;
    if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(v)) return false; // absolute / protocol
    if (v.indexOf("../") === 0) return false; // already correct
    return true;
  }

  function rewrite() {
    var scope = document.querySelectorAll(
      ".site-header a[href], .mobile-nav a[href], .bottom-nav a[href], .site-footer a[href], " +
        ".site-header img[src], .mobile-nav img[src], .site-footer img[src]"
    );
    scope.forEach(function (el) {
      var attr = el.tagName === "IMG" ? "src" : "href";
      var v = el.getAttribute(attr);
      if (isRewritable(v)) el.setAttribute(attr, ROOT + v);
      // inline onerror fallback on logos points at assets/icons/... (root-relative)
      if (el.tagName === "IMG" && el.getAttribute("onerror")) {
        el.setAttribute(
          "onerror",
          el.getAttribute("onerror").replace("this.src='assets/", "this.src='" + ROOT + "assets/")
        );
      }
    });
  }

  document.addEventListener("pharma3d:partials-ready", rewrite);
})();
