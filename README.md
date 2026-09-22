# PHARMA 3D — The Interactive World of Pharmacy
### World Pharmacist Day 2026 Special Edition — RIPSAT

## Purpose
PHARMA 3D is a mobile-first, installable Progressive Web App (PWA) foundation for an
interactive pharmaceutical-science learning experience, built for World Pharmacist Day 2026
("Empowering pharmacists for healthier futures", 25 September 2026).

Created by **Karnajit Reang** and **Kishaloy Debnath**, Regional Institute of Pharmaceutical
Science and Technology (RIPSAT), Tripura University, Agartala, Tripura, India.

This repository contains the **complete, final build**: the foundation (architecture, navigation,
design system, homepage, shell pages), the Pharmacy Universe (18-domain network map, relationship
graph and site-wide search), the Drug Explorer (12 drugs), Plant Explorer (8 plants), Instruments
(7 instruments with calculators), Manufacturing and Formulation modules, the Chitosan nanoparticle
lab, the Pharmacokinetic lab, the Pharmacovigilance module, the AI in Pharmacy module, the Learning
Centre (MCQs, flashcards, viva chains, progress dashboard, timed exam mode), the World Pharmacist
Day 2026 experience (opening sequence, journey, Thank a Pharmacist, share-card generator,
Presentation Mode) and the Authors page. All pages have been smoke-tested end to end; see
`QA-REPORT.md` for the full test log.

## Tech stack
- Plain **HTML5**, **CSS3**, **vanilla JavaScript** — no frameworks, no build tools, no backend.
- Static files only — deploy directly to **GitHub Pages** (or any static host).
- Fonts: **Fraunces** (headings), **IBM Plex Sans** (body), **IBM Plex Mono** (data/equations),
  loaded via Google Fonts.
- PWA: `manifest.json` + `service-worker.js` for offline caching and installability.

