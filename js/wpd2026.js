/* =========================================================
   PHARMA 3D — World Pharmacist Day 2026
   Opening sequence, role carousel, thank-a-pharmacist (local
   only), share-card generator (client-side canvas), and
   Presentation Mode. No network calls, no external storage.
   ========================================================= */
(function () {
  "use strict";

  const SESSION_KEY = "pharma3d:wpd2026-intro-seen";
  const THANKS_KEY = "pharma3d:wpd2026-thanks";
  const MAX_CHARS = 200;

  const DOMAIN_COUNT = 18;

  /* ---------------------------------------------------------
     Opening sequence
  --------------------------------------------------------- */
  function initIntro() {
    const overlay = document.getElementById("wpd-intro");
    if (!overlay) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const liteOn = document.documentElement.getAttribute("data-lite") === "on";
    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadySeen) {
      overlay.hidden = true;
      return;
    }

    if (prefersReduced || liteOn) {
      renderStaticFallback(overlay);
      wireStaticControls(overlay);
      return;
    }

    runAnimatedSequence(overlay);
  }

  function markSeenAndClose(overlay) {
    sessionStorage.setItem(SESSION_KEY, "1");
    overlay.hidden = true;
    const heading = document.getElementById("wpd-main-heading");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  }

  function renderStaticFallback(overlay) {
    overlay.innerHTML = `
      <div class="wpd-intro-controls">
        <button type="button" class="btn btn-secondary btn-sm" data-action="wpd-view-credits">View credits</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="wpd-skip-intro">Skip</button>
      </div>
      <div class="wpd-intro-stage">
        <div class="wpd-static-card">
          <div class="wpd-emblem-static"><span data-icon="vial"></span></div>
          <p class="wpd-intro-title">World Pharmacist Day</p>
          <p class="wpd-intro-sub">2026 · 25 September</p>
          <p style="max-width:44ch;color:var(--text-secondary);">"Empowering pharmacists for healthier futures." Motion is reduced on this device — here is the static version of the opening card.</p>
          <button type="button" class="btn btn-primary" data-action="wpd-enter-site">Enter</button>
        </div>
      </div>`;
    if (window.PHARMA3D_ICONS) {
      overlay.querySelectorAll("[data-icon]").forEach((el) => {
        const name = el.getAttribute("data-icon");
        if (window.PHARMA3D_ICONS[name]) el.innerHTML = window.PHARMA3D_ICONS[name];
      });
    }
  }

  function wireStaticControls(overlay) {
    overlay.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.getAttribute("data-action");
      if (action === "wpd-skip-intro" || action === "wpd-enter-site") {
        markSeenAndClose(overlay);
      }
      if (action === "wpd-view-credits") {
        markSeenAndClose(overlay);
        const target = document.getElementById("wpd-credits");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function domainDots() {
    let dots = "";
    for (let i = 0; i < DOMAIN_COUNT; i++) {
      const angle = (360 / DOMAIN_COUNT) * i;
      const radius = 95;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * radius;
      const y = Math.sin(rad) * radius;
      dots += `<span class="wpd-domain-dot" style="transform:translate(${x}px,${y}px); animation-delay:${(i * 60)}ms;"></span>`;
    }
    return dots;
  }

  function runAnimatedSequence(overlay) {
    overlay.innerHTML = `
      <div class="wpd-intro-controls">
        <button type="button" class="btn btn-secondary btn-sm" data-action="wpd-view-credits">View credits</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="wpd-skip-intro">Skip</button>
      </div>
      <div class="wpd-intro-stage">

        <div class="wpd-scene is-active" data-scene="1">
          <div class="wpd-vial" aria-hidden="true">
            <svg viewBox="0 0 90 150">
              <path d="M30 10 H60 V45 L78 120 Q80 138 60 138 H30 Q10 138 12 120 L30 45 Z" fill="none" stroke="#2F7E6A" stroke-width="4" stroke-linejoin="round"/>
              <clipPath id="vialClip"><path d="M30 10 H60 V45 L78 120 Q80 138 60 138 H30 Q10 138 12 120 L30 45 Z"/></clipPath>
              <g clip-path="url(#vialClip)">
                <rect class="wpd-vial-fill" x="10" y="70" width="70" height="70" fill="#63C6A7"/>
                <circle class="wpd-vial-bubble" cx="38" cy="120" r="3" fill="#E9F7F2"/>
                <circle class="wpd-vial-bubble" cx="52" cy="128" r="2.4" fill="#E9F7F2" style="animation-delay:0.4s;"/>
              </g>
              <rect x="26" y="4" width="38" height="8" rx="2" fill="#1F2E2C"/>
            </svg>
          </div>
          <p class="wpd-intro-title">World Pharmacist Day</p>
        </div>

        <div class="wpd-scene" data-scene="2">
          <div class="wpd-molecule" aria-hidden="true">
            <svg viewBox="0 0 130 130">
              <g class="wpd-molecule-group">
                <line x1="65" y1="65" x2="65" y2="15" stroke="#2F7E6A" stroke-width="3"/>
                <line x1="65" y1="65" x2="108" y2="90" stroke="#2F7E6A" stroke-width="3"/>
                <line x1="65" y1="65" x2="22" y2="90" stroke="#2F7E6A" stroke-width="3"/>
                <line x1="65" y1="65" x2="95" y2="35" stroke="#63C6A7" stroke-width="3"/>
                <circle cx="65" cy="65" r="12" fill="#1F2E2C"/>
                <circle cx="65" cy="15" r="9" fill="#63C6A7"/>
                <circle cx="108" cy="90" r="9" fill="#63C6A7"/>
                <circle cx="22" cy="90" r="9" fill="#63C6A7"/>
                <circle cx="95" cy="35" r="7" fill="#BFE8D6" stroke="#2F7E6A" stroke-width="2"/>
              </g>
            </svg>
          </div>
          <p class="wpd-intro-sub">2026</p>
        </div>

        <div class="wpd-scene" data-scene="3">
          <div class="wpd-domain-ring" aria-hidden="true">
            ${domainDots()}
            <div class="wpd-domain-center">18 domains</div>
          </div>
          <p class="wpd-intro-sub">25 SEPTEMBER</p>
        </div>

        <div class="wpd-scene" data-scene="4">
          <div class="wpd-mortar" aria-hidden="true">
            <svg viewBox="0 0 130 130">
              <path d="M20 75 Q65 130 110 75 L100 78 Q65 112 30 78 Z" fill="#2F7E6A"/>
              <ellipse cx="65" cy="75" rx="45" ry="10" fill="#BFE8D6" stroke="#2F7E6A" stroke-width="2"/>
              <g class="wpd-pestle">
                <rect x="80" y="20" width="12" height="55" rx="6" fill="#1F2E2C"/>
                <ellipse cx="86" cy="18" rx="9" ry="7" fill="#1F2E2C"/>
              </g>
            </svg>
          </div>
          <p class="wpd-intro-title" style="font-size:clamp(1.1rem,1rem+1vw,1.6rem);">"Empowering pharmacists for healthier futures"</p>
        </div>

        <div class="wpd-scene" data-scene="5">
          <div class="wpd-emblem-static" style="width:110px;height:110px;border-radius:50%;background:var(--bg-surface);border:2px solid var(--accent-soft);display:flex;align-items:center;justify-content:center;">
            <span data-icon="users" style="width:52px;height:52px;color:var(--accent-strong);"></span>
          </div>
          <p class="wpd-intro-title" style="font-size:1.3rem;">Credits</p>
          <p style="color:var(--text-secondary);max-width:40ch;">PHARMA 3D · Karnajit Reang &amp; Kishaloy Debnath<br>RIPSAT, Tripura University</p>
          <button type="button" class="btn btn-primary" data-action="wpd-enter-site">Enter</button>
        </div>

      </div>
      <div class="wpd-intro-progress" aria-hidden="true">
        <span class="dot is-active"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>`;

    if (window.PHARMA3D_ICONS) {
      overlay.querySelectorAll("[data-icon]").forEach((el) => {
        const name = el.getAttribute("data-icon");
        if (window.PHARMA3D_ICONS[name]) el.innerHTML = window.PHARMA3D_ICONS[name];
      });
    }

    const scenes = Array.from(overlay.querySelectorAll(".wpd-scene"));
    const dots = Array.from(overlay.querySelectorAll(".wpd-intro-progress .dot"));
    let idx = 0;
    let timer = null;
    const durations = [1700, 1600, 1700, 1600, 1800]; // ~8.4s total

    function goTo(i) {
      scenes.forEach((s, si) => s.classList.toggle("is-active", si === i));
      dots.forEach((d, di) => d.classList.toggle("is-active", di === i));
      idx = i;
    }

    function step() {
      if (idx >= scenes.length - 1) return; // hold on credits scene until Enter
      goTo(idx + 1);
      timer = window.setTimeout(step, durations[idx] || 1600);
    }

    timer = window.setTimeout(step, durations[0]);

    overlay.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.getAttribute("data-action");
      if (action === "wpd-skip-intro" || action === "wpd-enter-site") {
        window.clearTimeout(timer);
        markSeenAndClose(overlay);
      }
      if (action === "wpd-view-credits") {
        window.clearTimeout(timer);
        goTo(scenes.length - 1);
      }
    });
  }

  /* ---------------------------------------------------------
     7-role carousel
  --------------------------------------------------------- */
  function initCarousel() {
    const track = document.getElementById("wpd-carousel-track");
    if (!track) return;
    const cards = Array.from(track.children);
    const prevBtn = document.getElementById("wpd-carousel-prev");
    const nextBtn = document.getElementById("wpd-carousel-next");
    const progress = document.getElementById("wpd-carousel-progress");

    function currentIndex() {
      const scrollLeft = track.scrollLeft;
      let closest = 0;
      let min = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - track.offsetLeft - scrollLeft);
        if (d < min) { min = d; closest = i; }
      });
      return closest;
    }

    function updateProgress() {
      const i = currentIndex();
      if (progress) progress.textContent = `${i + 1} / ${cards.length}`;
    }

    function scrollToIndex(i) {
      const clamped = Math.max(0, Math.min(cards.length - 1, i));
      cards[clamped].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => scrollToIndex(currentIndex() - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => scrollToIndex(currentIndex() + 1));
    track.addEventListener("scroll", () => {
      window.clearTimeout(track._t);
      track._t = window.setTimeout(updateProgress, 100);
    });
    updateProgress();
  }

  /* ---------------------------------------------------------
     Thank a Pharmacist (local-only, capped 200 chars)
  --------------------------------------------------------- */
  function readThanks() {
    try {
      const raw = localStorage.getItem(THANKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeThanks(list) {
    try {
      localStorage.setItem(THANKS_KEY, JSON.stringify(list.slice(0, 25)));
    } catch (e) {
      /* storage unavailable — feature degrades silently, form still works this session */
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderThanksList() {
    const list = document.getElementById("wpd-thanks-list");
    if (!list) return;
    const items = readThanks();
    if (!items.length) {
      list.innerHTML = `<p class="wpd-thanks-empty">No messages yet on this device. Be the first to add one below — it stays only in your browser.</p>`;
      return;
    }
    list.innerHTML = items
      .map(
        (item) => `
      <div class="wpd-thanks-item">
        <p>${escapeHtml(item.text)}</p>
        <time datetime="${item.date}">${new Date(item.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time>
      </div>`
      )
      .join("");
  }

  function initThanks() {
    const form = document.getElementById("wpd-thanks-form");
    const textarea = document.getElementById("wpd-thanks-input");
    const counter = document.getElementById("wpd-thanks-count");
    if (!form || !textarea) return;

    function updateCount() {
      const remaining = MAX_CHARS - textarea.value.length;
      if (counter) {
        counter.textContent = `${textarea.value.length} / ${MAX_CHARS}`;
        counter.classList.toggle("is-limit", remaining <= 20);
      }
    }
    textarea.setAttribute("maxlength", String(MAX_CHARS));
    textarea.addEventListener("input", updateCount);
    updateCount();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text) return;
      const capped = text.slice(0, MAX_CHARS);
      const items = readThanks();
      items.unshift({ text: capped, date: new Date().toISOString() });
      writeThanks(items);
      textarea.value = "";
      updateCount();
      renderThanksList();
      if (window.pharma3dToast) window.pharma3dToast("Thank-you message saved on this device");
    });

    renderThanksList();
  }

  /* ---------------------------------------------------------
     Share-card generator (client-side canvas, no upload)
  --------------------------------------------------------- */
  function drawShareCard(canvas, message) {
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#E9F7F2");
    grad.addColorStop(1, "#BFE8D6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#1F2E2C";
    ctx.fillRect(0, 0, W, 14);
    ctx.fillRect(0, H - 14, W, 14);

    ctx.fillStyle = "#2F7E6A";
    ctx.font = "600 34px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("25 SEPTEMBER 2026", W / 2, 150);

    ctx.fillStyle = "#1F2E2C";
    ctx.font = "700 64px 'Fraunces', Georgia, serif";
    wrapText(ctx, "World Pharmacist Day", W / 2, 250, 900, 74);

    ctx.fillStyle = "#2F7E6A";
    ctx.font = "italic 500 40px 'Fraunces', Georgia, serif";
    wrapText(ctx, '"Empowering pharmacists for healthier futures"', W / 2, 430, 820, 52);

    // vial glyph
    ctx.save();
    ctx.translate(W / 2 - 70, 560);
    ctx.strokeStyle = "#2F7E6A";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(30, 10); ctx.lineTo(90, 10); ctx.lineTo(90, 60);
    ctx.lineTo(118, 170); ctx.quadraticCurveTo(120, 200, 90, 200);
    ctx.lineTo(30, 200); ctx.quadraticCurveTo(0, 200, 2, 170);
    ctx.lineTo(30, 60); ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#63C6A7";
    ctx.fillRect(8, 130, 105, 65);
    ctx.restore();

    // mortar/pestle glyph
    ctx.save();
    ctx.translate(W / 2 + 40, 600);
    ctx.fillStyle = "#2F7E6A";
    ctx.beginPath();
    ctx.moveTo(0, 60); ctx.quadraticCurveTo(70, 150, 140, 60);
    ctx.lineTo(120, 66); ctx.quadraticCurveTo(70, 130, 20, 66);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1F2E2C";
    ctx.fillRect(95, 10, 16, 60);
    ctx.beginPath(); ctx.ellipse(103, 8, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (message) {
      ctx.fillStyle = "#1F2E2C";
      ctx.font = "500 32px 'IBM Plex Sans', sans-serif";
      wrapText(ctx, message, W / 2, 830, 860, 42);
    }

    ctx.fillStyle = "#3E524F";
    ctx.font = "400 26px 'IBM Plex Mono', monospace";
    ctx.fillText("PHARMA 3D · RIPSAT, Tripura University", W / 2, 990);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, curY);
  }

  function initShareCard() {
    const canvas = document.getElementById("wpd-share-canvas");
    const input = document.getElementById("wpd-share-message");
    const downloadBtn = document.getElementById("wpd-share-download");
    if (!canvas) return;

    function redraw() {
      try {
        drawShareCard(canvas, input ? input.value.trim().slice(0, 120) : "");
      } catch (e) {
        const wrap = canvas.closest(".wpd-share-canvas-frame");
        if (wrap) wrap.innerHTML = `<p style="padding:var(--space-6);text-align:center;color:var(--text-muted);">Share card preview unavailable in this browser. You can still copy the theme text: "World Pharmacist Day 2026 — Empowering pharmacists for healthier futures."</p>`;
      }
    }

    redraw();
    if (input) input.addEventListener("input", () => {
      window.clearTimeout(input._t);
      input._t = window.setTimeout(redraw, 200);
    });

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        try {
          const url = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = url;
          a.download = "world-pharmacist-day-2026.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          if (window.pharma3dToast) window.pharma3dToast("Share card downloaded");
        } catch (e) {
          if (window.pharma3dToast) window.pharma3dToast("Download not available — right-click the image and save instead");
        }
      });
    }
  }

  /* ---------------------------------------------------------
     Presentation Mode
  --------------------------------------------------------- */
  function initPresentationMode() {
    const trigger = document.getElementById("wpd-present-trigger");
    const overlay = document.getElementById("wpd-present");
    if (!trigger || !overlay) return;

    const slides = Array.from(overlay.querySelectorAll(".wpd-present-slide"));
    const countEl = document.getElementById("wpd-present-count");
    let idx = 0;
    let lastFocused = null;

    function render() {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      if (countEl) countEl.textContent = `${idx + 1} / ${slides.length}`;
    }

    function open() {
      lastFocused = document.activeElement;
      idx = 0;
      render();
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      const closeBtn = document.getElementById("wpd-present-exit");
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function next() { if (idx < slides.length - 1) { idx++; render(); } }
    function prev() { if (idx > 0) { idx--; render(); } }

    trigger.addEventListener("click", open);

    overlay.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.getAttribute("data-action");
      if (action === "wpd-present-exit") close();
      if (action === "wpd-present-next") next();
      if (action === "wpd-present-prev") prev();
    });

    document.addEventListener("keydown", (e) => {
      if (overlay.hidden) return;
      if (e.key === "Escape") { close(); }
      else if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); next(); }
      else if (e.key === "Backspace") { e.preventDefault(); prev(); }
      else if (e.key === "ArrowRight") { next(); }
      else if (e.key === "ArrowLeft") { prev(); }
    });
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  function initAll() {
    initIntro();
    initCarousel();
    initThanks();
    initShareCard();
    initPresentationMode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("pharma3d:partials-ready", initAll, { once: true });
  } else {
    // partials already rendered synchronously in this load
    document.addEventListener("pharma3d:partials-ready", initAll, { once: true });
  }
})();
