// "In their words" board (Conversation mode).
// Each concern has quick-pick phrases the dispenser can tap, and an ordered list
// of "What if…?" prompts. The first prompt whose `needs` the chosen new model
// actually has is used, so a prompt never promises something the model can't do.
//   needs: feature ids from features.js (all must be present), or
//          'plan:together' / 'plan:home' (plan available for this model), 'size' (size data known).
// `now` frames the change as the technology moving on, not as the customer's failure.
window.HC_WORDS = {
  noise: {
    presets: ['I can’t follow conversations in restaurants', 'I avoid big family gatherings'],
    whatIf: [
      { needs: ['ai_chip'], q: 'What if, in a busy restaurant, the voice across the table came through instead of the clatter?',
        now: 'Hearing aids now have AI chips that separate speech from background noise as it happens.' },
      { needs: ['dnc'], q: 'What if the room got quieter and the person you’re facing got clearer?',
        now: 'Hearing aids can now turn down noise around you while focusing on the talker.' },
      { needs: ['autosense'], q: 'What if your hearing aids adjusted to a busy room by themselves?',
        now: 'Hearing aids now recognise where you are and adjust automatically.' },
    ],
  },
  soft: {
    presets: ['People seem to mumble', 'I miss what the grandchildren say'],
    whatIf: [
      { needs: ['speech_enhancer'], q: 'What if a soft voice, even from the next room, was easier to catch?',
        now: 'Speech Enhancer now lifts quiet and distant speech.' },
      { needs: ['speechsensor'], q: 'What if you could catch the voice beside or behind you without turning round?',
        now: 'Hearing aids can now find the talker from any direction.' },
      { needs: ['autosense'], q: 'What if your hearing aids worked out by themselves when someone was talking to you?',
        now: 'Hearing aids now recognise speech and adjust automatically.' },
    ],
  },
  partner: {
    presets: ['I can’t hear my partner from the other room'],
    whatIf: [
      { needs: ['plan:together'], q: 'What if your partner’s voice came straight to your ears, even across the room?',
        now: 'A small clip-on microphone can now send one person’s voice directly to your hearing aids.' },
      { needs: ['speechsensor'], q: 'What if you could follow your partner even when they’re beside or behind you?',
        now: 'Hearing aids can now find the talker from any direction.' },
    ],
  },
  tv: {
    presets: ['I have the TV turned up and the family complain'],
    whatIf: [
      { needs: ['stream', 'auracast'], q: 'What if the TV came straight into your ears, at a volume that suits everyone else in the room?',
        now: 'Hearing aids now stream TV sound directly, and can tune into broadcasts in theatres and venues.' },
      { needs: ['stream'], q: 'What if the TV came straight into your ears, at a volume that suits everyone else in the room?',
        now: 'Hearing aids can now stream TV sound directly with a small TV Connector.' },
    ],
  },
  phone: {
    presets: ['Phone calls are a struggle'],
    whatIf: [
      { needs: ['handsfree'], q: 'What if a phone call sounded clear in both ears, without holding the phone?',
        now: 'Hearing aids now connect to any Bluetooth phone for hands-free calls.' },
    ],
  },
  wind: {
    presets: ['Wind makes walking outside unbearable'],
    whatIf: [
      { needs: ['windblock2'], q: 'What if a breezy walk still left room for conversation?',
        now: 'New wind processing cuts wind noise by up to 50 dB.' },
      { needs: ['windblock'], q: 'What if windy days didn’t drown everything out?',
        now: 'Hearing aids now reduce wind rumble automatically.' },
    ],
  },
  battery: {
    presets: ['The batteries are fiddly and always run out'],
    whatIf: [
      { needs: ['rechargeable'], q: 'What if you never had to change a tiny battery again?',
        now: 'Hearing aids now charge overnight, like a phone.' },
    ],
  },
  discreet: {
    presets: ['I don’t want people to notice them'],
    whatIf: [
      { needs: ['size'], q: 'What if they were smaller and lighter than before?',
        now: 'The newest generation is noticeably smaller and lighter than the one before it.' },
    ],
  },
};
