# Council of Five: Hearing Aid Upgrade Comparison tool

Prepared for Zahid, 29 October 2026.

## Original request
> can you run this skill on the tool to seek areas of improvement

## Framed question
Zahid, an audiologist at Boots Hearingcare (UK), has a new offline, single-file HTML tool used across the desk with patients. He wants to know where it should be improved next.

WHAT THE TOOL DOES
- The dispenser picks the customer's current older Phonak aid (32 models across 7 platforms: Quest 2012, Venture 2014, Belong 2016, Marvel 2018, Paradise 2020, Lumity 2022, Infinio 2024). They also pick its technology level (e.g. Q90/Q70/Q50/Q30, "Not sure" allowed) and a new Phonak model from the Boots pricing file (20 models: Audéo EON E30-R, E50/E70/E90 Sphere; Naída L30–L90 (2022 Lumity platform); Virto I (Infinio) rechargeable / non-wireless / Titanium; 2 CROS systems). They can add an optional customer name, then press Generate.
- Output, designed for the patient across the desk:
  * Hero strip: old model + year + level (pale red) → new model + tier + pair/single price (green). Prices are always shown; Zahid asked for that.
  * Section A: 4 big cards (speech in noise with a headline Phonak stat, e.g. "37% less listening effort"; connectivity e.g. "Auracast"; power e.g. "0 battery changes"; size "25% smaller", or "Years of progress" when no size data).
  * Section B: scoreboard "+22 features your current aids don't have" with bars (0 of 22 vs 22 of 22). A checklist of every feature the NEW model has, with the old aid marked "✗ Didn't exist yet: arrived 2018 (Marvel)", "✗ Not at the Q50 level", "? Not confirmed", or "✓". Then a 12-row "In more detail" text table (generation, level, processor, channels, AutoSense version, speech in noise, wind, feedback, app, streaming, calls, battery).
  * Section C: a 3–4 sentence script to read aloud, generated from the data.
  * A collapsible list of sources. Amber "Verify" pills on weakly sourced facts. Missing older specs say "Specification not found in public archives—please verify with manufacturer". An amber dispenser-only box (not printed) warns e.g. when the new model lacks something the old one had, and suggests higher levels.
- Built in plain HTML/CSS/JS. Data files cover pricing (generated from the pricing tool export), new specs (from Phonak feature sheets), older-platform research (from web search; direct page fetching was blocked so some items are secondary-source) and a feature checklist. Print and copy-script buttons. 13 automated tests. No tracking, no saved patient data.

CONTEXT AND CONSTRAINTS
- Zahid's stated goal: visually demonstrate how far behind the old aids are, to create an evidence-based case for upgrading. He explicitly wanted the comparison to "show more of a difference so it looks like you're getting more features".
- It sits alongside his separate pricing/finance tool (finance terms, plans, insurance, discounts, PDF quote) and a three-way comparison tool. Both are already distributed to colleagues in his region.
- UK hearing-aid retail is regulated (HCPC-registered dispensers; consumer protection on misleading claims). Percentages shown are Phonak's own marketing/study claims.
- The checklist lists only features the new model has, so features the old aid had but the new one lacks appear only in the dispenser note.
- Known gaps: Paradise/Lumity/Infinio level data partly from retailer sites; no size data for older aids; Naída L in the price list is itself a 2022 platform; no hearing-test/audiogram input; no discounts/finance/plans in this tool; no link to the PDF quote tool.

THE QUESTION
What are the most valuable improvements to make to this tool next, and is anything about its current approach a problem that should be fixed before wider rollout?

## Advisor answers (as anonymised for peer review)
**Response A:**
The tool works. What will hold it back now is the data and who signs it off, not features. Here's what I'd do on Monday.

**Before rollout (this week):**
1. **Get one email to your Phonak territory rep out on Monday morning.** Ask for the archived feature sheets for Quest to Infinio. That single request clears most of the "Verify" pills and replaces the retailer-site level data. Until it's done, every amber pill in front of a patient is a credibility leak.
2. **Make the checklist two-sided.** Put a "What changes" row on the patient-facing side for anything the old aid had that the new one lacks. It's half a day's work. A scoreboard that only counts in one direction is the easiest thing for a complaint to pick apart. Fix it before anyone else uses the tool, not after.
3. **Label every percentage "Phonak study figure"** right where it appears, not just in the collapsed sources. That's a ten-minute edit.
4. **Send the file to your area manager or the compliance lead for sign-off.** Do it before handing it to colleagues. A one-paragraph cover note is enough, and it gets the tool cleared to spread.
5. **Fix the Naída L case.** A Lumity owner moving to a Lumity Naída shouldn't see "+22 features". Add a test for same-platform upgrades now.

