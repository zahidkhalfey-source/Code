/* Allergy Check — log food by meal and flag anything that matches the allergen list.
   Everything is stored on the phone (localStorage). Barcode lookups use Open Food Facts;
   label photos are read on-device with Tesseract.js. */
'use strict';

/* ---------------- Constants ---------------- */

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🥣', color: 'var(--breakfast)' },
  { id: 'lunch',     name: 'Lunch',     emoji: '🥪', color: 'var(--lunch)' },
  { id: 'dinner',    name: 'Dinner',    emoji: '🍝', color: 'var(--dinner)' },
  { id: 'snacks',    name: 'Snacks',    emoji: '🍎', color: 'var(--snacks)' },
];

const LIBS = {
  scanner: 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  ocr: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
};

/* Known allergen groups. If an entered allergen matches a group name or alias,
   every term in the group is searched for. Anything else is searched as typed. */
const GROUPS = [
  { key: 'Milk', aliases: ['milk', 'dairy', 'lactose', 'cows milk', "cow's milk"],
    terms: ['milk', 'dairy', 'butter', 'buttermilk', 'cheese', 'cream', 'creme', 'crème', 'yogurt', 'yoghurt',
      'whey', 'casein', 'caseinate', 'caseinates', 'lactose', 'lactalbumin', 'lactoglobulin', 'ghee', 'curd', 'curds',
      'custard', 'kefir', 'paneer', 'ricotta', 'mozzarella', 'cheddar', 'parmesan', 'quark', 'milk powder',
      'milk solids', 'milkfat', 'milk fat', 'skimmed milk', 'sour cream', 'ice cream', 'brie', 'feta', 'gouda'],
    except: ['cocoa butter', 'shea butter', 'peanut butter', 'nut butter', 'almond butter', 'cashew butter',
      'apple butter', 'sunflower butter', 'seed butter', 'coconut milk', 'almond milk', 'oat milk', 'soy milk',
      'soya milk', 'rice milk', 'cashew milk', 'coconut cream', 'cream of tartar', 'dairy free', 'dairy-free',
      'milk free', 'non dairy', 'non-dairy', 'cream crackers'] },
  { key: 'Egg', aliases: ['egg', 'eggs'],
    terms: ['egg', 'albumin', 'albumen', 'ovalbumin', 'ovomucoid', 'ovomucin', 'lysozyme', 'mayonnaise', 'mayo',
      'meringue', 'aioli', 'eggnog', 'egg white', 'egg yolk', 'custard', 'brioche'],
    except: ['eggplant', 'egg free', 'egg-free'] },
  { key: 'Peanuts', aliases: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
    terms: ['peanut', 'groundnut', 'arachis', 'monkey nut', 'satay', 'beer nuts'] },
  { key: 'Tree nuts', aliases: ['tree nut', 'tree nuts', 'nut', 'nuts', 'treenuts'],
    terms: ['tree nut', 'nut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'filbert',
      'macadamia', 'brazil nut', 'pine nut', 'praline', 'marzipan', 'nougat', 'gianduja', 'frangipane', 'pesto',
      'nutella', 'amaretto', 'pignoli'],
    except: ['nut free', 'nut-free', 'nutmeg', 'coconut', 'butternut', 'water chestnut', 'peanut'] },
  { key: 'Wheat', aliases: ['wheat'],
    terms: ['wheat', 'flour', 'semolina', 'durum', 'spelt', 'farro', 'couscous', 'bulgur', 'bulgar', 'seitan',
      'kamut', 'einkorn', 'emmer', 'bread', 'breadcrumbs', 'pasta', 'triticale', 'wheatgerm'],
    except: ['buckwheat', 'rice flour', 'corn flour', 'cornflour', 'maize flour', 'almond flour', 'coconut flour',
      'potato flour', 'chickpea flour', 'gram flour', 'tapioca flour', 'cassava flour', 'oat flour',
      'buckwheat flour', 'sorghum flour', 'wheat free', 'wheat-free', 'gluten free bread', 'gluten-free bread'] },
  { key: 'Gluten', aliases: ['gluten', 'coeliac', 'celiac'],
    terms: ['gluten', 'wheat', 'barley', 'rye', 'oat', 'malt', 'spelt', 'semolina', 'durum', 'couscous', 'bulgur',
      'seitan', 'triticale', 'kamut', 'farro', 'flour', 'bread', 'breadcrumbs', 'pasta', 'brewers yeast'],
    except: ['buckwheat', 'gluten free', 'gluten-free', 'rice flour', 'corn flour', 'cornflour', 'maize flour',
      'almond flour', 'coconut flour', 'potato flour', 'chickpea flour', 'gram flour', 'tapioca flour',
      'cassava flour', 'sorghum flour'] },
  { key: 'Soy', aliases: ['soy', 'soya', 'soybean', 'soybeans', 'soy beans'],
    terms: ['soy', 'soya', 'soybean', 'soy bean', 'tofu', 'edamame', 'miso', 'tempeh', 'tamari', 'shoyu',
      'natto', 'soy lecithin', 'soya lecithin'],
    except: ['soy free', 'soy-free', 'soya free'] },
  { key: 'Fish', aliases: ['fish'],
    terms: ['fish', 'anchovy', 'anchovies', 'cod', 'salmon', 'tuna', 'haddock', 'pollock', 'pollack', 'tilapia',
      'sardine', 'mackerel', 'trout', 'halibut', 'herring', 'catfish', 'swordfish', 'hake', 'plaice', 'sole',
      'snapper', 'fish sauce', 'worcestershire', 'surimi'],
    except: ['fish free'] },
  { key: 'Shellfish', aliases: ['shellfish', 'crustacean', 'crustaceans', 'seafood'],
    terms: ['shellfish', 'crustacean', 'shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'langoustine',
      'scampi', 'krill', 'mollusc', 'mollusk', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'calamari',
      'octopus', 'cockle', 'whelk'] },
  { key: 'Molluscs', aliases: ['mollusc', 'molluscs', 'mollusk', 'mollusks'],
    terms: ['mollusc', 'mollusk', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'calamari', 'octopus',
      'snail', 'escargot', 'cockle', 'whelk', 'oyster sauce'] },
  { key: 'Sesame', aliases: ['sesame', 'sesame seed', 'sesame seeds'],
    terms: ['sesame', 'tahini', 'tahina', 'benne', 'gingelly', 'halva', 'halvah', 'hummus', 'houmous'] },
  { key: 'Mustard', aliases: ['mustard'], terms: ['mustard'] },
  { key: 'Celery', aliases: ['celery', 'celeriac'], terms: ['celery', 'celeriac'] },
  { key: 'Lupin', aliases: ['lupin', 'lupine'], terms: ['lupin', 'lupine', 'lupini'] },
  { key: 'Sulphites', aliases: ['sulphite', 'sulphites', 'sulfite', 'sulfites', 'sulphur dioxide', 'sulfur dioxide'],
    terms: ['sulphite', 'sulfite', 'sulphur dioxide', 'sulfur dioxide', 'metabisulphite', 'metabisulfite',
      'bisulphite', 'bisulfite', 'e220', 'e221', 'e222', 'e223', 'e224', 'e226', 'e227', 'e228'] },
  { key: 'Corn', aliases: ['corn', 'maize'],
    terms: ['corn', 'maize', 'cornstarch', 'cornflour', 'corn flour', 'polenta', 'corn syrup', 'popcorn', 'grits'],
    except: ['peppercorn', 'corn free'] },
];

