# Hearing Aid Upgrade Comparison

An offline, single-page tool for a consultation. It compares a customer's older Phonak hearing aid (Quest 2012 up to Infinio 2024) with a new Phonak model from the pricing file, and translates the specs into everyday benefits.

**To use it,** double-click `dist/Hearing_Aid_Upgrade_Comparison.html`. It is one self-contained file you can copy or email, with no install and no internet needed. After editing any source or data file, rebuild it with `python3 scripts/build_single.py`. (`index.html` also runs directly from the repo for development.)

## Setting up a comparison
- **Current aid:** type in the search box. It matches by level code or by platform, e.g. `q90`, `quest 70`, `audeo m70 r`, `sphere`. Every model is listed at each technology level, plus "level not sure".
- **What bothers them most:** optional chips (noise, TV, phone, wind, batteries…). The matching cards, checklist rows and listening plans move to the front and are tagged "Matters to you", and the script refers back to them.
- **Fitting, discount and plan:** pair/single, one discount, and a listening plan chosen from cards that show each plan's benefits. These come from the Price & Plan tool's own engine (`assets/pricing-engine.js`, copied unchanged), so totals, eligibility, insurance and warranty always match that tool.

## What it shows
- **A. Headline cards** cover speech in noise, connectivity, power and convenience, and size. When there is no size data for the new model, the size card becomes "Years of progress".
- **B. Then vs. now** has a two-way feature checklist and scoreboard (gains, losses, unconfirmed shown separately), then a detail table with the old aid in pale red and the new aid in green.
- **C. Listening plans** shows plan cards with each accessory's benefit, price and insurance; tap one to add it to the price.
- **D. Why upgrade now** is a 3–4 sentence script built from the data, with an optional customer name.
- Print button and copy-script button.
- The price on the green panel: aid price, discount saving, plan accessory, total, insurance status and warranty, with "Prices as of" the import date.
- Every Phonak percentage states what it was compared with, or carries a Verify tag where sources disagree.
- The footer and printouts carry the build version (date and commit), so stale copies can be spotted.

## Evidence rules
Each fact carries a status:
- `verified`: stated by the manufacturer or in trade-press launch coverage.
- `check`: a secondary or conflicting source, shown with an amber **Verify** pill.
- `unknown`: shown as *"Specification not found in public archives—please verify with manufacturer"*.

Percentages are Phonak-reported claims. Each one is scoped to the model and level it applies to. For example, EON E30-R never gets Spheric/AI claims.

## Data files (edit these, not the UI)
| File | Contents |
|---|---|
| `data/pricing.js` | **Generated** from the pricing tool export: `python3 scripts/import_pricing.py path/to/CATALOGUE_AND_PAYMENT_DATA.json --prices-as-of YYYY-MM-DD`. The date is shown beside every price and on printouts |
| `assets/pricing-engine.js` | The Price & Plan tool's engine, copied unchanged. When that tool changes, copy it again |
| `data/plans.js` | The customer benefit of each plan's accessory |
| `data/concerns.js` | "What bothers you most" options and the cards, features and plans each one lifts |
| `data/new-specs.js` | New-model specs from the supplied spec files, plus a `models` map from pricing id → family/level/variant |
| `data/legacy-platforms.js` | Researched baseline per older platform, with per-model overrides |
| `data/sources.js` | Evidence register cited by every fact |

To add a new priced model, re-run the importer, then add its id to `models` in `data/new-specs.js`. The tests fail until every priced model is mapped.

## Tests
`npm test` (Node 18+, no dependencies).
