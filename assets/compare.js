// Pure comparison logic: no DOM access, so it runs in the browser and in Node tests.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HCCompare = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const NOT_FOUND = 'Specification not found in public archives—please verify with manufacturer';
  const NOT_SUPPLIED = 'Not stated in the supplied spec files—please verify with manufacturer';
  const CURRENT_YEAR = 2026;
  const DEFAULT_LEVELS = [90, 70, 50, 30];

  function pick(...layers) {
    const out = {};
    for (const layer of layers) {
      if (!layer) continue;
      for (const [k, val] of Object.entries(layer)) if (val !== undefined) out[k] = val;
    }
    return out;
  }

  function oldLevels(data, id) {
    const model = data.legacy.models.find((m) => m.id === id);
    return model ? model.levels || DEFAULT_LEVELS : [];
  }

  function resolveOld(data, id, level) {
    const model = data.legacy.models.find((m) => m.id === id);
    if (!model) throw new Error(`Unknown current model: ${id}`);
    const platform = data.legacy.platforms[model.platform];
    const levels = model.levels || DEFAULT_LEVELS;
    const lvl = level ? Number(level) : null;
    if (lvl && !levels.includes(lvl)) throw new Error(`${model.name} has no level ${lvl}`);
    const merged = pick(
      platform,
      lvl && (platform.levelFacts || {})[lvl],
      model,
      lvl && (model.levelFacts || {})[lvl],
    );
    delete merged.levelFacts;
    merged.platformKey = model.platform;
    merged.platformName = platform.name;
    merged.prefix = platform.prefix;
    merged.levels = levels;
    merged.level = lvl;
    merged.levelLabel = lvl ? `${platform.prefix}${lvl} (${data.legacy.levelNames[lvl]})` : 'Level not known';
    merged.displayName = lvl && model.tmpl ? model.tmpl.replace('{L}', lvl) : model.name;
    merged.launched = model.launched || platform.launched;
    merged.launchedIsPlatform = !model.launched;
    if (!lvl) merged.channels = channelRange(platform, levels);
    return merged;
  }

  // "20 (Q90) down to 8 (Q30)" when the level is not known.
  function channelRange(platform, levels) {
    const facts = levels.map((l) => [l, ((platform.levelFacts || {})[l] || {}).channels]).filter(([, f]) => f && f.text);
    if (!facts.length) return undefined;
    const [hiL, hi] = facts[0];
    const [loL, lo] = facts[facts.length - 1];
    return { text: `${hi.text} (${platform.prefix}${hiL}) down to ${lo.text} (${platform.prefix}${loL}), depending on level`,
      status: 'check', source: hi.source };
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
    if (typeof merged.channels === 'string') {
      merged.channels = { text: `${merged.channels} channels`, status: 'verified',
        source: /^eon|^cros/.test(map.family) ? 'eonSummary' : 'phonakMatrices' };
    }
    merged.price = price;
    merged.mapped = true;
    merged.level = map.level;
    merged.variant = map.variant || null;
    merged.familyKey = map.family;
    merged.familyLevels = Object.keys(fam.levels || {}).map(Number);
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

  // ---------- feature checklist ----------
  function levelValue(spec, level) {
    if (spec === undefined) return undefined;
    if (typeof spec !== 'object') return spec;
    if (level) return spec[level];
    const vals = [...new Set(Object.values(spec))];
    return vals.length === 1 ? vals[0] : 'depends';
  }

  function introInfo(data, key) {
    if (key === 'eon') return { name: 'EON', year: 2026 };
    const p = data.legacy.platforms[key];
    return { name: p.name, year: p.launched };
  }

  function oldFeature(data, f, oldM) {
    const order = data.features.platformOrder;
    if (f.oldModels && f.oldModels[oldM.id] !== undefined) return state(f.oldModels[oldM.id], 'model');
    if (order.indexOf(oldM.platformKey) < order.indexOf(f.introduced)) {
      const intro = f.introducedAs || introInfo(data, f.introduced);
      return { state: 'notyet', text: `Didn't exist yet: arrived ${intro.year} (${intro.name})` };
    }
    if (f.oldFromModel) {
      const val = oldM[f.oldFromModel];
      return state(val === true ? 1 : val === false ? 0 : '?', 'model');
    }
    const spec = (f.old || {})[oldM.platformKey];
    const val = levelValue(spec, oldM.level);
    if (val === 'depends') return { state: '?', text: 'Depends on technology level' };
    return state(val === undefined ? '?' : val, typeof spec === 'object' ? 'level' : 'model', oldM);
  }

  function state(val, kind, oldM) {
    if (val === 1) return { state: 'yes', text: 'Yes' };
    if (val === '?') return { state: '?', text: 'Not confirmed' };
    if (kind === 'level' && oldM && oldM.level) return { state: 'no', text: `Not at the ${oldM.prefix}${oldM.level} level` };
    return { state: 'no', text: 'Not on this model' };
  }

  function newFeatureValue(f, familyKey, level, variant) {
    let spec = (f.new || {})[familyKey];
    if (spec && spec.variants) spec = variant ? spec.variants[variant] : undefined;
    const val = levelValue(spec, level);
    return val === undefined ? 0 : val;
  }

  function checklist(data, oldM, newM) {
    const items = [];
    const lost = [];
    const upsell = [];
    for (const f of data.features.features) {
      const nv = newFeatureValue(f, newM.familyKey, newM.level, newM.variant);
      const old = oldFeature(data, f, oldM);
      if (nv === 1 || nv === 'c') {
        items.push({ id: f.id, group: f.group, label: f.label, benefit: f.benefit, sources: f.sources,
          old, new: { state: 'yes', text: 'Yes', status: nv === 'c' ? 'check' : 'verified' } });
      } else if (nv === 0) {
        if (old.state === 'yes') lost.push(f.label);
        const higher = newM.familyLevels.filter((l) => l > newM.level && newFeatureValue(f, newM.familyKey, l, newM.variant) === 1);
        if (higher.length) upsell.push({ label: f.label, from: Math.min(...higher) });
      }
    }
    const rank = { notyet: 0, no: 1, '?': 2, yes: 3 };
    items.sort((a, b) => rank[a.old.state] - rank[b.old.state]);
    const oldCount = items.filter((i) => i.old.state === 'yes').length;
    const gained = items.filter((i) => i.old.state === 'notyet' || i.old.state === 'no').length;
    return { items, total: items.length, oldCount, gained, lost, upsell };
  }

  // ---------- sections ----------
  function rows(oldM, newM) {
    const age = CURRENT_YEAR - oldM.launched;
    const yearText = oldM.launchedIsPlatform
      ? `${oldM.platformName} platform, launched ${oldM.launched}`
      : `Launched ${oldM.launched} (${oldM.platformName} platform)`;
    return [
      { label: 'Technology generation',
        old: { text: `${yearText}: about ${age} year${age === 1 ? '' : 's'} old`, status: 'verified' },
        new: { text: `${newM.platform} platform, ${newM.launched}`, status: 'verified' } },
      { label: 'Technology level',
        old: { text: oldM.levelLabel, status: oldM.level ? 'verified' : 'check' },
        new: { text: newM.price.tier, status: 'verified' } },
      { label: 'Processor', old: cell(oldM.chip, 'old'), new: cell(newM.chip, 'new') },
      { label: 'Fine-tuning channels', old: cell(oldM.channels, 'old'), new: cell(newM.channels, 'new') },
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

  function warnings(oldM, newM, list) {
    const out = [];
    if (!newM.mapped) out.push('This model from the pricing file has no spec mapping yet. Add it to data/new-specs.js.');
    if (newM.mapped && newM.launched <= oldM.launched) {
      out.push(`The ${newM.name} is on the ${newM.platform} platform (${newM.launched}), which is not newer than the customer's ${oldM.platformName} aids. This is not a technology upgrade.`);
    }
    if (!oldM.level) out.push('Choose the current technology level (e.g. Q50) for a sharper comparison. Some features show as "Depends on technology level" until you do.');
    if (list && list.lost.length) {
      out.push(`Heads-up for you: the customer's current aid has ${joinList(list.lost)}, which the ${newM.name} does not. Consider a higher level.`);
    }
    if (newM.note) out.push(newM.note);
    return out;
  }

  function joinList(items) {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
  }

  function narrative(oldM, newM, list, patientName) {
    const who = (patientName || '').trim();
    const opener = who ? `${who}, your` : 'Your';
    const era = oldM.launched;
    const oldTech = (oldM.speechShort && oldM.speechShort.text) || 'the processing of its day';
    const oldName = oldM.displayName.replace(/^Phonak /, '').replace(/ \([^)]*\)$/, '');
    const newName = newM.name.replace(/^Phonak /, '');
    const s1 = `${opener} ${oldName} hearing aids were good technology for ${era}, built on Phonak's ${oldM.platformName} platform with ${lowerFirst(oldTech)}.`;
    const stat = (newM.stats || [])[0];
    const statTail = stat ? `, and in Phonak's own testing that means ${stat.value} ${stat.label}` : '';
    let s2;
    if (newM.familyKey === 'eonSphere') {
      s2 = `The new ${newName} has a dedicated AI chip, so instead of just turning sound up it separates speech from background noise in real time${newM.level === 50 ? ' when you switch on its speech-in-noise programme' : ''}${statTail}.`;
    } else {
      s2 = `The new ${newName} is ${Math.max(0, newM.launched - era)} years further on, with ${lowerFirst(newM.adapt ? newM.adapt.text.split(':')[0] : 'automatic processing')} adjusting to each place you go${statTail}.`;
    }
    // Highlight the most customer-relevant gains not already mentioned above.
    const said = new Set(['ai_chip', 'ai_auto', 'rechargeable']);
    const gainedIds = new Set(list.items.filter((i) => i.old.state === 'notyet' || i.old.state === 'no').map((i) => i.id));
    const highlights = SAY_ORDER.filter((id) => gainedIds.has(id) && !said.has(id)).slice(0, 3).map((id) => SAY[id]);
    const s3 = list.gained
      ? `Altogether it brings ${list.gained} feature${list.gained === 1 ? '' : 's'} your current aids don't have${highlights.length ? `, including ${joinList(highlights)}` : ''}.`
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

  const SAY = {
    auracast: 'Auracast™ broadcast streaming',
    stream: 'streaming calls, music and TV straight to both ears',
    handsfree: 'hands-free phone calls',
    speech_enhancer: 'Speech Enhancer for soft and distant voices',
    dnc: 'Dynamic Noise Cancellation',
    speechsensor: 'SpeechSensor to catch voices beside and behind you',
    windblock2: 'WindBlock 2.0 for windy days',
    app: 'control from your phone',
    stereozoom2: 'StereoZoom 2.0',
    speech360: 'Speech in 360°',
    motion: 'Motion Sensor Hearing',
    tap: 'Tap Control',
    autosense: 'fully automatic AutoSense OS',
    sr2: 'SoundRecover2',
  };
  const SAY_ORDER = ['auracast', 'stream', 'handsfree', 'speech_enhancer', 'dnc', 'speechsensor', 'windblock2',
    'app', 'stereozoom2', 'speech360', 'motion', 'tap', 'autosense', 'sr2'];

  function lowerFirst(s) {
    return /^[A-Z][a-z]/.test(s) && !/^(AutoSense|Phonak|Binaural|SoundFlow|Spheric|StereoZoom|SpeechSensor|Speech |SoundRecover|WindBlock|Dynamic|Motion|Tap|RogerDirect|Auracast|Music, TV)/.test(s)
      ? s[0].toLowerCase() + s.slice(1) : s;
  }

  function usedSources(rowsOut, cardsOut, list, newM) {
    const keys = new Set();
    for (const r of rowsOut) for (const side of [r.old, r.new]) if (side.source) keys.add(side.source);
    for (const c of cardsOut) {
      for (const side of [c.old, c.new]) if (side.source) keys.add(side.source);
      if (c.stat && c.stat.source) keys.add(c.stat.source);
    }
    for (const i of list.items) for (const s of i.sources || []) keys.add(s);
    if (newM.noteSource) keys.add(newM.noteSource);
    return [...keys];
  }

  function compare(data, oldId, newId, opts = {}) {
    const oldM = resolveOld(data, oldId, opts.oldLevel);
    const newM = resolveNew(data, newId);
    if (!newM.mapped) {
      return { old: oldM, new: newM, cards: [], rows: [], features: null, warnings: warnings(oldM, newM, null), narrative: '', sources: [] };
    }
    const list = checklist(data, oldM, newM);
    const rowsOut = rows(oldM, newM);
    const cardsOut = cards(oldM, newM);
    return {
      old: oldM,
      new: newM,
      cards: cardsOut,
      rows: rowsOut,
      features: list,
      warnings: warnings(oldM, newM, list),
      narrative: narrative(oldM, newM, list, opts.patientName),
      sources: usedSources(rowsOut, cardsOut, list, newM),
    };
  }

  function priceText(p) {
    const gbp = (n) => '£' + Number(n).toLocaleString('en-GB', { maximumFractionDigits: 0 });
    if (p.pairOnly) return `${gbp(p.pairPrice)} per system (pair-only)`;
    return `${gbp(p.pairPrice)} pair · ${gbp(p.singlePrice)} single`;
  }

  return { compare, resolveOld, resolveNew, oldLevels, priceText, NOT_FOUND, NOT_SUPPLIED, CURRENT_YEAR };
});
