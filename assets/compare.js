// Pure comparison logic: no DOM access, so it runs in the browser and in Node tests.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HCCompare = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const NOT_FOUND = 'Specification not found in public archives—please verify with manufacturer';
  const NOT_SUPPLIED = 'Not stated in the supplied spec files—please verify with manufacturer';
  const CURRENT_YEAR = 2026;
  const FACT_KEYS = ['chip', 'adapt', 'speech', 'speechShort', 'wind', 'feedback', 'app', 'streaming',
    'calls', 'connectShort', 'battery', 'batteryShort', 'size', 'sizeShort'];

  function pick(...layers) {
    const out = {};
    for (const layer of layers) {
      if (!layer) continue;
      for (const [k, val] of Object.entries(layer)) if (val !== undefined) out[k] = val;
    }
    return out;
  }

  function resolveOld(data, id) {
    const model = data.legacy.models.find((m) => m.id === id);
    if (!model) throw new Error(`Unknown current model: ${id}`);
    const platform = data.legacy.platforms[model.platform];
    const merged = pick(platform, model);
    merged.platformName = platform.name;
    merged.launched = model.launched || platform.launched;
    merged.launchedIsPlatform = !model.launched;
    return merged;
  }

  function resolveNew(data, pricingId) {
    const price = data.pricing.models.find((m) => m.id === pricingId);
    if (!price) throw new Error(`Unknown new model: ${pricingId}`);
    const map = data.specs.models[pricingId];
    if (!map) return { price, mapped: false, name: `${price.family} ${price.name}` };
    const fam = data.specs.families[map.family];
    const merged = pick(fam, (fam.levels || {})[map.level], map.variant && (fam.variants || {})[map.variant]);
    delete merged.levels;
    delete merged.variants;
    merged.price = price;
    merged.mapped = true;
    merged.level = map.level;
    merged.familyKey = map.family;
    merged.name = `${price.family} ${price.name}`;
    return merged;
  }

  // A cell the UI can render: text plus whether it needs checking.
  function cell(fact, side) {
    if (!fact || fact.status === 'unknown' || !fact.text) {
      return { text: side === 'old' ? NOT_FOUND : NOT_SUPPLIED, status: 'unknown', source: null };
    }
    return { text: fact.text, status: fact.status, source: fact.source };
  }

  function rows(oldM, newM) {
    const age = CURRENT_YEAR - oldM.launched;
    const yearText = oldM.launchedIsPlatform
      ? `${oldM.platformName} platform, launched ${oldM.launched}`
      : `Launched ${oldM.launched} (${oldM.platformName} platform)`;
    return [
      { label: 'Technology generation',
        old: { text: `${yearText}: about ${age} year${age === 1 ? '' : 's'} old`, status: 'verified' },
        new: { text: `${newM.platform} platform, ${newM.launched}`, status: 'verified' } },
      { label: 'Processor', old: cell(oldM.chip, 'old'), new: cell(newM.chip, 'new') },
      { label: 'How it adapts to noise', old: cell(oldM.adapt, 'old'), new: cell(newM.adapt, 'new') },
      { label: 'Speech in noisy places', old: cell(oldM.speech, 'old'), new: cell(newM.speech, 'new') },
      { label: 'Wind handling', old: cell(oldM.wind, 'old'), new: cell(newM.wind, 'new') },
      { label: 'Feedback (whistling)', old: cell(oldM.feedback, 'old'), new: cell(newM.feedback, 'new') },
      { label: 'App control', old: cell(oldM.app, 'old'), new: cell(newM.app, 'new') },
      { label: 'TV & music streaming', old: cell(oldM.streaming, 'old'), new: cell(newM.streaming, 'new') },
      { label: 'Phone calls', old: cell(oldM.calls, 'old'), new: cell(newM.calls, 'new') },
      { label: 'Battery', old: cell(oldM.battery, 'old'), new: cell(newM.battery, 'new') },
    ];
  }

  function cards(oldM, newM) {
    const stats = newM.stats || [];
    const speech = {
      key: 'speech', title: 'Speech in noise', icon: 'speech',
      old: cell(oldM.speechShort, 'old'), new: cell(newM.speechShort, 'new'),
      stat: stats[0] || null,
      footnote: newM.upsell || null,
    };
    const connect = {
      key: 'connect', title: 'Connectivity', icon: 'bluetooth',
      old: cell(oldM.connectShort, 'old'), new: cell(newM.connectShort, 'new'),
      stat: newM.streaming && /Auracast/.test(newM.streaming.text) && !/follow|promised/.test(newM.streaming.text)
        ? { value: 'Auracast™', label: 'ready for TV, theatre and venue broadcasts' }
        : null,
    };
    const goesRechargeable = oldM.rechargeable === false && newM.rechargeable === true;
    const power = {
      key: 'power', title: 'Power & convenience', icon: 'battery',
      old: cell(oldM.batteryShort, 'old'), new: cell(newM.batteryShort, 'new'),
      stat: goesRechargeable
        ? { value: '0', label: 'battery changes. Charge overnight like a phone' }
        : (/38 h/.test((newM.batteryShort || {}).text || '') ? { value: '38 h', label: 'maximum on one charge' } : null),
    };
    const fourth = newM.size && newM.size.status !== 'unknown'
      ? { key: 'size', title: 'Size & discretion', icon: 'size',
          old: cell(oldM.size, 'old'), new: cell(newM.sizeShort || newM.size, 'new'),
          stat: { value: '25%', label: 'smaller than the previous Sphere generation', source: newM.size.source } }
      : { key: 'age', title: 'Years of progress', icon: 'clock',
          old: { text: `${oldM.platformName} technology, ${oldM.launched}`, status: 'verified' },
          new: { text: `${newM.platform} technology, ${newM.launched}`, status: 'verified' },
          stat: { value: `${Math.max(0, newM.launched - oldM.launched)} yrs`, label: 'of Phonak development between them' },
          footnote: `Size comparison: ${NOT_FOUND}` };
    return [speech, connect, power, fourth];
  }

  function warnings(oldM, newM) {
    const out = [];
    if (!newM.mapped) out.push('This model from the pricing file has no spec mapping yet. Add it to data/new-specs.js.');
    if (newM.mapped && newM.launched <= oldM.launched) {
      out.push(`The ${newM.name} is on the ${newM.platform} platform (${newM.launched}), which is not newer than the customer's ${oldM.platformName} aids. This is not a technology upgrade.`);
    }
    if (newM.note) out.push(newM.note);
    return out;
  }

  function narrative(oldM, newM, patientName) {
    const who = (patientName || '').trim();
    const opener = who ? `${who}, your` : 'Your';
    const era = oldM.launched;
    const oldTech = (oldM.speechShort && oldM.speechShort.text) || 'the processing of its day';
    const s1 = `${opener} ${oldM.name.replace(/^Phonak /, '')} hearing aids were excellent technology for ${era}, built on Phonak's ${oldM.platformName} platform with ${lowerFirst(oldTech)}.`;
    let s2;
    if (newM.familyKey === 'eonSphere') {
      s2 = `The new ${newM.name.replace(/^Phonak /, '')} has a dedicated AI chip, so instead of just turning sound up and pointing the microphones forward, it separates speech from background noise in real time${newM.level === 50 ? ' when you switch on its speech-in-noise programme' : ''}.`;
    } else {
      s2 = `The new ${newM.name.replace(/^Phonak /, '')} is ${Math.max(0, newM.launched - era)} years further on, with ${lowerFirst(newM.adapt ? newM.adapt.text.split(':')[0] : 'automatic processing')} adjusting to each place you go without you touching a button.`;
    }
    const stat = (newM.stats || [])[0];
    const s3 = stat
      ? `In Phonak's own testing, that means ${stat.value} ${stat.label}.`
      : '';
    let s4 = '';
    if (oldM.rechargeable === false && newM.rechargeable === true) {
      s4 = 'And you can say goodbye to fiddly batteries: it charges overnight like a phone.';
    } else if (/^No (Bluetooth|direct)/.test((oldM.connectShort || {}).text || '') && /Bluetooth/.test((newM.connectShort || {}).text || '')) {
      s4 = 'And phone calls and TV stream straight into your ears, with no streamer around your neck.';
    } else if (/Auracast/.test((newM.connectShort || {}).text || '')) {
      s4 = 'It also streams calls and TV directly, and is ready for Auracast™ broadcasts in theatres and public venues.';
    }
    return [s1, s2, s3, s4].filter(Boolean).join(' ');
  }

  function lowerFirst(s) {
    return /^[A-Z][a-z]/.test(s) && !/^(AutoSense|Phonak|Binaural|SoundFlow|Spheric|StereoZoom)/.test(s)
      ? s[0].toLowerCase() + s.slice(1) : s;
  }

  function usedSources(rowsOut, cardsOut, newM) {
    const keys = new Set();
    for (const r of rowsOut) for (const side of [r.old, r.new]) if (side.source) keys.add(side.source);
    for (const c of cardsOut) {
      for (const side of [c.old, c.new]) if (side.source) keys.add(side.source);
      if (c.stat && c.stat.source) keys.add(c.stat.source);
    }
    if (newM.noteSource) keys.add(newM.noteSource);
    return [...keys];
  }

  function compare(data, oldId, newId, opts = {}) {
    const oldM = resolveOld(data, oldId);
    const newM = resolveNew(data, newId);
    const rowsOut = newM.mapped ? rows(oldM, newM) : [];
    const cardsOut = newM.mapped ? cards(oldM, newM) : [];
    return {
      old: oldM,
      new: newM,
      cards: cardsOut,
      rows: rowsOut,
      warnings: warnings(oldM, newM),
      narrative: newM.mapped ? narrative(oldM, newM, opts.patientName) : '',
      sources: usedSources(rowsOut, cardsOut, newM),
    };
  }

  function priceText(p) {
    const gbp = (n) => '£' + Number(n).toLocaleString('en-GB', { maximumFractionDigits: 0 });
    if (p.pairOnly) return `${gbp(p.pairPrice)} per system (pair-only)`;
    return `${gbp(p.pairPrice)} pair · ${gbp(p.singlePrice)} single`;
  }

  return { compare, resolveOld, resolveNew, priceText, NOT_FOUND, NOT_SUPPLIED, CURRENT_YEAR };
});
