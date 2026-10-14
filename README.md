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

The atlas is published through GitHub Pages. PDF conversion remains pending HTML review.

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

42 DOM-emulation/runtime and static-asset checks passed, alongside the 13 PWA checks. Live browser checks covered phone widths of 320, 360, 390 and 430 pixels and a 1280-pixel desktop breakpoint. Menu dismissal, topic-category selection, and Topic Explorer → Ancient Egypt → Locate on map were verified, including matching details and retained 10× zoom. See `validation.json`, `phone-validation.json` and `pwa-validation.json`.

G7 and Commonwealth membership lists and UNICEF institutional details were checked against their official sources on 9 October 2026. The G7 filter highlights seven countries; EU participation is described separately. Commonwealth has 56 countries in the cited list.

## Phone layout

On phones, the title and **Menu** share a compact header row, followed by the country search. Menu contains Topics, Country index, Topic coverage, Sources and available Install/Update actions. The Category/Item selectors and Layers/Reset controls form aligned pairs, with 44-pixel primary touch targets. Zoom buttons sit together in a horizontal strip.

Topic Explorer replaces its desktop category-button column with one phone dropdown. Country details and located-topic information remain below the map. The footer wraps within the screen width. The tested phone header is 128 pixels high, reduced from 217 pixels, and the tested layouts have no horizontal page overflow.

For an installed or cached PWA, use **Update app** when offered to load this layout. In the new phone interface, Update is inside Menu. Closing all atlas tabs/app windows also allows a fully downloaded waiting release to activate.

## Country label correction · 11 October 2026

Country and water labels use normal fixed font sizes with inverse SVG transforms, so browser minimum-font settings cannot turn a tiny zoom-adjusted font into oversized map text. The selected country name sits above its anchor to help separate it from the capital label. On phones, **Focus on country** also scrolls back to the map while keeping details open. Singapore was visually checked at 85× on desktop and a 390×844 phone viewport; its country label remained about 17 pixels high, with no horizontal overflow or console errors. Regression checks cover Bangladesh, Singapore, Vatican City and Russia through 2048×. See `label-validation.json`.

Useful future features are saved study items, country comparison and recall quizzes using the cited facts already in the atlas. Additional study information should remain in country and topic panels to keep the map readable.


## Regions and peninsulas · 12 October 2026

Choose **Regions & peninsulas**, then a region: Baltics, Balkans, Western Balkans, Iberian Peninsula, Scandinavian Peninsula, Scandinavia, Nordic Region or Levant. Selection fits the principal grouping on the map and opens its country guide, study facts and dated sources. These records also appear in Topic Explorer and the linked countries' Topics tabs.

Country highlighting is context, not a traced region outline. Solid highlights show principal countries and separately listed additional map entities. Amber dashed outlines mark partly included or definition-dependent countries. The panel distinguishes these lists. Clicking a country retains the regional highlight. Reset clears it. **Show region on map** refocuses the grouping and returns to the map on phones.

Definitions distinguish landforms from cultural and policy groupings: Denmark belongs to narrow Scandinavia, but not the Scandinavian Peninsula; Finland's peninsula context is partial; Nordic Region is broader. Balkans has no universally fixed list, while the Council of the EU uses six Western Balkan partners. Not all Balkan countries experienced communist rule. Levant has flexible historical definitions, with Cyprus included by CBRL. Source links are provided in each record.

42 runtime/static checks and 13 offline/PWA checks passed. Live browser checks covered Baltic highlights, Balkan variable inclusions, and Levant/Topic Explorer use at 320px with no horizontal overflow or console errors. See `regions-validation.json`.


## Geography extensions · 13 October 2026

- **Largest & longest** has 11 entries for beaches, country population, city population, country area, river length, islands, ocean area, hot deserts, lakes and landlocked-country area. Each names its comparison metric and source. Jakarta uses UN WUP 2025; city-proper and other urban definitions can differ. Cox’s Bazar retains the official natural/unbroken sandy-beach description as an attributed claim; Praia do Cassino and the Nile have measurement/definition caveats.
- **Landlocked countries** offers All, the doubly landlocked pair, and individual country entries. The stated scope is 43 UN member states plus Vatican City, with Kosovo as separate additional map context. It is not the UN LLDC list. A Caspian coast does not provide ocean access.
- **Island countries** offers an All highlight and individual country entries. This UN-member geographic list excludes continental Australia and dependencies. Shared-island countries with land borders are included. It is not the UN SIDS list.
- **Regions & peninsulas** now includes Golden Triangle, Golden Crescent, Four Asian Tigers and Horn of Africa. The Tigers are four economies, not four universally recognised sovereign states or a contiguous landmass. The Golden groupings are historical geographic labels, not current production maps. Whole-country highlights provide context, not exact borderland extents.
- The existing **Mountains & ranges** category remains available without duplication.

The three new categories also appear in Topic Explorer and are linked through country Topics. Selecting a country from a geographic class opens its existing country facts and retains the group highlight. Reset clears the filter. Verification: 46 runtime/static checks, 13 offline/PWA checks, plus desktop and 390px phone checks. See `geography-validation.json`. Use **Menu → Update app** when offered to activate a cached PWA update.


## Wars, battles and revolutions · 13 October 2026

**Wars & battles** expands the existing World wars category without changing its internal ID. It adds 22 records: Badr, both Tarain battles, Trafalgar, Waterloo, Crimean War, Vietnam War, Korean War, Iran–Iraq War, Gulf War, the 2003 Iraq invasion, the 1948–1949 Arab–Israeli War, Suez, Six-Day War, October/Yom Kippur War, Cold War, Cuban Missile Crisis, Plassey, Buxar, Bangladesh Liberation War, October 2023 Israel–Gaza onset and June 2025 Israel–Iran escalation. Existing First/Second World War entries remain.

**Revolutions & reform movements** adds 20 entries: French Revolution, Renaissance, Chinese Xinhai and communist revolutions, Cultural Revolution, Rose, Orange, Tulip, Vietnam August Revolution, Bangladesh July–August 2024 uprising, Arab Spring, Prague Spring, Spring of Nations, White Revolution in Iran, White Revolution/Operation Flood in India, Iranian Revolution, Russian February and October revolutions, Industrial Revolution and Velvet Revolution.

Each new entry has a date/period, event classification, concise participants/outcome or reform context, approximate locator and historical source. Renaissance and dairy development are clearly classified rather than treated as political regime overthrows. Common spelling variants are searchable in Topic Explorer. Recent conflict entries describe their dated episodes, not current military positions, ceasefire status or casualty totals. Country tags denote selected historical locations/participants, not exact historical borders or collective responsibility.

Phone and desktop checks passed, alongside 49 runtime/static checks and 13 offline checks. Locator text is now reserved during label placement, reducing collisions with country names; long category eyebrows wrap clear of the panel close button. See `history-validation.json`. Use **Menu → Update app** when offered for a cached PWA.

## Android and touch update — 14 October 2026

Touch maps require two fingers for panning and pinch zoom. A one-finger swipe scrolls the page without panning the map; taps still select countries. Phone controls use the compact Menu and paired dropdowns; medium tablet widths use two toolbar columns. Touch users see a gesture hint above the map.

The companion signed APK bundles the same site for offline first launch on Android 8 or newer. It is provided separately from this public folder. Only this folder's contents belong in the GitHub repository.

Current checks: 50 runtime/static checks and 13 PWA/offline checks passed. Two-finger behavior was checked using synthetic touch events. Fresh visual and physical Android installation checks were unavailable for this release; earlier browser reports describe earlier checks.