## Project structure
```
/index.html              Homepage (hero, SVG molecule, orbit icons, progress path)
/explore.html            Explore hub: Universe, search, planned modules, relationship chains, nine topic doors
/universe.html           Pharmacy Universe: 18-domain network map + list view
/search.html             Search results page and answer page (?q=, ?entry=, ?concept=)
/domain/[slug].html      18 domain pages, generated from ONE template
/drug.html               Drug Explorer index (12 drugs)
/drug/[slug].html        12 drug pages, generated from ONE template
/plants.html             Plant Explorer index (8 plants)
/plants/[slug].html      8 plant pages, generated from ONE template
/instruments.html        Instruments index + calculator hub (7 instruments)
/instruments/[id].html   7 instrument pages, generated from ONE template
/manufacturing.html      12 stages in order + defect explorer (6 defects)
/formulation.html        Exploded 2D tablet diagram + release-system comparison
/chitosan.html           Chitosan nanoparticle module (Phase 4)
/lab.html                Pharmacokinetic laboratory (Phase 4)
/pharmacovigilance.html  Pharmacovigilance module (Phase 4)
/ai.html                 AI in Pharmacy: 6 pillars + 10 applications (Phase 4)
/learn.html              Learning centre: MCQs, flashcards, viva, dashboard, timed exam (Phase 4)
/wpd-2026.html           World Pharmacist Day 2026 — full build: opening sequence, journey, 7-role
                         carousel, About + FIP link, Thank a Pharmacist, share-card generator, credits,
                         Presentation Mode (Part 5)
/about-authors.html      Authors page with photo placeholders
/offline.html  /404.html Fallback pages
/manifest.json           PWA manifest
/service-worker.js       Offline caching service worker (cache v1.4.1)

/css/tokens.css          Design tokens (color, type, spacing, motion)
/css/base.css            Reset + global element styles
/css/components.css      Reusable components (buttons, cards, badges, modal, etc.)
/css/layout.css          Header, nav, footer, bottom nav
/css/home.css            Homepage-specific styles
/css/universe.css        Network diagram, filters, tooltip, bottom sheet, list cards
/css/domain.css          Domain page sections + related-topics component
/css/search.css          Search modal upgrade + results/answer pages
/css/modules.css         Explorer modules: topic nav, accordions, evidence blocks, calculators
/css/phase4.css          Phase 4 modules: learning path, model labs, AI tiles, learn/exam UI
/css/wpd2026.css         World Pharmacist Day 2026: opening sequence, carousel, thank-you, share card, presentation mode

/js/app.js               Core behavior (theme, Lite Mode, modal shell, a11y). Unchanged.
/js/partials.js          Injects shared header/nav/footer. Unchanged.
/js/icons.js             Inline SVG icon library. Unchanged.
/js/search-index.js      Legacy static index used by app.js. Unchanged; superseded in the UI by search.js.
/js/paths.js             Fixes relative URLs for pages nested in /domain/
/js/data-store.js        Shared JSON loader + small helpers (escape, evidence badge)
/js/related.js           Reusable related-topics component driven by the relationship graph
/js/universe.js          Universe map, filters, tooltip, bottom sheet, list view
/js/domain-page.js       Domain page renderer (9 sections in fixed order)
/js/explore-hub.js       Data-driven parts of the Explore hub
/js/search.js            Fuse.js search, modal upgrade, results + answer pages
/js/module-ui.js         Shared helpers: accordion, topic nav (tabs), references, prev/next, copy
/js/drug-explorer.js     Drug index + drug page renderer (10 topics)
/js/plant-explorer.js    Plant index + plant page renderer (traditional vs scientific blocks)
/js/instruments.js       Instrument index + page renderer (6 fixed sections + calculator)
/js/calculators.js       Calculator cards; pure math exposed as window.P3DCalc.math
/js/manufacturing.js     Stage explorer + defect explorer
/js/formulation.js       Exploded tablet SVG + release-system comparison
/js/p4-shared.js         Phase 4 helpers: escaping, theme-aware Canvas line chart, tables, storage
/js/wpd2026.js           WPD 2026: opening sequence, role carousel, Thank a Pharmacist, share-card canvas, Presentation Mode
/js/chitosan.js          Chitosan path, SVG parts, parameter panel, calculators, release models
/js/lab.js               Pharmacokinetic models (one-compartment, Bateman, IV bolus)
/js/pharmacovigilance.js Chain, terminology, Naranjo scoring, PRR/ROR/chi-square
/js/ai-data.js           Content for 6 pillars + 10 applications (8 fixed fields each)
/js/ai.js                Renders the AI topics in a fixed eight-section order
/js/learn-mcq.js         Question bank (71 MCQs, four tiers)
/js/learn-cards.js       36 flashcards + 12 viva chains
/js/learn.js             Practice, Leitner tracker, viva, dashboard, timed exam

/data/domains.json         Content for the 18 domains (single source of truth)
/data/relationships.json   Concept chains, domain edges, module registry (drives all related content)
/data/universe-layout.json Frozen node positions + edge curvature for the map
/data/search-corpus.json   Generated search entries (only content that exists)
/data/drugs.json           12 drug monographs + RDKit-verified structure data
/data/plants.json          8 plant monographs, traditional and scientific blocks kept separate
/data/instruments.json     7 instruments, six fixed fields each
/data/manufacturing.json   12 stages + 6 defects
/data/formulation.json     Tablet layers + 3 release systems

/templates/domain-page.template.html   The one reusable domain page template
/templates/module-page.template.html   The one reusable template for the Phase 3 modules
/tools/build-domain-pages.js           Stamps /domain/*.html from the template (dev-time)
/tools/build-module-pages.js           Stamps drug, plants, instruments, manufacturing, formulation pages (dev-time)
/tools/build-search-corpus.js          Regenerates data/search-corpus.json (dev-time)
/tools/_drugs_part1.py, _drugs_part2.py, _assemble_drugs.py, _plants.py, _instruments.py,
       _manufacturing.py, _formulation.py   Content authoring scripts (dev-time, Python 3)
/assets/                  Logo and generated PWA icons
```

## How to run locally
No build step required. From the project root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser. Any static file server works
(e.g. `npx serve`, VS Code Live Server).

> Note: the service worker requires a real HTTP origin (not `file://`) to register. The Universe,
> domain pages and search also `fetch()` JSON files, so they need HTTP as well. Opening files
> directly from disk will show a friendly "could not load" message instead of the content.

## Deploying to GitHub Pages
1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch, root folder.
3. The included `.nojekyll` file prevents GitHub's Jekyll processor from touching
   the `_`-prefixed or other static files.
4. Visit `https://<username>.github.io/<repo>/`.

