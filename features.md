Let me walk through each one with concrete stories. No jargon — just people, money, and what happens.

## Feature 8 — Wallet rules that respond to balance

**The core idea:** instead of money moving on a fixed schedule, money moves *because of what's happening in the wallet right now.* The wallet watches itself and reacts.

### Scenario A — "Lock the excess"

**The person:** Chidi. Gets paid ₦250,000 on the 25th of every month. Has a rent wallet with a ₦600,000 target for a 12-month lease.

**Without balance rules:** He manually transfers ₦50,000 into the rent wallet every month. Twice last year he forgot, and twice he spent that money on something else without noticing. Ended up ₦100,000 short when rent was due.

**With balance rules:** He sets a rule on his *main balance*: "If available balance exceeds ₦100,000, lock ₦50,000 into the rent wallet."

- **Day 25, 6:00 AM:** Salary lands. Main balance jumps from ₦45,000 to ₦295,000.
- **Day 25, 6:01 AM:** Rule fires. ₦50,000 locked into rent wallet. Main balance is now ₦245,000.
- **Day 25, 6:02 AM:** Rule checks again — main balance still above ₦100,000, so it locks another ₦50,000. Now main balance is ₦195,000.
- **Day 25, 6:03 AM:** Keeps firing... until main balance drops to ₦95,000 (below threshold).

Net result: ₦200,000 automatically locked into rent. Chidi wakes up, checks his phone, sees the notification. He didn't have to remember anything.

**The subtle bit:** the rule needs to know when to stop. If it fires "once per transaction," he'd need 4 transfers. If it fires "on a schedule," it might miss the salary landing. The natural design is: **fire on every balance-changing event.** Every deposit, every release, every break — re-evaluate the rule.

### Scenario B — "Unlock when short"

**The person:** Adaeze. Runs a small tailoring business. Has a savings wallet with ₦200,000 set aside for a new sewing machine (target: ₦500,000). Has a separate transport wallet for daily ₦1,500 bike fare.

**The problem:** Some weeks she has more transport cost than others (deliveries across town). When the transport wallet runs low, she ends up paying from her main balance — which is fine — but she also sometimes dips into savings because she can't be bothered to move money.

**With balance rules:** On her savings wallet, she sets: "If the transport wallet drops below ₦500, unlock ₦2,000 from savings into the transport wallet."

- **Monday 8:00 AM:** Transport wallet has ₦1,200.
- **Monday 10:00 AM:** Bike to Yaba, ₦700. Transport wallet has ₦500.
- **Monday 10:01 AM:** Rule fires. ₦2,000 moved from savings to transport. Transport wallet has ₦2,500.
- **Monday 2:00 PM:** Bike back from Yaba, ₦700. Transport wallet has ₦1,800.
- **Tuesday 9:00 AM:** Bike to Surulere, ₦600. Transport wallet has ₦1,200.
- **Tuesday 9:01 AM:** Rule fires. Another ₦2,000 unlocked. Now ₦3,200.

Over the month she pulls maybe ₦20,000 out of savings. Her savings target gets delayed by ~3 weeks. But she never has to check her balance or make a manual move. And crucially — she never accidentally overspends her savings.

**The tension:** this rule *reduces* savings. So the user has to opt into it knowing that. The right framing is "the savings wallet is a backup, not a lockbox." Adaeze could also cap it: "unlock ₦2,000 max, 5 times per month." Otherwise she'd drain savings on a bad week.

### Scenario C — "Keep a buffer"

**The person:** Emeka. Freelance developer. Income is lumpy — sometimes ₦500,000 lands, sometimes nothing for 3 weeks.

**The problem:** Every time he gets paid, he immediately feels rich and spends too much. By the time the next client pays, he's living on fumes.

**With balance rules:** Sets up: "If main balance exceeds ₦300,000, lock 40% of the excess into a buffer wallet."

- **Month 1:** Client pays ₦500,000. Main balance was ₦80,000. Excess is ₦200,000. Rule locks ₦80,000. Main balance now ₦420,000. He spends normally from there.
- **Month 2:** No new clients. Main balance drops to ₦280,000. Buffer wallet untouched.
- **Month 3:** Next client pays ₦600,000. Same rule fires. Locks 40% of ₦380,000 = ₦152,000.
- **Month 4:** Dry month. Main balance hits ₦50,000. He draws from buffer manually (or sets an unlock rule).

