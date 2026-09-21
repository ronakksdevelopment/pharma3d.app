/* =========================================================
   PHARMA 3D — Search corpus generator (dev-time only)
   Reads data/domains.json + data/relationships.json and writes
   data/search-corpus.json. Only content that ACTUALLY EXISTS is
   indexed: domains, concepts (from the relationship chains) and
   live modules. Categories with no real content yet (drugs,
   plants, instruments, AI section, learning) are deliberately
   left empty rather than invented.

   Run:  node tools/build-search-corpus.js
   ========================================================= */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const domains = JSON.parse(fs.readFileSync(path.join(root, "data/domains.json"), "utf8")).domains;
const rel = JSON.parse(fs.readFileSync(path.join(root, "data/relationships.json"), "utf8"));
const bySlug = Object.fromEntries(domains.map((d) => [d.slug, d]));

// Curated one-line concept explanations. General, textbook-level, non-clinical.
const CONCEPT_TEXT = {
  drug: {
    short: "A substance used to prevent, diagnose or treat disease, or to change a body function.",
    deeper: "In pharmacy a drug is studied from many angles at once: its structure, how it acts on the body, how it is formulated, how its quality is measured and how its safety is monitored. This site connects those angles rather than treating them separately.",
    evidence: "ESTABLISHED"
  },
  mechanism: {
    short: "The specific way a drug produces its effect, usually by acting on a molecular target.",
    deeper: "Mechanism of action typically describes binding to a receptor, enzyme, transporter or ion channel and the downstream change that follows. Understanding mechanism helps predict effects, interactions and adverse reactions.",
    evidence: "ESTABLISHED"
  },
  formulation: {
    short: "The design of a dosage form so a drug can be given safely, stably and effectively.",
    deeper: "Formulation combines the active substance with excipients and a manufacturing process to produce a tablet, capsule, liquid, cream, injection or other form. Choices here influence stability, release and patient acceptability.",
    evidence: "ESTABLISHED"
  },
  analysis: {
    short: "Testing that confirms the identity, purity and strength of a medicine.",
    deeper: "Analytical methods such as titration, spectroscopy and chromatography are validated for their purpose and used by quality control laboratories to decide whether a batch meets its specification.",
    evidence: "ESTABLISHED"
  },
  safety: {
    short: "The study and assurance that the benefits of a medicine outweigh its risks.",
    deeper: "Safety work spans preclinical testing, clinical trials, manufacturing quality, microbial control and post-marketing surveillance. It is continuous rather than a single checkpoint.",
    evidence: "ESTABLISHED"
  },
  pharmacovigilance: {
    short: "Detecting, assessing and preventing adverse effects of medicines after approval.",
    deeper: "Reports from healthcare professionals and patients are collected and analysed together to identify safety signals that trials may have missed, and to communicate identified risks.",
    evidence: "ESTABLISHED"
  },
  "clinical-pharmacy": {
    short: "Pharmacist-led optimisation of medicine use for individual patients.",
    deeper: "It includes medication review and reconciliation, monitoring, dose individualisation and collaboration with prescribers and care teams.",
    evidence: "ESTABLISHED"
  },
  ai: {
    short: "Machine learning and data tools applied to tasks across the medicine pathway.",
    deeper: "Applications under exploration include property prediction, compound screening, safety data analysis and decision support. Outputs depend on data quality and need professional oversight; much of the evidence is still developing.",
    evidence: "EMERGING"
  },
  chitosan: {
    short: "A polysaccharide derived from chitin, studied as a material in pharmaceutical formulation and delivery research.",
    deeper: "Chitosan is investigated for uses such as forming particles, films and gels in delivery systems. Its properties depend on source and processing, and specific claims about performance require verification against current primary literature. A dedicated Chitosan Lab module is planned and does not exist yet.",
    evidence: "SUPPORTED"
  },
  pharmaceutics: {
    short: "The science of designing and evaluating dosage forms.",
    deeper: "Pharmaceutics connects a drug's physical and chemical properties to how it is formulated, manufactured and used.",
    evidence: "ESTABLISHED"
  },
  nanotechnology: {
    short: "Engineering drug carriers at the nanometre scale to change dissolution, protection, distribution or release.",
    deeper: "Examples include liposomes, polymeric nanoparticles and lipid nanoparticles. Some nanomedicines are established products while many concepts remain in research.",
    evidence: "SUPPORTED"
  },
  biopharmaceutics: {
    short: "How a dosage form's properties affect the rate and extent of drug absorption.",
    deeper: "Dissolution, solubility, permeability and bioavailability link formulation to pharmacokinetics.",
    evidence: "ESTABLISHED"
  },
  "pharmaceutical-analysis": {
    short: "Chemical and instrumental methods for testing the quality of medicines.",
    deeper: "It covers assay, impurity and dissolution testing, and the validation that makes those methods trustworthy.",
    evidence: "ESTABLISHED"
  },
  "drug-delivery": {
    short: "Approaches for getting a drug to where it is needed, at the right rate, in the right form.",
    deeper: "Delivery draws on formulation design, absorption science, nanoscale carriers and manufacturing. It is a meeting point of several domains rather than a single discipline.",
    evidence: "ESTABLISHED"
  }
};

