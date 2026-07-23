# Chommie Discovery Engine — "Ubuntu Discovery"

> Design spec for the culture-, circle-, and calendar-aware product discovery algorithm described in `do.md` §3.5. This is the platform's most defensible long-term moat: an Amazon/Costco clone can be copied; a discovery system genuinely tuned to how South African households organise staple buying cannot, without doing the same cultural groundwork.

**Status:** design (v1). Target service: `services/recommendation-service` (extends existing heuristic service — see `recommendations.service.ts`, which is explicitly marked "to be replaced").

---

## 0. Design principles (non-negotiable)

1. **The purchasing unit is the household/circle, not the individual.** Individual click-history is a weak signal here; circle and calendar signals are strong ones.
2. **Staples core is never pay-to-rank.** Advertising influences *only* the discretionary marketplace tier (`do.md` §3.6). The ranker enforces `ad_weight = 0` for staple categories structurally, not by policy alone.
3. **Local & Black-owned visibility is a first-class ranking signal**, applied when suppliers tie on price/quality — a structural lever, transparent and auditable, never sold.
4. **Graceful degradation.** If the LLM or vector store is unavailable, discovery still works from deterministic signals. A value platform for low-income households cannot show a blank feed because an AI call timed out.
5. **Explainable by construction.** Every surfaced item can state *why* ("Your circle restocks this every month-end · R18 cheaper than retail · delivers in Khayelitsha").
6. **Cheap at the margin.** Most users are mobile-first on metered data and the platform runs near-cost. LLM calls are cached and batched; the expensive stage is optional.

---

## 1. Pipeline overview

A classic cascading multi-stage recommender (candidate generation → lightweight ranking → LLM re-rank), which is how large-scale production systems keep quality high without running an LLM over the whole catalogue.

```
        ┌─────────────────────────────────────────────────────────────┐
        │ Stage 0 · SIGNAL / FEATURE STORE                             │
        │ individual · circle · calendar · geo · supplier              │
        └─────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        │ Stage 1 · CANDIDATE GENERATION  (multi-route, cheap) │
        │ A replenishment  B circle co-purchase  C calendar    │
        │ D semantic/vector  E geo local & Black-owned         │
        │  → ~200 deduped candidates                           │
        └──────────────────────────┬──────────────────────────┘
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        │ Stage 2 · LIGHTWEIGHT RANKER  (deterministic, fast)  │
        │ transparent weighted score · enforces guardrails     │
        │  → top ~30                                           │
        └──────────────────────────┬──────────────────────────┘
                                   │  (optional, cached)
        ┌──────────────────────────┴──────────────────────────┐
        │ Stage 3 · LLM RE-RANK + REASONING  (Claude, grounded)│
        │ coherent bundles · per-item rationale · concierge    │
        │  → final ordered feed + explanations                 │
        └──────────────────────────┬──────────────────────────┘
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        │ Stage 4 · SERVE + FEEDBACK LOOP                      │
        │ impressions/clicks/basket-adds → retrain weights     │
        └─────────────────────────────────────────────────────┘
```

---

## 2. Stage 0 — Signals / feature store

| Family | Signals | Source |
|---|---|---|
| **Individual** | standing-basket contents, purchase history, views, wishlist, `favoriteCategory` | auth-service (Postgres), order-service, product views (Mongo/Redis) |
| **Circle / stokvel** | circle membership, circle basket composition, in-circle co-purchase graph, payout cycle, circle size | new `circles` domain (Postgres) |
| **Calendar** | days-to-payday, SASSA grant dates, festive/Easter/school-term windows, ceremony seasons, stokvel year-end payout | `sa_calendar` reference table (see §6) |
| **Geo** | member region/township, which suppliers deliver there | address (auth-service) + supplier coverage |
| **Supplier / product** | landed cost vs retail price, `black_owned` flag, locality, reliability score, live stock, category (`staple` vs `marketplace`) | product-service (Mongo) |

Feature values are materialised into a fast store (Redis for hot per-user features; Postgres/Mongo for the rest) so Stage 1–2 run in single-digit ms.

---

## 3. Stage 1 — Candidate generation (multi-route retrieval)

Each route is independently cheap and returns a bounded set; the union is deduped into a candidate pool (~200). Routes are additive — a new cultural signal is a new route, not a rewrite.