**Why this works:** Emeka doesn't have to have willpower. The rule has willpower for him. The buffer grows in fat months and cushions the lean ones.

### What makes this feature hard

- **When does a rule fire?** On every transaction? On a schedule? Both?
- **Infinite loops.** A rule that unlocks from wallet A to wallet B, and another that unlocks from B to A, will ping-pong forever.
- **Preview.** Users need to see *what the rule would do* before they turn it on. Otherwise they wake up to money that moved while they slept.
- **Undo.** If a rule fires wrongly, the user wants to reverse it. That means either a reversal system or a "confirm before firing" mode.
- **Notification fatigue.** If a rule fires 30 times a day, the user will turn notifications off. Then when something actually goes wrong, they miss it.

## Feature 12 — Conditional releases

**The core idea:** a scheduled release only fires if a *condition* is met. Otherwise it waits, or skips.

### Scenario A — "Release only if I've saved"

**The person:** Fatima. Wants to buy a laptop in 3 months. Target wallet: ₦400,000. She releases ₦4,000 every Friday from the "laptop fund" — but only if she's already saved ₦100,000 in the wallet.

**The idea:** she doesn't trust herself. She wants the release to be *conditional* on her not having broken the plan.

**With conditional releases:** On the laptop wallet, she sets: "Release ₦4,000 every Friday — but only if the wallet's locked amount is at least ₦100,000."

- **Week 1:** Wallet has ₦50,000. Condition fails. No release. She gets a notification: "Release skipped — wallet balance below ₦100,000."
- **Week 6:** Wallet has ₦120,000. Condition passes. ₦4,000 releases to her bank.
- **Week 7:** Wallet still above ₦100,000. Release fires again.
- **Week 12:** Wallet at ₦95,000. Release skipped.

**The effect:** her laptop fund never dips below the safety floor. She can't accidentally drain it because she added a "stay above this line" rule.

### Scenario B — "Release only on days I haven't spent much"

**The person:** Tunde. Trying to build a habit: spend under ₦5,000 per day. He has a "weekly treat" wallet that releases ₦10,000 every Sunday.

**The idea:** he wants the release tied to his good behavior. If he overspends during the week, the treat is withheld.

**With conditional releases:** "Release ₦10,000 on Sunday — but only if I spent less than ₦30,000 this week."

- **Week 1:** He spent ₦22,000 across his wallets and main balance. Condition passes. ₦10,000 lands Sunday.
- **Week 2:** He spent ₦45,000 (dinner out, Uber surge, a present). Condition fails. Release skipped. Notification: "Treat skipped — you spent ₦45,000 this week. Target was under ₦30,000."
- **Week 3:** He spent ₦18,000. Release fires. He feels rewarded.

**The effect:** MOVA becomes a coach, not a scheduler. He's not just getting money on Sunday — he's getting it *because he earned it.*

### Scenario C — "Release only if the wallet is funded"

**The person:** Ngozi. Runs a thrift/ajo group of 5 people. Every month each person contributes ₦20,000. Whoever's turn it is gets the ₦100,000 pot.

**The idea:** the release to the current recipient only happens if all 5 contributions have been received.

**With conditional releases:** "Release ₦100,000 to the current recipient on the 28th — but only if the wallet's total contributions for the month equal ₦100,000."

- **Month 1, day 28:** Only 4 of 5 contributed. Wallet has ₦80,000. Release skipped. Ngozi gets a notification: "Payout held — ₦20,000 still pending from one member."
- **Month 1, day 29:** Last contribution arrives. Wallet hits ₦100,000. Condition passes on the next check. Release fires.
- **Month 2:** All 5 contribute on time. Release fires at midnight on day 28.

**The effect:** conditional releases make MOVA handle "trust but verify" situations automatically. Ngozi doesn't have to chase people — the rule does.

### Scenario D — "Release only when I have a buffer"

