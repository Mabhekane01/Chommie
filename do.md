# Chommie — Business Plan & White Paper
### Cutting the Middle. Rebuilding the Pipeline. Putting the Consumer First.

> **Name resolved:** the platform is **Chommie** — SA vernacular for "friend," matching the community-centered, stokvel-native positioning (and already the repo/package scope `@chommie/*`). Technical design lives in `docs/ARCHITECTURE.md` and `docs/discovery-algorithm.md`.

---

## 1. Executive Summary

South African households pay retail prices for staple goods (eggs, maize meal, rice, cooking oil) that remain structurally elevated even after the cost shocks that caused them — while the producers and manufacturers who make these goods often see comparatively little of that margin.

**Chommie** is a direct-to-consumer staples platform whose core mission is to **remove the retail middle layer entirely** and connect households directly with the farmers, producers, and manufacturers who make what they buy. Retail concentration is the problem being solved, not a side effect — every structural choice in this plan (supply relationships, pricing, discovery, community buying) is designed to route value around that layer, not just discount it.

It combines four elements into a model that does not yet exist in South Africa:

1. **The Costco/Amazon membership economics** — revenue from access, not markup, so shelf prices can sit close to cost.
2. **The stokvel pooled-buying tradition** — South Africa's own trusted, culturally native savings-and-bulk-buying mechanism, digitized and connected directly to supply.
3. **A dual consumer/reseller structure** — serving both the household buying for itself and the informal trader who buys to resell, without either group subsidizing the other.
4. **A platform built around Black and African consumer culture** — not a Western template with local pricing, but a product whose discovery experience, product mix, and community mechanics reflect how South African households actually shop, save, and buy together (see Section 3.5).

The consumer is the center of every design decision in this plan. Every mechanism described below exists to answer one question: **does this make staple goods measurably cheaper and more reliably available for the person buying them, in a way that feels like it was built for them?**

---

## 2. The Problem

- **Market concentration.** A small number of retail groups account for the large majority of formal food retail in South Africa, reducing competitive pressure on pricing.
- **Sticky, asymmetric pricing.** When input costs rise (fuel, avian flu, sunflower oil shortages), retail prices rise quickly. When input costs fall, retail prices are slow to follow, or don't fully revert. Margins expand net of the shock.
- **No real alternative for the ordinary household.** Buying directly from producers works — people already do it informally, driving to farms for cheaper eggs — but it isn't scalable, safe, or convenient for most people. There's no formal channel offering the same price advantage at everyday convenience.
- **Existing e-commerce grocery models don't solve this.** Most online grocery platforms are simply a retailer's existing markup, delivered. They don't change the underlying supply chain — they add a delivery fee on top of the same margin structure.

---

## 3. What We're Building: The Model

### 3.1 Core structure: membership funds the platform, not the product

Following Costco and Thrive Market, **Chommie** earns its revenue primarily from a **flat membership fee**, not from marking up staple goods. This is the single structural choice that makes genuinely lower prices possible, rather than aspirational marketing copy.

- Product pricing on core staples is set as close to landed cost (supplier price + logistics + minimal handling) as the business can sustain.
- The membership fee is the profit center. It should be priced well below the demonstrable annual savings a household would realize versus retail — the savings must be provably larger than the fee, or the model doesn't earn trust.
- Non-staple, discretionary, and perishable goods are sold at a normal marketplace margin (see Section 3.4) — this is where ordinary retail-style margin is acceptable, because these aren't the trust-building core product.

### 3.2 Solving the guarantee problem: standing baskets, not per-item subscriptions

Earlier iteration of this idea assumed customers would subscribe per product (e.g., "subscribe to a dozen eggs weekly"). That creates subscription fatigue — people already manage too many recurring payments.

Instead: **one standing basket per household.**

- A member sets up a single monthly staples basket (eggs, maize meal, rice, cooking oil, whatever their regular needs are) — one relationship, one thing to edit or pause, not five.
- This basket is what gets aggregated across all members to produce forecastable demand, which is what we take to suppliers to negotiate near-wholesale terms.
- Editing is lightweight — increase/decrease quantities, swap items, skip a month — but the default is a standing, recurring commitment, because that predictability is the entire mechanism that makes supplier deals possible.

