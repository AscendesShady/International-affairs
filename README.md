# World Study Atlas — GitHub Pages edition

Static HTML + CSS + JavaScript + JSON. No backend, API key, npm installation or build service is required for hosting.

## Publish

1. Upload the **contents** of this folder to the root of a GitHub repository (do not put them inside an extra github-pages folder).
2. Keep `index.html`, `.nojekyll`, `assets/`, `data/`, and `licenses/` together. The hidden `.nojekyll` file bypasses Jekyll processing.
3. In repository **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and `/ (root)`, then Save.
4. Open the Pages URL shown in Settings. Project URLs such as `https://USER.github.io/REPOSITORY/` work because asset paths are relative.

Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site.

## Preview locally

From this folder run `python -m http.server 8000`, then open `http://localhost:8000/`. Fetching local JSON generally requires HTTP; double-clicking this edition's index.html is not the supported preview method. The separate `world-atlas-preview.html` deliverable embeds everything for double-click review.

## Contents and behaviour

- Click a country name, polygon, search result or index entry for country details.
- Three country tabs: Country atlas, Study, Topics.
- The compact toolbar has two dependent dropdowns: **Category → Item**. Institutions offers UN, UNICEF, World Bank, Commonwealth and other institutions; Membership offers SAARC, NATO, G7 and other groups. Straits, canals, control lines, oceans, seas, mountains and study topics have their own item lists.
- Layer checkboxes are inside the collapsed **Layers** menu. Changing category clears the previous item and effects; Reset returns to the world view.
- Choosing an item opens its facts and sources in the side panel. **Locate on map** in Topic Explorer does the same and preserves the located map position when the layout changes.
- Topics opens a searchable library with category, country, Nobel category/year and legislature structure filters.
- Membership highlights countries in selected organisations. BRICS partner status and historical OPEC membership are separate data fields, not silently combined with full membership.
- Country tags on Nobel records mean reported birthplace / award affiliation, not citizenship. Organisational laureates do not receive invented birthplaces.
- IPU parliamentary records include suspension and source discrepancy notes where supplied.
- Modern country tags on civilisations and wars indicate study geography, not historical political boundaries.

## Edit or extend

`data/topics.json` contains editorial study entries; `data/nobel.json` contains downloaded award records; `data/legislatures.json` contains parliamentary data and provenance; `data/atlas.json` contains country facts and organisations; `data/world.geojson` contains boundaries. Styles are in `assets/atlas.css`; interactions are in `assets/atlas.js`. Keep record ids unique and country codes consistent with `data/atlas.json`.

Datasets are dated snapshots, not live feeds. An empty country/topic result means this curated library has no linked entry; it does not mean the real-world subject is absent. See `licenses/DATA-SOURCES.md` for dataset-specific conditions, including IPU’s noncommercial licence.

No site has been published automatically and no PDF has been created. PDF conversion remains pending HTML review.

## Install on a phone and use offline

This site is a PWA. `manifest.json` provides standalone display, relative start/scope/id, theme colours, regular 192/512 PNG icons and an Android maskable icon. `sw.js` caches the app shell and all atlas datasets; `assets/pwa.js` registers it and exposes installation/update controls when the browser supports them.

1. Open `https://ascendesshady.github.io/International-affairs/` in Chrome on your phone after GitHub Pages deploys.
2. Keep the first visit online until **Offline ready** appears at the bottom of the map. The initial cached bundle is about 12 MB.
3. Tap **Install app** if it appears, or use Chrome’s menu → **Add to Home screen / Install app**. The wording varies by Chrome version.
4. Launch World Atlas from the phone’s home screen. The manifest requests a standalone app window. The map, country details and bundled topic data work offline; external reference/source pages still require internet.

The app uses versioned, scope-specific caches. A fully downloaded new release waits rather than mixing its code/data with the previous release; **Update app** activates it and refreshes the page. Closing all app/site tabs also allows a waiting worker to activate. Cache cleanup affects only this exact project scope. Installation requires HTTPS (localhost is permitted for development). A direct file:// launch cannot install/register this PWA; use the hosted site.

When changing any cached HTML, CSS, JS, icon or dataset, update the `VERSION` value in `sw.js` as part of the release. The authoring build helper regenerates a version from the cached file content automatically.

PWA verification: 13 manifest/icon and service-worker lifecycle/offline-request checks passed, including complete data caching, failure-safe installation, update activation, query-string reads and cache isolation. The live desktop browser completed registration and displayed **Offline ready** with no console errors. Physical phone installation is performed by the user.

## Latest verification

The final interface uses neutral branding: “Geography · History · World affairs”. The visible “BCS preparation” wording was removed; source references to historical exam questions remain as evidence inside the coverage material.

35 DOM-emulation/runtime and static-asset checks passed. Targeted live desktop-browser checks also passed: Institutions → UNICEF, Membership → G7, and Topic Explorer → Ancient Egypt → Locate on map with the matching side panel and retained 10× zoom. Mobile visual layout was not browser-tested. See `validation.json`.

G7 and Commonwealth membership lists and UNICEF institutional details were checked against their official sources on 9 October 2026. The G7 filter highlights seven countries; EU participation is described separately. Commonwealth has 56 countries in the cited list.
