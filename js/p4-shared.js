/* =========================================================
   PHARMA 3D — Phase 4 shared helpers
   Escaping, Canvas line chart (theme-aware), number formatting,
   tiny localStorage wrapper. Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmt(x, d) {
    if (x === null || x === undefined || !isFinite(x)) return "—";
    var n = Math.abs(x);
    if (d === undefined) d = n >= 100 ? 1 : n >= 10 ? 2 : n >= 1 ? 3 : 4;
    return Number(x).toFixed(d);
  }

  function store(key, fallback) {
    return {
      get: function () {
        try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
      },
      set: function (v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
    };
  }

  function cssVar(name, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fb;
  }

  /* Canvas line chart.
     series: [{ name, pts:[[x,y],...], dash:bool, colorVar }]
     opts: { xLabel, yLabel, xMin,xMax,yMin,yMax, w,h, marks:[{x,y,label}] } */
  function lineChart(canvas, series, opts) {
    opts = opts || {};
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = opts.w || 560, H = opts.h || 340;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.aspectRatio = W + " / " + H;
    var c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bg = cssVar("--bg-surface", "#fff");
    var ink = cssVar("--text-primary", "#1F2E2C");
    var mut = cssVar("--text-muted", "#5C726E");
    var grid = cssVar("--border-subtle", "#BFE8D6");
    var strong = cssVar("--accent-strong", "#1F2E2C");
    var acc = cssVar("--accent", "#2F7E6A");
    var soft = cssVar("--accent-soft", "#63C6A7");
    var palette = [strong, acc, soft, mut];

    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    var L = 52, R = 14, T = 14, B = 46;
    var xs = [], ys = [];
    series.forEach(function (s) { s.pts.forEach(function (p) { if (isFinite(p[0]) && isFinite(p[1])) { xs.push(p[0]); ys.push(p[1]); } }); });
    var xMin = opts.xMin !== undefined ? opts.xMin : Math.min.apply(null, xs);
    var xMax = opts.xMax !== undefined ? opts.xMax : Math.max.apply(null, xs);
    var yMin = opts.yMin !== undefined ? opts.yMin : Math.min(0, Math.min.apply(null, ys));
    var yMax = opts.yMax !== undefined ? opts.yMax : Math.max.apply(null, ys);
    if (xMax === xMin) xMax = xMin + 1;
    if (yMax === yMin) yMax = yMin + 1;
    var pad = (yMax - yMin) * 0.06; if (opts.yMax === undefined) yMax += pad;

    function X(x) { return L + (x - xMin) / (xMax - xMin) * (W - L - R); }
    function Y(y) { return H - B - (y - yMin) / (yMax - yMin) * (H - T - B); }

    c.font = "11px 'IBM Plex Mono', monospace"; c.fillStyle = mut; c.strokeStyle = grid; c.lineWidth = 1;
    var i, n = 5;
    for (i = 0; i <= n; i++) {
      var yv = yMin + (yMax - yMin) * i / n, yy = Y(yv);
      c.beginPath(); c.moveTo(L, yy); c.lineTo(W - R, yy); c.stroke();
      c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(fmt(yv, yMax > 20 ? 0 : yMax > 2 ? 1 : 2), L - 6, yy);
    }
    for (i = 0; i <= n; i++) {
      var xv = xMin + (xMax - xMin) * i / n, xx = X(xv);
      c.beginPath(); c.moveTo(xx, T); c.lineTo(xx, H - B); c.stroke();
      c.textAlign = "center"; c.textBaseline = "top"; c.fillText(fmt(xv, xMax > 20 ? 0 : xMax > 2 ? 1 : 2), xx, H - B + 6);
    }
    c.strokeStyle = ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, T); c.lineTo(L, H - B); c.lineTo(W - R, H - B); c.stroke();

    c.fillStyle = ink; c.font = "600 11.5px 'IBM Plex Sans', sans-serif";
    c.textAlign = "center"; c.textBaseline = "bottom";
    if (opts.xLabel) c.fillText(opts.xLabel, L + (W - L - R) / 2, H - 4);
    if (opts.yLabel) { c.save(); c.translate(12, T + (H - T - B) / 2); c.rotate(-Math.PI / 2); c.textBaseline = "top"; c.fillText(opts.yLabel, 0, -2); c.restore(); }

    series.forEach(function (s, si) {
      c.strokeStyle = s.color || palette[si % palette.length]; c.lineWidth = 2.5;
      c.setLineDash(s.dash ? [7, 5] : []);
      c.beginPath(); var started = false;
      s.pts.forEach(function (p) {
        if (!isFinite(p[0]) || !isFinite(p[1])) return;
        var px = X(p[0]), py = Y(p[1]);
        if (!started) { c.moveTo(px, py); started = true; } else c.lineTo(px, py);
      });
      c.stroke(); c.setLineDash([]);
    });

    (opts.marks || []).forEach(function (m) {
      c.fillStyle = strong; c.beginPath(); c.arc(X(m.x), Y(m.y), 5, 0, 7); c.fill();
      c.fillStyle = bg; c.beginPath(); c.arc(X(m.x), Y(m.y), 2, 0, 7); c.fill();
      if (m.label) {
        c.fillStyle = ink; c.font = "600 11px 'IBM Plex Sans', sans-serif"; c.textAlign = "left"; c.textBaseline = "bottom";
        var lx = X(m.x) + 8; if (lx > W - 80) { c.textAlign = "right"; lx = X(m.x) - 8; }
        c.fillText(m.label, lx, Y(m.y) - 4);
      }
    });

    if (series.length > 1) {
      var lx0 = L + 10, ly0 = T + 6;
      series.forEach(function (s, si) {
        c.strokeStyle = s.color || palette[si % palette.length]; c.lineWidth = 2.5; c.setLineDash(s.dash ? [6, 4] : []);
        c.beginPath(); c.moveTo(lx0, ly0 + si * 16 + 6); c.lineTo(lx0 + 22, ly0 + si * 16 + 6); c.stroke(); c.setLineDash([]);
        c.fillStyle = ink; c.font = "11px 'IBM Plex Sans', sans-serif"; c.textAlign = "left"; c.textBaseline = "middle";
        c.fillText(s.name, lx0 + 28, ly0 + si * 16 + 6);
      });
    }
  }

  function tableHtml(head, rows) {
    return '<div class="tbl-wrap" tabindex="0" role="region" aria-label="Data table"><table class="p4-tbl"><thead><tr>' +
      head.map(function (h) { return "<th scope=\"col\">" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div>";
  }

  function redrawOnTheme(fn) {
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", fn);
    }
  }

  window.P4 = { esc: esc, fmt: fmt, store: store, lineChart: lineChart, tableHtml: tableHtml, redrawOnTheme: redrawOnTheme };
})();