### 3.3 The stokvel layer: South Africa's own model, digitized and pointed at supply

This is the platform's most defensible and most culturally native differentiator versus a Costco or Amazon copy-paste.

Stokvels are an existing, deeply trusted South African institution: groups of people pooling money on a rotating or collective basis, historically used for burial societies, grocery stokvels, and bulk year-end buying. **Chommie** builds a digital stokvel layer directly into the platform:

- Users can form or join a **buying circle** — a group of households (a family, a street, a workplace, an existing stokvel) that pools its combined standing-basket demand.
- A buying circle unlocks a **deeper discount tier** than an individual membership, because a group order is a larger, more reliable, more schedulable unit of demand — exactly what a supplier will pay more for in reduced price.
- The platform manages the pooled payment collection, order aggregation, and delivery split — solving the traditional stokvel's manual-admin burden (collecting cash, tracking who paid, splitting goods) with software, while keeping the trust structure people already understand.
- This turns an existing informal financial behavior into structured demand aggregation — it isn't a new consumer behavior we're asking people to adopt, it's an existing one we're making more powerful.

### 3.4 The dual consumer/reseller structure

The plan explicitly serves two customer types, priced and positioned differently so neither subsidizes the other unfairly:

| | **Household Member** | **Reseller Member** |
|---|---|---|
| **Buys for** | Own consumption | Resale (spaza shops, informal traders, street vendors) |
| **Commitment** | Standing monthly basket | Higher-volume standing order, longer commitment term |
| **Pricing** | Near-cost + membership fee | Wholesale-tier pricing, volume-scaled |
| **Discount lever** | Buying circle / stokvel pooling | Volume thresholds + reliability history |
| **Platform value to them** | Cheaper staples, no more driving to farms informally | A formal, reliable, lower-risk alternative to informal broker/farm-gate sourcing |

