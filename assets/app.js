// UI wiring for index.html. All comparison rules live in compare.js.
(function () {
  const DATA = {
    pricing: window.HC_PRICING,
    specs: window.HC_NEW_SPECS,
    legacy: window.HC_LEGACY,
    sources: window.HC_SOURCES,
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('setup'), patient: $('patient'), oldFilter: $('old-filter'), oldModel: $('old-model'),
    newModel: $('new-model'), showPrice: $('show-price'), print: $('print'),
    error: $('form-error'), output: $('output'), stamp: $('data-stamp'),
  };

  const ICONS = {
    speech: '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4M7 10v4M11 10v4"/>',
    size: '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon">${ICONS[name] || ''}</svg>`;

  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function badge(c) {
    if (c.status === 'check') {
      const src = c.source && DATA.sources[c.source] ? DATA.sources[c.source].title : 'secondary source';
      return ` <span class="pill check" title="Source: ${esc(src)}">Verify</span>`;
    }
    return '';
  }
  const cellHtml = (c) => `<span class="${c.status === 'unknown' ? 'unknown' : ''}">${esc(c.text)}</span>${badge(c)}`;

  // ---------- selectors ----------
  function fillOld(filter = '') {
    const q = filter.trim().toLowerCase();
    const current = els.oldModel.value;
    const groups = {};
    for (const m of DATA.legacy.models) {
      const p = DATA.legacy.platforms[m.platform];
      if (q && !`${m.name} ${p.name}`.toLowerCase().includes(q)) continue;
      (groups[m.platform] ||= []).push(m);
    }
    let html = '<option value="">Select current model…</option>';
    for (const [key, list] of Object.entries(groups)) {
      const p = DATA.legacy.platforms[key];
      html += `<optgroup label="${esc(p.name)} platform (from ${p.launched})">`;
      html += list.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('');
      html += '</optgroup>';
    }
    els.oldModel.innerHTML = html;
    if (current && [...els.oldModel.options].some((o) => o.value === current)) els.oldModel.value = current;
    else if (q && els.oldModel.options.length === 2) {
      els.oldModel.selectedIndex = 1; // a single match: pick it
      suggestNew();
    }
  }

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

  // Suggest a like-for-like style when the salesperson picks the current aid.
  function suggestNew() {
    if (els.newModel.value) return;
    const m = DATA.legacy.models.find((x) => x.id === els.oldModel.value);
    if (!m) return;
    const pick = { RIC: 'e70', BTE: 'naida70', Custom: 'virto_i70_r' }[m.style];
    if (pick && DATA.pricing.models.some((x) => x.id === pick)) els.newModel.value = pick;
  }

  // ---------- rendering ----------
  function render(result) {
    const o = result.old;
    const n = result.new;
    const priceLine = els.showPrice.checked
      ? `<p class="price">${esc(HCCompare.priceText(n.price))} <span class="muted">from the pricing file; confirm before quoting</span></p>` : '';

    const warn = result.warnings.length
      ? `<div class="warnings">${result.warnings.map((w) => `<p>${esc(w)}</p>`).join('')}</div>` : '';

    if (!n.mapped) {
      els.output.innerHTML = `<section class="panel">${warn}</section>`;
      return;
    }

    const hero = `
      <section class="hero">
        <div class="hero-side then">
          <p class="hero-label">Your current hearing aids</p>
          <p class="hero-name">${esc(o.name)}</p>
          <p class="hero-year">${esc(o.platformName)} technology · ${o.launched}</p>
        </div>
        <div class="hero-arrow" aria-hidden="true">→</div>
        <div class="hero-side now">
          <p class="hero-label">The new generation</p>
          <p class="hero-name">${esc(n.name)}</p>
          <p class="hero-year">${esc(n.platform)} technology · ${n.launched}</p>
          ${priceLine}
        </div>
      </section>`;

    const cards = result.cards.map((c) => `
      <article class="card">
        <header class="card-head">${icon(c.icon)}<h3>${esc(c.title)}</h3></header>
        ${c.stat ? `<p class="stat"><span class="stat-value">${esc(c.stat.value)}</span> <span class="stat-label">${esc(c.stat.label)}</span></p>
          ${c.stat.note ? `<p class="stat-note">${esc(c.stat.note)}</p>` : ''}` : ''}
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

    const sources = result.sources.map((k) => {
      const s = DATA.sources[k];
      if (!s) return '';
      const links = (s.urls || []).map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(new URL(u).hostname)}</a>`).join(', ');
      return `<li><strong>${s.kind === 'supplied' ? 'Supplied file' : 'Web'}:</strong> ${esc(s.title)}${links ? ` (${links})` : ''}</li>`;
    }).join('');

    els.output.innerHTML = `
      ${warn}
      ${hero}
      <section aria-labelledby="a-title">
        <h2 id="a-title" class="section-title"><span class="section-letter">A</span> What changes for you</h2>
        <div class="cards">${cards}</div>
      </section>
      <section aria-labelledby="b-title">
        <h2 id="b-title" class="section-title"><span class="section-letter">B</span> Then vs. now</h2>
        <div class="table-wrap">
          <table class="versus">
            <thead><tr><th scope="col"><span class="sr-only">Feature</span></th>
              <th scope="col" class="then">Your current ${esc(o.name.replace(/^Phonak /, ''))}</th>
              <th scope="col" class="now">The new ${esc(n.name.replace(/^Phonak /, ''))}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="c-title">
        <h2 id="c-title" class="section-title"><span class="section-letter">C</span> Why upgrade now</h2>
        <blockquote class="script" id="script">${esc(result.narrative)}</blockquote>
        <button type="button" class="btn ghost no-print" id="copy-script">Copy script</button>
      </section>
      <details class="sources">
        <summary>Sources and evidence for this comparison</summary>
        <ul>${sources}</ul>
        <p class="muted">Where nothing could be found for an older model, the tool says: “${esc(HCCompare.NOT_FOUND)}”.</p>
      </details>`;

    $('copy-script').addEventListener('click', async (e) => {
      try {
        await navigator.clipboard.writeText(result.narrative);
        e.target.textContent = 'Copied';
      } catch {
        e.target.textContent = 'Select the text to copy';
      }
    });
    els.print.disabled = false;
  }

  function generate(evt) {
    if (evt) evt.preventDefault();
    const oldId = els.oldModel.value;
    const newId = els.newModel.value;
    if (!oldId || !newId) {
      els.error.textContent = !oldId ? 'Choose the customer’s current hearing aid.' : 'Choose the new model to show.';
      els.error.hidden = false;
      (oldId ? els.newModel : els.oldModel).focus();
      return;
    }
    els.error.hidden = true;
    render(HCCompare.compare(DATA, oldId, newId, { patientName: els.patient.value }));
    els.output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- init ----------
  fillOld();
  fillNew();
  els.stamp.textContent = `New-model prices: ${DATA.pricing.source}, imported ${DATA.pricing.importedOn}. Older-model research: 29 October 2026.`;
  els.oldFilter.addEventListener('input', () => fillOld(els.oldFilter.value));
  els.oldModel.addEventListener('change', suggestNew);
  els.form.addEventListener('submit', generate);
  els.showPrice.addEventListener('change', () => { if (els.output.innerHTML.trim()) generate(); });
  els.print.addEventListener('click', () => window.print());
})();