**Next (weeks 2–4):**
- **Add a "Get quote" button.** It should pass the chosen model and tier to the PDF quote tool in the URL. That turns two tools into one patient journey, and it's the biggest win for the effort.
- **Stamp each data file with its date and a named owner** for price updates. The first time Boots changes prices, a stale figure on the hero strip will get the tool withdrawn.
- **Pilot it with two or three colleagues for a fortnight.** Ask one question: did they use it, and did it change the conversation?

**Don't do:** audiogram input. There's no clear first step, it needs clinical validation, and it doubles the scope. Park it.

None of the problems is fatal. Item 2 is the one thing that must not ship as it stands.

**Response B:**
Picture yourself as the patient across the desk. You've never heard of Marvel, Paradise, Lumity, Sphere or AutoSense, and the tool's whole explanation leans on those names. "Didn't exist yet: arrived 2018 (Marvel)" means nothing to someone who only knows "my beige hearing aid". Every platform name, tier code (Q50, E70) and spec term (channels, AutoSense version, feedback) should be rewritten as what it does for the person, or left off the patient view.

The scoreboard is the weakest part. "0 of 22 vs 22 of 22" is rigged by design: the list is built from the new model's features, so the old aid always scores zero. A sceptical patient, or their adult child, will notice that and stop trusting everything else on the page. Score both ways and show what they already have.

The headline stats raise questions you haven't answered. "37% less listening effort" than what? "25% smaller" than which aid? "0 battery changes" leaves out that rechargeable cells wear out over time. If a patient asks "compared to what?", the dispenser needs an answer ready.

Nothing in the tool asks about the patient. It never records what they struggle with: restaurants, the phone, TV, wind. So the output is a list of everything the new aid has, not what this person needs. One "what bothers you most?" picker that reorders the cards would beat any feature count.

There are also some odd cases. What happens when the "upgrade" is on an older platform than the current aid (Naída L is 2022 Lumity; a 2024 Infinio owner gets what)? And if "Not sure" is chosen for the level, does the page fill with question marks?

Finally, the prices are fixed inside an offline file. Put a visible "prices as of [date]" stamp on the page, or one day a printed sheet will quote a wrong price to a patient.

**Response C:**
The fatal flaw is the brief itself: "show more of a difference so it looks like you're getting more features". You've built a persuasion engine and given it an "evidence-based" label. Before any wider rollout, that needs fixing. New features come after.

**What's wrong now:**

1. **The scoreboard is rigged by design.** The denominator is the new model's own feature list, so the old aid can never win. Anything the old aid did better is hidden in a dispenser-only box the patient never sees. Leaving out disadvantages like that is the kind of omission consumer protection law treats as misleading (CPRs, now the DMCC Act 2024).
2. **"? Not confirmed" probably counts as 0.** If an unverified feature drops the old aid's score, you're presenting your research gaps to the patient as the old aid's failings. The same applies to "Not sure" levels.
3. **Marketing figures shown as facts.** "37% less listening effort" is a Phonak study claim. Shown in a big hero card by an HCPC registrant, it looks like a clinical judgement. Some of your older specs also come from retailer websites.
4. **Price comes before need.** There's no audiogram input, but the screen already shows a price and a scripted upgrade pitch. HCPC expects you to act in the patient's best interest. The tool can't tell whether the old aid is actually failing this patient.
5. **The Naída L gap undermines it.** Put a 2022 Lumity aid against a 2022 Lumity Naída L and the "years of progress" story falls apart in front of the customer.
6. **Distribution turns it into a Boots communication.** Colleagues will use it as corporate material. Without sign-off from Boots compliance or marketing, the liability is personal to you.

**Fix before rollout:**
- Make the comparison symmetric: show what the patient loses, on the patient-facing page.
- Leave unverified items out of the score.
- Label percentages as "Phonak reports…" and give the source.
- Add a clinical-need step (audiogram, or a summary of their reported difficulties) before price or script appear.
- Get written sign-off from Boots compliance.

**After that:** the best improvement isn't more persuasive visuals. It's linking the result to the quote tool, so an honest comparison flows straight into a priced decision.

**Response D:**
The biggest opportunity here is that you're treating this as a desk visual when it's really the front end of the whole sale. Right now it's one of three tools that don't talk to each other, and that's the thing to fix first.

