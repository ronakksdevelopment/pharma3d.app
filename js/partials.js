/* =========================================================
   PHARMA 3D — Shared partials
   Injects header, mobile nav, search modal, accessibility
   drawer, bottom nav and footer into every page via a
   data-include-* hook. Keeps every page's HTML file free of
   duplicated chrome markup while staying framework-free.
   ========================================================= */
(function () {
  "use strict";

  const NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "wpd-2026.html", label: "World Pharmacist Day" },
    { href: "universe.html", label: "Universe" },
    { href: "explore.html", label: "Explore" },
    { href: "learn.html", label: "Learn" },
    { href: "about-authors.html", label: "Authors" },
  ];

  const BOTTOM_NAV_LINKS = [
    { href: "index.html", label: "Home", icon: "home" },
    { href: "explore.html", label: "Explore", icon: "compass" },
    { href: "learn.html", label: "Learn", icon: "book" },
    { href: "wpd-2026.html", label: "WPD 2026", icon: "calendar" },
    { href: "universe.html", label: "Universe", icon: "globe" },
  ];

  function navLinksHtml(links, extraAttrs) {
    return links
      .map(
        (l) =>
          `<a href="${l.href}" data-nav-link ${extraAttrs || ""}>${l.icon ? `<span data-icon="${l.icon}"></span>` : ""}<span>${l.label}</span></a>`
      )
      .join("");
  }

  function headerHtml() {
    return `
<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header">
  <div class="site-header-inner">
    <a class="brand" href="index.html" aria-label="PHARMA 3D — Home">
      <img src="assets/logo.png" alt="" width="36" height="36" onerror="this.src='assets/icons/icon-192.png'">
      <span>PHARMA 3D<span class="brand-sub">RIPSAT · Tripura University</span></span>
    </a>
    <nav class="primary-nav" aria-label="Primary">
      ${navLinksHtml(NAV_LINKS)}
    </nav>
    <div class="header-actions">
      <button type="button" class="search-trigger" data-action="open-search" aria-haspopup="dialog" aria-controls="search-modal">
        <span data-icon="search"></span>
        <span class="label-text">Search</span>
        <span class="kbd-hint"><kbd>Ctrl</kbd>+<kbd>K</kbd></span>
      </button>
      <button type="button" class="btn-icon" data-action="open-a11y" aria-haspopup="dialog" aria-controls="a11y-drawer" aria-label="Accessibility options">
        <span data-icon="a11y"></span>
      </button>
      <button type="button" class="btn-icon" data-action="toggle-theme" aria-pressed="false">
        <span data-icon="moon" data-theme-icon="dark"></span>
      </button>
      <button type="button" class="btn-icon hamburger-btn" data-action="open-mobile-nav" aria-haspopup="dialog" aria-controls="mobile-nav" aria-label="Open menu">
        <span data-icon="menu"></span>
      </button>
    </div>
  </div>
</header>`;
  }

  function mobileNavHtml() {
    return `
<div class="mobile-nav" id="mobile-nav" hidden role="dialog" aria-modal="true" aria-label="Site menu">
  <div class="mobile-nav-panel">
    <div class="mobile-nav-header">
      <span class="brand" style="font-size:1rem;"><img src="assets/logo.png" alt="" width="28" height="28" onerror="this.src='assets/icons/icon-192.png'">PHARMA 3D</span>
      <button type="button" class="btn-icon" data-action="close-mobile-nav" aria-label="Close menu">
        <span data-icon="close"></span>
      </button>
    </div>
    <nav aria-label="Mobile primary">
      ${navLinksHtml(NAV_LINKS)}
    </nav>
    <div style="margin-top: var(--space-6); display:flex; flex-direction:column; gap: var(--space-4);">
      <div class="switch" role="switch" data-action="toggle-lite" aria-checked="false" tabindex="0">
        <span class="switch-track"><span class="switch-thumb"></span></span>
        <span>Lite Mode (reduced motion)</span>
      </div>
    </div>
  </div>
</div>`;
  }

  function searchModalHtml() {
    return `
<div class="modal-overlay" id="search-modal" hidden role="dialog" aria-modal="true" aria-label="Search PHARMA 3D">
  <div class="modal" role="document">
    <div class="modal-header">
      <h2 id="search-modal-title" style="font-size:var(--fs-h4);">Search PHARMA 3D</h2>
      <button type="button" class="btn-icon" data-action="close-search" aria-label="Close search">
        <span data-icon="close"></span>
      </button>
    </div>
    <div class="field" style="margin-bottom:var(--space-3);">
      <label for="search-input" class="visually-hidden">Search topics and pages</label>
      <input id="search-input" type="search" placeholder="Search topics, pages, authors…" autocomplete="off">
    </div>
    <ul id="search-results" aria-label="Search results"></ul>
  </div>
</div>
<style>
  #search-results{ display:flex; flex-direction:column; gap: var(--space-2); max-height: 50vh; overflow-y:auto; }
  .search-result-item{ display:block; padding: var(--space-3); border-radius: var(--radius-sm); min-height:44px; }
  .search-result-item:hover, .search-result-item:focus-visible{ background: var(--accent-tint); }
  .sr-title{ display:block; font-weight:600; }
  .sr-desc{ display:block; font-size: var(--fs-caption); color: var(--text-muted); }
  .search-empty{ padding: var(--space-4); color: var(--text-muted); text-align:center; }
</style>`;
  }

  function a11yDrawerHtml() {
    return `
<div class="drawer-overlay" id="a11y-drawer-overlay" hidden></div>
<div class="drawer" id="a11y-drawer" hidden role="dialog" aria-modal="true" aria-label="Accessibility options">
  <div class="drawer-handle"></div>
  <div class="modal-header">
    <h2 style="font-size:var(--fs-h4);">Accessibility</h2>
    <button type="button" class="btn-icon" data-action="close-a11y" aria-label="Close accessibility options">
      <span data-icon="close"></span>
    </button>
  </div>
  <div style="display:flex; flex-direction:column; gap: var(--space-5);">
    <div>
      <h3 style="font-size:var(--fs-body); font-family:var(--font-body); font-weight:600; margin-bottom:var(--space-2);">Text size</h3>
      <div style="display:flex; gap:var(--space-2);">
        <button type="button" class="btn btn-secondary btn-sm" data-textsize="100">A</button>
        <button type="button" class="btn btn-secondary btn-sm" data-textsize="115" style="font-size:1.1em;">A</button>
        <button type="button" class="btn btn-secondary btn-sm" data-textsize="130" style="font-size:1.25em;">A</button>
      </div>
    </div>
    <div>
      <h3 style="font-size:var(--fs-body); font-family:var(--font-body); font-weight:600; margin-bottom:var(--space-2);">Motion</h3>
      <div class="switch" role="switch" data-action="toggle-lite" aria-checked="false" tabindex="0">
        <span class="switch-track"><span class="switch-thumb"></span></span>
        <span>Lite Mode (reduced motion &amp; effects)</span>
      </div>
    </div>
    <div>
      <h3 style="font-size:var(--fs-body); font-family:var(--font-body); font-weight:600; margin-bottom:var(--space-2);">Theme</h3>
      <div class="switch" role="switch" data-action="toggle-theme" aria-checked="false" tabindex="0">
        <span class="switch-track"><span class="switch-thumb"></span></span>
        <span>Dark theme</span>
      </div>
    </div>
    <p style="font-size:var(--fs-caption); color:var(--text-muted);">All content and controls on PHARMA 3D remain fully usable with Lite Mode on and at any text size.</p>
  </div>
</div>`;
  }

  function bottomNavHtml() {
    return `
<nav class="bottom-nav" aria-label="Bottom primary">
  ${navLinksHtml(BOTTOM_NAV_LINKS, "")}
</nav>`;
  }

  function footerHtml() {
    return `
<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <div class="footer-brand">
        <img src="assets/logo.png" alt="" width="32" height="32" onerror="this.src='assets/icons/icon-192.png'">
        <span>PHARMA 3D</span>
      </div>
      <p style="color:rgba(233,247,242,0.75); font-size:var(--fs-body-sm); max-width:40ch;">
        The Interactive World of Pharmacy — a World Pharmacist Day 2026 special edition.
      </p>
    </div>
    <div class="footer-col">
      <h4>Created by</h4>
      <p>Karnajit Reang</p>
      <p>Kishaloy Debnath</p>
      <a href="about-authors.html">About the authors</a>
    </div>
    <div class="footer-col">
      <h4>Institution</h4>
      <p>Regional Institute of Pharmaceutical Science and Technology (RIPSAT)</p>
      <p>Tripura University, Agartala, Tripura, India</p>
    </div>
  </div>
  <div class="footer-inner" style="padding-top:0; display:block;">
    <p class="footer-note">
      PHARMA 3D is an independent educational project created by the individuals named above. It is not an official
      publication of, and is not endorsed or certified by, Tripura University or RIPSAT. Content is intended for
      general pharmaceutical-science education only and is not a substitute for professional medical or pharmacy advice.
    </p>
  </div>
</footer>`;
  }

  function inject(selector, html) {
    document.querySelectorAll(selector).forEach((el) => {
      el.outerHTML = html;
    });
  }

  function renderAll() {
    inject("[data-include='header']", headerHtml());
    inject("[data-include='mobile-nav']", mobileNavHtml());
    inject("[data-include='search-modal']", searchModalHtml());
    inject("[data-include='a11y-drawer']", a11yDrawerHtml());
    inject("[data-include='bottom-nav']", bottomNavHtml());
    inject("[data-include='footer']", footerHtml());

    // Icons + active nav state need to run after partials exist in the DOM
    if (window.PHARMA3D_ICONS) {
      document.querySelectorAll("[data-icon]").forEach((el) => {
        const name = el.getAttribute("data-icon");
        if (window.PHARMA3D_ICONS[name]) {
          el.innerHTML = window.PHARMA3D_ICONS[name];
          el.dataset.iconLoaded = "true";
        }
      });
    }
    document.dispatchEvent(new CustomEvent("pharma3d:partials-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})();
