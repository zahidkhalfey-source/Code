// "What bothers you most?" Each concern lifts its matching cards, checklist
// features and listening plan to the top, and steers the read-aloud script.
window.HC_CONCERNS = [
  { id: 'noise', say: 'noisy places', label: 'Noisy places & groups', card: 'speech', plan: 'everywhere',
    features: ['ai_chip', 'ai_auto', 'dnc', 'stereozoom2', 'loud_noise', 'speechsensor', 'speech360', 'motion'] },
  { id: 'soft', say: 'soft voices', label: 'Soft or distant voices', card: 'speech',
    features: ['speech_enhancer', 'speechsensor', 'speech360'] },
  { id: 'partner', say: 'hearing one person', label: 'Hearing one person, e.g. a partner', card: 'speech', plan: 'together',
    features: ['speechsensor', 'speech360', 'stereozoom2'] },
  { id: 'tv', say: 'TV', label: 'TV & music', card: 'connect', plan: 'home',
    features: ['stream', 'auracast'] },
  { id: 'phone', say: 'phone calls', label: 'Phone calls', card: 'connect',
    features: ['handsfree', 'stream', 'tap', 'app'] },
  { id: 'wind', say: 'wind', label: 'Wind & outdoors', card: null,
    features: ['windblock2', 'windblock', 'motion'] },
  { id: 'battery', say: 'battery changes', label: 'Changing batteries', card: 'power',
    features: ['rechargeable', 'battery38'] },
  { id: 'discreet', say: 'being noticed', label: 'Being noticed wearing them', card: 'size', features: [] },
];
