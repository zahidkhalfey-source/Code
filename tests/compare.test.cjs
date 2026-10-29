// Run: node tests/compare.test.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const HCCompare = require('../assets/compare.js');

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['sources', 'pricing', 'new-specs', 'legacy-platforms']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', `${f}.js`), 'utf8'), ctx);
}
const w = ctx.window;
const DATA = { pricing: w.HC_PRICING, specs: w.HC_NEW_SPECS, legacy: w.HC_LEGACY, sources: w.HC_SOURCES };
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
});

test('all old x new combinations render complete output', () => {
  for (const o of DATA.legacy.models) for (const p of DATA.pricing.models) {
    const r = HCCompare.compare(DATA, o.id, p.id, { patientName: 'Mr Jones' });
    assert.strictEqual(r.cards.length, 4);
    assert.strictEqual(r.rows.length, 10);
    for (const row of r.rows) for (const side of [row.old, row.new]) assert.ok(side.text, `${o.id}/${p.id} ${row.label}`);
    assert.ok(r.narrative.startsWith('Mr Jones, your'), r.narrative);
    const visible = r.cards.map((c) => [c.old.text, c.new.text, c.stat && c.stat.value, c.stat && c.stat.label, c.footnote].join(' ')).join(' ') + r.narrative;
    assert.ok(!/undefined|null|NaN/.test(visible), `${o.id}/${p.id}: ${visible}`);
  }
});

test('missing old-model specs use the exact not-found wording', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90');
  const size = r.cards.find((c) => c.key === 'size');
  assert.strictEqual(size.old.text, 'Specification not found in public archives—please verify with manufacturer');
  assert.strictEqual(size.stat.value, '25%');
});

test('Quest to EON Sphere headline content', () => {
  const r = HCCompare.compare(DATA, 'audeo_q', 'e90', { patientName: 'Mr Jones' });
  assert.match(r.narrative, /excellent technology for 2013/);
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

console.log(`\n${n} tests passed`);