## PWA notes
- **Installable** on desktop (Chrome/Edge "Install app") and mobile (Android "Add to Home
  Screen"; iOS Safari "Add to Home Screen" via the share sheet — iOS meta tags are included).
- **Offline caching**: the service worker precaches all core pages, styles, scripts and icons
  on first visit, then serves cached content when offline (`offline.html` is shown for
  uncached navigations).
- **Icons**: standard (192/512), maskable (192/512), Apple touch icon, and multi-size favicon
  were all generated from the supplied `assets/logo.png`.
- **Theme & Lite Mode**: both persist via `localStorage` and are available from the header,
  mobile menu, and the accessibility drawer.
- **Installing**: desktop Chrome/Edge show an install icon in the address bar (or Menu →
  Install PHARMA 3D); Android Chrome shows an "Add to Home screen" / install banner; iOS Safari
  uses Share → Add to Home Screen. Once installed, the app opens standalone with the wired icons
  and a splash screen generated from `assets/logo.png`.
- **Updates**: when a new version of the site is deployed, the service worker installs it in the
  background and a "Reload" toast appears (see `window.pharma3dWatchForUpdates` in `js/app.js`)
  rather than switching versions silently underneath an open tab.

## Content verification rules
- Every factual claim about real people, institutions, or organizations (RIPSAT, Tripura
  University, the authors, FIP/World Pharmacist Day) is either independently verifiable public
  information or was explicitly supplied for this project. Nothing about the authors — bios,
  credentials, research interests, or contact details — was invented; anything not supplied is
  left as a clearly marked placeholder (see "Author photo placeholders" below).
- `wpd-2026.html` does not reproduce FIP's official logo and does not claim FIP endorsement; it
  links out to FIP's own page for current official materials and includes an on-page data
  verification notice.
- Drug, plant, domain, and instrument content elsewhere in the app follows the same rule: no
  invented dosing, no invented clinical claims, and calculators are labelled **USER CALCULATED**
  with any pre-filled values labelled **ILLUSTRATIVE**.

## Logo placement
The logo you provided was found at build time and is already wired in at:
`/assets/logo.png`

It is used for:
- Header brand mark and mobile nav header
- Footer brand mark
- PWA manifest icons (`/assets/icons/icon-*.png`, maskable variants)
- Favicon and Apple touch icon
- Splash screen graphic
- World Pharmacist Day 2026 emblem, opening sequence, and share-card generator

**To replace the logo later:** overwrite `/assets/logo.png` with a new **square** PNG
(1024×1024px or larger recommended) and regenerate the derived icon files in
`/assets/icons/` at the same sizes (192, 512, maskable 192/512, apple-touch-icon 180,
favicons 16/32/48). Any image-editing tool or script that resizes a square PNG to those
dimensions will work — no special tooling is required.

## Author photo placeholders
`about-authors.html` contains two dashed placeholder circles, clearly commented in the
HTML, marking where to drop in real author photos (e.g.
`/assets/authors/karnajit-reang.jpg` and `/assets/authors/kishaloy-debnath.jpg`).

## Non-affiliation notice
PHARMA 3D is an independent educational project created by the individuals named above.
It is not an official publication of, and is not endorsed or certified by, Tripura
University or RIPSAT.

## Phase 2: Pharmacy Universe, domain pages, relationship graph, search

### What was added
- **Pharmacy Universe** (`/universe.html`): a flat 2D SVG network of exactly 18 domains:
  Pharmacognosy, Pharmaceutics, Pharmacology, Medicinal Chemistry, Pharmaceutical Analysis,
  Clinical Pharmacy, Pharmacovigilance, Pharmaceutical Microbiology, Biopharmaceutics,
  Biostatistics, Pharmaceutical Biotechnology, Nanotechnology, Drug Discovery, Regulatory Science,
  Industrial Pharmacy, Community Pharmacy, Public Health, AI in Pharmacy.
  - Desktop: hover shows a tooltip and highlights connections. Click or tap opens a panel
    (bottom sheet on mobile, docked side panel at 1024px and above) with a summary and a link to the full page.
  - Filters: DISCOVERY, DEVELOPMENT, DELIVERY, SAFETY, CARE (multi-select). One filter state drives both views.
  - **List view** is a complete keyboard-accessible alternative: compact cards styled like
    loyalty-app list items with progress-style depth bars. The bars are illustrative depth
    indicators only. They are not a score, reward or ranking.
  - Node positions are stored in `data/universe-layout.json`. They were computed so that no
    relationship line passes through a third node.
- **Domain pages** (`/domain/[slug].html`), from one template, each with these sections in order:
  What is it, Where does it fit, Three key ideas, What do pharmacists do here, Related domains,
  Site modules, Practise this domain, References, Previous/Next.
- **Relationship graph** (`data/relationships.json`): two chains
  (Drug, Mechanism, Formulation, Analysis, Safety, Pharmacovigilance, Clinical pharmacy, AI; and
  Chitosan, Pharmaceutics, Nanotechnology, Biopharmaceutics, Pharmaceutical analysis, Drug delivery),
  34 domain-to-domain edges, and a module registry. `js/related.js` renders every "related" section
  from this file. No page hardcodes its related links.
- **Site search** (`js/search.js`): Fuse.js loaded from a CDN script tag (no build step), typo
  tolerant, with a "did you mean" hint. Opens with Ctrl/Cmd+K or the header search icon. Mobile
  layout is full screen with a prominent input, category chips, tappable result cards and a back
  button. `/search.html` holds the full results list and the answer page
  (Short answer, Deeper explanation, Visual, Related topics, References).
  - If the CDN is unreachable, search falls back to exact substring matching and says so.
  - **Only content that exists is indexed** (18 domains, 8 concepts, 3 live modules).
    The Drugs, Plants, Instruments, AI and Learning chips are shown **disabled** because no such
    content exists yet.
- **Explore hub** (`/explore.html`): links to the Universe, list view and search; shows planned
  modules (unlinked, marked Planned) and the relationship chains. The nine original topic anchors
  are preserved below the hub because the homepage links to them.

### Evidence tiers
Every content entry carries exactly one of: `ESTABLISHED`, `SUPPORTED`, `EMERGING`, `TRADITIONAL`,
`DATA PENDING VERIFICATION`. Most domains are `ESTABLISHED` (textbook-level overviews). Nanotechnology
is `SUPPORTED` and AI in Pharmacy is `EMERGING`, reflecting how much of those areas is still developing.

### References policy
Every reference has **Source, Type, Purpose, Verify before citing**. References are deliberately
**source pointers** (for example "the pharmacopoeia of your jurisdiction", "ICH guideline on
validation of analytical procedures", "a standard pharmacology textbook, edition per your course").
They contain **no DOIs, PMIDs, page numbers, specific article titles or invented citations**.
Each one is marked to be verified against the source itself before use. Two entries are explicitly
labelled as search directions rather than citations.

### Content notes
- All domain text is general, textbook-level education. It contains no dosing, treatment advice,
  clinical claims or regulatory rulings, and no research findings.
- Regulatory content points readers to their own national or regional regulator, since requirements
  differ by jurisdiction and change over time.
- Chitosan is represented only as a concept entry plus a link in the relationship chain. Its
  performance claims are not asserted, and the Chitosan Lab does not exist yet.
- **All content should be reviewed by a qualified subject expert before public release.**

### Editing content
- Change domain text in `data/domains.json`, then run `node tools/build-search-corpus.js`.
- Add or change relationships in `data/relationships.json`. Related sections update automatically.
  If you move nodes or add edges on the map, update `data/universe-layout.json` to match.
- To add a domain: add it to `domains.json` and `universe-layout.json`, then run both build scripts
  in `/tools`. The generator stamps the new `/domain/[slug].html`. Add it to the service worker
  precache list if you want it available offline on first load.
- Build scripts need Node.js but are dev-time only. The generated output is committed, so deployment
  is still just static files.

## Phase 3: Drug Explorer, Plant Explorer, Instruments, Manufacturing, Formulation

### What was added
- **Drug Explorer** (`/drug.html`, `/drug/[slug].html`): exactly 12 drugs: Paracetamol, Ibuprofen,
  Aspirin, Atenolol, Metformin, Amoxicillin, Atorvastatin, Salbutamol, Omeprazole, Warfarin,
  Ciprofloxacin, Levothyroxine. Each page has ten progress-style topics (Class & uses, Mechanism,
  Forms & routes, Pharmacokinetics, Safety, Interactions, Monitoring & counselling, Pharmaceutical,
  Structure data, References) covering class, uses, mechanism, dosage forms, routes, pharmacokinetics,
  adverse effects, contraindications, precautions, interactions, monitoring, counselling points,
  pharmaceutical considerations, storage and references. Accordions inside each topic.
- **Plant Explorer** (`/plants.html`, `/plants/[slug].html`): exactly 8 plants: Turmeric, Cinchona,
  Catharanthus roseus, Rauvolfia serpentina, Digitalis, Papaver somniferum, Tulsi, Ashwagandha.
- **Instruments** (`/instruments.html`, `/instruments/[id].html`): microscope, HPLC, UV-Vis
  spectrophotometer, dissolution apparatus, tablet press, capsule filler, centrifuge. Each page has
  WHAT IT MEASURES, HOW IT WORKS, SAMPLE, OUTPUT, APPLICATION, COMMON ERRORS, plus a calculator card.
- **Manufacturing** (`/manufacturing.html`): 12 stages in order (raw materials, dispensing,
  granulation, drying, blending, compression, coating, filling, packaging, QC, QA, batch release),
  each with equipment, purpose, critical process parameters, common defects, in-process checks and GMP
  relevance. **Defect explorer** for capping, lamination, sticking, mottling, weight variation and
  orange peel (cause, appearance, prevention).
- **Formulation** (`/formulation.html`): an exploded 2D tablet diagram in SVG (API, diluent, binder,
  disintegrant, lubricant, optional coating) and a comparison of immediate, sustained and enteric
  release.

### Molecular formula, molecular weight and SMILES
These are shown only when verified. Each of the 12 structures was written as a SMILES string, parsed
with **RDKit**, and its molecular formula was computed from the structure and matched against the
expected formula. The average molecular weight is computed by RDKit from standard atomic weights.
For the drugs with defined stereochemistry (amoxicillin, atorvastatin, levothyroxine) the CIP
labels were also computed and checked. Where a drug is marketed as a racemate the SMILES is
deliberately shown without stereochemistry and the page says so. Values refer to the neutral form
shown, not to a salt or hydrate. If a value could not be verified, the page shows
`DATA PENDING VERIFICATION` instead of an approximation (the code path exists in
`js/drug-explorer.js`; all 12 currently verify). To re-verify, install RDKit
(`pip install rdkit`) and re-run the authoring scripts in `/tools`.

### Traditional use vs experimental / scientific evidence
Each plant page has a dedicated tab that shows two separate blocks, never merged:
- **TRADITIONAL USE**: dashed border, open-circle icon, its own evidence tier and stated limits.
- **EXPERIMENTAL / SCIENTIFIC EVIDENCE**: solid heavy border, filled icon, its own evidence tier and
  stated limits.
The separation does not rely on colour: border style, icon shape and text labels all differ.
Plant pages give no treatment or dosing advice and repeat that natural does not mean safe.

### Calculators (real math, labelled units)
| Card | Equation | Notes |
|---|---|---|
| UV-Vis | A = ε · c · l | ε in L·mol⁻¹·cm⁻¹, c in mol·L⁻¹, l in cm. Solves for A or c; also shows %T = 100·10^(−A). |
| Dissolution | dC/dt = (D·A/h)(Cs − C) | Noyes-Whitney. D cm²/s, A cm², h cm, Cs and C mg/mL. Includes a sink-condition explanation and a Cs/C check against the common "at least 3 ×" rule of thumb. |
| Centrifuge | RCF = 1.118 × 10⁻⁵ × r × RPM² | r in cm, result in ×g. Can also solve for RPM from a target RCF. |
| Microscope | d ≈ 0.61 · λ / NA | λ in nm, NA dimensionless, result in nm and µm. Every variable is defined on the card. |
| HPLC | conceptual only | Two sliders (% organic, flow rate) redraw a schematic two-peak chromatogram labelled **CONCEPTUAL**. It produces no retention time or resolution value. A text description is provided. |
| Tablet press, capsule filler | qualitative only | Process explanations. No numeric outputs are produced, so none can be fabricated. |

All calculators work with touch, mouse and keyboard (Enter in a field runs the calculation). They
validate input and show a message rather than a wrong number. The pure math is exposed as
`window.P3DCalc.math` so it can be checked independently of the interface. **The calculators are
learning tools, not validated analytical, manufacturing, clinical or regulatory calculators.**

### Accessible equivalents for visual content
- The tablet diagram has a text description, a button list that drives the same detail panel, and the
  release-system comparison is available as cards and as a real HTML table.
- The HPLC illustration has a text description that updates as the sliders move.
- The diagram layers differ by pattern as well as fill, so meaning is not carried by colour alone.
- Topic navigation supports arrow keys, Home and End.

### Evidence tiers, limitations and references
Every entry carries an evidence tier from the established set. Every reference follows the same
schema as earlier phases (Source, Type, Purpose, Verify before citing) and is a **source pointer**,
not a citation. There are no DOIs, PMIDs, page numbers or specific article titles. Three plant
references are explicitly labelled "Search direction" and are not citations.

### Integration with earlier phases (no rebuilds)
- `data/relationships.json`: Drug Explorer, Plant Explorer and Instruments changed from `planned` to
  `live`; Manufacturing and Formulation were added. Domain pages and the Explore hub re-render from
  this file automatically.
- `tools/build-search-corpus.js` was extended additively. The search index now has 61 entries
  (18 domains, 12 drugs, 8 plants, 7 instruments, 8 concepts, 8 modules). The Drugs, Plants and
  Instruments chips enable themselves because they are derived from the corpus.
- `explore.html`: five module cards appended to "Available now", and two stale sentences corrected.
- `service-worker.js`: new pages, scripts and data files appended to the precache list; cache
  version bumped to `v1.2.0`.
- Not modified: `app.js`, `partials.js`, `icons.js`, `paths.js`, `search.js`, `related.js`,
  `data-store.js`, the domain pages and the universe.

### Content and safety notes
- All drug, plant and instrument content is general, textbook-level education. **No patient-specific
  dosing is given anywhere.**
- Some plants covered are poisonous or legally controlled (Digitalis, Papaver somniferum, Cinchona,
  Rauvolfia, Catharanthus). These pages state this plainly and recommend nothing.
- Drug interaction lists are deliberately non-exhaustive and always point to a current interactions
  source. Half-life and similar values are described qualitatively; no numeric clinical values are
  given.
- **All content must be reviewed by a qualified pharmacist, pharmacologist or pharmacognosist before
  public release.**

### Known limitations of Phase 3
- Drug, plant and instrument content is a compact overview. It is not exhaustive and does not replace
  a formulary, pharmacopoeia or product label.
- The HPLC illustration is a hand-built schematic. Its peak positions follow a simple qualitative
  rule and are not derived from chromatographic theory.
- The Noyes-Whitney card uses a simplified constant-area model.
- The exploded tablet diagram is a simplified teaching figure, not a formulation.
- Structures are shown as SMILES text and computed values only. No structure drawings are rendered.
- No tests, QA, audits or bug-fixing passes have been run in this phase, per project scope. It is
  likely that issues remain that a proper review would find.

## Phase 4: Chitosan, Pharmacokinetic Lab, Pharmacovigilance, AI, Learn

### What was added
- `chitosan.html` — evidence tier **EMERGING / RESEARCH-DEPENDENT**. Seven tappable stages
  (Chitosan → Ionic gelation → Nanoparticle formation → Drug loading → Characterisation → Drug release →
  Potential application) with a mobile progress bar. Each stage uses WHAT / HOW / WHY / LIMITATIONS.
  Includes a flat 2D SVG cutaway of a nanoparticle (polymer network, crosslinks, schematic drug,
  environment) with the caption *Schematic representation — not a molecular-scale structural model*
  always visible beside it, a five-parameter panel (parameter → possible effect → scientific reasoning →
  limitations), nine characterisation cards, EE% and DL% calculators, a four-model release laboratory
  (zero-order, first-order, Higuchi, Korsmeyer–Peppas) and a six-system conceptual comparison with no ranking.
- `lab.html` — one-compartment, oral (Bateman) and IV bolus models. Cmax, Tmax, AUC, half-life,
  clearance, Vd and F are computed from closed-form equations. Every graph carries the label
  *ILLUSTRATIVE — COMPUTED FROM THE DISPLAYED MODEL.*
- `pharmacovigilance.html` — seven-stage chain, terminology filter, a clearly fictional Naranjo case with
  the ten published questions scored live, and a PRR / ROR / chi-square calculator.
  *A statistical signal is not proof of causation* is displayed prominently in two places.
- `ai.html` — six pillars and ten applications. Every topic has exactly eight sections: WHAT IT IS, HOW IT WORKS,
  DATA IT USES, WHAT IT CAN HELP WITH, REAL-WORLD EXAMPLE, LIMITATIONS, HUMAN OVERSIGHT, EVIDENCE TIER.
- `learn.html` (replaces the stub) — 71 MCQs (Beginner 16, Intermediate 20, Advanced 20, Research 15),
  36 flashcards with a five-box Leitner tracker, 12 viva chains, a progress dashboard (completion ring,
  domain bars, streak, weak domains) and a timed exam mode (domain, difficulty, count, time, scoring,
  explanations, incorrect-question review, weak-domain identification).

### Calculators and labels
- Calculators are labelled **USER CALCULATED**. Pre-filled demo values are labelled **ILLUSTRATIVE**.
- EE% = (W_total − W_free) / W_total × 100. DL% = (W_total − W_free) / W_np × 100 (denominator defined on the page;
  literature definitions vary).
- PK: IV C(t) = (Dose/Vd)·e^(−kt); oral (Bateman) C(t) = F·Dose·ka / [Vd(ka−k)] · (e^(−kt) − e^(−ka·t));
  Tmax = ln(ka/k)/(ka−k); CL = k·Vd; AUC(0–∞) = F·Dose/CL; t½ = ln2/k.
- Signal detection: PRR = [a/(a+b)] / [c/(c+d)]; ROR = ad/bc; χ² = N(ad−bc)² / [(a+b)(c+d)(a+c)(b+d)].

### Storage and privacy
- All Learn progress is stored in `localStorage` under keys beginning `pharma3d:learn:` and
  `pharma3d:chitosan:`. Nothing is transmitted. The dashboard has a reset button.
- The page states plainly that it is not an official exam, is not affiliated with GPAT or any examining
  body, and offers no certificate or reward.

### Integration with earlier phases (additive)
- `data/relationships.json`: `chitosan-lab`, `ai-section` and `learning-center` changed from `planned` to
  `live`; `pk-lab` and `pharmacovigilance-module` were added.
- `tools/build-search-corpus.js` gained short answers for the five modules; the corpus was regenerated (66 entries).
- `explore.html`: five cards added to "Available now"; one stale sentence updated.
- `js/search-index.js`: four entries added and the Learn description updated.
- `service-worker.js`: new pages, scripts and CSS added to the precache; cache version bumped to `v1.3.0`.
- Not modified: `app.js`, `partials.js`, `icons.js`, `paths.js`, `search.js`, `related.js`, `data-store.js`,
  `module-ui.js`, the domain pages and the universe. The shared header nav (`partials.js`) was left as is.

### Content and safety notes
- The chitosan page gives **no formulation recipe** and no dose. Parameter effects are presented as
  tendencies from the literature, not universal rules.
- PK values are computed from user-chosen inputs and are not patient data or dosing guidance.
- The Naranjo case, its drug ("Drug X") and all example counts are invented.
- AI content uses cautious wording and never claims guaranteed outcomes or replacement of pharmacists.
- **All content must be reviewed by a qualified pharmaceutics specialist, pharmacokineticist,
  pharmacovigilance professional, and pharmacy-informatics specialist before public release.**

### Known limitations of Phase 4
- No tests, QA, audits, optimisation or debugging were run in this phase, per project scope. Pages were
  written but not exercised in a browser here. It is likely that defects remain that a proper review would find.
- The Higuchi and Korsmeyer–Peppas graphs draw the model equation with user-chosen constants; they do not fit data.
- The question bank is compact and hand-written; some answer-option wording may need editorial review.
- Leitner intervals (0, 1, 3, 7, 14 days) are a simple convention, not a validated schedule.
- The streak counts days with any activity in this browser only; clearing site data resets it.
- The service worker precache was extended, but offline behaviour of the new pages was not tested.
- Header and bottom navigation were not changed, so the new pages are reached through Explore, search and links.

## Known limitations of this build
- The relationship layout for the map is fixed. Adding many more domains will need a new layout.
- The service worker caches the CDN-hosted Fuse.js only after first successful load. On a first
  offline visit, search falls back to exact matching.
- Fraunces, IBM Plex Sans and IBM Plex Mono are loaded from Google Fonts, as in the foundation build.
- Practice questions are short self-check prompts. They are not an assessment.

## Part 5 — World Pharmacist Day 2026, authors, presentation mode, PWA polish

### `wpd-2026.html` — full build (replaces the earlier shell)
- 7–10 second skippable opening sequence (`#wpd-intro`, driven by `js/wpd2026.js`): glass-vial fill
  animation, a rotating schematic molecule, an 18-dot "domain activation" ring, an original mortar-and-pestle
  glyph, and on-screen text for "World Pharmacist Day," "2026," "25 September," ending on a credits scene
  with an Enter control. All shapes are hand-drawn inline SVG/CSS — no external assets, no FIP logo.
- Plays once per browser tab session (`sessionStorage` flag `pharma3d:wpd2026-intro-seen`); revisiting the
  page in a new tab/session replays it.
- Visible **Skip** and **View credits** controls are present throughout the sequence, plus an **Enter**
  control on the final scene.
- `prefers-reduced-motion: reduce` or Lite Mode (site-wide `data-lite="on"`) shows a static fallback card
  with the same information and an Enter control — no motion is attempted in that state.
- Content sections: pharmacist-journey narrative (4 stages), a 7-role horizontally-scrolling carousel with
  progress indicator and prev/next controls, an About section with a factual, non-logo-reproducing note on
  FIP's role in establishing World Pharmacist Day, an outbound link to FIP's official site, and a data
  verification notice.
- **Thank a Pharmacist**: local-only message feature, hard-capped at 200 characters (`maxlength` + JS
  enforcement), stored in `localStorage` under `pharma3d:wpd2026-thanks`, rendered back as a list with
  timestamps. Nothing is transmitted anywhere.
- **Share-card generator**: client-side `<canvas>` renders a 1080×1080 image (theme, date, hand-drawn vial
  and mortar-and-pestle glyphs, optional personal message) and offers a direct PNG download via
  `canvas.toDataURL`. No upload, no external service.
- Cards use the shared `.card`/`.btn` components; all interactive controls meet the 44×44px minimum target.

### `about-authors.html`
- Unchanged from the earlier build: it already used only verified information (Karnajit Reang, Kishaloy
  Debnath, RIPSAT, Tripura University) and the Part 1 photo-placeholder pattern, with a non-affiliation
  notice. No bios, credentials or contact details were invented, so no edits were needed here.

### Presentation Mode
- `#wpd-present` on `wpd-2026.html`: fullscreen, high-contrast (deep-green background, light text), large
  type, five slides covering the theme, the seven roles, the journey, the thank-you feature and the
  RIPSAT/author credit.
- Controls: on-screen **Prev / Next / Exit** buttons plus keyboard — **Space** advances, **Backspace** goes
  back, **Esc** exits and returns focus to the trigger button. Arrow keys also work as a convenience.
- Focus is moved into the overlay on open and restored to the triggering button on close.

### PWA update-available toast
- `js/app.js` gained `window.pharma3dWatchForUpdates(registration)`: shows a persistent toast with a
  **Reload** button when a new service worker has installed and is waiting, and reloads the page once the
  new worker takes control.
- `service-worker.js` no longer calls `skipWaiting()` automatically on install; it now waits for a
  `{ type: "SKIP_WAITING" }` message (sent when the person taps Reload), so updates are user-controlled
  rather than silent. Cache version bumped to `v1.4.0`; `css/wpd2026.css` and `js/wpd2026.js` added to the
  precache list.
- Every page's service-worker registration snippet was extended to call `pharma3dWatchForUpdates` — this is
  the one mechanical, site-wide change in this part; the registration call itself, the cache strategy and
  every other script were left as they were.

### Verified deep links
`/drug/aspirin.html`, `/plants/turmeric.html`, `/domain/pharmacovigilance.html`,
`/domain/pharmaceutics.html`, `/instruments/hplc.html`, `/chitosan.html`, `/ai.html`, `/learn.html` — all
confirmed present and unmodified from earlier parts.

### Not done in this part (per scope)
- Content should still be reviewed by a qualified subject-matter reviewer before public release, consistent
  with the note in Part 4.

## Part 6 — Testing, bug fixing and final packaging
A full smoke test was run across every page and feature listed in this README: all navigation and
deep links, the WPD 2026 experience (opening sequence, skip, credits, reduced-motion fallback,
Thank a Pharmacist, share-card generator), the Universe and all 18 domain pages, Explore, site-wide
search, the Drug/Plant Explorers and all 20 detail pages, all 7 instrument pages and calculators,
Manufacturing, Formulation, the Chitosan lab, the Pharmacokinetic lab, Pharmacovigilance, the AI
module, and the Learning Centre (MCQs, flashcards, viva chains, dashboard, exam mode). See
`QA-REPORT.md` for the full log, the two real bugs found and fixed, and remaining non-blocking notes.
No new features, redesigns, or content changes were made in this part — only verification and bug
fixes.

## Scope limits (still out of scope)
- Automated end-to-end browser testing (real Chromium/WebKit rendering, visual regression, device labs)
  was not available in the environment this project was packaged in. Testing in Part 6 was static/structural
  (HTML/link/JSON/JS validation, a headless DOM harness with browser-API polyfills, and manual code review
  against each stated formula, label and accessibility requirement) rather than pixel-level visual QA in a
  live browser. A manual pass in real desktop and mobile browsers before public release is still recommended.
