// UI wiring for index.html. Comparison rules live in compare.js; prices,
// plans and discounts come from pricing-engine.js (the pricing tool's engine).
(function () {
  const BUILD = '__BUILD__'; // replaced by scripts/build_single.py
  const DATA = {
    pricing: window.HC_PRICING,
    specs: window.HC_NEW_SPECS,
    legacy: window.HC_LEGACY,
    sources: window.HC_SOURCES,
    features: window.HC_FEATURES,
    concerns: window.HC_CONCERNS,
    plans: window.HC_PLANS,
    words: window.HC_WORDS,
    engine: window.Pricing.create(window.HC_PRICING.engine),
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('setup'), patient: $('patient'), oldSearch: $('old-search'), oldList: $('old-list'),
    newModel: $('new-model'), discount: $('discount'), chips: $('concern-chips'), print: $('print'),
    error: $('form-error'), output: $('output'), stamp: $('data-stamp'),
    wordPresets: $('word-presets'), wordText: $('word-text'), wordConcern: $('word-concern'),
    wordAdd: $('word-add'), wordList: $('word-list'),
  };

  // Everything the comparison depends on. Plan and insurance are chosen in the results.
  const state = { old: null, concerns: [], quotes: [], plan: 'none', purchaseInsurance: false, generated: false, mode: null };

  const ICONS = {
    speech: '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4M7 10v4M11 10v4"/>',
    size: '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon">${ICONS[name] || ''}</svg>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const money = (n) => '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const longDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const version = () => (BUILD.startsWith('__') ? 'development copy' : BUILD);

  function badge(c) {
    if (c.status === 'check') {
      const src = c.source && DATA.sources[c.source] ? DATA.sources[c.source].title : 'secondary source';
      return ` <span class="pill check" title="Source: ${esc(src)}">Verify</span>`;
    }
    return '';
  }
  const cellHtml = (c) => `<span class="${c.status === 'unknown' ? 'unknown' : ''}">${esc(c.text)}</span>${badge(c)}`;

  // ---------- current-aid type-ahead ----------
  let active = -1;
  let matches = [];

  function openList() {
    matches = HCCompare.searchOld(DATA, els.oldSearch.value);
    active = matches.length ? 0 : -1;
    let html = '';
    let group = '';
    matches.forEach((m, i) => {
      if (m.platform !== group) {
        group = m.platform;
        html += `<li class="combo-group" role="presentation">${esc(group)}</li>`;
      }
      html += `<li role="option" id="old-opt-${i}" data-i="${i}" class="combo-opt${i === active ? ' active' : ''}" aria-selected="${i === active}">
        <span>${esc(m.label.replace(/^Phonak /, ''))}</span><small>${esc(m.sub)}</small></li>`;
    });
    if (!matches.length) html = '<li class="combo-empty" role="presentation">No match. Try a model letter and level, e.g. “M70” or “Paradise 90”.</li>';
    els.oldList.innerHTML = html;
    els.oldList.hidden = false;
    els.oldSearch.setAttribute('aria-expanded', 'true');
    syncActive();
  }

  function closeList() {
    els.oldList.hidden = true;
    els.oldSearch.setAttribute('aria-expanded', 'false');
    els.oldSearch.removeAttribute('aria-activedescendant');
  }

  function syncActive() {
    els.oldList.querySelectorAll('.combo-opt').forEach((li) => {
      const on = Number(li.dataset.i) === active;
      li.classList.toggle('active', on);
      li.setAttribute('aria-selected', String(on));
      if (on) li.scrollIntoView({ block: 'nearest' });
    });
    if (active >= 0) els.oldSearch.setAttribute('aria-activedescendant', `old-opt-${active}`);
  }

  function chooseOld(i) {
    const m = matches[i];
    if (!m) return;
    state.old = { id: m.id, level: m.level };
    els.oldSearch.value = m.label.replace(/^Phonak /, '');
    closeList();
    suggestNew(m.id);
    if (state.generated) generate();
  }

  els.oldSearch.addEventListener('input', () => { state.old = null; openList(); });
  els.oldSearch.addEventListener('focus', openList);
  els.oldSearch.addEventListener('blur', () => setTimeout(closeList, 150));
  els.oldSearch.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (els.oldList.hidden) openList();
      e.preventDefault();
      if (!matches.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
      syncActive();
    } else if (e.key === 'Enter' && !els.oldList.hidden && active >= 0) {
      e.preventDefault();
      chooseOld(active);
    } else if (e.key === 'Escape') {
      closeList();
    }
  });
  els.oldList.addEventListener('mousedown', (e) => {
    const li = e.target.closest('.combo-opt');
    if (li) { e.preventDefault(); chooseOld(Number(li.dataset.i)); }
  });

  // ---------- other controls ----------
  function fillNew() {
    const groups = {};
    for (const m of DATA.pricing.models) (groups[m.family] ||= []).push(m);
    let html = '<option value="">Select new model…</option>';
    for (const [fam, list] of Object.entries(groups)) {
      html += `<optgroup label="${esc(fam)}">`;
      html += list.map((m) => `<option value="${m.id}">${esc(m.name)} · ${esc(m.tier)}</option>`).join('');
      html += '</optgroup>';
    }
    els.newModel.innerHTML = html;
  }

  // Discount list: ineligible offers stay visible but disabled, as in the pricing tool.
  function fillDiscounts() {
    const id = els.newModel.value;
    const current = els.discount.value || 'none';
    const opts = [['none', 'No discount', 0], ['existing', 'Existing customer', 0.1],
      ...Object.entries(DATA.engine.discounts).filter(([k]) => k !== 'none').map(([k, d]) => [k, d.name, d.rate])];
    els.discount.innerHTML = opts.map(([k, name, rate]) => {
      const ok = k === 'none' || k === 'existing' || !id || DATA.engine.discountEligible(id, k);
      return `<option value="${k}"${ok ? '' : ' disabled'}>${esc(name)}${rate ? ` (${Math.round(rate * 100)}%)` : ''}${ok ? '' : ' – not for this model'}</option>`;
    }).join('');
    const still = [...els.discount.options].find((o) => o.value === current && !o.disabled);
    els.discount.value = still ? current : 'none';
  }

  function fillConcerns() {
    els.chips.innerHTML = DATA.concerns.map((c) =>
      `<label class="chip"><input type="checkbox" value="${c.id}"> ${esc(c.label)}</label>`).join('');
  }

  // ---------- "in their words" ----------
  function fillWords() {
    els.wordPresets.innerHTML = DATA.concerns.flatMap((c) => (DATA.words[c.id] || { presets: [] }).presets.map((t) =>
      `<button type="button" class="chip preset" data-concern="${c.id}" data-text="${esc(t)}">“${esc(t)}”</button>`)).join('');
    els.wordConcern.innerHTML = DATA.concerns.map((c) => `<option value="${c.id}">About: ${esc(c.label)}</option>`).join('');
  }

  function renderQuotes() {
    els.wordList.innerHTML = state.quotes.map((q, i) =>
      `<li><span>“${esc(q.text)}”</span> <small>${esc(DATA.concerns.find((c) => c.id === q.concern).label)}</small>
        <button type="button" class="word-remove" data-i="${i}" aria-label="Remove">×</button></li>`).join('');
    els.wordPresets.querySelectorAll('.preset').forEach((b) =>
      b.classList.toggle('used', state.quotes.some((q) => q.text === b.dataset.text)));
  }

  // A quote also ticks its concern, so the Comparison view puts it first too.
  function addQuote(text, concern) {
    text = text.trim().replace(/^[“"']|[”"']$/g, '');
    if (!text || state.quotes.some((q) => q.text === text)) return;
    state.quotes.push({ text, concern });
    const chip = els.chips.querySelector(`input[value="${concern}"]`);
    if (chip && !chip.checked) {
      chip.checked = true;
      state.concerns = [...els.chips.querySelectorAll('input:checked')].map((i) => i.value);
    }
    renderQuotes();
    if (state.generated) generate();
  }

  els.wordPresets.addEventListener('click', (e) => {
    const b = e.target.closest('.preset');
    if (b) addQuote(b.dataset.text, b.dataset.concern);
  });
  els.wordAdd.addEventListener('click', () => { addQuote(els.wordText.value, els.wordConcern.value); els.wordText.value = ''; els.wordText.focus(); });
  els.wordText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); els.wordAdd.click(); }
  });
  els.wordList.addEventListener('click', (e) => {
    const b = e.target.closest('.word-remove');
    if (!b) return;
    state.quotes.splice(Number(b.dataset.i), 1);
    renderQuotes();
    if (state.generated) generate();
  });

  function suggestNew(oldId) {
    if (els.newModel.value) return;
    const m = DATA.legacy.models.find((x) => x.id === oldId);
    const pick = m && { RIC: 'e70', BTE: 'naida70', Custom: 'virto_i70_r' }[m.style];
    if (pick && DATA.pricing.models.some((x) => x.id === pick)) {
      els.newModel.value = pick;
      fillDiscounts();
    }
  }

  const fitting = () => (els.form.querySelector('input[name="fitting"]:checked') || {}).value || 'pair';

  // Name of the same new family at another level, e.g. "E90 Sphere CRT".
  function levelName(n, level) {
    const id = Object.keys(DATA.specs.models).find((k) => {
      const m = DATA.specs.models[k];
      return m.family === n.familyKey && m.level === level && (m.variant || null) === n.variant;
    });
    const p = id && DATA.pricing.models.find((x) => x.id === id);
    return p ? p.name : `the ${level} level`;
  }

  // ---------- rendering ----------
  function priceBox(pr) {
    const q = pr.quote;
    const unit = pr.fitting === 'single' ? 'Hearing aid (single)' : pr.pairOnly ? 'CROS system (pair)' : 'Hearing aids (pair)';
    const lines = [`<div class="price-line"><span>${unit}</span><span>${q.discountRate ? `<s>${money(q.fullAidPrice)}</s> ` : ''}${money(q.aidPrice)}</span></div>`];
    if (q.discountRate) lines.push(`<div class="price-line saving"><span>${esc(q.discountName)} discount (${Math.round(q.discountRate * 100)}%)</span><span>−${money(q.discountSaving)}</span></div>`);
    if (pr.planDetail) lines.push(`<div class="price-line"><span>${esc(pr.planDetail.name)} plan · ${esc(pr.planDetail.accessory)}</span><span>${money(q.accessoryPrice)}</span></div>`);
    if (q.insurancePrice) lines.push(`<div class="price-line"><span>Purchase insurance</span><span>${money(q.insurancePrice)}</span></div>`);
    return `
      <div class="price-box">
        ${lines.join('')}
        <div class="price-line total"><span>Total</span><span>${money(q.total)}</span></div>
        <p class="price-meta">Insurance: ${esc(q.insurance.status.toLowerCase())}${q.insurance.status === 'Included' ? ' with plan' : ''} · ${q.warrantyYears}-year warranty · excl. VAT · Prices as of ${esc(longDate(pr.pricesAsOf))}</p>
      </div>`;
  }

  function planSection(pr) {
    if (!pr.planEligible) {
      return '<p class="plan-none">Listening plans are not available for this model.</p>';
    }
    const cards = pr.planOptions.map((p) => `
      <button type="button" class="plan-card${p.id === pr.plan ? ' chosen' : ''}${p.suits.length ? ' suits' : ''}" data-plan="${p.id}" aria-pressed="${p.id === pr.plan}">
        <span class="plan-name">${esc(p.name)}</span>
        ${p.accessory ? `<span class="plan-acc">${esc(p.accessory)}</span>` : ''}
        <span class="plan-benefit">${esc(p.benefit)}</span>
        <span class="plan-cost">${p.cost ? `+ ${money(p.cost)}` : 'No extra cost'}</span>
        ${p.id !== 'none' ? '<span class="plan-ins">Insurance included</span>' : ''}
        ${p.suits.length ? `<span class="plan-suits">Good for: ${esc(p.suits.join(', '))}</span>` : ''}
        ${p.id === pr.plan ? '<span class="plan-tick">✓ Selected</span>' : ''}
      </button>`).join('');
    const ins = pr.insuranceOptional
      ? `<label class="ins-opt no-print"><input type="checkbox" id="buy-insurance"${pr.purchaseInsurance ? ' checked' : ''}> Add purchase insurance (${pr.fitting === 'single' ? '£99 for one aid' : '£198 for two aids'}; not discounted)</label>` : '';
    return `<div class="plans">${cards}</div>${ins}`;
  }

  function render(result) {
    const o = result.old;
    const n = result.new;
    const warn = result.warnings.length
      ? `<div class="warnings no-print"><p class="warnings-title">For the dispenser (not printed)</p>${result.warnings.map((w) => `<p>${esc(w)}</p>`).join('')}</div>` : '';

    if (!n.mapped) {
      els.output.innerHTML = `<section class="panel">${warn}</section>`;
      return;
    }
    const pr = result.price;
    const concernLine = result.concerns.length
      ? `<p class="concern-line">You told us the hardest things are: <strong>${esc(result.concerns.map((c) => c.label).join(' · '))}</strong>. These are shown first.</p>` : '';

    const hero = `
      ${concernLine}
      <section class="hero">
        <div class="hero-side then">
          <p class="hero-label">Your current hearing aids</p>
          <p class="hero-name">${esc(o.displayName)}</p>
          <p class="hero-year">${esc(o.platformName)} technology · ${o.launched} · ${esc(o.levelLabel)}</p>
        </div>
        <div class="hero-arrow" aria-hidden="true">→</div>
        <div class="hero-side now">
          <p class="hero-label">The new generation</p>
          <p class="hero-name">${esc(n.name)}</p>
          <p class="hero-year">${esc(n.platform)} technology · ${n.launched} · ${esc(n.price.tier)}</p>
          ${pr ? priceBox(pr) : ''}
        </div>
      </section>`;

    const statBlock = (st) => {
      if (!st) return '';
      const basis = st.vs ? `${st.note ? `${st.note}, ` : ''}${st.vs}` : (st.note || '');
      return `<p class="stat"><span class="stat-value">${esc(st.value)}</span> <span class="stat-label">${esc(st.label)}</span></p>
        ${basis ? `<p class="stat-note">${/\d/.test(st.value) ? 'Phonak figure: ' : ''}${esc(basis)}${st.status === 'check' ? ' <span class="pill check">Verify</span>' : ''}</p>` : ''}`;
    };
    const cards = result.cards.map((c) => `
      <article class="card${c.matters ? ' matters' : ''}">
        ${c.matters ? '<span class="matters-tag">Matters to you</span>' : ''}
        <header class="card-head">${icon(c.icon)}<h3>${esc(c.title)}</h3></header>
        ${statBlock(c.stat)}
        <div class="compare-line then"><span class="tag">Then</span><p>${cellHtml(c.old)}</p></div>
        <div class="compare-line now"><span class="tag">Now</span><p>${cellHtml(c.new)}</p></div>
        ${c.footnote ? `<p class="card-foot">${esc(c.footnote)}</p>` : ''}
      </article>`).join('');

    const rows = result.rows.map((r) => `
      <tr>
        <th scope="row">${esc(r.label)}</th>
        <td class="then">${cellHtml(r.old)}</td>
        <td class="now">${cellHtml(r.new)}</td>
      </tr>`).join('');

    const f = result.features;
    const mark = (st) => ({ yes: '✓', no: '✗', notyet: '✗', '?': '?' }[st]);
    const stateClass = (st) => (st === 'notyet' ? 'no' : st === '?' ? 'unk' : st);
    const featureRow = (i) => `
      <tr class="feat-${i.kind}${i.matters ? ' feat-matters' : ''}">
        <th scope="row"><span class="feat-name">${esc(i.label)}${i.matters ? ' <span class="matters-pill">Matters to you</span>' : ''}</span><span class="feat-benefit">${esc(i.benefit)}</span></th>
        <td class="then state-${stateClass(i.old.state)}">
          <span class="mark" aria-hidden="true">${mark(i.old.state)}</span><span class="mark-text">${esc(i.old.text)}</span></td>
        <td class="now state-${i.new.state}"><span class="mark" aria-hidden="true">${mark(i.new.state)}</span><span class="mark-text">${esc(i.new.text)}${i.new.status === 'check' ? ' <span class="pill check">Verify</span>' : ''}</span></td>
      </tr>`;
    const counted = f.items.filter((i) => i.kind !== 'unconfirmed');
    const unconfirmed = f.items.filter((i) => i.kind === 'unconfirmed');
    const featureRows = counted.map(featureRow).join('') + (unconfirmed.length ? `
      <tr class="group-row"><th colspan="3">Not confirmed for your current aid, so not counted in the score above</th></tr>
      ${unconfirmed.map(featureRow).join('')}` : '');
    const pct = (k) => (f.confirmed ? Math.round((k / f.confirmed) * 100) : 0);
    const upsell = f.upsell.length
      ? `<p class="upsell"><strong>Step up for even more:</strong> ${f.upsell.map((u) => `${esc(u.label)} (from ${esc(levelName(n, u.from))})`).join(' · ')}</p>` : '';
    const headline = f.gained
      ? `<span class="score-num">+${f.gained}</span><span class="score-cap">feature${f.gained === 1 ? '' : 's'} your current aids don't have</span>`
      : '<span class="score-num score-zero">0</span><span class="score-cap">new features at this level</span>';
    const scoreboard = `
      <div class="scoreboard">
        <div class="score-big">${headline}
          ${f.lostCount ? `<span class="score-lost">${f.lostCount} feature${f.lostCount === 1 ? '' : 's'} you would give up (shown below)</span>` : ''}</div>
        <div class="score-bars">
          <div class="bar-row"><span class="bar-label">Your current ${esc(o.displayName.replace(/^Phonak /, ''))}</span>
            <span class="bar then"><span style="width:${pct(f.oldCount)}%"></span></span><span class="bar-val">${f.oldCount} of ${f.confirmed}</span></div>
          <div class="bar-row"><span class="bar-label">The new ${esc(n.name.replace(/^Phonak /, ''))}</span>
            <span class="bar now"><span style="width:${pct(f.newCount)}%"></span></span><span class="bar-val">${f.newCount} of ${f.confirmed}</span></div>
          <p class="score-note">Compared on ${f.confirmed} feature${f.confirmed === 1 ? '' : 's'} we could confirm for both hearing aids${f.unconfirmed ? `. ${f.unconfirmed} more could not be confirmed for your current aid and are not counted` : ''}.</p>
        </div>
      </div>`;

    const sources = result.sources.map((k) => {
      const s = DATA.sources[k];
      if (!s) return '';
      const links = (s.urls || []).map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(new URL(u).hostname)}</a>`).join(', ');
      return `<li><strong>${s.kind === 'supplied' ? 'Supplied file' : 'Web'}:</strong> ${esc(s.title)}${links ? ` (${links})` : ''}</li>`;
    }).join('');

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const modeSwitch = `
      <div class="mode-switch no-print" role="group" aria-label="View">
        <button type="button" data-mode="conversation" aria-pressed="${state.mode === 'conversation'}">Conversation</button>
        <button type="button" data-mode="comparison" aria-pressed="${state.mode === 'comparison'}">Comparison</button>
      </div>`;

    if (state.mode === 'conversation') {
      els.output.innerHTML = `${modeSwitch}${conversationHtml(result)}`;
      wireOutput(result);
      return;
    }

    els.output.innerHTML = `
      ${modeSwitch}
      ${warn}
      <p class="print-only print-head">Prepared ${esc(today)} · Prices as of ${esc(longDate(DATA.pricing.pricesAsOf))} · Tool ${esc(version())}</p>
      ${hero}
      <section aria-labelledby="a-title">
        <h2 id="a-title" class="section-title"><span class="section-letter">A</span> What changes for you</h2>
        <div class="cards">${cards}</div>
      </section>
      <section aria-labelledby="b-title">
        <h2 id="b-title" class="section-title"><span class="section-letter">B</span> Then vs. now</h2>
        ${scoreboard}
        <div class="table-wrap">
          <table class="versus checklist">
            <thead><tr><th scope="col">Feature</th>
              <th scope="col" class="then">Your current ${esc(o.displayName.replace(/^Phonak /, ''))}</th>
              <th scope="col" class="now">The new ${esc(n.name.replace(/^Phonak /, ''))}</th></tr></thead>
            <tbody>${featureRows}</tbody>
          </table>
        </div>
        ${upsell}
        <h3 class="sub-title">In more detail</h3>
        <div class="table-wrap">
          <table class="versus">
            <thead><tr><th scope="col"><span class="sr-only">Feature</span></th>
              <th scope="col" class="then">Your current ${esc(o.displayName.replace(/^Phonak /, ''))}</th>
              <th scope="col" class="now">The new ${esc(n.name.replace(/^Phonak /, ''))}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
      ${pr ? `<section aria-labelledby="c-title">
        <h2 id="c-title" class="section-title"><span class="section-letter">C</span> Listening plans</h2>
        ${planSection(pr)}
      </section>` : ''}
      <section aria-labelledby="d-title">
        <h2 id="d-title" class="section-title"><span class="section-letter">D</span> Why upgrade now</h2>
        <blockquote class="script" id="script">${esc(result.narrative)}</blockquote>
        <button type="button" class="btn ghost no-print" id="copy-script">Copy script</button>
      </section>
      <details class="sources">
        <summary>Sources and evidence for this comparison</summary>
        <ul>${sources}</ul>
        <p class="muted">Where nothing could be found for an older model, the tool says: “${esc(HCCompare.NOT_FOUND)}”.</p>
      </details>`;

    wireOutput(result);
  }

  // Conversation mode: validate, mirror their words, then "what if". No product names or prices.
  function conversationHtml(result) {
    const o = result.old;
    const oldName = o.displayName.replace(/^Phonak /, '').replace(/ \([^)]*\)$/, '');
    const who = els.patient.value.trim();
    const rows = result.words.map((w) => `
      <div class="word-row">
        <blockquote class="their"><span class="their-label">You said</span>“${esc(w.quote)}”</blockquote>
        <div class="word-arrow" aria-hidden="true">→</div>
        <div class="possible">
          <p class="what-if">${esc(w.question)}</p>
          <p class="now-line"><span>Now:</span> ${esc(w.now)}</p>
        </div>
      </div>`).join('');
    return `
      <section class="convo" aria-label="In your words">
        <p class="convo-intro">${who ? `${esc(who)}, your` : 'Your'} ${esc(oldName)} hearing aids were a sensible choice in ${o.launched}.
          Since then, hearing technology has moved on. Here’s what you told us, and what’s possible now.</p>
        ${rows ? `<div class="words-board">${rows}</div>
          <p class="convo-close">Which of these would make the biggest difference to your week?</p>`
          : '<p class="convo-empty no-print">Add what the customer told you under “In their words” above, and it will appear here.</p>'}
        <button type="button" class="btn ghost no-print" data-mode="comparison">See the full comparison</button>
      </section>`;
  }

  function wireOutput(result) {
    els.output.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      state.mode = b.dataset.mode;
      generate();
    }));
    const copy = $('copy-script');
    if (copy) copy.addEventListener('click', async (e) => {
      try {
        await navigator.clipboard.writeText(result.narrative);
        e.target.textContent = 'Copied';
      } catch {
        e.target.textContent = 'Select the text to copy';
      }
    });
    els.output.querySelectorAll('.plan-card').forEach((b) => b.addEventListener('click', () => {
      state.plan = b.dataset.plan;
      generate();
    }));
    const ins = $('buy-insurance');
    if (ins) ins.addEventListener('change', () => { state.purchaseInsurance = ins.checked; generate(); });
    els.print.disabled = false;
  }

  function generate(evt) {
    if (evt) evt.preventDefault();
    const newId = els.newModel.value;
    if (!state.old || !newId) {
      els.error.textContent = !state.old ? 'Choose the customer’s current hearing aid from the list.' : 'Choose the new model to show.';
      els.error.hidden = false;
      (state.old ? els.newModel : els.oldSearch).focus();
      return;
    }
    els.error.hidden = true;
    const first = !state.generated;
    if (!state.mode) state.mode = state.quotes.length ? 'conversation' : 'comparison';
    const result = HCCompare.compare(DATA, state.old.id, newId, {
      patientName: els.patient.value, oldLevel: state.old.level, concerns: state.concerns,
      plan: state.plan, discount: els.discount.value, fitting: fitting(), purchaseInsurance: state.purchaseInsurance,
      quotes: state.quotes,
    });
    // Keep controls in step with what the engine accepted (e.g. no plan on a non-plan model).
    if (result.price) {
      state.plan = result.price.plan;
      state.purchaseInsurance = result.price.purchaseInsurance;
      if (result.price.pairOnly) els.form.querySelector('input[value="pair"]').checked = true;
    }
    render(result);
    state.generated = true;
    if (first) els.output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- init ----------
  fillNew();
  fillDiscounts();
  fillConcerns();
  fillWords();
  els.stamp.textContent = `Prices as of ${longDate(DATA.pricing.pricesAsOf)} (from ${DATA.pricing.source}). Older-model research: 29 October 2026. Tool version: ${version()}.`;
  els.form.addEventListener('submit', generate);
  els.newModel.addEventListener('change', () => {
    fillDiscounts();
    state.plan = 'none';
    if (state.generated) generate();
  });
  els.discount.addEventListener('change', () => { if (state.generated) generate(); });
  els.form.querySelectorAll('input[name="fitting"]').forEach((r) => r.addEventListener('change', () => { if (state.generated) generate(); }));
  els.patient.addEventListener('input', () => { if (state.generated) generate(); });
  els.chips.addEventListener('change', () => {
    state.concerns = [...els.chips.querySelectorAll('input:checked')].map((i) => i.value);
    if (state.generated) generate();
  });
  els.print.addEventListener('click', () => window.print());
})();