- **Route A · Replenishment.** Items in the member's standing basket whose predicted run-out date is near. Recurrence model = median inter-purchase interval per (member, SKU), seeded from category defaults for cold start.
- **Route B · Circle co-purchase.** "Households in your circle also stock…" — items frequent in the member's circle basket but absent from theirs. This is the stokvel-native signal that a generic recommender cannot produce.
- **Route C · Calendar-triggered.** Bulk staples relevant to the *next* high-demand moment (month-end run, festive bulk, ceremony catering, back-to-school). Fires ahead of the moment, not during it.
- **Route D · Semantic / vector.** Embedding similarity over the catalogue for search/browse intent and "similar staple, cheaper supplier." Store: **pgvector** (if catalogue mirrored to Postgres) or **Mongo Atlas Vector Search** (catalogue already lives in Mongo — preferred to avoid a second copy).
- **Route E · Geo local & Black-owned.** Producers that deliver to the member's area, with local/Black-owned producers eligible for the visibility weighting applied in Stage 2.

Cold start (new user, no history): Routes C + D + E + circle (if they joined via an existing stokvel) carry the feed. The platform's savings-vs-retail framing ranks well even with zero personal data.

---

## 4. Stage 2 — Lightweight ranker (deterministic & auditable)

A transparent weighted score over the candidate pool. Ships hand-tuned at launch (explainable, no training data required), then upgrades to a gradient-boosted model once feedback accrues — the interface stays identical.

```
score(item) =
    w_replen   · replenishment_due          // 0..1, how overdue a basket staple is
  + w_circle   · circle_affinity            // 0..1, co-purchase strength in member's circle
  + w_calendar · calendar_relevance         // 0..1, fit to upcoming SA moment
  + w_savings  · price_advantage_vs_retail  // 0..1, the core value proposition
  + w_local    · locality_match             // 0..1, delivers-in-your-area
  + w_bowned   · black_owned_boost          // applied only on price/quality ties
  + w_reliab   · supplier_reliability       // 0..1, on-time / in-stock history
  + w_ad       · ad_bid           ← HARD 0 for category == 'staple'
```

**Guardrail enforcement lives here in code, not in a policy doc:**

```ts
// staples core is never pay-to-rank (do.md §3.6)
const wAd = item.category === 'staple' ? 0 : W.ad;

// Black-owned/local weighting only breaks ties — it never overrides
// a materially better price or reliability for the household.
const blackOwnedBoost = isNearTie(item, pool) && item.blackOwned ? 1 : 0;
```

The tie-break definition (`isNearTie`) is auditable: two suppliers are "tied" when landed price is within X% and reliability within Y — only then does ownership/locality weight decide order. This makes the fairness lever defensible and non-extractive, exactly as `do.md` §3.5 argues.

Output: top ~30 candidates with their feature vectors (kept for the LLM and for logging).

---

## 5. Stage 3 — LLM re-rank, bundling & reasoning (grounded)

This is the "use LLM for product discovery" layer. The LLM **never invents products, prices, or stock** — it is constrained to the Stage-2 candidate set (retrieval-augmented / grounded generation) and receives real numbers it must not alter.

What the LLM adds that a numeric ranker can't:
- **Coherent bundles**, not just a ranked list — assembles a sensible "month-end staples run" or "festive bulk basket" from the candidates, respecting how households actually shop.
- **Per-item rationale** in the member's terms ("Your circle restocks this every month-end · R18 under retail · delivers in your area").
- **Diversity & sequencing** — avoids 10 near-identical maize-meal SKUs; balances the feed.
- **Conversational concierge** — the same grounded context powers the existing `ai_chat` hook (`recommendations.service.ts`).

Contract:
- **Model:** Claude Haiku for the batched re-rank/rationale (cheap, fast); Sonnet/Opus for the interactive concierge. (IDs: `claude-haiku-4-5-20251001`, `claude-sonnet-5`, `claude-opus-4-8`.)
- **Input:** compact user/circle/calendar context + the ≤30 candidates as structured JSON (id, name, price, retail_price, category, black_owned, delivers_here, circle_affinity, replen_due).
- **Output:** strict JSON — `ordered_ids[]`, optional `bundles[]`, `rationale{id: string}`. Validated against the candidate id set; anything off-list is dropped.
- **Grounding rules in the system prompt:** never output an id not in the input; never change prices/stock; never reorder `staple` items by anything other than household value; keep rationales ≤ 120 chars and factual.
- **Cost control:** cache per `(user, context_bucket, yyyy-mm-dd)`; batch circle members who share context; **fall back to Stage-2 order** on timeout/error. Target: LLM touches < 1 request in N via caching.

