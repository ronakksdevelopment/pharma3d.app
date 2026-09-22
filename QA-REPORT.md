# PHARMA 3D — QA Report (Part 6: Testing, Bug Fixing & Final Packaging)

Date of pass: 22 September 2026
Scope: full smoke test of the completed application across all five prior build parts.
No new features, redesigns, or content/scientific/author changes were made — this pass
was verification and bug-fixing only.

## Method

The runtime environment for this pass had no access to a real browser (Chromium/WebKit
download was blocked by network policy), so testing combined:

- **Static validation** — an automated link/asset checker across all 65 HTML files
  (every `href`/`src`/`action`), `node --check` syntax validation of all 32 JS files,
  and JSON schema/cross-reference validation of all 11 data files.
- **Headless DOM execution** — every page was loaded and its scripts run in a jsdom
  harness with polyfills for browser APIs jsdom does not implement (`matchMedia`,
  `fetch`, `scrollIntoView`), to separate genuine application errors from
  environment gaps, then re-run to confirm fixes.
- **Manual code-level verification** — every calculator's implementation was read
  and checked line-by-line against its stated formula; every required label string
  was located and checked for exact wording and placement; AI-module copy was
  scanned for guarantee/replacement/elimination-of-judgement language; all
  reference/citation content was checked for fabricated DOIs, PMIDs, or invented
  author/institutional details; PWA manifest, icons, and service worker were
  checked for correctness, completeness, and correct file existence; accessibility
  patterns (ARIA roles/labels, focus management, keyboard handlers, text
  equivalents for canvas charts, touch target sizing, safe-area-inset handling)
  were reviewed against each page's rendering code.

This is not a substitute for manual testing in real desktop and mobile browsers,
which is recommended before public release (see Limitations below).

## Areas tested

- Home, Universe (18 domain pages), Explore, site-wide search (Ctrl/Cmd+K)
- Drug Explorer (12 drugs), Plant Explorer (8 plants), Instruments (7 pages + calculators)
- Manufacturing module (12 stages, 6 defects) and defect explorer
- Formulation module, Chitosan lab (EE%/DL% + 4 release-kinetics models), Pharmacokinetic
  lab (one-compartment, Bateman, IV bolus), Pharmacovigilance module (Naranjo, PRR, ROR,
  chi-square, screening rule)
- AI in Pharmacy module
- Learning Centre: 71 MCQs, flashcards (Leitner spaced repetition), viva chains, progress
  dashboard, timed exam mode
- Authors page, Presentation Mode, theme toggle, Lite Mode
- PWA: manifest, service worker (install/activate/fetch strategies, offline fallback,
  update-available flow), icon set (standard + maskable, all required sizes)
- Deep links, keyboard navigation, `prefers-reduced-motion` behaviour, responsive layout
  (360/390/768/1024px+), image-load failure fallback, safe-area-inset handling

## Failures found and fixes applied

### 1. Site search silently broken on 5 pages
**Pages affected:** `ai.html`, `chitosan.html`, `lab.html`, `learn.html`,
`pharmacovigilance.html`.
**Symptom:** Opening search (Ctrl/Cmd+K) on any of these five pages threw an
uncaught `TypeError` (`Cannot read properties of undefined, reading 'corpus'`) in
`js/search.js`, because `window.PHARMA3D_STORE` — defined by `js/data-store.js` —
was never loaded on these pages, even though `js/search.js` depends on it.
**Root cause:** all five pages included `js/app.js` → `js/p4-shared.js` → their
module script, but omitted the `js/data-store.js` include that every other page
(e.g. `manufacturing.html`, `formulation.html`) has between those two.
**Fix:** added `<script src="js/data-store.js"></script>` in the same position
used by the working pages, on all five affected files. No other script tags,
markup, or content were touched.
**Verification:** re-ran the full headless page-load pass; all five pages now load
with zero console errors, matching the previously-working pages.

### 2. Duplicate entries in the service worker's precache list
**File affected:** `service-worker.js`.
**Symptom:** `PRECACHE_URLS` contained 8 duplicate string entries (`css/components.css`,
`css/layout.css`, `manufacturing.html`, `formulation.html`, `chitosan.html`, `lab.html`,
`pharmacovigilance.html`, `ai.html`), left over from incremental edits across build parts.
Not a functional failure — `cache.addAll()` tolerates duplicates — but wasteful and
untidy, and confusing for future maintenance.
**Fix:** removed the duplicate lines, preserving order and all other entries.
Verified every remaining URL in the list still resolves to a real file on disk
(127 → 119 entries, 0 missing, 0 remaining duplicates). Bumped `CACHE_VERSION` from
`pharma3d-v1.4.0` to `pharma3d-v1.4.1` so the corrected precache list actually reaches
browsers that already have the app installed, rather than being masked by the
existing cache.
**Verification:** `node --check` passes; precache list re-scanned and confirmed clean.