1. **Merge it with the pricing and three-way comparison tools into one patient journey.** Old aid, then gap analysis, then a recommended tier, then finance options, then the PDF quote. The patient would take home a single document that starts with "here's what you've been missing since 2018" and ends with "£X a month". That take-home document makes the sale. Patients talk it over with family at the kitchen table, and right now nothing goes home with them.
2. **Add an audiogram or lifestyle input.** Three taps would do it: busy restaurants, phone calls, TV. Then put the features this patient cares about at the top. "22 features you don't have" is impressive. "The 3 that fix your restaurant problem" closes the sale. It's also your defence on regulation, because the recommendation is tied to the patient's own clinical needs.
3. **Show the upside for the trade-up.** The tool already flags higher levels to the dispenser. Show it to the patient as well: "E70 vs E90: 4 more features for £X". Every consultation becomes a chance to sell the higher tier.
4. **Be bold on reach.** You've got 32 legacy models from one manufacturer. Add Oticon, Signia and ReSound older aids and the tool works for every walk-in customer, including people switching from the NHS or a competitor. Those are the biggest group of potential upgraders.
5. **Pitch it to Boots nationally, not just your region.** Ask for anonymised counts of which old models come in. That shows Boots where its upgrade pool is. A tool on one desk becomes a planning dataset for the whole business.

On the approach: don't water down the "show more difference" framing. Back it up by making every claim traceable. Strong sources protect a strong pitch, and you won't need to tone it down.

**Response E:**
The tool answers the wrong question. It asks "how far behind is the old aid?" The patient is really asking "will I hear my grandchildren better at Sunday lunch, and is that worth £X?" No one buys 22 features. They buy relief from two or three situations they struggle with. The tool has no input for those situations, so every output is a spec sheet aimed at the patient rather than a case built for them.

There is a fatal flaw to fix before rollout: the scoreboard is rigged by construction. You only count features the new model has, so the old aid will always score "0 of 22" against "22 of 22", whatever the truth. That isn't evidence. It's the counting method showing up on screen. Anything the old aid did better is hidden in a box the patient never sees. Add a "Not sure" level that turns into ✗, and older features renamed by Phonak's marketing showing as "didn't exist", and you have something a complaining customer, a trading-standards officer or the HCPC could fairly call misleading by omission. Zahid's brief to "look like more features" is exactly what a regulator would quote back to him. It also puts at risk his reputation and that of the colleagues he hands it to.

How I'd rebuild it:
1. Start from the patient. The dispenser picks their top three difficulties (noise, TV, phone, batteries, wind, discreetness). The output then shows only what changes for those situations, old versus new, both sides judged on the same terms.
2. Make the comparison symmetric. One list covering both aids, so losses show as well as gains. Mark "unknown" as unknown, never as ✗.
3. Label claims honestly. Show percentages as "Phonak study claim", with the conditions they were measured under.
4. Link to the quote tool once the patient has agreed there's a problem worth solving.

The big upside: a tool that says "here are your three problems, and here's what fixes them" will sell more aids than a 22–0 scoreboard. It's believable, and it can be defended if anyone challenges it.

## Anonymisation key
A = Executor · B = Outsider · C = Contrarian · D = Expansionist · E = First Principles Thinker

The Outsider received only the tool description, without Zahid's goal, the regulatory context or the known gaps.

## Peer reviews (anonymous)
### Reviewer 1
**Strongest: C.** It names the root problem, which is the brief itself ("look like more features" sold as "evidence-based"). It then turns that into specific pre-rollout fixes: compare both ways on the patient-facing page, keep unverified items out of the score, label the percentages, put clinical need before price, and get Boots compliance sign-off. It is the only one to raise personal liability once colleagues are using the tool. A comes a close second: it covers most of the same ground with better sequencing, but it misses that "Not sure" and "? Not confirmed" probably count as ✗.
**Biggest blind spot: D.** It never mentions that the scoreboard is rigged, and it says outright "don't water down" the framing. Its tier upselling, extra manufacturers and national data collection scale the misleading-omission risk rather than fixing it.
**What all five missed:** a "no upgrade needed" outcome; copies drifting apart (needs a version number and one place to get the current copy); accessibility (print the script in large type; the 22-item list may overload older patients).

### Reviewer 2
**Strongest: E.** It puts the rigged scoreboard, "Not sure" counting as ✗, and features Phonak renamed showing as "didn't exist" into one argument about misleading by omission. It answers that with a rebuild that starts from the patient's needs, and it shows that the honest version also sells better. C is nearly as strong; A is the most practical to act on.
**Biggest blind spot: D.** It keeps the framing, pushes upsells, treats sources as armour, and suggests collecting model counts without thinking about data protection or Boots governance.
**What all five missed:** a "keep or refit" option; uncontrolled copies with no version check or way to withdraw them; accessibility (the red/green hero strip fails colour-blind users; older patients may need larger print).

### Reviewer 3
**Strongest: C.** It finds the most real defects and gives a fix for each, and it names the law (CPRs, DMCC Act 2024). A comes a close second for who does what and when. E repeats much of C.
**Biggest blind spot: D.** It treats regulation as a sourcing problem and would multiply the risk across Boots.
**What all five missed:** no "keep, re-tune or repair" option; no control over copies once shared; accessibility, plus no testing with real patients.

