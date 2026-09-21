/* =========================================================
   PHARMA 3D — Core app behavior
   Vanilla JS only. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEYS = {
    theme: "pharma3d:theme",
    lite: "pharma3d:lite-mode",
  };

  /* ---------------------------------------------------------
     Theme (light / dark) toggle
  --------------------------------------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    if (stored === "light" || stored === "dark") {
      root.setAttribute("data-theme", stored);
    }

    const toggles = document.querySelectorAll("[data-action='toggle-theme']");
    toggles.forEach((btn) => {
      updateThemeButton(btn);
      btn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        const next = current === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEYS.theme, next);
        document.querySelectorAll("[data-action='toggle-theme']").forEach(updateThemeButton);
        showToast(next === "dark" ? "Dark theme on" : "Light theme on");
      });
    });
  }

  function updateThemeButton(btn) {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    btn.setAttribute("aria-pressed", current === "dark" ? "true" : "false");
    btn.setAttribute("aria-label", current === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const iconEl = btn.querySelector("[data-icon]");
    if (iconEl && window.PHARMA3D_ICONS) {
      const nextIconName = current === "dark" ? "sun" : "moon";
      iconEl.setAttribute("data-icon", nextIconName);
      iconEl.innerHTML = window.PHARMA3D_ICONS[nextIconName];
    }
  }

  /* ---------------------------------------------------------
     Lite Mode (reduces motion & decorative effects)
  --------------------------------------------------------- */
  function initLiteMode() {
    const root = document.documentElement;
    const stored = localStorage.getItem(STORAGE_KEYS.lite);
    if (stored === "on") {
      root.setAttribute("data-lite", "on");
    }

    const switches = document.querySelectorAll("[data-action='toggle-lite']");
    switches.forEach((el) => {
      syncLiteSwitch(el);
      el.addEventListener("click", () => {
        const isOn = root.getAttribute("data-lite") === "on";
        const next = isOn ? "off" : "on";
        if (next === "on") {
          root.setAttribute("data-lite", "on");
        } else {
          root.removeAttribute("data-lite");
        }
        localStorage.setItem(STORAGE_KEYS.lite, next);
        document.querySelectorAll("[data-action='toggle-lite']").forEach(syncLiteSwitch);
        showToast(next === "on" ? "Lite Mode on — reduced motion and effects" : "Lite Mode off");
      });
    });
  }

  function syncLiteSwitch(el) {
    const isOn = document.documentElement.getAttribute("data-lite") === "on";
    el.setAttribute("aria-checked", isOn ? "true" : "false");
  }

  /* ---------------------------------------------------------
     Mobile nav drawer (hamburger)
  --------------------------------------------------------- */
  function initMobileNav() {
    const openBtns = document.querySelectorAll("[data-action='open-mobile-nav']");
    const closeBtns = document.querySelectorAll("[data-action='close-mobile-nav']");
    const panel = document.getElementById("mobile-nav");
    if (!panel) return;

    let lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      panel.hidden = false;
      document.body.style.overflow = "hidden";
      const firstLink = panel.querySelector("a, button");
      if (firstLink) firstLink.focus();
      document.addEventListener("keydown", onKeydown);
    }
    function close() {
      panel.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }
    function onKeydown(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") trapFocus(e, panel);
    }

    openBtns.forEach((b) => b.addEventListener("click", open));
    closeBtns.forEach((b) => b.addEventListener("click", close));
    panel.addEventListener("click", (e) => {
      if (e.target === panel) close();
    });
  }

  function trapFocus(e, container) {
    const focusables = container.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------------------------------------
     Search modal (Ctrl/Cmd+K)
  --------------------------------------------------------- */
  function initSearch() {
    const modal = document.getElementById("search-modal");
    const openTriggers = document.querySelectorAll("[data-action='open-search']");
    const closeTriggers = document.querySelectorAll("[data-action='close-search']");
    if (!modal) return;
    const input = modal.querySelector("input[type='search']");
    let lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      if (input) {
        input.value = "";
        input.focus();
      }
      renderResults("");
      document.addEventListener("keydown", onKeydown);
    }
    function close() {
      modal.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }
    function onKeydown(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") trapFocus(e, modal.querySelector(".modal"));
    }

    document.addEventListener("keydown", (e) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        open();
      }
    });

    openTriggers.forEach((b) => b.addEventListener("click", open));
    closeTriggers.forEach((b) => b.addEventListener("click", close));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });

    if (input) {
      input.addEventListener("input", () => renderResults(input.value));
    }

    function renderResults(query) {
      const list = modal.querySelector("#search-results");
      if (!list) return;
      const q = query.trim().toLowerCase();
      const filtered = q
        ? window.PHARMA3D_SEARCH_INDEX.filter((item) =>
            (item.title + " " + item.description).toLowerCase().includes(q)
          )
        : window.PHARMA3D_SEARCH_INDEX;

      if (!filtered.length) {
        list.innerHTML =
          '<li class="search-empty" role="status">No matches. Try “capsule”, “formulation”, or “authors”.</li>';
        return;
      }

      list.innerHTML = filtered
        .slice(0, 8)
        .map(
          (item) => `
          <li>
            <a href="${item.url}" class="search-result-item">
              <span class="sr-title">${escapeHtml(item.title)}</span>
              <span class="sr-desc">${escapeHtml(item.description)}</span>
            </a>
          </li>`
        )
        .join("");
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------
     Toast system
  --------------------------------------------------------- */
  function ensureToastRegion() {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }

  function showToast(message, duration) {
    const region = ensureToastRegion();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 200ms ease";
      window.setTimeout(() => toast.remove(), 200);
    }, duration || 2600);
  }
  window.pharma3dToast = showToast;

  /* ---------------------------------------------------------
     Generic tabs
  --------------------------------------------------------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((wrapper) => {
      const tabs = Array.from(wrapper.querySelectorAll('[role="tab"]'));
      const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));

      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => activate(i));
        tab.addEventListener("keydown", (e) => {
          let idx = null;
          if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
          if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
          if (idx !== null) {
            e.preventDefault();
            tabs[idx].focus();
            activate(idx);
          }
        });
      });

      function activate(index) {
        tabs.forEach((t, i) => {
          const selected = i === index;
          t.setAttribute("aria-selected", selected ? "true" : "false");
          t.tabIndex = selected ? 0 : -1;
          if (panels[i]) panels[i].hidden = !selected;
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Accessibility menu (font size / contrast quick actions)
  --------------------------------------------------------- */
  function initAccessibilityMenu() {
    const drawer = document.getElementById("a11y-drawer");
    const overlay = document.getElementById("a11y-drawer-overlay");
    const openTriggers = document.querySelectorAll("[data-action='open-a11y']");
    const closeTriggers = document.querySelectorAll("[data-action='close-a11y']");
    if (!drawer) return;

    function open() {
      drawer.hidden = false;
      if (overlay) overlay.hidden = false;
      document.addEventListener("keydown", onKeydown);
    }
    function close() {
      drawer.hidden = true;
      if (overlay) overlay.hidden = true;
      document.removeEventListener("keydown", onKeydown);
    }
    function onKeydown(e) {
      if (e.key === "Escape") close();
    }
    openTriggers.forEach((b) => b.addEventListener("click", open));
    closeTriggers.forEach((b) => b.addEventListener("click", close));
    if (overlay) overlay.addEventListener("click", close);

    const textSizeBtns = drawer.querySelectorAll("[data-textsize]");
    const stored = localStorage.getItem("pharma3d:text-scale");
    if (stored) document.documentElement.style.setProperty("--user-text-scale", stored);

    textSizeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const scale = btn.getAttribute("data-textsize");
        document.documentElement.style.fontSize = scale + "%";
        localStorage.setItem("pharma3d:text-scale", scale);
        showToast("Text size updated");
      });
    });
  }

  /* ---------------------------------------------------------
     Set active nav link based on current path
  --------------------------------------------------------- */
  function markActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------------------------------------------------------
     Online / offline banner
  --------------------------------------------------------- */
  function initConnectivityBanner() {
    function update() {
      if (!navigator.onLine) {
        showToast("You’re offline — showing cached content", 4000);
      }
    }
    window.addEventListener("offline", update);
    window.addEventListener("online", () => showToast("Back online", 2000));
  }

  /* ---------------------------------------------------------
     PWA update-available toast
     Call window.pharma3dWatchForUpdates(registration) right
     after a successful service worker registration. Shows a
     persistent toast with a Reload action when a new version
     has installed and is waiting to activate.
  --------------------------------------------------------- */
  function watchForUpdates(registration) {
    if (!registration) return;

    function promptReload(reg) {
      const region = ensureToastRegion();
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.style.display = "flex";
      toast.style.alignItems = "center";
      toast.style.gap = "var(--space-3)";
      toast.innerHTML = `<span>An update to PHARMA 3D is ready.</span>`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary btn-sm";
      btn.textContent = "Reload";
      btn.style.minHeight = "36px";
      btn.addEventListener("click", () => {
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      });
      toast.appendChild(btn);
      region.appendChild(toast);
    }

    if (registration.waiting && navigator.serviceWorker.controller) {
      promptReload(registration);
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          promptReload(registration);
        }
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
  window.pharma3dWatchForUpdates = watchForUpdates;

  /* ---------------------------------------------------------
     Boot
     Header/nav/footer are injected by partials.js, so the
     controls they contain are wired up once partials signal
     they're in the DOM (falls back to DOMContentLoaded for
     any page that doesn't use partials).
  --------------------------------------------------------- */
  function bootChrome() {
    initTheme();
    initLiteMode();
    initMobileNav();
    initSearch();
    initAccessibilityMenu();
    markActiveNav();
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootChrome();
    initTabs();
    initConnectivityBanner();
  });
  document.addEventListener("pharma3d:partials-ready", bootChrome);
})();
