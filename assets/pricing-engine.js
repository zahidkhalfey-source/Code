/* Copied unchanged from the Hearingcare Price & Plan tool (source/dist/pricing.js, offline release v23).
   Do not edit here: update it in the pricing tool and copy it across, so both tools quote identically. */
/* Pure pricing rules. No DOM, storage, network or patient information. */
(function (root) {
  'use strict';
  const TERMS = Object.freeze([12, 24, 36, 48]);
  const SINGLE_FACTOR = 0.699450507240;
  const PLANS = Object.freeze({
    none: { name: 'No plan', accessory: 'No accessory', cost: 0 },
    home: { name: 'Hear at Home', accessory: 'TV Connector', cost: 142.50 },
    together: { name: 'Hear Together', accessory: 'Partner Mic', cost: 247.91 },
    everywhere: { name: 'Hear Everywhere', accessory: 'Roger On', cost: 1000 }
  });
  Object.values(PLANS).forEach(Object.freeze);
  const DISCOUNTS = Object.freeze({
    none: { name: 'No additional discount', rate: 0, rule: 'all' },
    blue: { name: 'Blue Light Card', rate: 0.15, rule: 'premium' },
    dds: { name: 'DDS', rate: 0.15, rule: 'premium' },
    staff: { name: 'Boots staff', rate: 0.25, rule: 'all' },
    friends: { name: 'Boots staff friends and family', rate: 0.20, rule: 'all' },
    opticians: { name: 'Opticians customer', rate: 0.10, rule: 'gold' }
  });
  Object.values(DISCOUNTS).forEach(Object.freeze);
  const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
  // Round down so a penny-rounded deposit never exceeds the configured cap.
  const maxDeposit = total => Math.floor(total * 0.495798319328 * 100) / 100;
  const normal = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function requireValue(condition, message) { if (!condition) throw new Error(message); }
  function isMoney(value) { return Number.isFinite(value) && value >= 0 && value < 1000000; }
  function create(input) {
    requireValue(input && Array.isArray(input.aids) && input.aids.length && input.breakdown, 'Price catalogue is unavailable.');
    const data = JSON.parse(JSON.stringify(input));
    const byId = new Map();
    for (const aid of data.aids) {
      requireValue(aid && typeof aid.id === 'string' && !byId.has(aid.id), 'Invalid or duplicate aid ID.');
      requireValue(['name', 'family', 'tier'].every(key => typeof aid[key] === 'string' && aid[key].length), 'Missing aid description.');
      requireValue(isMoney(aid.price) && typeof aid.eligible === 'boolean' && typeof aid.starkey === 'boolean', 'Invalid aid pricing rules.');
      requireValue(aid.priceSource === undefined || aid.priceSource === 'owner', 'Invalid price source.');
      requireValue(aid.planEligible === undefined || typeof aid.planEligible === 'boolean', 'Invalid plan eligibility.');
      requireValue(aid.pairOnly === undefined || typeof aid.pairOnly === 'boolean', 'Invalid pair-only rule.');
      if (aid.pairOnly) requireValue(aid.priceSource === 'owner' && aid.price > 0 && aid.singlePrice === undefined, 'Pair-only systems require a supplied pair price and no single price.');
      if (aid.priceSource === 'owner' && !aid.pairOnly) requireValue(isMoney(aid.singlePrice) && aid.singlePrice > 0 && aid.price > 0, 'Missing or invalid supplied single-aid price.');
      byId.set(aid.id, Object.freeze(aid));
    }
    for (const aid of data.aids.filter(item => item.priceSource !== 'owner')) for (const customer of ['0', '1']) for (const plan of ['home', 'together', 'everywhere']) {
      const row = data.breakdown[`${aid.id}|${customer}|${plan}`];
      requireValue(row && ['total', 'deposit', 'balance'].every(key => isMoney(row[key])), 'Missing or invalid PDF price row.');
      const expectedTotal = round(aid.price * (customer === '1' ? 0.9 : 1) + (aid.starkey ? 0 : PLANS[plan].cost));
      requireValue(row.total === expectedTotal && row.deposit === round(row.total * 0.1), 'PDF cash price or deposit conflicts with catalogue rules.');
      requireValue(round(row.deposit + row.balance) === row.total, 'PDF deposit and balance do not reconcile.');
      requireValue(Array.isArray(row.monthly) && Array.isArray(row.totals) && row.monthly.length === 4 && row.totals.length === 4, 'Invalid payment terms.');
      TERMS.forEach((months, index) => {
        if (!aid.eligible && index === 0) {
          requireValue(row.monthly[index] === null && row.totals[index] === null, 'Unexpected Essentials finance eligibility.');
        } else {
          requireValue(isMoney(row.monthly[index]) && isMoney(row.totals[index]) && row.totals[index] >= row.total, 'Invalid monthly payment.');
          if (index > 0) {
            const rate = Math.pow(1.099, 1 / 12) - 1;
            const expectedPayment = row.balance * rate / (1 - Math.pow(1 + rate, -months));
            requireValue(Math.abs(row.monthly[index] - expectedPayment) <= 0.005001, 'PDF repayment conflicts with the stated APR method.');
          }
          if (index === 0) requireValue(Math.abs(row.monthly[index] - row.balance / months) <= 0.005001, 'Invalid interest-free monthly instalment.');
          requireValue(index === 0 ? row.totals[index] === row.total : round(row.deposit + row.monthly[index] * months) === row.totals[index], 'PDF repayments do not reconcile.');
        }
      });
    }
    function validate(aidId, customer, plan, fitting) {
      requireValue(byId.has(aidId), 'Choose a listed hearing aid.');
      requireValue(['0', '1'].includes(customer), 'Choose a valid customer price.');
      requireValue(Object.prototype.hasOwnProperty.call(PLANS, plan), 'Choose a valid listening plan.');
      requireValue(['pair', 'single'].includes(fitting), 'Choose pair or single fitting.');
      const aid = byId.get(aidId);
      requireValue(!aid.pairOnly || fitting === 'pair', 'CROS systems are available as a pair only in this catalogue.');
      requireValue(plan === 'none' || planEligible(aidId), 'Listening plans are not available for this hearing aid.');
      return aid;
    }
    function planEligible(aidId) {
      requireValue(byId.has(aidId), 'Choose a listed hearing aid.');
      const aid = byId.get(aidId);
      return !aid.starkey && aid.planEligible !== false;
    }
    function warrantyYears(aidId) {
      requireValue(byId.has(aidId), 'Choose a listed hearing aid.');
      return /^Essentials/i.test(byId.get(aidId).tier) ? 2 : 4;
    }
    function discountEligible(aidId, discount) {
      requireValue(byId.has(aidId), 'Choose a listed hearing aid.');
      requireValue(Object.prototype.hasOwnProperty.call(DISCOUNTS, discount), 'Choose one valid discount.');
      const aid = byId.get(aidId);
      const rule = DISCOUNTS[discount].rule;
      return rule === 'all' || (rule === 'premium' ? ['Bronze', 'Silver', 'Gold', 'Platinum', 'Platinum +', 'Platinum Plus'].includes(aid.tier) : ['Gold', 'Platinum', 'Platinum +', 'Platinum Plus'].includes(aid.tier));
    }
    function discountDetails(aidId, customer, discount) {
      requireValue(discountEligible(aidId, discount), 'This discount is not available for the selected hearing aid.');
      requireValue(customer !== '1' || discount === 'none', 'Existing customer discount cannot be combined with another discount.');
      return customer === '1' ? { name: 'Existing customer', rate: 0.10 } : DISCOUNTS[discount];
    }
    function aidPrice(aidId, customer, fitting = 'pair', discount = 'none') {
      const aid = validate(aidId, customer, 'none', fitting);
      const benefit = discountDetails(aidId, customer, discount);
      // Explicit business convention: round full single price, then apply discount.
      const base = fitting === 'single' ? (aid.priceSource === 'owner' ? aid.singlePrice : Math.round(aid.price * SINGLE_FACTOR / 5) * 5) : aid.price;
      return round(base * (1 - benefit.rate));
    }
    function optionalInsuranceEligible(aidId, plan) {
      requireValue(byId.has(aidId), 'Choose a listed hearing aid.');
      if (plan === 'none') return true;
      return planEligible(aidId) && ['home', 'together', 'everywhere'].includes(plan)
        && ['b1312', 'b1r', 'b3r', 's3r', 'custom_b1_312', 'custom_b3_312'].includes(aidId);
    }
    function insurance(aidId, plan, fitting = 'pair', purchaseInsurance = false) {
      const aid = validate(aidId, '0', plan, fitting);
      requireValue(typeof purchaseInsurance === 'boolean' && (!purchaseInsurance || optionalInsuranceEligible(aidId, plan)), 'Optional purchase insurance is not available for this selection.');
      if (purchaseInsurance) return { status: 'Added', reason: `Optional purchase insurance added for ${fitting === 'single' ? 'one hearing aid at £99' : 'two hearing aids at £198'}. Confirm policy duration, excess and exclusions. This premium is not discounted.` };
      if (plan === 'none') return { status: 'Not included', reason: 'No listening plan selected. Monthly finance alone does not include insurance.' };
      if (['s5r', 's7r', 's9r'].includes(aid.id)) return { status: 'Included', reason: 'Included with this plan under your AudioNova S5-and-upwards rule, for pair or single fittings.' };
      if (aid.family.startsWith('Phonak ')) return { status: 'Included', reason: 'Insurance is included with every Phonak model when a listening plan is selected, for pair or single fittings.' };
      if (['custom_b5_312', 'custom_b7_312'].includes(aid.id)) return { status: 'Included', reason: 'Insurance is included with AudioNova Custom B5/B7 when purchased with an eligible listening plan, for pair or single fittings.' };
      return { status: 'Not included', reason: 'Insurance is not included with this plan. You can add optional purchase insurance at the displayed price.' };
    }
    function quote(aidId, customer, plan, fitting = 'pair', purchaseInsurance = false, discount = 'none', depositOverride = null) {
      const aid = validate(aidId, customer, plan, fitting);
      const benefit = discountDetails(aidId, customer, discount);
      const netAidPrice = aidPrice(aidId, customer, fitting, discount);
      const fullAidPrice = aidPrice(aidId, '0', fitting);
      const cover = insurance(aidId, plan, fitting, purchaseInsurance);
      const insurancePrice = purchaseInsurance ? (fitting === 'single' ? 99 : 198) : 0;
      const cashTotal = round(netAidPrice + PLANS[plan].cost + insurancePrice);
      const defaultDeposit = round(cashTotal * 0.1);
      requireValue(depositOverride === null || (isMoney(depositOverride) && round(depositOverride) === depositOverride && depositOverride >= defaultDeposit && depositOverride <= maxDeposit(cashTotal)), 'Enter a deposit between 10% and the maximum allowed deposit, to the nearest penny.');
      const customDeposit = depositOverride !== null && depositOverride !== defaultDeposit;
      const exact = !customDeposit && aid.priceSource !== 'owner' && fitting === 'pair' && !purchaseInsurance && discount === 'none' ? data.breakdown[`${aidId}|${customer}|${aid.starkey ? 'home' : plan}`] : null;
      let result;
      if (exact) result = { ...exact, monthly: [...exact.monthly], totals: [...exact.totals], kind: 'listed' };
      else {
        const total = round(netAidPrice + PLANS[plan].cost + insurancePrice);
        const deposit = depositOverride === null ? defaultDeposit : depositOverride;
        const balance = round(total - deposit);
        const monthlyRate = Math.pow(1.099, 1 / 12) - 1;
        const monthly = TERMS.map((months, i) => i === 0 ? (aid.eligible ? round(balance / months) : null) : round(balance * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months))));
        result = { total, deposit, balance, monthly, totals: monthly.map((payment, i) => payment === null ? null : i === 0 ? total : round(deposit + payment * TERMS[i])), kind: 'calculated' };
      }
      return { ...result, customDeposit, warrantyYears: warrantyYears(aidId), aidId, customer, plan, fitting, purchaseInsurance, insurancePrice, discount, discountName: benefit.name, discountRate: benefit.rate, discountSaving: round(fullAidPrice - netAidPrice), fullAidPrice, aidPrice: netAidPrice, accessoryPrice: PLANS[plan].cost, insurance: cover };
    }
    return Object.freeze({ aids: Object.freeze([...byId.values()]), plans: PLANS, planEligible, optionalInsuranceEligible, discounts: DISCOUNTS, discountEligible, aidPrice, quote, insurance, warrantyYears, normal, round, maxDeposit });
  }
  const api = { create, round, normal, TERMS, SINGLE_FACTOR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Pricing = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