const COMMON = ['Milk', 'Egg', 'Peanuts', 'Tree nuts', 'Wheat', 'Gluten', 'Soy', 'Fish', 'Shellfish', 'Sesame',
  'Mustard', 'Celery', 'Lupin', 'Molluscs', 'Sulphites', 'Corn'];

/* ---------------- Storage ---------------- */

const STORE_KEY = 'allergyCheck.v1';
let state = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.days) return { settings: { childName: '', allergens: [], reportTime: '19:00', ...s.settings }, days: s.days };
  } catch (e) { /* fall through */ }
  return { settings: { childName: '', allergens: [], reportTime: '19:00' }, days: {} };
}
function save() {
  // keep ~90 days of history
  const keys = Object.keys(state.days).sort();
  while (keys.length > 90) delete state.days[keys.shift()];
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Phone storage is full — delete some old photo items.'); }
}
function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dayData(key) {
  if (!state.days[key]) state.days[key] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  return state.days[key];
}
function prettyDate(key, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
}

/* ---------------- Allergen matching ---------------- */

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = s => (s || '').toLowerCase().replace(/[’`]/g, "'").replace(/[_:]/g, ' ');

function groupFor(allergen) {
  const a = norm(allergen).trim();
  return GROUPS.find(g => g.key.toLowerCase() === a || g.aliases.includes(a));
}

function termsFor(allergen) {
  const g = groupFor(allergen);
  if (g) return { terms: g.terms, except: g.except || [] };
  const a = norm(allergen).trim();
  return { terms: [a.replace(/(es|s)$/, '') || a], except: [`${a} free`, `${a}-free`] };
}

function findTerm(text, terms, except) {
  let t = ' ' + norm(text) + ' ';
  for (const ex of except) t = t.split(ex).join(' ');
  for (const term of terms) {
    // word boundary, optional plural, not followed by "free"
    const re = new RegExp(`(^|[^a-z0-9])${esc(term)}(s|es)?(?![a-z0-9])(?!\\s*-?\\s*free)`, 'i');
    if (re.test(t)) return term;
  }
  return null;
}

/* Split label text into the main ingredients and any "may contain" statements. */
const TRACE_RE = /(may (also )?contain|traces? of|made in a (factory|facility)|produced in a (factory|facility)|manufactured (on|in)|processed (on|in)|packed in a|not suitable for)[^.]*/gi;
function splitTraces(text) {
  const traces = (text || '').match(TRACE_RE) || [];
  return { main: (text || '').replace(TRACE_RE, ' '), traces: traces.join('. ') };
}

/* Returns { level: 'danger'|'warn'|'ok'|'unknown', hits: [{allergen, term, kind}] } */
function checkItem(item, allergens = state.settings.allergens) {
  const { main, traces } = splitTraces(item.ingredients);
  const tagText = (item.allergenTags || []).map(t => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')).join(', ');
  const traceTagText = (item.traceTags || []).map(t => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')).join(', ');
  const contains = [item.name, main, tagText].join(' , ');
  const mayContain = [traces, traceTagText].join(' , ');

  const hits = [];
  for (const a of allergens) {
    const { terms, except } = termsFor(a);
    const t1 = findTerm(contains, terms, except);
    if (t1) { hits.push({ allergen: a, term: t1, kind: 'contains' }); continue; }
    const t2 = findTerm(mayContain, terms, except);
    if (t2) hits.push({ allergen: a, term: t2, kind: 'may contain' });
  }
  const hasInfo = !!((item.ingredients || '').trim() || (item.allergenTags || []).length);
  let level = 'ok';
  if (hits.some(h => h.kind === 'contains')) level = 'danger';
  else if (hits.length) level = 'warn';
  else if (!hasInfo) level = 'unknown';
  return { level, hits };
}

function hitPills(res) {
  if (res.level === 'unknown') return `<span class="pill warn">No ingredients — check manually</span>`;
  if (!res.hits.length) return `<span class="pill ok">No allergens found</span>`;
  return res.hits.map(h => h.kind === 'contains'
    ? `<span class="pill danger">⚠ ${h_(h.allergen)}${h.term.toLowerCase() !== h.allergen.toLowerCase() ? ` (${h_(h.term)})` : ''}</span>`
    : `<span class="pill warn">May contain ${h_(h.allergen)}</span>`).join('');
}

function resultBox(res) {
  if (!state.settings.allergens.length) return `<div class="result-box warn">No allergens set yet — add them with the ⚙︎ button.</div>`;
  if (res.level === 'danger') return `<div class="result-box danger"><b>Contains:</b> ${res.hits.filter(h => h.kind === 'contains').map(h => `${h_(h.allergen)} (“${h_(h.term)}”)`).join(', ')}${res.hits.some(h => h.kind !== 'contains') ? `<br><b>May contain:</b> ${res.hits.filter(h => h.kind !== 'contains').map(h => h_(h.allergen)).join(', ')}` : ''}</div>`;
  if (res.level === 'warn') return `<div class="result-box warn"><b>May contain:</b> ${res.hits.map(h => h_(h.allergen)).join(', ')}</div>`;
  if (res.level === 'unknown') return `<div class="result-box warn">Only the name was checked. Add ingredients for a proper check.</div>`;
  return `<div class="result-box ok">✓ No listed allergens found.</div>`;
}

/* ---------------- Helpers ---------------- */

const $ = sel => document.querySelector(sel);
function h_(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
}

const loaded = {};
function loadScript(src) {
  if (!loaded[src]) loaded[src] = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
  return loaded[src];
}

function setHeader(title, subtitle, showBack) {
  $('#title').textContent = title;
  $('#subtitle').textContent = subtitle || '';
  $('#backBtn').hidden = !showBack;
}

/* ---------------- Router ---------------- */

function route() {
  closeSheet();
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  window.scrollTo(0, 0);
  if (parts[0] === 'meal' && MEALS.some(m => m.id === parts[1])) return renderMeal(parts[1]);
  if (parts[0] === 'report') return renderReport(parts[1] || todayKey());
  if (parts[0] === 'settings') return renderSettings();
  renderHome();
}
window.addEventListener('hashchange', route);
$('#backBtn').onclick = () => { location.hash = '#/'; };
$('#settingsBtn').onclick = () => { location.hash = '#/settings'; };

/* ---------------- Home ---------------- */

function isEndOfDay() {
  const [h, m] = (state.settings.reportTime || '19:00').split(':').map(Number);
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
}

function renderHome() {
  const key = todayKey();
  const day = dayData(key);
  const who = state.settings.childName ? `${state.settings.childName}'s food` : 'Allergy Check';
  setHeader(who, prettyDate(key), false);

  let total = 0, flagged = 0;
  const tiles = MEALS.map(m => {
    const items = day[m.id];
    const bad = items.filter(i => checkItem(i).level === 'danger').length;
    total += items.length; flagged += bad;
    return `<button class="meal-btn" style="--meal:${m.color}" data-meal="${m.id}">
      ${bad ? `<span class="flag">${bad}</span>` : ''}
      <span class="emoji">${m.emoji}</span>
      <span><div class="name">${m.name}</div>
      <div class="count">${items.length ? `${items.length} item${items.length > 1 ? 's' : ''}` : 'Nothing yet'}</div></span>
    </button>`;
  }).join('');

  const setup = !state.settings.allergens.length
    ? `<div class="notice"><b>First, add the allergens.</b><br>Nothing can be checked until the allergen list is set.<br><button class="btn" onclick="location.hash='#/settings'">Set allergens</button></div>` : '';

  const eod = isEndOfDay() && total;
  $('#view').innerHTML = `
    ${setup}
    <div class="meal-grid">${tiles}</div>
    <button class="report-cta" onclick="location.hash='#/report'">
      <span style="font-size:24px">${flagged ? '⚠️' : '📋'}</span>
      <span>${eod ? 'End-of-day report is ready' : "Today's report"}<br>
      <span style="font-weight:500;font-size:14px;opacity:.85">${total ? `${total} item${total > 1 ? 's' : ''} logged · ${flagged ? `${flagged} allergen hit${flagged > 1 ? 's' : ''}` : 'no allergen hits'}` : 'No food logged yet'}</span></span>
      <span class="arrow">›</span>
    </button>`;
  document.querySelectorAll('.meal-btn').forEach(b => b.onclick = () => { location.hash = '#/meal/' + b.dataset.meal; });
}

/* ---------------- Meal screen ---------------- */

const SRC_ICON = { text: '✏️', barcode: '▥', photo: '📷' };

function itemRow(item, meal, key, editable) {
  const res = checkItem(item);
  const icon = item.photo ? `<img class="thumb" src="${item.photo}" alt="">` : `<div class="src">${SRC_ICON[item.source] || '✏️'}</div>`;
  const time = new Date(item.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `<div class="item" data-id="${item.id}" data-meal="${meal}" data-key="${key}">
    ${icon}
    <div class="body">
      <div class="name">${h_(item.name)}</div>
      <div class="meta">${time}${item.brand ? ' · ' + h_(item.brand) : ''}</div>
      ${item.ingredients ? `<div class="ingr">${h_(item.ingredients)}</div>` : ''}
      <div>${hitPills(res)}</div>
    </div>
    ${editable ? `<button class="del" aria-label="Delete">×</button>` : ''}
  </div>`;
}

function renderMeal(mealId) {
  const meal = MEALS.find(m => m.id === mealId);
  const key = todayKey();
  const items = dayData(key)[mealId];
  setHeader(`${meal.emoji} ${meal.name}`, prettyDate(key), true);

  $('#view').innerHTML = `
    <div class="section-title">Add food</div>
    <div class="add-row">
      <button class="add-btn" id="addText"><span class="ic">✏️</span>Type it</button>
      <button class="add-btn" id="addBarcode"><span class="ic">▥</span>Barcode</button>
      <button class="add-btn" id="addPhoto"><span class="ic">📷</span>Photo</button>
    </div>
    <div class="section-title">Logged today</div>
    <div class="card">${items.length ? items.slice().reverse().map(i => itemRow(i, mealId, key, true)).join('') : '<div class="empty">Nothing logged for this meal yet.</div>'}</div>
    <p class="disclaimer">Tap an item to edit it.</p>`;

  $('#addText').onclick = () => openTextSheet(mealId);
  $('#addBarcode').onclick = () => openBarcodeSheet(mealId);
  $('#addPhoto').onclick = () => openPhotoSheet(mealId);

  document.querySelectorAll('.item').forEach(row => {
    const item = items.find(i => i.id === row.dataset.id);
    row.querySelector('.del').onclick = e => {
      e.stopPropagation();
      if (!confirm(`Delete “${item.name}”?`)) return;
      dayData(key)[mealId] = items.filter(i => i.id !== item.id);
      save(); renderMeal(mealId);
    };
    row.onclick = () => openTextSheet(mealId, item);
  });
}

function addItem(mealId, item) {
  const day = dayData(todayKey());
  const idx = day[mealId].findIndex(i => i.id === item.id);
  if (idx >= 0) day[mealId][idx] = item; else day[mealId].push(item);
  save();
  const res = checkItem(item);
  closeSheet();
  renderMeal(mealId);
  if (res.level === 'danger') {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    toast(`⚠️ ${item.name} contains ${res.hits.filter(h => h.kind === 'contains').map(h => h.allergen).join(', ')}`);
  } else toast(`Added ${item.name}`);
}

/* ---------------- Sheets ---------------- */

let sheetCleanup = null;
function openSheet(html) {
  $('#sheetBody').innerHTML = html;
  $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  if (sheetCleanup) { const c = sheetCleanup; sheetCleanup = null; try { c(); } catch (e) {} }
  $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true;
  document.body.style.overflow = '';
}
$('#sheetBackdrop').onclick = closeSheet;

/* A shared "review and save" form used by all three input methods. */
function reviewForm(mealId, base) {
  openSheet(`
    <h2>${base.id ? 'Edit item' : 'Check & save'}</h2>
    ${base.photo ? `<img class="photo-preview" src="${base.photo}" alt="">` : ''}
    <label class="field">Food name
      <input class="input" id="fName" value="${h_(base.name || '')}" placeholder="e.g. Chicken nuggets" autocomplete="off"></label>
    <label class="field">Ingredients <span style="font-weight:400">(optional, but gives a better check)</span>
      <textarea class="input" id="fIngr" placeholder="Paste or type the ingredients list">${h_(base.ingredients || '')}</textarea></label>
    ${base.allergenTags && base.allergenTags.length ? `<div class="hint">Product database lists allergens: ${h_(base.allergenTags.map(t => t.replace(/^[a-z]{2}:/, '')).join(', '))}</div>` : ''}
    <div id="fResult"></div>
    <div class="btn-row">
      <button class="btn secondary" id="fCancel">Cancel</button>
      <button class="btn" id="fSave">${base.id ? 'Save' : 'Add to ' + MEALS.find(m => m.id === mealId).name}</button>
    </div>`);

  const current = () => ({ ...base, name: $('#fName').value.trim(), ingredients: $('#fIngr').value.trim() });
  const update = () => {
    const it = current();
    $('#fResult').innerHTML = it.name || it.ingredients ? resultBox(checkItem(it)) : '';
    $('#fSave').disabled = !it.name;
  };
  $('#fName').oninput = update; $('#fIngr').oninput = update; update();
  $('#fCancel').onclick = closeSheet;
  $('#fSave').onclick = () => {
    const it = current();
    if (!it.name) return;
    addItem(mealId, { source: 'text', ...it, id: it.id || uid(), time: it.time || Date.now() });
  };
  if (!base.name) setTimeout(() => $('#fName').focus(), 250);
}

function openTextSheet(mealId, existing) {
  reviewForm(mealId, existing || { source: 'text' });
}

/* ---- Barcode ---- */

async function lookupBarcode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,traces_tags`;
  const r = await fetch(url);
  if (!r.ok && r.status !== 404) throw new Error('Lookup failed');
  const j = await r.json();
  if (j.status !== 1 || !j.product) return null;
  const p = j.product;
  return {
    name: p.product_name_en || p.product_name || `Product ${code}`,
    brand: (p.brands || '').split(',')[0].trim(),
    ingredients: p.ingredients_text_en || p.ingredients_text || '',
    allergenTags: p.allergens_tags || [],
    traceTags: p.traces_tags || [],
  };
}

async function handleBarcode(mealId, code) {
  code = String(code).replace(/\D/g, '');
  if (!code) return;
  if (navigator.vibrate) navigator.vibrate(60);
  openSheet(`<h2>Looking up ${h_(code)}…</h2><div class="progress"><div style="width:60%"></div></div>`);
  try {
    const p = await lookupBarcode(code);
    if (p) return reviewForm(mealId, { source: 'barcode', barcode: code, ...p });
    openSheet(`<h2>Product not found</h2>
      <p>Barcode <b>${h_(code)}</b> isn't in the Open Food Facts database.</p>
      <div class="btn-row" style="flex-direction:column">
        <button class="btn" id="nfPhoto">📷 Photograph the ingredients label</button>
        <button class="btn secondary" id="nfType">✏️ Type it in</button>
      </div>`);
    $('#nfPhoto').onclick = () => openPhotoSheet(mealId, code);
    $('#nfType').onclick = () => reviewForm(mealId, { source: 'barcode', barcode: code });
  } catch (e) {
    openSheet(`<h2>Couldn't look that up</h2><p>Check you have an internet connection, or type the item in instead.</p>
      <div class="btn-row"><button class="btn secondary" id="erType">Type it in</button><button class="btn" id="erRetry">Try again</button></div>`);
    $('#erType').onclick = () => reviewForm(mealId, { source: 'barcode', barcode: code });
    $('#erRetry').onclick = () => handleBarcode(mealId, code);
  }
}

async function openBarcodeSheet(mealId) {
  openSheet(`
    <h2>Scan barcode</h2>
    <div id="reader"></div>
    <div class="hint" id="scanHint">Starting camera…</div>
    <label class="field">Or enter the number
      <div style="display:flex;gap:8px"><input class="input" id="bcManual" inputmode="numeric" placeholder="e.g. 5000159407236">
      <button class="btn" id="bcGo" style="margin-top:6px">Go</button></div></label>
    <label class="btn secondary block" style="display:block;text-align:center;margin-top:12px">📷 Scan from a photo instead
      <input type="file" accept="image/*" capture="environment" id="bcFile" hidden></label>
    <button class="btn secondary block" style="margin-top:10px" id="bcCancel">Cancel</button>`);

  $('#bcCancel').onclick = closeSheet;
  $('#bcGo').onclick = () => handleBarcode(mealId, $('#bcManual').value);
  $('#bcManual').onkeydown = e => { if (e.key === 'Enter') handleBarcode(mealId, $('#bcManual').value); };

  let scanner = null, done = false;
  const stop = async () => { if (scanner) { try { await scanner.stop(); } catch (e) {} try { scanner.clear(); } catch (e) {} scanner = null; } };
  sheetCleanup = stop;

  try {
    await loadScript(LIBS.scanner);
    const F = window.Html5QrcodeSupportedFormats;
    const formats = [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128];
    $('#bcFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      await stop();
      try {
        const tmp = new window.Html5Qrcode('reader', { formatsToSupport: formats, verbose: false });
        const code = await tmp.scanFile(f, false);
        handleBarcode(mealId, code);
      } catch (err) { $('#scanHint').textContent = "Couldn't find a barcode in that photo. Try again closer up, or type the number."; }
    };
    if (!sheetCleanup) return; // sheet closed while loading
    scanner = new window.Html5Qrcode('reader', { formatsToSupport: formats, verbose: false });
    await scanner.start({ facingMode: 'environment' },
      { fps: 10, qrbox: (w, h) => ({ width: Math.min(w * 0.85, 320), height: Math.min(h * 0.5, 160) }) },
      async text => {
        if (done) return; done = true;
        await stop(); sheetCleanup = null;
        handleBarcode(mealId, text);
      }, () => {});
    $('#scanHint').textContent = 'Point the camera at the barcode.';
  } catch (e) {
    const hint = $('#scanHint');
    if (hint) hint.textContent = 'Camera not available here — use “Scan from a photo” or type the number.';
    const reader = $('#reader'); if (reader) reader.style.display = 'none';
  }
}

/* ---- Photo / OCR ---- */

function readImage(file, maxSide) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c);
    };
    img.onerror = rej;
    img.src = url;
  });
}

function cleanOcr(text) {
  // Join wrapped lines and tidy common OCR noise; try to keep only the ingredients section.
  let t = text.replace(/\r/g, '').replace(/-\n/g, '').replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const m = t.match(/ingredients?\s*[:;.]?\s*(.*)/i);
  if (m && m[1].length > 15) t = m[1];
  return t;
}

function openPhotoSheet(mealId, barcode) {
  openSheet(`
    <h2>Photo of food or label</h2>
    <p class="hint" style="font-size:15px">Take a clear, close photo of the <b>ingredients list</b>. The app reads the text on your phone and checks it. A photo of a plate of food is saved for the record, but you'll need to type what's in it.</p>
    <label class="btn block" style="display:block;text-align:center;margin-top:12px">📷 Take photo
      <input type="file" accept="image/*" capture="environment" id="phFile" hidden></label>
    <label class="btn secondary block" style="display:block;text-align:center;margin-top:10px">🖼 Choose from library
      <input type="file" accept="image/*" id="phLib" hidden></label>
    <div id="phStatus"></div>
    <button class="btn secondary block" style="margin-top:10px" id="phCancel">Cancel</button>`);
  $('#phCancel').onclick = closeSheet;

  let cancelled = false;
  sheetCleanup = () => { cancelled = true; };

  const onFile = async e => {
    const f = e.target.files[0]; if (!f) return;
    const canvas = await readImage(f, 1800);
    const thumb = (await readImage(f, 240)).toDataURL('image/jpeg', 0.7);
    $('#phStatus').innerHTML = `<img class="photo-preview" src="${thumb}" alt="">
      <div class="hint" id="ocrMsg">Reading the label…</div><div class="progress"><div id="ocrBar"></div></div>
      <button class="btn secondary block" style="margin-top:10px" id="skipOcr">Skip — I'll type it</button>`;
    let skipped = false;
    $('#skipOcr').onclick = () => { skipped = true; reviewForm(mealId, { source: 'photo', photo: thumb, barcode }); };
    let text = '';
    try {
      await loadScript(LIBS.ocr);
      const { data } = await window.Tesseract.recognize(canvas, 'eng', {
        logger: m => {
          const bar = document.getElementById('ocrBar');
          if (bar && m.status === 'recognizing text') bar.style.width = Math.round(m.progress * 100) + '%';
        },
      });
      text = cleanOcr(data.text || '');
    } catch (err) {
      text = '';
      if (!skipped && !cancelled) toast("Couldn't read the text — please type it.");
    }
    if (skipped || cancelled) return;
    reviewForm(mealId, { source: 'photo', photo: thumb, barcode, name: '', ingredients: text });
  };
  $('#phFile').onchange = onFile;
  $('#phLib').onchange = onFile;
}

