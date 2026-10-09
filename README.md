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
- Three country tabs: Country atlas, BCS study, Topics.
- Topics opens a searchable library with category, country, Nobel category/year and legislature structure filters.
- Membership highlights countries in selected organisations. BRICS partner status and historical OPEC membership are separate data fields, not silently combined with full membership.
- Country tags on Nobel records mean reported birthplace / award affiliation, not citizenship. Organisational laureates do not receive invented birthplaces.
- IPU parliamentary records include suspension and source discrepancy notes where supplied.
- Modern country tags on civilisations and wars indicate study geography, not historical political boundaries.

## Edit or extend

`data/topics.json` contains editorial study entries; `data/nobel.json` contains downloaded award records; `data/legislatures.json` contains parliamentary data and provenance; `data/atlas.json` contains country facts and organisations; `data/world.geojson` contains boundaries. Styles are in `assets/atlas.css`; interactions are in `assets/atlas.js`. Keep record ids unique and country codes consistent with `data/atlas.json`.

Datasets are dated snapshots, not live feeds. An empty country/topic result means this curated library has no linked entry; it does not mean the real-world subject is absent. See `licenses/DATA-SOURCES.md` for dataset-specific conditions, including IPU’s noncommercial licence.

No site has been published automatically and no PDF has been created. PDF conversion remains pending HTML review.

## Control lines and boundary references

The **Control / boundary reference** selector above the map and **Control lines & boundaries** topic category contain 25 classified entries. They distinguish military control/position lines, armistice/disengagement lines, withdrawal-verification lines, buffer zones, disputed or historical boundaries, defensive systems and latitude references.

Downloaded Natural Earth source geometry supplies 15 route segments for Korean MDL/DMZ, Cyprus buffer/ceasefire references, Golan disengagement context and generic India–Pakistan control-line context. Dashed overlays preserve source classifications, including “please verify”. Cross markers locate named entries. Lines without sourced route geometry remain markers. The LoC, LAC and Siachen AGPL are not treated as interchangeable.

The India–Pakistan source uses the generic label “Line of control” for several segments, including southern Working Boundary context. The combined source overlay is **not** one certified LoC route and does not establish an agreed extension beyond NJ9842. Golan “Ceasefire Lines 1974” and “UNDOF” source layers are agreement context, not independently surveyed Alpha/Bravo linework or live deployments. These distinctions appear in the topic facts.

Natural Earth’s land-boundary data is public domain: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_boundary_lines_land.geojson. Its original line names, classes, feature ids and adjacent-country attributes are retained in `data/atlas.json` under `controlRoutes`.

Built 9 October 2026. Base topics use the 8 October snapshot; control-line content was reviewed on 9 October. There are 13 topic categories, 414 non-Nobel study records, 1,033 Nobel award records and 193 IPU parliamentary records. Coverage is curated rather than exhaustive.

26 Node DOM-emulation/runtime and static-asset checks passed, including line classifications, source provenance, map selection and layer toggles, alongside the original topic/country functionality. `validation.json` records the checks. Live-browser layout QA remains unverified in this environment. The worldwide historical/Indigenous table remains illustrative and still needs individual source auditing.
