// Feature-by-feature checklist ("Then vs. now").
//
// For each feature:
//   introduced  first platform that had it. Older platforms are marked
//               "not available yet", which is the strongest, fully honest ✗.
//   old         per platform: 1 (yes), 0 (not on this model/level), '?' (not
//               confirmed), or { 90:…, 70:…, 50:…, 30:… } by technology level.
//               Platforms missing from `old` (but not older than `introduced`)
//               show as '?'.
//   oldModels   per-model overrides (e.g. only the B-Direct had calls on Belong).
//   oldFromModel 'rechargeable' reads the model's own rechargeable flag.
//   introducedAs optional { name, year } when the first model came later than its platform.
//   new         per new family: 1 / 0 / 'c' (yes, but verify) by level, plus
//               optional `variants` for Virto (R / NWO / Titanium).
// Only features the chosen NEW model has are listed in the checklist.
(function () {
  const L = (l90, l70, l50, l30) => ({ 90: l90, 70: l70, 50: l50, 30: l30 });
  const ALL = L(1, 1, 1, 1);

  const features = [
    {
      id: 'ai_chip', group: 'Hearing in noise',
      label: 'AI chip that separates speech from noise',
      benefit: 'Pulls voices out of background noise in real time',
      introduced: 'infinio', sources: ['eonSummary', 'infinio'],
      old: { infinio: 0 }, oldModels: { audeo_sphere_i: 1 },
      new: { eonSphere: L(1, 1, 1, 0), eonR: L(0, 0, 0, 0), crosE: L(0, 0, 0, 0), virtoI: L(0, 0, 0, 0), naidaL: L(0, 0, 0, 0) },
    },
    {
      id: 'ai_auto', group: 'Hearing in noise',
      label: 'AI speech clarity switches on by itself',
      benefit: 'No buttons to press when a room gets loud',
      introduced: 'infinio', sources: ['eonSummary'],
      old: { infinio: 0 }, oldModels: { audeo_sphere_i: '?' },
      new: { eonSphere: L(1, 1, 0, 0) },
    },
    {
      id: 'speech_enhancer', group: 'Hearing in noise',
      label: 'Speech Enhancer',
      benefit: 'Soft or distant voices are easier to follow, even from another room',
      introduced: 'paradise', sources: ['eonSummary', 'phonakMatrices', 'paradiseLevels', 'infinioLevels'],
      old: { paradise: L(1, 0, 0, 0), lumity: '?', infinio: L(1, 0, 0, 0) },
      new: { eonSphere: L(1, 0, 0, 0), eonR: L(1, 0, 0, 0), crosE: L(1, 0, 0, 0), virtoI: L(1, 0, 0, 0), naidaL: L(1, 0, 0, 0) },
    },
    {
      id: 'dnc', group: 'Hearing in noise',
      label: 'Dynamic Noise Cancellation',
      benefit: 'Turns down noise coming from around you so speech stands out',
      introduced: 'paradise', sources: ['eonSummary', 'phonakMatrices', 'paradiseLevels', 'infinioLevels'],
      old: { paradise: L(1, 0, 0, 0), lumity: '?', infinio: L(1, 1, 0, 0) },
      new: { eonSphere: L(1, 1, 0, 0), eonR: L(1, 1, 0, 0), crosE: L(1, 1, 0, 0), virtoI: L(1, 1, 0, 0), naidaL: L(1, 1, 0, 0) },
    },
    {
      id: 'speechsensor', group: 'Hearing in noise',
      label: 'SpeechSensor',
      benefit: 'Finds the talker even when they are beside or behind you',
      introduced: 'lumity', sources: ['eonSummary', 'phonakMatrices', 'lumity'],
      old: { lumity: '?', infinio: '?' },
      new: { eonSphere: L(1, 1, 0, 0), eonR: L(1, 0, 0, 0), crosE: L(1, 0, 0, 0), virtoI: L(1, 0, 0, 0), naidaL: L(1, 0, 0, 0) },
    },
    {
      id: 'stereozoom2', group: 'Hearing in noise',
      label: 'StereoZoom 2.0',
      benefit: 'A smooth, gradual focus on the person you are facing',
      introduced: 'lumity', sources: ['eonSummary', 'phonakMatrices', 'lumity', 'infinioLevels'],
      old: { lumity: '?', infinio: L(1, 1, 0, 0) },
      new: { eonSphere: L(1, 1, 0, 0), eonR: L(1, 1, 0, 0), crosE: L(1, 1, 0, 0), virtoI: L(1, 1, 0, 0), naidaL: L(1, 1, 0, 0) },
    },
    {
      id: 'loud_noise', group: 'Hearing in noise',
      label: 'Both aids team up to focus in loud noise',
      benefit: 'The two hearing aids share sound to zoom in on one voice',
      introduced: 'quest', sources: ['phonakMatrices', 'questLevels', 'ventureLevels', 'belongLevels', 'marvelLevels', 'infinioLevels'],
      old: {
        quest: L(1, 1, 0, 0), venture: L(1, 1, '?', 0), belong: L(1, 1, '?', '?'),
        marvel: L(1, '?', '?', '?'), paradise: L(1, '?', '?', '?'), lumity: L(1, '?', '?', '?'), infinio: L(1, 1, 0, 0),
      },
      new: { eonSphere: L(1, 1, 0, 0), eonR: L(1, 1, 0, 0), crosE: L(1, 1, 0, 0), virtoI: L(1, 1, 0, 0), naidaL: L(1, 1, 0, 0) },
    },
    {
      id: 'speech360', group: 'Hearing in noise',
      label: 'Speech in 360°',
      benefit: 'Hear people behind you, for example in the car',
      introduced: 'belong', sources: ['phonakMatrices', 'belongLevels', 'marvelLevels', 'paradiseLevels'],
      old: { belong: L(1, 1, 0, 0), marvel: L(1, 1, 0, 0), paradise: L('?', '?', 0, 0), lumity: '?', infinio: '?' },
      new: { eonSphere: L(1, 1, 0, 0), eonR: L(1, 1, 0, 0), crosE: L(1, 1, 0, 0), virtoI: L(1, 1, 0, 0), naidaL: L(1, 1, 0, 0) },
    },
    {
      id: 'motion', group: 'Hearing in noise',
      label: 'Motion Sensor Hearing',
      benefit: 'Adjusts automatically while you walk and talk',
      introduced: 'paradise', sources: ['eonSummary', 'phonakMatrices', 'paradise'],
      old: { paradise: '?', lumity: '?', infinio: '?' },
      new: { eonSphere: L(1, 1, 1, 0), eonR: L(1, 1, 1, 0), crosE: L(1, 1, 1, 0), virtoI: L(1, 1, 1, 0), naidaL: L(1, 1, 1, 0) },
    },
    {
      id: 'autosense', group: 'Automatic sound',
      label: 'Fully automatic adjustment to every place (AutoSense OS)',
      benefit: 'Blends settings automatically as you move from place to place',
      introduced: 'venture', sources: ['venture', 'ventureLevels', 'eonSummary'],
      old: { venture: 1, belong: 1, marvel: 1, paradise: 1, lumity: 1, infinio: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, virtoI: ALL, naidaL: ALL },
    },
    {
      id: 'ml', group: 'Automatic sound',
      label: 'Machine-learning sound recognition',
      benefit: 'Trained on thousands of real sound scenes to recognise where you are',
      introduced: 'marvel', sources: ['marvel', 'lumity', 'eonSummary'],
      old: { marvel: 1, paradise: 1, lumity: 1, infinio: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, virtoI: ALL, naidaL: ALL },
    },
    {
      id: 'windblock2', group: 'Comfort',
      label: 'WindBlock 2.0',
      benefit: 'Cuts wind noise by up to 50 dB so speech still comes through outdoors',
      introduced: 'eon', sources: ['eonSummary'],
      old: {},
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL },
    },
    {
      id: 'windblock', group: 'Comfort',
      label: 'Automatic wind-noise reduction',
      benefit: 'Takes the rumble out of windy days',
      introduced: 'quest', sources: ['questLevels', 'marvelLevels', 'phonakMatrices', 'eonSummary'],
      old: { quest: L(1, 1, 0, 0), venture: '?', belong: '?', marvel: L(1, 1, 0, 0), paradise: L(1, 1, '?', '?'), lumity: '?', infinio: ALL },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, virtoI: ALL, naidaL: ALL },
    },
    {
      id: 'sr2', group: 'Comfort',
      label: 'SoundRecover2',
      benefit: 'Brings back high-pitched sounds like birdsong and “s” and “f”',
      introduced: 'belong', sources: ['belong', 'eonSummary', 'phonakMatrices'],
      old: { belong: 1, marvel: 1, paradise: 1, lumity: 1, infinio: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, virtoI: ALL, naidaL: ALL },
    },
    {
      id: 'stream', group: 'Connectivity',
      label: 'Music, TV and calls stream straight to both ears',
      benefit: 'No streamer around your neck; works with any Bluetooth phone',
      introduced: 'marvel', sources: ['marvel', 'eonSummary', 'phonakMatrices'],
      old: { marvel: 1, paradise: 1, lumity: 1, infinio: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, naidaL: L('c', 'c', 'c', 'c'),
             virtoI: { variants: { R: ALL, NWO: L(0, 0, 0, 0), Titanium: L('?', '?', '?', '?') } } },
    },
    {
      id: 'handsfree', group: 'Connectivity',
      label: 'Hands-free phone calls',
      benefit: 'Talk on the phone with it still in your pocket',
      introduced: 'belong', introducedAs: { name: 'Audéo B-Direct', year: 2017 },
      sources: ['bDirect', 'marvel', 'eonSummary', 'phonakMatrices'],
      old: { belong: 0, marvel: 1, paradise: 1, lumity: 1, infinio: 1 }, oldModels: { audeo_bdirect: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, naidaL: L('c', 'c', 'c', 'c'),
             virtoI: { variants: { R: ALL, NWO: L(0, 0, 0, 0), Titanium: L('?', '?', '?', '?') } } },
    },
    {
      id: 'auracast', group: 'Connectivity',
      label: 'Auracast™ broadcast audio',
      benefit: 'Tune into TVs, theatres, airports and venues that broadcast sound',
      introduced: 'eon', sources: ['eonSummary', 'eonLaunch'],
      old: {},
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL },
    },
    {
      id: 'app', group: 'Connectivity',
      label: 'Smartphone app control (myPhonak)',
      benefit: 'Change volume and settings discreetly from your phone',
      introduced: 'marvel', sources: ['marvel', 'eonSummary'],
      old: { marvel: 1, paradise: 1, lumity: 1, infinio: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, naidaL: L('c', 'c', 'c', 'c'),
             virtoI: { variants: { R: L('c', 'c', 'c', 'c'), NWO: L(0, 0, 0, 0), Titanium: L('?', '?', '?', '?') } } },
    },
    {
      id: 'tap', group: 'Connectivity',
      label: 'Tap Control',
      benefit: 'Double-tap your ear to answer a call or pause music',
      introduced: 'paradise', sources: ['eonSummary', 'phonakMatrices', 'paradiseLevels', 'infinioLevels'],
      old: { paradise: L(1, 1, 0, 0), lumity: '?', infinio: L(1, 1, 0, 0) },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, naidaL: L(1, 1, 0, 0), virtoI: L(0, 0, 0, 0) },
    },
    {
      id: 'rogerdirect', group: 'Connectivity',
      label: 'RogerDirect™',
      benefit: 'Connects straight to Roger microphones for meetings and lectures',
      introduced: 'marvel', sources: ['marvel', 'eonSummary', 'phonakMatrices'],
      old: { marvel: 1, paradise: 1, lumity: 1, infinio: 1 },
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL, naidaL: ALL,
             virtoI: { variants: { R: ALL, NWO: L('?', '?', '?', '?'), Titanium: L('?', '?', '?', '?') } } },
    },
    {
      id: 'rechargeable', group: 'Power',
      label: 'Built-in lithium-ion rechargeable battery',
      benefit: 'No more tiny batteries: charge overnight like a phone',
      introduced: 'belong', sources: ['belong', 'eSphereDatasheet', 'eonSummary'],
      oldFromModel: 'rechargeable',
      new: { eonSphere: ALL, eonR: ALL, crosE: ALL,
             virtoI: { variants: { R: ALL, NWO: L(0, 0, 0, 0), Titanium: L('?', '?', '?', '?') } } },
    },
    {
      id: 'battery38', group: 'Power',
      label: 'Up to 38 hours from one charge',
      benefit: 'About 22 hours on a typical day, so it easily lasts from morning to bedtime',
      introduced: 'eon', sources: ['eSphereDatasheet'],
      old: {},
      new: { eonSphere: ALL },
    },
  ];

  window.HC_FEATURES = { features, platformOrder: ['quest', 'venture', 'belong', 'marvel', 'paradise', 'lumity', 'infinio', 'eon'] };
})();
