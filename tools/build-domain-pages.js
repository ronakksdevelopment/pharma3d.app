/* =========================================================
   PHARMA 3D — Domain page generator (dev-time only)
   Stamps /domain/[slug].html from ONE template using the slugs
   in data/domains.json. Output is committed, so deployment
   needs no build step.

   Run:  node tools/build-domain-pages.js
   ========================================================= */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const template = fs.readFileSync(path.join(root, "templates/domain-page.template.html"), "utf8");
const domains = JSON.parse(fs.readFileSync(path.join(root, "data/domains.json"), "utf8")).domains;

const outDir = path.join(root, "domain");
fs.mkdirSync(outDir, { recursive: true });

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

domains.forEach((d) => {
  const html = template
    .replace(/{{SLUG}}/g, esc(d.slug))
    .replace(/{{NAME}}/g, esc(d.name))
    .replace(/{{SHORT}}/g, esc(d.short));
  fs.writeFileSync(path.join(outDir, d.slug + ".html"), html);
});

console.log("Wrote " + domains.length + " domain pages to /domain.");
