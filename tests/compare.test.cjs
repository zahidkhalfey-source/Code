// Run: node tests/compare.test.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const HCCompare = require('../assets/compare.js');

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['sources', 'pricing', 'plans', 'concerns', 'words', 'new-specs', 'features', 'legacy-platforms']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', `${f}.js`), 'utf8'), ctx);
}
const w = ctx.window;
const Pricing = require('../assets/pricing-engine.js');
const DATA = { pricing: w.HC_PRICING, specs: w.HC_NEW_SPECS, legacy: w.HC_LEGACY, sources: w.HC_SOURCES, features: w.HC_FEATURES,
  concerns: w.HC_CONCERNS, plans: w.HC_PLANS, words: w.HC_WORDS, engine: Pricing.create(w.HC_PRICING.engine) };
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok -', name); };

test('every pricing model has a spec mapping', () => {
  for (const m of DATA.pricing.models) assert.ok(DATA.specs.models[m.id], `unmapped ${m.id}`);
});

test('every cited source exists', () => {
  const check = (obj, where) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object' && 'status' in v && v.source) assert.ok(DATA.sources[v.source], `${where}.${k} cites ${v.source}`);
      else if (v && typeof v === 'object' && !Array.isArray(v)) check(v, `${where}.${k}`);
      if (Array.isArray(v)) v.forEach((s, i) => s.source && assert.ok(DATA.sources[s.source], `${where}.${k}[${i}]`));
    }
  };
  check(DATA.legacy, 'legacy');
  check(DATA.specs.families, 'families');
  for (const f of DATA.features.features) for (const k of f.sources) assert.ok(DATA.sources[k], `${f.id} cites ${k}`);
});

test('all old x level x new combinations render complete output', () => {
  for (const o of DATA.legacy.models) for (const lvl of ['', ...HCCompare.oldLevels(DATA, o.id)]) for (const p of DATA.pricing.models) {
    const r = HCCompare.compare(DATA, o.id, p.id, { patientName: 'Mr Jones', oldLevel: lvl });
    assert.strictEqual(r.cards.length, 4);
    assert.strictEqual(r.rows.length, 12);
    for (const row of r.rows) for (const side of [row.old, row.new]) assert.ok(side.text, `${o.id}/${lvl}/${p.id} ${row.label}`);
    assert.ok(r.narrative.startsWith('Mr Jones, your'), r.narrative);
    const f = r.features;
    assert.strictEqual(f.items.length, f.confirmed + f.unconfirmed);
    assert.strictEqual(f.newCount, f.confirmed - f.lostCount);
    assert.strictEqual(f.oldCount, f.confirmed - f.gained);
    const visible = r.cards.map((c) => [c.old.text, c.new.text, c.stat && c.stat.value, c.stat && c.stat.label, c.footnote].join(' ')).join(' ')
      + r.narrative + r.features.items.map((i) => i.old.text).join(' ');
    assert.ok(!/undefined|null|NaN/.test(visible), `${o.id}/${lvl}/${p.id}: ${visible}`);
  }
});

test('technology level changes the old side', () => {
  const q90 = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: '90' });
  const q50 = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: '50' });
  assert.strictEqual(q50.old.displayName, 'Phonak Audéo Q50');
  const focus = (r) => r.features.items.find((i) => i.id === 'loud_noise').old;
  assert.strictEqual(focus(q90).state, 'yes');
  assert.strictEqual(focus(q50).text, 'Not at the Q50 level');
  assert.ok(q50.features.gained > q90.features.gained);
  assert.match(q50.rows.find((r) => r.label === 'Fine-tuning channels').old.text, /12 channels/);
});

test('features from later platforms are marked as not existing yet', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: '90' });
  const auracast = r.features.items.find((i) => i.id === 'auracast');
  assert.strictEqual(auracast.old.state, 'notyet');
  assert.match(auracast.old.text, /2026/);
  assert.ok(r.features.gained >= 15, `gained ${r.features.gained}`);
});

test('Sphere Infinio offers only I90 and I70', () => {
  assert.strictEqual(HCCompare.oldLevels(DATA, 'audeo_sphere_i').join(','), '90,70');
  assert.throws(() => HCCompare.compare(DATA, 'audeo_sphere_i', 'e90', { oldLevel: '50' }));
});

