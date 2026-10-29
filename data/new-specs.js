// Specs for the NEW Phonak models being pitched, taken from the supplied spec
// files (EON Feature Summary, Audéo E-Sphere datasheet, CROS E sheet, Phonak
// feature matrices), plus the EON launch release where noted.
//
// How it fits together:
//   data/pricing.js   (generated from the pricing file) lists models by id
//   `models` below    maps each pricing id -> { family, level, variant }
//   `families` below  holds the specs: base values, then per-level and
//                     per-variant overrides, merged in that order.
// A pricing id with no entry in `models` still appears, with a warning.
//
// Fact format and statuses match legacy-platforms.js. 'unknown' facts on new
// models mean "not in the supplied spec files".
(function () {
  const v = (text, source) => ({ text, status: 'verified', source });
  const c = (text, source) => ({ text, status: 'check', source });
  const u = () => ({ text: null, status: 'unknown', source: null });

  const S = 'eonSummary';
  const M = 'phonakMatrices';

  const eonCommon = {
    platform: 'EON',
    launched: 2026,
    adapt: v('AutoSense OS™ AI 8.0: machine learning identifies your surroundings and adjusts automatically, and you can personalise it in the myPhonak app', S),
    wind: v('WindBlock 2.0: reduces wind noise by up to 50 dB and improves speech-to-noise by up to 30 dB', S),
    feedback: v('WhistleBlock feedback canceller', S),
    app: v('myPhonak app plus Tap Control (tap the ear to answer calls or pause streaming)', S),
    streaming: v('Universal Bluetooth® from any Bluetooth device, now with Auracast™ broadcast streaming (TVs, cinemas, venues)', S),
    calls: v('Hands-free calls from any Bluetooth phone; the aids’ own microphones pick up your voice', S),
    connectShort: v('Universal Bluetooth + Auracast™, hands-free calls', S),
    rechargeable: true,
  };

  const families = {
    eonSphere: Object.assign({}, eonCommon, {
      label: 'Phonak Audéo EON Sphere',
      chip: v('HYPERSONIC AI chip + ERA connectivity chip: 37% more power-efficient than the previous Sphere', 'eonLaunch'),
      battery: v('Built-in lithium-ion rechargeable: about 22 h expected, up to 38 h maximum per charge', 'eSphereDatasheet'),
      batteryShort: v('Rechargeable: 22 h typical, up to 38 h', 'eSphereDatasheet'),
      size: v('25% smaller and 20% lighter than the previous Sphere generation', 'eonLaunch'),
      sizeShort: v('25% smaller, 20% lighter', 'eonLaunch'),
      levels: {
        90: {
          speech: v('Automatic Spheric Speech Clarity 3.0 at highest strength, plus Speech Enhancer, SpeechSensor, StereoZoom 2.0 and Dynamic Noise Cancellation', S),
          speechShort: v('AI chip separates speech from noise automatically, at maximum strength', S),
          stats: [
            { value: '37%', label: 'less listening effort', source: 'eonLaunch', note: 'Phonak-reported study result for EON Sphere' },
            { value: '2×', label: 'as likely to understand every word, from any direction', source: 'eonLaunch', note: 'Phonak-reported claim for EON Sphere' },
          ],
          channels: '20',
        },
        70: {
          speech: v('Automatic Spheric Speech Clarity 3.0 at high strength, plus SpeechSensor, StereoZoom 2.0 and Dynamic Noise Cancellation', S),
          speechShort: v('AI chip separates speech from noise automatically', S),
          stats: [
            { value: '37%', label: 'less listening effort', source: 'eonLaunch', note: 'Phonak-reported result for EON Sphere; strength is “high” at 70 (“highest” at 90)' },
          ],
          channels: '20',
        },
        50: {
          speech: v('Spheric Speech Clarity 3.0 as a manual programme (moderate strength), plus Motion Sensor Hearing', S),
          speechShort: v('AI speech-from-noise programme, switched on manually', S),
          stats: [
            { value: 'AI', label: 'speech-from-noise programme you switch on in noisy places', source: S, note: 'Manual activation, moderate strength at the 50 level' },
          ],
          channels: '16',
        },
      },
    }),

    eonR: Object.assign({}, eonCommon, {
      label: 'Phonak Audéo EON R',
      chip: c('ERA connectivity chip (EON R processor details not in the supplied files)', 'eonLaunch'),
      battery: c('Built-in rechargeable (R model). Runtime for EON R is not in the supplied datasheet, please verify with manufacturer', 'eonSummary'),
      batteryShort: c('Built-in rechargeable', 'eonSummary'),
      size: u(),
      levels: {
        30: {
          speech: v('Speech in Noise programme with UltraZoom directional microphones. Spheric Speech Clarity is not included at the 30 level (it starts at E50 Sphere)', S),
          speechShort: v('Automatic Speech in Noise programme (no AI Spheric processing at this level)', S),
          stats: [],
          upsell: 'Spheric Speech Clarity 3.0 (the AI speech-in-noise chip) starts at EON E50 Sphere.',
          channels: '12',
        },
        90: {
          speech: v('Speech in Loud Noise, SpeechSensor, Speech Enhancer, StereoZoom 2.0 and Dynamic Noise Cancellation (AI Spheric processing is Sphere-only)', M),
          speechShort: v('Premium directional processing with SpeechSensor (no AI Spheric chip)', M),
          stats: [],
          channels: '20',
        },
      },
    }),

    virtoI: {
      label: 'Phonak Virto I (Infinio custom)',
      platform: 'Infinio',
      launched: 2024,
      chip: v('ERA chip', 'infinio'),
      adapt: c('AutoSense OS 6.0 (Infinio platform)', 'infinio'),
      wind: v('WindBlock', M),
      feedback: v('WhistleBlock', M),
      app: c('myPhonak app (no Tap Control on Virto)', M),
      streaming: v('Universal Bluetooth via the ERA chip; Phonak says Auracast will follow by firmware update', 'eonLaunch'),
      calls: v('Hands-free calls (phone call + mic)', M),
      connectShort: v('Universal Bluetooth, hands-free calls', 'infinio'),
      size: u(),
      rechargeable: null,
      levels: {
        90: { speech: v('SpeechSensor, Speech Enhancer, StereoZoom 2.0, Dynamic Noise Cancellation and Speech in Loud Noise', M),
              speechShort: v('Premium directional processing with SpeechSensor', M),
              stats: [{ value: '45%', label: 'less listening effort', source: 'infinio', note: 'Phonak-reported claim for Infinio SmartSpeech' }],
              channels: '20' },
        70: { speech: v('StereoZoom 2.0, Dynamic Noise Cancellation and Motion Sensor Hearing', M),
              speechShort: v('Advanced directional processing and noise cancellation', M),
              stats: [{ value: '16%', label: 'better speech understanding in loud noise', source: 'lumity', note: 'Phonak-reported StereoZoom 2.0 vs StereoZoom' }],
              channels: '20' },
        50: { speech: v('Motion Sensor Hearing, Speech in Noise and UltraZoom', M),
              speechShort: v('Automatic Speech in Noise programme', M), stats: [], channels: '16' },
        30: { speech: v('Speech in Noise programme with UltraZoom', M),
              speechShort: v('Automatic Speech in Noise programme', M), stats: [], channels: '12' },
      },
      variants: {
        R: { battery: c('Built-in rechargeable (runtime not in the supplied files)', 'phonakMatrices'),
             batteryShort: c('Built-in rechargeable', 'phonakMatrices'), rechargeable: true },
        NWO: { app: c('Controls on the aid only (non-wireless version)', 'phonakMatrices'),
               streaming: c('Non-wireless (NW) version: no Bluetooth streaming. Confirm the exact variant', 'phonakMatrices'),
               calls: c('No Bluetooth calls on the non-wireless version. Confirm the exact variant', 'phonakMatrices'),
               connectShort: c('Non-wireless version: no Bluetooth', 'phonakMatrices'),
               battery: c('Disposable size 10 battery (from the model code)', 'phonakMatrices'),
               batteryShort: c('Disposable size 10 battery', 'phonakMatrices'), rechargeable: false },
        Titanium: { battery: u(), batteryShort: u(),
                    streaming: c('Bluetooth expected on Infinio; confirm for the Titanium variant', 'infinio'),
                    connectShort: c('Bluetooth expected; confirm for Titanium', 'infinio') },
      },
    },

    naidaL: {
      label: 'Phonak Naída L (Lumity)',
      platform: 'Lumity',
      launched: 2022,
      chip: c('PRISM chip (retailer-cited)', 'lumityRetail'),
      adapt: c('AutoSense OS 5.0', 'lumity'),
      wind: v('WindBlock', M),
      feedback: v('WhistleBlock', M),
      app: c('myPhonak app', 'lumity'),
      streaming: c('Direct Bluetooth streaming (Lumity platform)', 'lumity'),
      calls: c('Hands-free calls (Lumity platform)', 'lumity'),
      connectShort: c('Bluetooth streaming and hands-free calls', 'lumity'),
      battery: c('The catalogue does not say which Naída L power or battery version this is. Please verify with manufacturer', 'phonakMatrices'),
      batteryShort: c('Depends on Naída L version, so check before quoting', 'phonakMatrices'),
      size: u(),
      rechargeable: null,
      levels: {
        90: { speech: v('SpeechSensor, Speech Enhancer, StereoZoom 2.0, Dynamic Noise Cancellation and EchoBlock', M),
              speechShort: v('Premium directional processing with SpeechSensor', M),
              stats: [{ value: '15%', label: 'better understanding of speech from the side and behind', source: 'lumity', note: 'Phonak-reported SpeechSensor result' }],
              channels: '20' },
        70: { speech: v('StereoZoom 2.0, Dynamic Noise Cancellation and Motion Sensor Hearing', M),
              speechShort: v('Advanced directional processing and noise cancellation', M),
              stats: [{ value: '16%', label: 'better speech understanding in loud noise', source: 'lumity', note: 'Phonak-reported StereoZoom 2.0 vs StereoZoom' }],
              channels: '20' },
        50: { speech: v('Motion Sensor Hearing, Speech in Noise and UltraZoom', M),
              speechShort: v('Automatic Speech in Noise programme', M), stats: [], channels: '16' },
        30: { speech: v('Speech in Noise programme with UltraZoom', M),
              speechShort: v('Automatic Speech in Noise programme', M), stats: [], channels: '12' },
      },
    },
  };

  // CROS systems use the Audéo EON R aid at the matching level, plus the
  // transmitter. CROS E-R is compatible with Audéo E-R only (supplied sheet).
  families.crosE = Object.assign({}, families.eonR, {
    label: 'Phonak CROS EON R system',
    note: 'CROS E-R sits on the unaidable ear and sends sound to an Audéo E-R aid on the better ear. It is compatible with Audéo E-R only and does not restore two-ear hearing.',
    noteSource: 'crosE',
  });

  const models = {
    e30: { family: 'eonR', level: 30 },
    e50: { family: 'eonSphere', level: 50 },
    e70: { family: 'eonSphere', level: 70 },
    e90: { family: 'eonSphere', level: 90 },
    naida30: { family: 'naidaL', level: 30 },
    naida50: { family: 'naidaL', level: 50 },
    naida70: { family: 'naidaL', level: 70 },
    naida90: { family: 'naidaL', level: 90 },
    virto_i30_10nwo: { family: 'virtoI', level: 30, variant: 'NWO' },
    virto_i30_r: { family: 'virtoI', level: 30, variant: 'R' },
    virto_i50_10nwo: { family: 'virtoI', level: 50, variant: 'NWO' },
    virto_i50_r: { family: 'virtoI', level: 50, variant: 'R' },
    virto_i70_10nwo: { family: 'virtoI', level: 70, variant: 'NWO' },
    virto_i70_r: { family: 'virtoI', level: 70, variant: 'R' },
    virto_i70_titanium: { family: 'virtoI', level: 70, variant: 'Titanium' },
    virto_i90_10nwo: { family: 'virtoI', level: 90, variant: 'NWO' },
    virto_i90_r: { family: 'virtoI', level: 90, variant: 'R' },
    virto_i90_titanium: { family: 'virtoI', level: 90, variant: 'Titanium' },
    cros_e30: { family: 'crosE', level: 30 },
    cros_e90: { family: 'crosE', level: 90 },
  };

  window.HC_NEW_SPECS = { families, models };
})();
