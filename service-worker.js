/* =========================================================
   PHARMA 3D — Service Worker
   Cache-first for static assets, network-first fallback to
   cache for navigation requests, with an offline fallback page.
   ========================================================= */

const CACHE_VERSION = "pharma3d-v1.4.1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./wpd-2026.html",
  "./about-authors.html",
  "./universe.html",
  "./explore.html",
  "./learn.html",
  "./offline.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./css/layout.css",
  "./css/home.css",
  "./js/app.js",
  "./js/icons.js",
  "./js/search-index.js",
  "./search.html",
  "./css/universe.css",
  "./css/domain.css",
  "./css/search.css",
  "./css/wpd2026.css",
  "./js/wpd2026.js",
  "./ai.html",
  "./chitosan.html",
  "./manufacturing.html",
  "./formulation.html",
  "./lab.html",
  "./pharmacovigilance.html",
  "./404.html",
  "./js/paths.js",
  "./js/partials.js",
  "./js/data-store.js",
  "./js/related.js",
  "./js/universe.js",
  "./js/domain-page.js",
  "./js/explore-hub.js",
  "./js/search.js",
  "./data/domains.json",
  "./data/relationships.json",
  "./data/search-corpus.json",
  "./data/universe-layout.json",
  "./domain/pharmacognosy.html",
  "./domain/pharmaceutics.html",
  "./domain/pharmacology.html",
  "./domain/medicinal-chemistry.html",
  "./domain/pharmaceutical-analysis.html",
  "./domain/clinical-pharmacy.html",
  "./domain/pharmacovigilance.html",
  "./domain/pharmaceutical-microbiology.html",
  "./domain/biopharmaceutics.html",
  "./domain/biostatistics.html",
  "./domain/pharmaceutical-biotechnology.html",
  "./domain/nanotechnology.html",
  "./domain/drug-discovery.html",
  "./domain/regulatory-science.html",
  "./domain/industrial-pharmacy.html",
  "./domain/community-pharmacy.html",
  "./domain/public-health.html",
  "./domain/ai-in-pharmacy.html",
  "./css/modules.css",
  "./js/module-ui.js",
  "./js/calculators.js",
  "./js/drug-explorer.js",
  "./js/plant-explorer.js",
  "./js/instruments.js",
  "./js/manufacturing.js",
  "./js/formulation.js",
  "./data/drugs.json",
  "./data/plants.json",
  "./data/instruments.json",
  "./data/manufacturing.json",
  "./data/formulation.json",
  "./drug.html",
  "./plants.html",
  "./instruments.html",
  "./css/phase4.css",
  "./js/p4-shared.js",
  "./js/chitosan.js",
  "./js/lab.js",
  "./js/pharmacovigilance.js",
  "./js/ai-data.js",
  "./js/ai.js",
  "./js/learn-mcq.js",
  "./js/learn-cards.js",
  "./js/learn.js",
  "./drug/paracetamol.html",
  "./drug/ibuprofen.html",
  "./drug/aspirin.html",
  "./drug/atenolol.html",
  "./drug/metformin.html",
  "./drug/amoxicillin.html",
  "./drug/atorvastatin.html",
  "./drug/salbutamol.html",
  "./drug/omeprazole.html",
  "./drug/warfarin.html",
  "./drug/ciprofloxacin.html",
  "./drug/levothyroxine.html",
  "./plants/turmeric.html",
  "./plants/cinchona.html",
  "./plants/catharanthus-roseus.html",
  "./plants/rauvolfia-serpentina.html",
  "./plants/digitalis.html",
  "./plants/papaver-somniferum.html",
  "./plants/tulsi.html",
  "./plants/ashwagandha.html",
  "./instruments/microscope.html",
  "./instruments/hplc.html",
  "./instruments/uv-vis.html",
  "./instruments/dissolution-apparatus.html",
  "./instruments/tablet-press.html",
  "./instruments/capsule-filler.html",
  "./instruments/centrifuge.html",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-192.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => {
        // Non-fatal: continue install even if one optional asset 404s
        console.warn("[SW] Precache warning:", err);
      })
  );
  // Do not auto-activate: wait for the page to confirm via SKIP_WAITING
  // so the update-available toast can offer a controlled reload.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("pharma3d-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first, fall back to cache, then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("./offline.html"))
        )
    );
    return;
  }

  // Static assets: cache-first, fall back to network, update cache in background
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
