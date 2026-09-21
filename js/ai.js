/* =========================================================
   PHARMA 3D — AI page renderer
   Renders each topic with exactly eight sections, fixed order.
   ========================================================= */
(function () {
  "use strict";
  var esc = P4.esc;
  var SECTIONS = [
    ["what", "WHAT IT IS"],
    ["how", "HOW IT WORKS"],
    ["data", "DATA IT USES"],
    ["help", "WHAT IT CAN HELP WITH"],
    ["example", "REAL-WORLD EXAMPLE"],
    ["limits", "LIMITATIONS"],
    ["oversight", "HUMAN OVERSIGHT"],
    ["tier", "EVIDENCE TIER"]
  ];
  var TIER_NOTE = {
    "ESTABLISHED": "Widely used and well supported in this general role.",
    "SUPPORTED": "Supported by a growing body of evidence and use, with performance depending on the setting.",
    "EMERGING": "Early or research-stage in this role; evidence is limited and evolving."
  };
  var uid = 0;

  function detailHtml(t) {
    return '<div class="ai-sections">' + SECTIONS.map(function (s) {
      var cls = s[0] === "limits" ? " lim" : s[0] === "oversight" ? " human" : "";
      var body;
      if (s[0] === "tier") {
        var tier = t.tier;
        body = '<p><span class="badge badge-' + (tier === "ESTABLISHED" ? "established" : tier === "SUPPORTED" ? "supported" : "emerging") + '">' + esc(tier) + "</span></p><p style=\"margin-top:6px\">" + esc(TIER_NOTE[tier] || "") + "</p>";
      } else {
        body = "<p>" + esc(t[s[0]]) + "</p>";
      }
      return '<div class="s' + cls + '"><h4>' + s[1] + "</h4>" + body + "</div>";
    }).join("") + "</div>";
  }

  function render(rootId, list, prefix) {
    var root = document.getElementById(rootId);
    root.innerHTML = list.map(function (t, i) {
      var id = prefix + "-" + (++uid);
      return '<div class="ai-item"><button type="button" class="ai-tile" aria-expanded="false" aria-controls="' + id + '"><span class="ix" aria-hidden="true">' + (i + 1) + '</span><span class="t">' + esc(t.title) + '</span></button>' +
        '<div class="ai-detail" id="' + id + '" role="region" aria-label="' + esc(t.title) + ' details" hidden>' + detailHtml(t) + "</div></div>";
    }).join("");
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".ai-tile"); if (!b) return;
      var open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      document.getElementById(b.getAttribute("aria-controls")).hidden = open;
    });
  }

  render("pillars", window.P4_AI.pillars, "pl");
  render("apps", window.P4_AI.apps, "ap");
})();
