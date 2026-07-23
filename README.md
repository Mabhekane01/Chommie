# Chommie

**Chommie is a direct-to-consumer staples retailer for South Africa** — it removes
the retail middle layer and connects households directly with the farmers, producers
and manufacturers who make what they buy. Chommie *is* the retailer; it sources
staples direct from producers and sells them near cost. The full product/business
blueprint is in [`do.md`](./do.md).

> **Not a marketplace.** There are no third-party vendors/sellers. Products are
> Chommie's own catalogue, **sourced from producers** (`supplierId`, see
> `supply-service`). The legacy multi-vendor code is being retired — see
> `apps/web-customer/DEPRECATED.md`.

## The model (from `do.md`)

- **Membership funds the platform, not markup** (§3.1) — a flat fee is the profit centre so staples sit near cost. → `membership-service`
- **One standing basket per household** (§3.2) — recurring demand that becomes the supplier-negotiation asset. → `membership-service`
- **Stokvel buying circles** (§3.3) — pooled demand unlocks a deeper discount tier. → `circle-service`
- **Household + reseller tiers** (§3.4) — resellers get volume-scaled wholesale pricing at checkout. → `membership-service` + `order-service`
- **Culture-aware discovery** (§3.5) — circle-, calendar-, geo- and savings-aware, with a grounded LLM re-rank. Staples are never pay-to-rank. → `recommendation-service`
- **Marketplace advertising** (§3.6) — sponsored placement in the *discretionary* tier only. → `ad-service`
- **Supply / off-take** (§5) — suppliers, off-take agreements, and a demand forecast aggregating standing-basket + circle demand. → `supply-service`
- **Price transparency** (§6) — every order records savings vs retail; the member's running total is the trust metric. → `order-service` + `membership-service`
- **Payments** (§9) — Ozow · PayShap · PayFast · Yoco behind one provider abstraction. → `payment-service`

## Architecture

Turborepo monorepo:

- **`apps/web`** — the customer storefront (Next.js App Router + Tailwind + Supabase auth: passkeys / Google / email / phone).
- **`services/*`** — NestJS microservices over TCP behind an `api-gateway` (REST):
  `auth`, `product`, `order`, `bnpl`, `payment`, `notification`,
  `recommendation` (discovery), `circle`, `membership`, `ad`, `supply`.
- **`packages/shared-types`** — shared DTOs (`@chommie/shared-types`).
- Data: **Postgres** (identity, orders, payments, circles, membership, ads, supply) · **MongoDB** (catalogue) · **Redis** (cache).

Design detail: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and the discovery moat: [`docs/discovery-algorithm.md`](./docs/discovery-algorithm.md).

## Running locally

```bash
npm install
docker compose up -d postgres mongodb redis   # or point env at managed DBs
cp apps/web/.env.example apps/web/.env.local   # NEXT_PUBLIC_API_URL + Supabase keys
npm run dev                                     # gateway + services + web (turbo)
npm run seed                                    # seed SA staples + a demo stokvel
# customer app: http://localhost:4300 · gateway: http://localhost:3000
```

Optional: set `ANTHROPIC_API_KEY` (+ `DISCOVERY_LLM_MODEL`) to enable the LLM
discovery re-rank and concierge — without it, discovery runs on the deterministic
ranker. Payment rails need each provider's credentials to transact.

---
© 2026 Chommie — staples, direct from producers.