function chainNeighbours(conceptId) {
  const out = new Set();
  rel.chains.forEach((c) => {
    const i = c.nodes.indexOf(conceptId);
    if (i > -1) {
      if (c.nodes[i - 1]) out.add(c.nodes[i - 1]);
      if (c.nodes[i + 1]) out.add(c.nodes[i + 1]);
    }
  });
  return [...out];
}

const entries = [];

/* ---- Domains ---- */
domains.forEach((d) => {
  const relatedIds = rel.edges
    .filter((e) => e.a === d.slug || e.b === d.slug)
    .map((e) => (e.a === d.slug ? e.b : e.a));
  entries.push({
    id: "domain:" + d.slug,
    category: "domain",
    title: d.name,
    keywords: [d.slug.replace(/-/g, " "), ...d.categories.map((c) => c.toLowerCase())],
    shortAnswer: d.short,
    deeper: d.whatIsIt,
    visual: { type: "domain-node", slug: d.slug },
    related: relatedIds.map((s) => ({ kind: "domain", id: s })),
    references: d.references,
    evidence: d.evidence,
    url: "domain/" + d.slug + ".html"
  });
});

/* ---- Concepts (only those with curated text) ---- */
Object.entries(rel.concepts).forEach(([id, c]) => {
  const t = CONCEPT_TEXT[id];
  if (!t) return;
  // Skip concepts that are exactly a domain (avoid duplicate results)
  if (bySlug[id]) return;
  const relatedDomains = c.domains.map((s) => ({ kind: "domain", id: s }));
  const relatedConcepts = chainNeighbours(id).map((n) => ({ kind: "concept", id: n }));
  entries.push({
    id: "concept:" + id,
    category: "concept",
    title: c.label,
    keywords: [id.replace(/-/g, " ")],
    shortAnswer: t.short,
    deeper: t.deeper,
    visual: { type: "chain", concept: id },
    related: [...relatedConcepts, ...relatedDomains],
    references: [
      {
        source: "See the reference lists on the linked domain pages",
        type: "Pointer",
        purpose: "Concept summary; sources are held on the related domain pages.",
        verify: "Yes. Verify any statement against primary sources before citing."
      }
    ],
    evidence: t.evidence,
    url: "search.html?concept=" + id
  });
});