No other functional bugs, broken links, dead buttons, invalid/`#` links, incorrect
calculation outputs, or missing labels were found.

## Scientific accuracy — verified correct

- **Calculators (`js/calculators.js`):** Beer–Lambert (A = εcl), Noyes–Whitney,
  RCF (1.118×10⁻⁵ × r × RPM²), and microscope resolution (0.61λ/NA) all match their
  stated formulas.
- **Chitosan lab (`js/chitosan.js`):** EE% = (Total − Free)/Total × 100 and
  DL% = (Total − Free)/Nanoparticle mass × 100 are standard and correct. Zero-order,
  first-order, Higuchi, and Korsmeyer–Peppas release models are correctly formulated,
  with correct stated assumptions/limitations for each.
- **Pharmacokinetic lab (`js/lab.js`):** IV bolus (C(t) = C0·e^(−kt)), the Bateman
  equation (including the correct limiting-case form when ka ≈ k, a detail that is
  frequently implemented incorrectly), Tmax = ln(ka/k)/(ka−k), CL = k·Vd, and
  AUC = F·Dose/CL are all correct.
- **Pharmacovigilance (`js/pharmacovigilance.js`):** the real 10-question Naranjo
  algorithm weight table, PRR = [a/(a+b)]/[c/(c+d)], ROR = ad/bc, the standard 2×2
  chi-square statistic, the log-normal 95% CI for ROR, and the conventional
  PRR≥2 / χ²≥4 / a≥3 screening rule are all correctly implemented, with sensible
  input validation.
- **Learning Centre MCQs:** all 71 questions pass structural validation (in-bounds
  answer index, no duplicate options, no missing fields); a representative sample
  of pharmacokinetics questions was checked against the verified PK formulas above
  and found correct.

## Required labels and safeguards — verified present

- `"ILLUSTRATIVE"` and `"USER CALCULATED"` — present on every calculator/model tool checked.
- `"Schematic representation — not a molecular-scale structural model"` — present exactly
  as specified, adjacent to the relevant schematic content.
- `"A statistical signal is not proof of causation"` — present in the pharmacovigilance module.
- Evidence tiers — every drug (`ESTABLISHED`) and every plant (dual `traditional`/
  `scientific` tiers, correctly differentiated — e.g. cinchona/digitalis/vinca/opium poppy
  as `ESTABLISHED`, turmeric/tulsi/ashwagandha as `EMERGING`) render a badge; the badge
  helper has a safe fallback for any future entry that omits the field.
- AI module language: an explicit on-page statement that AI tools "do not guarantee
  outcomes, are not always correct, do not replace pharmacists and do not remove the
  need for professional judgement" — no contradicting language found elsewhere in the
  AI module's content.