---

## 6. SA cultural & financial calendar (Route C / calendar_relevance)

A first-class reference dataset — the calendar *is* the feature. Seeded, then tuned per region.

| Moment | Timing | Discovery behaviour |
|---|---|---|
| Month-end / payday | last ~5 days of month | surface full staples run, push circle pooling before cut-off |
| SASSA grant dates | published monthly schedule | mirror month-end behaviour for grant-dependent households |
| Festive bulk | Nov–Dec, peak mid-Dec | bulk rice/oil/maize, stokvel year-end payout bundles |
| Easter | Mar–Apr | regional staples uplift |
| Back-to-school | early Jan, mid-year | household-consumption shift |
| Ceremony seasons | regional (funerals, umgidi/umembeso, Heritage Day) | catering-scale staples for circles |
| Stokvel payout cycle | per-circle, often year-end | pre-position bulk buys ahead of payout |

Model: `sa_calendar(moment, region, start_rule, end_rule, category_weights)`. `calendar_relevance` for an item = max weight over active/upcoming moments for the member's region, decayed by days-until.

---

## 7. Stage 4 — Serving, feedback & cold start

- **Serving:** api-gateway `/ai/*` and `/products/recommendations` → recommendation-service. Stage 1–2 synchronous (< 50 ms target); Stage 3 served from cache or computed async and merged on next load.
- **Feedback:** log impression → click → add-to-basket → add-to-circle-basket → purchase. These train the Stage-2 weights (and later the GBM) and the recurrence model. Add-to-circle-basket is the highest-value positive signal.
- **Cold start:** circle + calendar + geo + savings ranking needs zero individual history — deliberately, because most new users arrive mobile-first with no history, often via an existing stokvel.

---

## 8. Privacy, fairness & trust

- **Circle data is shared by consent.** A member sees *aggregate* circle signals ("your circle stocks X"), never another member's individual purchases. Circle joins are explicit.
- **Fairness lever is auditable.** The Black-owned/local weighting only breaks near-ties and is logged, so its effect on ranking can be measured and defended — not a hidden thumb on the scale.
- **No dark patterns.** Replenishment nudges must reflect real run-out predictions; savings claims must be real landed-cost-vs-retail deltas (`do.md` §6 price transparency).

---

## 9. Build phases

1. **P1 — Deterministic core (no LLM): ✅ implemented.** SA calendar (`discovery/sa-calendar.ts`, incl. computed Easter), staple detection (`discovery/staples.ts`), and the transparent weighted ranker with the auditable near-tie Black-owned/local promotion (`discovery/discovery.service.ts`). Exposed as `get_discovery_feed` and gateway `GET /ai/discovery`. Routes A/B (replenishment/circle) accept pluggable signals and default empty until orders/circles land — degrading gracefully. *This is the launch-critical layer.*
2. **P2 — Vector retrieval:** Route D via Mongo Atlas Vector Search (or pgvector); powers semantic search + "similar, cheaper supplier."
3. **P3 — LLM layer:** Stage-3 grounded re-rank/bundling/rationale + upgrade `ai_chat` concierge to Claude with the same grounded context.
4. **P4 — Learned ranker:** replace Stage-2 hand weights with a GBM trained on Stage-4 feedback; add per-region calendar tuning.

Each phase is shippable on its own and degrades gracefully to the one below it.

---

### Sources (market/architecture research)
- Multi-stage candidate-generation → re-ranking is standard large-scale practice; two-stage LLM re-ranking pre-filters cheaply then applies the LLM only to a small candidate set. See survey/《Generative Recommendation》 and two-stage re-ranking work: https://www.techrxiv.org/doi/full/10.36227/techrxiv.176523089.94266134/v2 , https://arxiv.org/pdf/2511.17913
- LLM embeddings for semantic candidate retrieval: https://medium.com/@moeinh77/llms-as-retrieval-and-recommendation-engines-part-1-43ceecb8e79b
