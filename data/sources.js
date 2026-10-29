// Evidence register. Every fact in legacy-platforms.js and new-specs.js cites one
// of these keys. "supplied" sources are the files uploaded with the brief; "web"
// sources were found by web search on 29 October 2026.
window.HC_SOURCES = {
  eonSummary: {
    kind: 'supplied',
    title: 'Phonak EON Feature Summary (028-xxxx-02, V1.00, 2026-07)',
  },
  eSphereDatasheet: {
    kind: 'supplied',
    title: 'Phonak Audéo E-Sphere technical datasheet (V1.00, 2025-10)',
  },
  crosE: {
    kind: 'supplied',
    title: 'Phonak CROS E product information (027-0743-02)',
  },
  phonakMatrices: {
    kind: 'supplied',
    title: 'Phonak.com feature-level matrices for Audéo EON, EON R, Naída Lumity and Virto Infinio (snapshot in the supplied comparison package)',
  },
  eonLaunch: {
    kind: 'web',
    title: 'Sonova/Phonak EON launch, 24 August 2026 (Sonova release; Hearing Review; HearingTracker)',
    urls: [
      'https://www.sonova.com/?p=632008',
      'https://hearingreview.com/hearing-products/hearing-aids/phonak-launches-eon-hearing-aids-with-new-hypersonic-chip-and-auracast',
      'https://hearingtracker.com/news/phonak-eon-debuts-smaller-sphere-auracast-and-windblock',
    ],
  },
  quest: {
    kind: 'web',
    title: 'Phonak Quest launch releases (Oct 2012 Bolero Q/Virto Q; Apr 2013 Audéo Q/Naída Q) and AAA 2013 handout',
    urls: [
      'https://phonakpro.com/il/en/about-phonak/press-center/2013/2013-april-03-productlaunch.html',
      'https://hearingreview.com/hearing-products/aaa-news-phonak-expands-its-quest-platform-with-new-product-lines2',
      'https://hearingreview.com/hearing-products/a-marketing-perspective-on-phonak-s-new-quest',
      'https://cochlearimplanthelp.com/wp-content/uploads/2013/04/20130327_aaa_handout_final.pdf',
    ],
  },
  questSpecs: {
    kind: 'web',
    title: 'Phonak Audéo Q product information and Quest sales reference guide (2014)',
    urls: [
      'https://www.phonakpro.com/content/dam/phonakpro/gc_hq/en/products_solutions/hearing_aid/audeo_q/documents/product_information_audeo_q_027-0109.pdf',
      'https://www.phonakpro.com/content/dam/phonakpro/gc_hq/en/products_solutions/documents/reference_guide_sales_quest_spice_march_2014.pdf',
    ],
  },
  wind: {
    kind: 'web',
    title: 'Latzel & Appleton (2013) Binaural Speech in Wind, Hearing Review; Phonak WindBlock 2.0 Insight (2026)',
    urls: [
      'https://hearingreview.com/2013/07/evaluation-of-a-binaural-speech-in-wind-feature-part-1-verification-in-the-laboratory/',
      'https://www.phonak.com/content/dam/phonak/en/evidence-library/white-paper/technical-paper/PH_Insight_WindBlock2.0_210x280_EN_028-2924-02_V1.00.pdf',
    ],
  },
  compilot: {
    kind: 'web',
    title: 'Phonak knowledge base: wireless accessories compatibility (ComPilot for Spice/Quest; ComPilot II for Venture/Belong)',
    urls: ['https://www.phonak.com/en-nz/support-options/knowledge-base-articles/phonak-wireless-accessories-and-phonak-hearing-aids'],
  },
  venture: {
    kind: 'web',
    title: 'Phonak Audéo V / Venture launch, 15 October 2014',
    urls: [
      'https://www.phonak.com/mx/es/press/phonak-audeo-v-next-generation-ric.html',
      'https://hearingreview.com/2014/10/phonak-launches-phonak-audeo-v-ric-hearing-aid-line-based-new-venture-platform/',
    ],
  },
  belong: {
    kind: 'web',
    title: 'Phonak Belong launch incl. Audéo B-R lithium-ion rechargeable (August 2016)',
    urls: [
      'https://www.sonova.com/en/phonak-launch-next-generation-platform-including-first-mainstream-lithium-ion-rechargeable-hearing',
      'https://www.phonakpro.com/il/en/about-phonak/press-center/2016/2016-august-30-belong.html',
      'https://hearingreview.com/hearing-products/hearing-aids/speech-noise/phonak-launches-bolero-b-pr-rechargeable-bte-virto-b-titanium-iic-hearing-aids',
    ],
  },
  bDirect: {
    kind: 'web',
    title: 'Phonak Audéo B-Direct release (2017)',
    urls: [
      'https://www.audiology-worldnews.com/new-products/2508-phonak-releases-audeotm-b-direct',
      'https://www.phonakpro.com/il/en/about-phonak/technologies/direct-connectivity.html',
    ],
  },
  marvel: {
    kind: 'web',
    title: 'Phonak Marvel launch (October 2018) and Audéo Marvel leaflet (Feb 2019)',
    urls: [
      'https://hearingreview.com/2018/10/phonak-launches-marvel-universal-binaural-streaming-new-level-sound-quality/',
      'https://www.hearingtracker.com/news/phonak-launches-first-real-bluetooth-hearing-aid',
      'https://www.phonakpro.com/content/dam/phonakpro/gc_us/en/marketing/documents/marvel/028-1905-03_Leaflet_BtB_Phonak_Audeo_Marvel_Feb 2019.pdf',
    ],
  },
  paradise: {
    kind: 'web',
    title: 'Sonova Paradise platform launch (19 August 2020)',
    urls: [
      'https://www.sonova.com/?p=232',
      'https://hearingreview.com/hearing-products/phonak-launches-audeo-paradise-hearing-aid',
    ],
  },
  paradiseBattery: {
    kind: 'web',
    title: 'HearingTracker forum reports of the advertised Audéo P-R runtime (user-reported, not an official sheet)',
    urls: ['https://forum.hearingtracker.com/t/phonak-audeo-paradise-p90-r-vs-p90-13t/58383'],
  },
  lumity: {
    kind: 'web',
    title: 'Phonak Lumity launch (2022): StereoZoom 2.0, SpeechSensor, AutoSense OS 5.0',
    urls: [
      'https://hearinghealthmatters.org/hearing-news-watch/2022/phonak-audeo-lumity-hearing-aid-platform/',
      'https://www.phonakpro.com/il/en/products/hearing-aids/audeo-lumity/smartspeech-technology.html',
    ],
  },
  lumityRetail: {
    kind: 'web',
    title: 'Retailer listings for Audéo Lumity (chip and battery figures; secondary source)',
    urls: ['https://injoyhearing.com/products/phonak-audeo-lumity-l90'],
  },
  infinio: {
    kind: 'web',
    title: 'Phonak Infinio / Audéo Sphere Infinio launch (2024) and ERA chip blog',
    urls: [
      'https://audiologyblog.phonakpro.com/connectivity-ultra-responsive-era-chip-at-the-heart-of-infinio/',
      'https://www.hearingtracker.com/news/phonak-unveils-groundbreaking-infinio-hearing-aids-and-ai-powered-audeo-sphere-infinio',
      'https://www.phonak.com/en-us/professionals/ai-audiology',
    ],
  },
};
