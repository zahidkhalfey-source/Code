# Hearing Aid Upgrade Comparison

An offline, single-page tool for a consultation. It compares a customer's older Phonak hearing aid (Quest 2012 up to Infinio 2024) with a new Phonak model from the pricing file, and translates the specs into everyday benefits.

**To use it,** double-click `dist/Hearing_Aid_Upgrade_Comparison.html`. It is one self-contained file you can copy or email, with no install and no internet needed. After editing any source or data file, rebuild it with `python3 scripts/build_single.py`. (`index.html` also runs directly from the repo for development.)

## What it shows
- **A. Headline cards** cover speech in noise, connectivity, power and convenience, and size. When there is no size data for the new model, the size card becomes "Years of progress".
- **B. Then vs. now table** puts the old aid in pale red and the new aid in green. Rows cover processor, AutoSense version, speech in noise, wind, feedback, app, streaming, calls and battery.
- **C. Why upgrade now** is a 3–4 sentence script built from the data, with an optional customer name.
- Print button and copy-script button.
- The new model's pair and single price from the pricing file, always shown on the green "new generation" panel and in print.

## Evidence rules
Each fact carries a status:
- `verified`: stated by the manufacturer or in trade-press launch coverage.
- `check`: a secondary or conflicting source, shown with an amber **Verify** pill.
- `unknown`: shown as *"Specification not found in public archives—please verify with manufacturer"*.

Percentages are Phonak-reported claims. Each one is scoped to the model and level it applies to. For example, EON E30-R never gets Spheric/AI claims.

## Data files (edit these, not the UI)
| File | Contents |
|---|---|
| `data/pricing.js` | **Generated** from the pricing tool export: `python3 scripts/import_pricing.py path/to/CATALOGUE_AND_PAYMENT_DATA.json` |
| `data/new-specs.js` | New-model specs from the supplied spec files, plus a `models` map from pricing id → family/level/variant |
| `data/legacy-platforms.js` | Researched baseline per older platform, with per-model overrides |
| `data/sources.js` | Evidence register cited by every fact |

To add a new priced model, re-run the importer, then add its id to `models` in `data/new-specs.js`. The tests fail until every priced model is mapped.

## Tests
`npm test` (Node 18+, no dependencies).
