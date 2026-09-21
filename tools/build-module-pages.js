/* =========================================================
   PHARMA 3D — Module page generator (dev-time only)
   Stamps the Drug, Plant, Instrument, Manufacturing and
   Formulation pages from ONE template. Output is committed, so
   deployment still needs no build step.

   Run:  node tools/build-module-pages.js
   ========================================================= */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const tpl = fs.readFileSync(path.join(root, "templates/module-page.template.html"), "utf8");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function crumbs(r, trail) {
  // trail: [[label, href|null], ...] after Home > Explore
  const parts = [`      <a href="${r}index.html">Home</a>`, `      <span aria-hidden="true">/</span>`, `      <a href="${r}explore.html">Explore</a>`];
  trail.forEach(([label, href], i) => {
    parts.push(`      <span aria-hidden="true">/</span>`);
    parts.push(href ? `      <a href="${r}${href}">${esc(label)}</a>` : `      <span aria-current="page">${esc(label)}</span>`);
  });
  return parts.join("\n");
}

function stamp(file, o) {
  const html = tpl
    .replace(/{{ROOT}}/g, o.root)
    .replace(/{{DATA_ATTR}}/g, o.dataAttr || "")
    .replace(/{{TITLE}}/g, esc(o.title))
    .replace(/{{DESC}}/g, esc(o.desc))
    .replace(/{{CRUMBS}}/g, o.crumbs)
    .replace(/{{SCRIPT}}/g, o.script)
    .replace(/{{DATAFILE}}/g, o.datafile)
    .replace(/{{ROOTID}}/g, o.rootId)
    .replace(/{{ROOTCLASS}}/g, o.rootClass || "")
    .replace(/{{EXTRA_SCRIPTS}}/g, o.extra || "");
  const out = path.join(root, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

let count = 0;

/* ---- Drugs ---- */
const drugs = read("drugs.json").drugs;
stamp("drug.html", { root: "", title: "Drug Explorer", desc: "Twelve drug monographs with a consistent ten-topic layout: class, uses, mechanism, pharmacokinetics, safety, interactions, monitoring and more.",
  crumbs: crumbs("", [["Drug Explorer", null]]), script: "drug-explorer.js", datafile: "drugs.json", rootId: "drug-root", rootClass: " mod-wide" }); count++;
drugs.forEach((d) => {
  stamp(`drug/${d.slug}.html`, { root: "../", dataAttr: ` data-drug="${esc(d.slug)}"`, title: d.name + " — Drug Explorer", desc: d.summary,
    crumbs: crumbs("../", [["Drug Explorer", "drug.html"], [d.name, null]]), script: "drug-explorer.js", datafile: "drugs.json", rootId: "drug-root" }); count++;
});

/* ---- Plants ---- */
const plants = read("plants.json").plants;
stamp("plants.html", { root: "", title: "Plant Explorer", desc: "Eight medicinal plants with traditional use kept strictly separate from experimental and scientific evidence.",
  crumbs: crumbs("", [["Plant Explorer", null]]), script: "plant-explorer.js", datafile: "plants.json", rootId: "plant-root", rootClass: " mod-wide" }); count++;
plants.forEach((p) => {
  stamp(`plants/${p.slug}.html`, { root: "../", dataAttr: ` data-plant="${esc(p.slug)}"`, title: p.name + " — Plant Explorer", desc: `${p.name} (${p.latin}): biological source, constituents, quality, and separate traditional-use and scientific-evidence sections.`,
    crumbs: crumbs("../", [["Plant Explorer", "plants.html"], [p.name, null]]), script: "plant-explorer.js", datafile: "plants.json", rootId: "plant-root" }); count++;
});

/* ---- Instruments ---- */
const inst = read("instruments.json").instruments;
stamp("instruments.html", { root: "", title: "Instruments", desc: "Seven pharmaceutical instruments explained through six fixed questions, with working calculators.",
  crumbs: crumbs("", [["Instruments", null]]), script: "instruments.js", datafile: "instruments.json", rootId: "inst-root", rootClass: " mod-wide",
  extra: '<script src="js/calculators.js"></script>' }); count++;
inst.forEach((x) => {
  stamp(`instruments/${x.id}.html`, { root: "../", dataAttr: ` data-instrument="${esc(x.id)}"`, title: x.name + " — Instruments", desc: x.short,
    crumbs: crumbs("../", [["Instruments", "instruments.html"], [x.name, null]]), script: "instruments.js", datafile: "instruments.json", rootId: "inst-root",
    extra: '<script src="../js/calculators.js"></script>' }); count++;
});

/* ---- Manufacturing ---- */
stamp("manufacturing.html", { root: "", title: "Manufacturing", desc: "Twelve stages from raw materials to batch release, with a defect explorer for common tablet defects.",
  crumbs: crumbs("", [["Manufacturing", null]]), script: "manufacturing.js", datafile: "manufacturing.json", rootId: "mfg-root", rootClass: " mod-wide" }); count++;

/* ---- Formulation ---- */
stamp("formulation.html", { root: "", title: "Formulation", desc: "An exploded 2D tablet diagram and a comparison of immediate, sustained and enteric release systems.",
  crumbs: crumbs("", [["Formulation", null]]), script: "formulation.js", datafile: "formulation.json", rootId: "formu-root", rootClass: " mod-wide" }); count++;

console.log("Wrote " + count + " pages.");