This matters because it mirrors — and legitimizes — a pattern that already exists informally (people who informally sell eggs bought cheaply at farms, as referenced earlier in this plan's origin). Rather than treating that as leakage, the platform builds a real, transparent reseller tier that benefits from the same aggregated demand as everyone else, while household consumers keep the pricing designed specifically for them.

**Design principle: the household member's experience and pricing must never be worse because resellers are also on the platform.** Reseller volume strengthens the platform's negotiating position with suppliers, which should flow back into better household pricing — not the reverse.

### 3.5 Culture-centered design: the discovery algorithm

Most global e-commerce discovery algorithms (Amazon, most SA grocery apps) are optimized for one thing: individual browsing behavior — what you clicked, what you bought, what's "trending" in an undifferentiated national feed. That model is a poor fit for how staple-goods buying actually works in Black South African households, where purchasing is frequently communal, seasonal, and tied to specific cultural moments (month-end shopping, stokvel payout cycles, funerals, umgidi/traditional ceremonies, festive-season bulk buying) rather than one person's individual click history.

The discovery algorithm should be designed around that reality rather than importing a generic recommendation engine:

- **Circle-aware discovery, not just individual-aware.** Recommendations surface what a member's buying circle or stokvel group tends to buy together, not just what one individual has bought before — because the actual purchasing unit is often the household or group, not the individual.
- **Calendar-aware surfacing.** The platform should anticipate and surface relevant bulk staples ahead of known high-demand cultural and financial moments — month-end, festive season, ceremony season — rather than running a flat, undifferentiated feed year-round.
- **Local and Black-owned supplier visibility as a first-class signal.** Where a product has multiple viable suppliers at comparable price and quality, the discovery layer should give visibility weight to Black-owned and local producers/manufacturers, not bury them behind whichever supplier has the biggest advertising budget — this is a direct, structural way to make good on the "internal capital" argument (Black producers and Black consumers connecting with fewer extractive layers in between).
- **Township- and community-level relevance, not just national relevance.** Supplier and pricing availability differ by region; the discovery experience should be able to say "these producers deliver in your area" rather than presenting a generic national catalog that quietly under-serves specific communities.

This is the platform's most defensible long-term moat: a Costco or Amazon clone can be copied, but a discovery system genuinely tuned to how South African households and communities actually organize their staple purchasing is much harder to replicate without doing the same cultural groundwork.

### 3.6 Second revenue stream: advertising

Membership is the primary, trust-anchoring revenue stream — it is what makes near-cost staple pricing credible and sustainable (Section 3.1). Advertising is a secondary stream layered on top, similar to how Amazon monetizes discovery placements without changing the price a customer pays for the item itself.

- **Sponsored placement within the marketplace (non-staples) tier.** Manufacturers and suppliers of discretionary goods (Section 3.4's open marketplace tier) can pay for visibility in search and category browsing — this is standard, low-controversy retail media, and it doesn't touch the core staples pricing promise.
- **Guardrail: advertising cannot buy its way into the staples core.** Given the culture-centered discovery design in Section 3.5 above, the core staples category — the trust-building heart of the platform — should not be pay-to-rank. Suppliers compete there on price, reliability, and local/Black-ownership visibility weighting, not ad spend. Advertising revenue lives in the discretionary marketplace tier, where it doesn't compromise the "we don't mark up your eggs" promise that the whole model depends on.
- **Supplier-funded promotional slots for new-product introduction.** A manufacturer entering the marketplace tier can pay to feature a new product to relevant buying circles — useful revenue and useful discovery for members, provided it stays confined to the non-staples tier.

This keeps the two revenue streams cleanly separated: **membership funds the core trust proposition; advertising monetizes the open marketplace without ever touching it.**

---

## 4. What Makes This Different From Costco, Amazon, and Existing Grocery E-Commerce

| Feature | Costco | Amazon | Typical SA grocery e-commerce | **Chommie** |
|---|---|---|---|---|
| Revenue model | Membership fee | Product margin + Prime + ads | Product margin + delivery fee | Membership fee (core) + advertising (marketplace tier only) |
| Product scope | Broad but curated (~4,000 SKUs) | Everything | Everything (full retailer catalog) | Narrow staples core + open marketplace tier |
| Supply relationship | Direct to manufacturer | Marketplace + direct | Same as existing retail supply chain | Direct to farmer/manufacturer, off-take agreements |
| Group/community buying | No | No | No | Yes — stokvel-native buying circles |
| Reseller tier | Business membership (generic) | Amazon Business (generic) | None | Purpose-built, wholesale-tier reseller pricing |
| Cultural fit to South African household finance behavior | Imported | Imported | Imported | Built around an existing local trust mechanism |

---

## 5. Supply Side: How We Actually Get the Price Down

1. **Off-take agreements, not exclusivity.** We commit to minimum guaranteed volumes at fixed or capped prices over 3–6 month terms with farmers/manufacturers. This does not require the producer to abandon their existing retail buyers — it de-risks their commitment to us.
2. **Start with one product, one region.** Eggs first (highest visible price-gap signal, non-perishable enough to manage), one metro area, prove the demand-guarantee mechanism works before adding SKUs.
3. **Asset-light logistics where possible.** Rather than building a full owned fleet and warehouse network from day one, partner with existing distribution/logistics capacity and cross-dock (goods move same-day rather than sitting in owned storage) until volume justifies owned infrastructure. (This mirrors a lesson from Twiga Foods in Kenya, which found full vertical integration too capital-intensive early on and moved to an asset-light distributor model.)
4. **Forecastable demand as the negotiating asset.** The standing basket + stokvel aggregation is not just a customer feature — it is the platform's primary leverage in supplier negotiations. Predictability is worth more to a producer than a slightly higher headline price from a retailer who may or may not actually move the stock that week.

---

## 6. Consumer-First Design Principles

Everything above serves this section — restated explicitly so it stays the north star as the plan gets built out:

1. **Price transparency.** Show the actual savings versus retail, every order, so the value is provable and not just claimed.
2. **No hidden markup on staples.** The core basket categories are priced to a stated, auditable margin ceiling — this is a trust commitment, not just a feature.
3. **Low-friction commitment.** One basket, editable anytime, not a maze of individual product subscriptions.
4. **Community pricing power available to everyone, not just large buyers.** A household in a five-person buying circle should get real, meaningful pricing benefit — not a token discount.
5. **Resale tier strengthens, never weakens, the consumer tier.** Aggregated volume from resellers should translate into better pricing for households, not compete with them for the same discount pool.

---

## 7. Open Questions for Next-Stage Validation

- What minimum guaranteed volume and term length would a real egg producer accept for a genuinely wholesale-level price? (Requires direct producer conversation — the single most important next step before further build-out.)
- What membership fee level makes the math work — i.e., is clearly smaller than a household's provable monthly savings — while still covering platform operating costs at realistic early-stage volumes?
- What discount differential should a stokvel/buying-circle tier receive over an individual membership, and how many households are needed in a circle to unlock it?
- What logistics partner(s) exist in target metro areas for asset-light cross-docking of perishable/semi-perishable staples?
- What is the right onboarding channel — should the platform lead with existing stokvels and community buying groups as the initial acquisition wedge, given they are a trusted structure, rather than leading with individual sign-ups?

**Research notes (2026-07):** The stokvel-led wedge is well-supported — the digitized buying circle (§3.3) maps directly onto an existing, trusted structure, so leading with community groups rather than individuals lowers the trust barrier that is otherwise the hardest thing for a new SA staples brand to earn. On money movement, the SA underbanked/card-light reality makes the **payment rail mix** (new §9) a first-order onboarding decision, not an afterthought: phone-native instant rails (PayShap) and instant EFT (Ozow) reach members that a card-only checkout would exclude. These remain to be validated with real producer and member conversations.

---

## 8. Technology & Delivery (summary)

Full detail in `docs/ARCHITECTURE.md`; the discovery engine has its own spec in `docs/discovery-algorithm.md`. In brief:

- **Monorepo:** Turborepo. **Frontend:** migrating the customer web app to **Next.js** (App Router, Tailwind) against the existing REST gateway; the Angular vendor app stays for now. Mobile-first and data-light by design, for SA connectivity realities.
- **Backend:** NestJS microservices behind an API gateway, with **Postgres** (identity, orders, payments, circles), **MongoDB** (catalogue), and **Redis** (cache / discovery feature store). Polyglot where it earns its place (e.g. a Python service for the learned ranker later).
- **Auth:** **passkeys + email/Google-social OAuth + phone OTP** via Supabase Auth, fronting the existing services — low-friction, Amazon/Costco-style, and reachable for phone-first users.
- **Discovery:** an LLM-augmented, **circle-, calendar-, and geo-aware** engine (the moat, §3.5) — deterministic core first, LLM re-ranking and grounded concierge on top, degrading gracefully.
- **Delivery:** Docker-first, deployable to **AWS EC2** (primary), **Render**, and **Railway**.

## 9. Payments & Money Movement

The target member is frequently **underbanked or card-light**, so the payment-rail mix is a core part of the consumer-first promise, not plumbing. Chommie's `payment-service` uses a provider-abstraction (one interface, one adapter per rail) so checkout stays provider-agnostic. Initial four rails:

| Rail | What it is | Why it's here |
|---|---|---|
| **Ozow** | instant bank-to-bank EFT | reaches customers with a bank account but no card |
| **PayShap** | SARB rapid-payments rail; instant **proxy pay by phone number**, low-value, low-cost | purpose-built for this demographic — phone-native, no card needed |
| **PayFast** | all-in-one gateway (cards, EFT, SnapScan, Mobicred) | already integrated; broad method coverage |
| **Yoco** | cards + QR, wide SMB footprint | strong fit for the reseller/spaza tier and in-person QR |

**On the roadmap (documented in the architecture doc):** **Capitec Pay** (large low-income footprint) and **cash/voucher rails** (1Voucher, Flash, Kazang) for the genuinely unbanked — arguably a bigger differentiator for the township/stokvel wedge than a fourth card gateway. A gateway aggregator (Peach Payments / PayU) is a valid later consolidation if maintaining direct adapters becomes heavy.

---

## 10. Summary Positioning Statement

**Chommie** takes the membership economics that made Costco and Thrive Market durable, combines them with South Africa's own trusted stokvel pooled-buying tradition, and builds a dual structure that serves both the household buying to feed its family and the informal trader buying to earn a living — without either one competing with the other for value. The result is not an imported grocery app with a discount coupon. It is a direct pipeline from producer to consumer, engineered so that the consumer, not the retailer, keeps the value that a shorter supply chain creates.