test('downgrade in features is flagged for the dispenser and higher levels are suggested', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e30', { oldLevel: '90' });
  assert.ok(r.warnings.some((w) => /focus in loud noise/.test(w)), r.warnings.join('|'));
  const lostRow = r.features.items.find((i) => i.id === 'loud_noise');
  assert.strictEqual(lostRow.kind, 'lost'); // shown to the patient, not hidden
  assert.strictEqual(r.features.newCount, r.features.confirmed - r.features.lostCount);
  assert.ok(r.features.upsell.some((u) => /Speech Enhancer/.test(u.label) && u.from === 90));
});

test('missing old-model specs use the exact not-found wording', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90');
  const size = r.cards.find((c) => c.key === 'size');
  assert.strictEqual(size.old.text, 'Specification not found in public archives—please verify with manufacturer');
  assert.strictEqual(size.stat.value, '25%');
});

test('Quest to EON Sphere headline content', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90', { patientName: 'Mr Jones' });
  assert.match(r.narrative, /good technology for 2013/);
  assert.match(r.narrative, /AI chip/);
  assert.match(r.narrative, /37% less listening effort/);
  assert.match(r.narrative, /batteries/);
  assert.strictEqual(r.cards.find((c) => c.key === 'power').stat.value, '0');
});

test('E30-R does not claim Spheric/AI processing and points to E50', () => {
  const r = HCCompare.compare(DATA, 'audeo_v', 'e30');
  const speech = r.cards[0];
  assert.strictEqual(speech.stat, null);
  assert.match(speech.footnote, /E50 Sphere/);
  assert.doesNotMatch(r.narrative, /AI chip/);
  assert.strictEqual(r.cards[3].key, 'age'); // no size data for EON R
});

test('same or older platform is flagged as not an upgrade', () => {
  const r = HCCompare.compare(DATA, 'naida_l_old', 'naida90');
  assert.ok(r.warnings.some((w) => /not a technology upgrade/.test(w)));
});

test('non-wireless Virto is not sold as Bluetooth', () => {
  const r = HCCompare.compare(DATA, 'virto_q', 'virto_i90_10nwo');
  assert.match(r.cards[1].new.text, /no Bluetooth/);
});

test('price text follows pricing-file values', () => {
  const e30 = DATA.pricing.models.find((m) => m.id === 'e30');
  assert.strictEqual(HCCompare.priceText(e30), '£2,595 pair · £1,815 single');
  const cros = DATA.pricing.models.find((m) => m.id === 'cros_e90');
  assert.match(HCCompare.priceText(cros), /pair-only/);
});

test('unconfirmed features never count against the old aid', () => {
  const r = HCCompare.compare(DATA, 'naida_l_old', 'naida90', { oldLevel: '90' });
  const f = r.features;
  assert.strictEqual(f.gained, 0);
  assert.strictEqual(f.oldCount, f.newCount, `old ${f.oldCount} vs new ${f.newCount}`);
  assert.ok(f.unconfirmed > 0);
  assert.ok(f.items.filter((i) => i.kind === 'unconfirmed').every((i) => i.old.state === '?'));
});

test('a feature only the old aid has is listed as lost', () => {
  const r = HCCompare.compare(DATA, 'audeo_sphere_i', 'e30', { oldLevel: '90' });
  assert.ok(r.features.items.some((i) => i.id === 'ai_chip' && i.kind === 'lost'));
});

test('type-ahead finds models by level code or platform name', () => {
  const labels = (q) => HCCompare.searchOld(DATA, q).map((e) => e.label);
  assert.deepStrictEqual(labels('q90'), ['Phonak Audéo Q90', 'Phonak Bolero Q90', 'Phonak Virto Q90', 'Phonak Naída Q90']);
  assert.deepStrictEqual(labels('quest 70'), ['Phonak Audéo Q70', 'Phonak Bolero Q70', 'Phonak Virto Q70', 'Phonak Naída Q70']);
  assert.ok(labels('audeo m70 r').includes('Phonak Audéo M70-R (Marvel)'));
  assert.ok(labels('sphere').every((l) => /Sphere/.test(l)));
  assert.strictEqual(labels('zzz').length, 0);
  const e = HCCompare.searchOld(DATA, 'virto q50')[0];
  assert.strictEqual(e.id, 'virto_q');
  assert.strictEqual(e.level, 50);
});