- No DOIs, PMIDs, or specific fabricated citations exist anywhere in the site; the
  reference system is deliberately generic (e.g. "consult a current pharmacopoeial
  monograph for your jurisdiction") and explicitly labelled "Not a citation," directing
  the reader to verify independently rather than presenting an invented source.
- Author/institution content (Karnajit Reang, Kishaloy Debnath, RIPSAT, Tripura
  University) matches supplied information exactly, with an explicit non-affiliation/
  non-endorsement notice; no invented credentials, bios, or contact details.

## Accessibility — verified

- Canvas-based charts (release-kinetics, plasma concentration) all carry `role="img"`
  and a descriptive `aria-label`, **and** a visible "Data table" rendering the same
  numeric series, **and** a dynamically-populated visually-hidden text summary —
  full text equivalence, not just a label.
- No missing `alt` text anywhere; decorative logo images correctly use `alt=""`
  (redundant with adjacent visible text) with an `onerror` fallback to a guaranteed
  -present icon; photo placeholders use `role="img"` with a descriptive `aria-label`.
- Ctrl/Cmd+K search: correct modifier-key branching, `preventDefault` on the browser's
  own shortcut, Escape to close, focus trap while open, focus restored on close.
- Presentation Mode: Space/Backspace/Esc/arrow keys all handled, guarded so they only
  fire while the overlay is open, focus moved in on open and restored on close.
- Touch targets meet the 44×44px minimum across buttons, inputs, sliders, tabs, and
  navigation; one secondary, low-frequency "Reload" toast button is 36px — a minor,
  non-blocking design choice, not flagged as a bug.
- `prefers-reduced-motion` is respected at both a global CSS level (a catch-all rule
  neutralises animation/transition site-wide) and at the WPD opening-sequence level
  (a genuinely equivalent static fallback with the same information, not merely a
  faster animation).
- Lite Mode is correctly scoped to what it claims to do — the UI explicitly labels it
  "reduced motion & effects" and states "all content and controls remain fully usable
  with Lite Mode on." It only suppresses CSS animation/transition and the WPD intro
  sequence; nothing is hidden or removed, so there is no information loss by design.

## PWA — verified

- `manifest.json` is well-formed with all required fields; all four referenced icon
  files exist with correct dimensions (192/512, standard + maskable); maskable icons
  are fully opaque to the edge with no transparency holes.
- `service-worker.js` uses network-first-with-offline-fallback for navigation and
  stale-while-revalidate for static assets, with correct cache versioning/cleanup on
  activate.
- Update flow (`js/app.js` `pharma3dWatchForUpdates`) correctly detects a waiting
  worker, shows a persistent Reload toast, and reloads exactly once via a guard flag
  against the classic double-reload bug.
- `viewport-fit=cover` is present on all 65 pages; safe-area-inset CSS variables are
  defined and correctly applied to the header, bottom navigation, and body padding
  (with a fallback rule for pages where the bottom nav is hidden).
- Service worker registration uses a relative path (`../service-worker.js` from
  nested pages), which correctly resolves its default scope to the site root
  regardless of registering page depth or deployment subpath — confirmed this
  supports both a domain-root deployment and a GitHub Pages project-subpath
  deployment without modification.

## Data integrity — verified

- All 34 relationship-graph edges reference valid domain slugs; all 18 domains have
  exactly one universe-layout position (no missing or orphaned nodes); all 66
  search-corpus entries link to real, existing pages.
- Item counts match specification exactly: 18 domains, 12 drugs, 8 plants, 7
  instruments, 12 manufacturing stages, 6 defects, 71 MCQs.

## Final packaging — verified

- No secrets, API keys, tokens, passwords, or credentials found anywhere in the
  source tree (HTML, JS, JSON, Python build tools, or Markdown) — confirmed by
  automated pattern scan.
- No stray `.env`, private key, or other local/sensitive files present.
- The app is confirmed to run as pure static files with no backend dependency:
  no Node-specific code, no hardcoded server URLs, no environment-variable reads.
- `assets/logo.png` and all supplied assets are preserved unchanged; the two
  still-missing author photos use a clearly labelled `PLACEHOLDER` block (with an
  inline HTML comment noting the exact file path to drop the real photo at) rather
  than a fabricated or generic stock image.
- `README.md` was updated to remove stale "not built yet" language left over from
  earlier build parts (the app is now complete) and to add a summary of this
  testing/packaging pass; no other README content was altered.

## Non-blocking observations (not fixed — outside "fix only actual bugs" scope)

- `css/phase4.css` contains a `table.cmp` / `.cmp-wrap` rule pair that is not
  referenced by any current JS or data file (dead CSS from an earlier iteration).
  Harmless — nothing renders using it, so it cannot cause a layout bug — but noted
  here for future cleanup.
- The service worker's cached CDN copy of Fuse.js is only available offline after
  a first successful online load; on a first-ever offline visit, search falls back
  to exact-match only. This is pre-existing, documented behaviour (see README
  "Known limitations"), not a regression from this pass.

## Remaining limitations of this pass

- No real browser (Chromium/WebKit) was available in this environment to install,
  so this pass could not perform pixel-level visual QA, real touch-input testing,
  or genuine cross-browser rendering checks. Testing here was static/structural and
  code-level rather than a live interactive walkthrough. A manual pass in real
  desktop and mobile browsers is still recommended before public release.
- The full 71-question MCQ bank, all flashcards, and all viva chains were validated
  structurally (100%) and spot-checked for correctness against verified formulas;
  not every single question was independently re-derived from first principles.
- This report reflects a testing and bug-fixing pass, not an independent
  subject-matter/clinical review. As stated throughout the app itself, content
  should still be reviewed by a qualified subject-matter reviewer before public
  release.

## Summary

2 real bugs found, both fixed and re-verified with no regressions:
1. Site search broken on 5 pages (missing script include) — **fixed**.
2. Duplicate service-worker precache entries — **fixed**, cache version bumped.

No scope, design, feature, or content changes were made. All previously verified
scientific formulas, required labels, evidence tiers, author/institutional content,
and the visual design system were found unchanged and correct throughout.