/* ---------------- Report ---------------- */

function renderReport(key) {
  const day = state.days[key] || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const isToday = key === todayKey();
  setHeader(isToday ? "Today's report" : 'Report', prettyDate(key), true);

  const rows = [];
  let total = 0, danger = 0, warn = 0;
  const lines = [];
  for (const m of MEALS) {
    const items = day[m.id] || [];
    total += items.length;
    for (const it of items) {
      const r = checkItem(it);
      if (r.level === 'danger') { danger++; lines.push(`⚠️ ${m.name}: ${it.name} — contains ${r.hits.filter(h => h.kind === 'contains').map(h => h.allergen).join(', ')}`); }
      else if (r.level === 'warn') { warn++; lines.push(`• ${m.name}: ${it.name} — may contain ${r.hits.map(h => h.allergen).join(', ')}`); }
      else if (r.level === 'unknown') { warn++; lines.push(`• ${m.name}: ${it.name} — no ingredients, check manually`); }
    }
    rows.push(`<div class="section-title">${m.emoji} ${m.name}</div>
      <div class="card">${items.length ? items.map(i => itemRow(i, m.id, key, false)).join('') : '<div class="empty">Nothing logged</div>'}</div>`);
  }

  let verdict;
  if (!state.settings.allergens.length) verdict = `<div class="verdict warn"><div class="big">⚙︎</div><div class="head">No allergens set</div><div class="sub">Add the allergen list to get a report.</div></div>`;
  else if (!total) verdict = `<div class="verdict warn"><div class="big">🍽</div><div class="head">No food logged</div><div class="sub">Nothing was added for this day.</div></div>`;
  else if (danger) verdict = `<div class="verdict danger"><div class="big">⚠️</div><div class="head">${danger} item${danger > 1 ? 's' : ''} contained an allergen</div><div class="sub">${total} item${total > 1 ? 's' : ''} logged${warn ? ` · ${warn} to double-check` : ''}</div></div>`;
  else if (warn) verdict = `<div class="verdict warn"><div class="big">🔎</div><div class="head">No confirmed allergens</div><div class="sub">${warn} item${warn > 1 ? 's' : ''} to double-check · ${total} logged</div></div>`;
  else verdict = `<div class="verdict ok"><div class="big">✅</div><div class="head">All clear</div><div class="sub">None of the ${total} item${total > 1 ? 's' : ''} logged hit an allergen.</div></div>`;

  // day navigation through stored history
  const keys = Array.from(new Set([...Object.keys(state.days), todayKey()])).sort();
  const i = keys.indexOf(key);
  const prev = i > 0 ? keys[i - 1] : null;
  const next = i >= 0 && i < keys.length - 1 ? keys[i + 1] : null;

  $('#view').innerHTML = `
    <div class="day-nav">
      <button ${prev ? '' : 'disabled'} id="prevDay">‹ Earlier</button>
      <button ${next ? '' : 'disabled'} id="nextDay">Later ›</button>
    </div>
    ${state.settings.allergens.length ? `<div class="subtitle" style="margin-top:10px">Checking for: ${h_(state.settings.allergens.join(', '))}</div>` : ''}
    <div style="margin-top:12px">${verdict}</div>
    ${total ? `<button class="btn secondary block" style="margin-top:12px" id="shareBtn">Share report</button>` : ''}
    ${rows.join('')}
    <p class="disclaimer">This is a helper, not a guarantee. Always read the label yourself — databases and photo-reading can miss things.</p>`;

  if (prev) $('#prevDay').onclick = () => { location.hash = '#/report/' + prev; };
  if (next) $('#nextDay').onclick = () => { location.hash = '#/report/' + next; };
  const sb = $('#shareBtn');
  if (sb) sb.onclick = async () => {
    const who = state.settings.childName ? `${state.settings.childName}'s` : 'Food';
    const text = `${who} allergy report — ${prettyDate(key)}\nAllergens: ${state.settings.allergens.join(', ')}\n\n` +
      (lines.length ? lines.join('\n') : `✅ All clear — ${total} items, no allergens found.`) +
      `\n\nEverything logged:\n` + MEALS.map(m => `${m.name}: ${(day[m.id] || []).map(i => i.name).join(', ') || '—'}`).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Allergy report', text });
      else { await navigator.clipboard.writeText(text); toast('Report copied'); }
    } catch (e) { /* user cancelled */ }
  };
}