**The person:** Kelechi. Has a daily ₦3,000 release from his salary wallet. But he's had 3 months where he ran out of money in his main balance before payday.

**The idea:** release only fires if his *main balance* has at least ₦20,000 in it. Otherwise, hold.

**With conditional releases:** "Release ₦3,000 daily — but only if main balance ≥ ₦20,000."

- **Day 1:** Main balance ₦180,000. Release fires. Balance ₦177,000.
- **Day 15:** Main balance ₦40,000. Release fires. Balance ₦37,000.
- **Day 22:** Main balance ₦19,000. Condition fails. Release held. Notification: "Release held — main balance below buffer."
- **Day 23:** Main balance ₦16,000. Still below. Release held again.
- **Day 25:** Salary lands. Main balance jumps to ₦216,000. All held releases fire in sequence (or collapse into one).

**The effect:** Kelechi can't drain his main balance. The daily release becomes self-limiting.

### What makes this feature hard

- **What happens to skipped releases?** Do they:
  - Get dropped entirely? (Loss of money)
  - Queue and fire when the condition next passes? (Might cause a burst)
  - Merge into the next release? (Changes the amount)
- **The condition itself is a mini rules engine.** "Balance above X" is easy. "Spent less than X in the last N days" requires aggregating transactions. "Received a deposit from a specific source" needs categorization. Each condition type is a new feature.
- **Timezones and calendars.** "This week" means different things depending on where the user is.
- **Predictability.** Users want to know *when* money is coming. If the rule is fuzzy, the schedule becomes fuzzy. That's the opposite of what MOVA is selling.

## Feature 11 — Multiple users per wallet

**The core idea:** a wallet is not one person's — it belongs to two or more people who both contribute, both see, and both have a say in how it's used.

### Scenario A — The couple's rent fund

**The people:** Bola and Ifeoma. Live together in Lagos. Rent is ₦1.2M per year, paid once. They split it 50/50.

**Without shared wallets:** One person creates the wallet in their app. The other person transfers their half to that person's main balance every month. The person who owns the wallet has to remember to move the money into the wallet. If they forget, or if they spend it on something else, the other person has no way of knowing.

**With shared wallets:** They create a joint "Rent" wallet. Both are members. Both can:
- See the current locked amount
- See the schedule and upcoming releases
- Contribute on their own schedule
- Receive a notification whenever a release fires