### Reviewer 4
**Strongest: C.** It catches the denominator problem, the hidden disadvantages and unknowns scoring as zero. It names the law and HCPC's best-interest duty, and says distribution turns the tool into a Boots communication. A is the better to-do list but never asks what the patient needs.
**Biggest blind spot: D.** It doubles down on the framing, adds other brands with no source data, and suggests collecting counts in a tool built to save no patient data.
**What all five missed:** a "no upgrade needed" result (retune, repair, or the free NHS option); Phonak's comparison baseline (its percentages are usually measured against the previous model, not a 2012 Quest); old copies in circulation (needs a version number, expiry check and recall); red/green colour coding.

### Reviewer 5
**Strongest: C.** It names the clash between the brief and the "evidence-based" label, pins down both scoring flaws and ties them to the actual regulation. A is the best Monday plan but misses the unknown-scores-as-zero flaw.
**Biggest blind spot: D.** It keeps the framing, never mentions the rigged scoreboard, multiplies an unsolved data-verification problem across more brands, and breaks the no-tracking design.
**What all five missed:** no "don't upgrade" outcome; vulnerable consumers (many owners of older aids are elderly, which brings extra duties under the DMCC Act and Boots policy); governance of an unofficial tool using Phonak trademarks and Boots' internal pricing outside Boots IT.

## Code check by the chairman
Run against the current build. Unconfirmed features lower the old aid's bar: Audéo P70 → E70 shows 9 of 21 with 4 unconfirmed; Naída L90 (2022) → Naída L90 shows 8 of 16 vs 16 of 16 with 8 unconfirmed and 0 actually gained. The 'not a technology upgrade' warning exists but sits in the dispenser box, which is not printed. A 'Not sure' level shows as '? Depends on technology level', not ✗.

# Chairman's verdict
## Where the council agrees
- **The scoreboard is the weak point and must change before rollout.** All five advisors and all five reviewers said so independently. It counts only the new model's features, so the old aid can never come out ahead. Anything the old aid did better appears only in a box the patient never sees. A code check confirmed it is worse than they suspected: features marked "? Not confirmed" count against the old aid in the bars. A Naída L90 owner shown the new Naída L90 sees "8 of 16 vs 16 of 16" even though nothing is actually gained.
- **Label percentages where they appear.** Show each as a Phonak figure, and say what it was compared against.
- **The same-platform case (Naída L) breaks the "years of progress" story.**
- **Link the result to the quote tool.** Four of the five advisors said this is the most valuable next feature.

## Where the council clashes
- **Patient-needs input: now or later?** The First Principles Thinker, the Outsider and the Expansionist want a "what bothers you most?" picker that drives the output. They see it as better selling and a regulatory defence. The Executor says park it, but he was rejecting a full audiogram input, not a three-tap difficulty picker. A picker is half a day's work.
- **How hard to sell.** The Expansionist says keep the "show more difference" framing and add upsells, more brands and national data. The Contrarian says the brief itself ("so it looks like you're getting more features") is the liability. All five reviewers called the Expansionist's answer the biggest blind spot.

## Blind spots the council caught (peer review)
- **No "keep, retune or repair" outcome.** Every session ends in a pitch. The ability to say "your aid is fine, let's refit it" is what makes it evidence-based and in the patient's best interest.
- **Comparison baseline.** Phonak's percentages are measured against its previous model, not a 2013 Quest. Placing them beside a Quest aid overstates what the figure shows.
- **Old copies in circulation.** A single file passed between colleagues will drift into stale versions with old prices. It needs a version and date stamp, and one place to get the current copy.
- **Accessibility.** The red/green colour coding, the print size, and reading a script aloud to someone with hearing loss.
- **Governance.** Phonak trademarks and Boots internal pricing are being shared outside Boots IT, and many owners of older aids are elderly, vulnerable consumers.

## The recommendation
Fix how it counts and frames the comparison, then build features. The persuasive goal can stay. It just has to be persuasive because it's fair. Concretely:
1. Score only verified features, and show unknowns separately as "not confirmed".
2. Show what the patient keeps or loses on the patient-facing page.
3. Put "Phonak study figure, measured against [baseline]" next to every percentage.
4. Add a three-tap difficulties picker that reorders the cards and checklist.
5. Add a fair "keep / retune / upgrade" note.
6. Version-stamp the file, with a visible "prices as of" date.

Then take it to your area manager or compliance lead before colleagues get it. After that, add the quote-tool link. Defer other brands and national data. The council sides with the Contrarian and the First Principles Thinker over the Expansionist: an honest 8-feature gain that matches the patient's problems sells better than a 22–0 scoreboard, and it survives a complaint.

## The one thing to do first
Change the scoreboard so that unconfirmed features no longer count as losses, and show features the patient would lose on the patient-facing page. It is about half a day's work and removes the biggest risk.
