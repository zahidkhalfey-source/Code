// Listening plans: names and prices come from the pricing tool's engine
// (assets/pricing-engine.js). This file only adds the customer benefit of each
// plan's accessory, worded as in Zahid's three-way comparison tool.
window.HC_PLANS = {
  home: { accessory: 'TV Connector', benefit: 'Hear TV dialogue through the aids while others keep a comfortable room volume' },
  together: { accessory: 'PartnerMic', benefit: 'A companion wears the microphone to bring one voice closer, useful when walking or sitting apart' },
  everywhere: { accessory: 'Roger On', benefit: 'Bring speech closer at a busy table, across a room or during a presentation' },
};