- **Month 1:** Bola contributes ₦50,000. Ifeoma contributes ₦50,000. Wallet has ₦100,000.
- **Month 2:** Same.
- **Month 3:** Bola's month is tight. Only contributes ₦20,000. Ifeoma sees this in the wallet activity. She contributes her ₦50,000 plus an extra ₦30,000 to keep the schedule on track. Bola sees her contribution in the activity feed and knows to make it up next month.
- **Month 12:** The wallet has ₦1.2M. A release fires on the agreed date to the linked bank (which is in both their names, or the landlord's account).

**The effect:** both partners see the same picture. No one has to be the accountant. The wallet becomes a shared ledger for a shared obligation.

### Scenario B — Siblings funding a parent's medical bill

**The people:** Chuka, Ngozi, and Emeka. Their mother needs ₦600,000 of surgery in 4 months.

**Without shared wallets:** They create a WhatsApp group. Someone volunteers to be the "treasurer." Everyone transfers to that person. The treasurer keeps a note in their phone. Arguments start when the totals don't match.

**With shared wallets:** One of them creates a "Mum's Surgery" wallet. All three become members.

- **Week 1:** Chuka commits ₦50,000/month. Ngozi commits ₦30,000/month. Emeka commits ₦70,000/month.
- **Week 4:** Total in wallet: ₦150,000. Everyone sees the progress bar at 25%.
- **Week 8:** Total: ₦300,000. Progress bar 50%. All three get a notification.
- **Week 12:** Emeka's business is slow. He can't contribute this month. He marks himself "deferred" on the wallet. The others see it and adjust.
- **Week 16:** The target hits ₦600,000. Release scheduled for the surgery date. Everyone gets a confirmation.

**The effect:** accountability without confrontation. The wallet shows the truth. No one has to nag anyone.

### Scenario C — Roommates' utility fund

**The people:** Four NYSC corps members sharing a flat in Abuja. Shared utilities: ₦80,000/month (electricity, water, internet).

**Without shared wallets:** One person is the "bills guy." Every month he chases the others for their share. Two people always pay late. He ends up fronting money.

**With shared wallets:** They create a shared "Utilities" wallet with a monthly release to the bills guy's account.

- **Day 1 of month:** Each contributes ₦20,000. Wallet hits ₦80,000.
- **Day 5:** The release fires automatically to the bills guy's account.
- **If someone doesn't contribute by day 3:** The release is conditional (see feature 12) — it waits. The bills guy gets a notification: "Waiting on ₦20,000 from one member."
- **Late payer gets a notification:** "Your contribution is pending. The shared release is on hold until all members have contributed."

**The effect:** peer pressure without confrontation. The wallet is the referee.

### Scenario D — Parents saving for a child's education

**The people:** Ade and Yemi. Two kids, one university fund. They want to save ₦2M over 5 years.

**Without shared wallets:** One parent's account holds the savings. The other parent contributes but can't see the balance without asking.

**With shared wallets:** Joint fund. Both contribute. Both see progress. Both can see the daily or weekly releases.

- **Month 1:** ₦10,000 + ₦10,000 = ₦20,000.
- **Month 30:** ₦600,000. Progress 30%.
- **One parent loses their job temporarily.** The wallet's rule automatically pauses contributions. Releases pause. Both partners see the pause state.
- **Six months later, employment returns.** Contributions resume. Releases resume.

**The effect:** the family's money goal is not tied to one person's account or one person's memory.

### What makes this feature hard

**1. Permissions.** Not every member should be able to break the wallet. There's a spectrum:
- **Owner:** full control, can break, can pause, can change rules, can remove members
- **Contributor:** can add money, can see the balance, cannot break or change rules
- **Viewer:** can see everything, cannot move money
- **Receiver:** gets the releases, nothing else

Most couples want: both are contributors, both are receivers, but breaking requires both to approve.

**2. Notifications.** Everyone gets notified of every event? That's noisy. Only the relevant people? Then someone misses something important. The right design is usually: notifying everyone on state changes (release fired, wallet paused), but only the actor + owner on routine events (deposit).

**3. Consent.** When a wallet is broken, does it need majority approval? Unanimous? A single owner's decision? Every answer is valid for a different use case. You have to pick a default and let users configure.

**4. Money in = money out?** If Bola contributes ₦50,000 and Ifeoma contributes ₦10,000, and the wallet has ₦60,000 in it, and it's broken, does the ₦60,000 go 50/50? Or in proportion to contributions? Or all to one person? This is a legal question as much as a design question.

**5. Tax and compliance.** Money held for two people is legally ambiguous. Is it a joint account? A trust? A pooled arrangement? Different jurisdictions have different answers. You may need a specific account structure per shared wallet.

**6. Disputes.** Two people on a shared wallet disagree. One wants to break it, the other doesn't. What happens? The platform needs a rule. Most products choose: only the "owner" (usually the creator) can decide. That means shared wallets aren't truly equal.

## Which of these should you actually build?

If I had to rank them by user value divided by engineering effort:

1. **Conditional releases** (feature 12) — Medium effort, high value. Users already understand "if X then Y" because they use it in spreadsheets. Turns MOVA from a scheduler into a rule-follower.
2. **Balance-responsive rules** (feature 8) — Medium-high effort. But the "lock the excess when salary lands" scenario alone will make users tell their friends about MOVA. This is the killer feature.
3. **Shared wallets** (feature 11) — High effort, high value. But it's a different product. It requires its own onboarding, its own legal structure, its own support flows. Build this only after PMF, not before.

If I were you, I'd build features 12 and 8 first, in that order. They share a lot of machinery (a rules engine), they use the wallet structure you already have, and they make MOVA meaningfully different from a plain savings app. Shared wallets is a bigger organizational bet — save it for when you have a team and legal counsel.

Want me to sketch out what a rules engine would look like in your codebase? Or start building one of these file by file?