/* ---------------- Settings ---------------- */

function renderSettings() {
  setHeader('Allergens', 'What to check for', true);
  const s = state.settings;
  const chosen = s.allergens;
  const suggestions = COMMON.filter(c => !chosen.some(a => a.toLowerCase() === c.toLowerCase()));

  $('#view').innerHTML = `
    <div class="section-title">His allergens</div>
    <div class="card" style="padding:14px 16px">
      ${chosen.length ? `<div class="chips" style="margin-top:0">${chosen.map((a, i) => `<button class="chip on" data-rm="${i}">${h_(a)} <span class="x">×</span></button>`).join('')}</div>`
        : `<div class="hint" style="margin-top:0">None yet. Tap the common ones below or type your own.</div>`}
      <div style="display:flex;gap:8px;margin-top:12px">
        <input class="input" id="newAllergen" placeholder="Add another, e.g. kiwi" autocomplete="off" style="margin-top:0">
        <button class="btn" id="addAllergen">Add</button>
      </div>
      <div class="hint">You can paste a list separated by commas.</div>
    </div>

    <div class="section-title">Common allergens — tap to add</div>
    <div class="chips">${suggestions.map(c => `<button class="chip" data-add="${h_(c)}">+ ${h_(c)}</button>`).join('')}</div>

    <div class="section-title">Details</div>
    <div class="card" style="padding:4px 16px 16px">
      <label class="field">Child's name (optional)
        <input class="input" id="childName" value="${h_(s.childName)}" placeholder="e.g. Sam"></label>
      <label class="field">End-of-day report time
        <input class="input" type="time" id="reportTime" value="${h_(s.reportTime)}"></label>
      <div class="hint">After this time the home screen shows that the day's report is ready.</div>
    </div>
    <p class="disclaimer">Common allergens also catch related words — e.g. “Milk” also flags butter, cheese, whey, casein; “Tree nuts” flags almond, cashew, pesto, marzipan. Data is stored only on this phone.</p>`;

  const addMany = str => {
    str.split(/[,\n;]/).map(x => x.trim()).filter(Boolean).forEach(a => {
      const g = groupFor(a);
      const name = g ? g.key : a.charAt(0).toUpperCase() + a.slice(1);
      if (!s.allergens.some(x => x.toLowerCase() === name.toLowerCase())) s.allergens.push(name);
    });
    save(); renderSettings();
  };
  $('#addAllergen').onclick = () => addMany($('#newAllergen').value);
  $('#newAllergen').onkeydown = e => { if (e.key === 'Enter') addMany($('#newAllergen').value); };
  document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => addMany(b.dataset.add));
  document.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
    s.allergens.splice(Number(b.dataset.rm), 1); save(); renderSettings();
  });
  $('#childName').onchange = e => { s.childName = e.target.value.trim(); save(); };
  $('#reportTime').onchange = e => { s.reportTime = e.target.value || '19:00'; save(); };
}

/* ---------------- Boot ---------------- */

// Re-render home when the app comes back to the foreground on a new day.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (location.hash === '' || location.hash === '#/')) renderHome();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

// Expose matcher for tests.
window.__allergy = { checkItem, splitTraces, termsFor };

route();