/* ---- Live modules only ---- */
rel.modules.items
  .filter((m) => m.status === "live")
  .forEach((m) => {
    entries.push({
      id: "module:" + m.id,
      category: "module",
      title: m.label,
      keywords: [m.id.replace(/-/g, " ")],
      shortAnswer:
        m.id === "universe"
          ? "An interactive map of 18 pharmacy domains and how they connect."
          : m.id === "explore"
          ? "A hub linking the universe, search and the explorer modules."
          : m.id === "drug-explorer"
          ? "Twelve drug monographs with a consistent ten-topic layout."
          : m.id === "plant-explorer"
          ? "Eight medicinal plants, with traditional use kept separate from scientific evidence."
          : m.id === "instruments"
          ? "Seven pharmaceutical instruments with working learning calculators."
          : m.id === "manufacturing"
          ? "Twelve manufacturing stages from raw materials to batch release, plus a tablet defect explorer."
          : m.id === "formulation"
          ? "An exploded tablet diagram and a comparison of immediate, sustained and enteric release."
          : m.id === "chitosan-lab"
          ? "A seven-stage path through chitosan nanoparticles by ionic gelation, with a schematic diagram, parameter panel, EE% and DL% calculators and a release-model laboratory."
          : m.id === "pk-lab"
          ? "Illustrative one-compartment, oral (Bateman) and IV bolus models computing Cmax, Tmax, AUC, half-life, clearance, Vd and F."
          : m.id === "pharmacovigilance-module"
          ? "The chain from medicine to regulatory action, a fictional Naranjo case, and PRR, ROR and chi-square signal detection."
          : m.id === "ai-section"
          ? "Six pillars and ten applications of AI in pharmacy, each with limitations, human oversight and an evidence tier."
          : m.id === "learning-center"
          ? "Practice MCQs, Leitner flashcards, viva chains, a progress dashboard and a timed exam mode."
          : "Search across all indexed domains, concepts and modules.",
      deeper:
        "A live page on this site. Modules that are not yet built are not indexed.",
      visual: { type: "none" },
      related: [],
      references: [
        {
          source: "This site",
          type: "Internal page",
          purpose: "Navigation.",
          verify: "Not applicable. Internal link."
        }
      ],
      evidence: "ESTABLISHED",
      url: m.url
    });
  });


/* ---- Drugs, plants, instruments (only content that exists) ---- */
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));
const drugRefs = (r) => r;

readJson("drugs.json").drugs.forEach((d) => {
  entries.push({
    id: "drug:" + d.slug,
    category: "drug",
    title: d.name,
    keywords: [d.slug, d.family.toLowerCase(), d.alsoKnownAs].filter(Boolean),
    shortAnswer: d.summary,
    deeper: d["class"] + " " + d.mechanism[0],
    visual: { type: "none" },
    related: [{ kind: "domain", id: "pharmacology" }, { kind: "domain", id: "clinical-pharmacy" }],
    references: drugRefs(d.references),
    evidence: d.evidence,
    url: "drug/" + d.slug + ".html"
  });
});

readJson("plants.json").plants.forEach((p) => {
  entries.push({
    id: "plant:" + p.slug,
    category: "plant",
    title: p.name,
    keywords: [p.latin, p.family.toLowerCase(), p.slug.replace(/-/g, " ")],
    shortAnswer: p.name + " (" + p.latin + "), family " + p.family + ". Traditional use and scientific evidence are shown separately.",
    deeper: p.significance,
    visual: { type: "none" },
    related: [{ kind: "domain", id: "pharmacognosy" }],
    references: p.references,
    evidence: p.scientific.tier,
    url: "plants/" + p.slug + ".html"
  });
});

readJson("instruments.json").instruments.forEach((i) => {
  entries.push({
    id: "instrument:" + i.id,
    category: "instrument",
    title: i.name,
    keywords: [i.id.replace(/-/g, " ")],
    shortAnswer: i.short,
    deeper: i.how,
    visual: { type: "none" },
    related: [{ kind: "domain", id: "pharmaceutical-analysis" }],
    references: i.references,
    evidence: i.evidence,
    url: "instruments/" + i.id + ".html"
  });
});

const corpus = {
  meta: {
    generated: "by tools/build-search-corpus.js",
    categories: ["domain", "concept", "module", "drug", "plant", "instrument"],
    emptyCategoriesNote:
      "AI section and learning entries are intentionally absent: that content does not exist yet in this build."
  },
  entries
};

fs.writeFileSync(path.join(root, "data/search-corpus.json"), JSON.stringify(corpus, null, 2));
console.log("Wrote " + entries.length + " search entries.");