test('plans, discount and fitting match the pricing tool engine', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: 90, plan: 'home', discount: 'staff', fitting: 'pair' });
  const q = r.price.quote;
  assert.strictEqual(q.fullAidPrice, 4195);
  assert.strictEqual(q.aidPrice, 3146.25);
  assert.strictEqual(q.accessoryPrice, 142.5);
  assert.strictEqual(q.total, 3288.75);
  assert.strictEqual(q.insurance.status, 'Included');
  assert.strictEqual(q.warrantyYears, 4);
  assert.strictEqual(r.price.planDetail.accessory, 'TV Connector');
  assert.match(r.price.planDetail.benefit, /TV dialogue/);
  const existing = HCCompare.compare(DATA, 'audeo_q', 'e70', { plan: 'none', discount: 'existing', fitting: 'single' });
  assert.strictEqual(existing.price.quote.aidPrice, 2515.5); // 3995 x 0.69945 -> £2,795, then 10% off
  assert.strictEqual(existing.price.quote.discountName, 'Existing customer');
});

test('ineligible plan, discount or fitting falls back safely', () => {
  const nw = HCCompare.compare(DATA, 'virto_q', 'virto_i90_10nwo', { plan: 'home', discount: 'opticians' });
  assert.strictEqual(nw.price.plan, 'none');
  assert.strictEqual(nw.price.planEligible, false);
  const e30 = HCCompare.compare(DATA, 'audeo_q', 'e30', { discount: 'opticians' });
  assert.strictEqual(e30.price.discount, 'none'); // Opticians is Gold and above only
  const cros = HCCompare.compare(DATA, 'audeo_q', 'cros_e90', { fitting: 'single' });
  assert.strictEqual(cros.price.fitting, 'pair');
});

test('concerns move matching cards, features and plans to the front', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: 50, concerns: ['tv', 'battery'] });
  assert.strictEqual(r.cards.filter((c) => c.matters).map((c) => c.key).join(','), 'connect,power');
  assert.strictEqual(r.cards[0].key, 'connect');
  assert.ok(r.features.items[0].matters);
  assert.strictEqual(r.price.planOptions.find((p) => p.id === 'home').suits.join(), 'TV & music');
  assert.match(r.narrative, /you mentioned/);
});

test('every headline percentage states what it was compared with or is marked to verify', () => {
  for (const fam of Object.values(DATA.specs.families)) for (const lvl of Object.values(fam.levels || {})) {
    for (const st of lvl.stats || []) {
      if (!/\d/.test(st.value)) continue;
      assert.ok(st.vs || st.status === 'check', `${fam.label} ${st.value}`);
      assert.ok(['verified', 'check'].includes(st.status));
    }
  }
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: 90 });
  assert.match(r.narrative, /switched off/);
});

test('their-words board only offers what the new model can do', () => {
  const quotes = [{ text: 'I turn the TV up', concern: 'tv' }, { text: 'Restaurants are hopeless', concern: 'noise' },
    { text: 'I can’t hear my wife', concern: 'partner' }];
  const sphere = HCCompare.compare(DATA, 'audeo_q', 'e90', { oldLevel: 50, quotes }).words;
  assert.strictEqual(sphere.length, 3);
  assert.match(sphere[1].now, /AI chips/);
  assert.match(sphere[2].question, /partner/);
  const e30 = HCCompare.compare(DATA, 'audeo_q', 'e30', { quotes }).words;
  assert.doesNotMatch(e30[1].now, /AI/); // E30-R has no AI chip
  const nw = HCCompare.compare(DATA, 'virto_q', 'virto_i90_10nwo', { quotes }).words;
  assert.strictEqual(nw[0].matched, false); // non-wireless: no TV streaming promise
  assert.strictEqual(nw[2].matched, true); // falls back to SpeechSensor, which I90 has
  const two = HCCompare.compare(DATA, 'audeo_q', 'e90', { quotes: [quotes[1], { text: 'I nod along at the pub', concern: 'noise' }] }).words;
  assert.notStrictEqual(two[0].question, two[1].question);
  for (const c of DATA.concerns) assert.ok(DATA.words[c.id] && DATA.words[c.id].presets.length, c.id);
  for (const conf of Object.values(DATA.words)) for (const wi of conf.whatIf) for (const need of wi.needs) {
    assert.ok(/^plan:|^size$/.test(need) || DATA.features.features.some((f) => f.id === need), need);
  }
});

console.log(`\n${n} tests passed`);
