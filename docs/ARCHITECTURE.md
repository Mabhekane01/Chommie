# Chommie — Architecture & Delivery Decisions

Companion to `do.md` (product/business) and `docs/discovery-algorithm.md` (the discovery moat). This records the **resolved technical decisions** and the reasoning, so future work extends a known baseline instead of re-litigating it.

---

## 1. Stack at a glance

| Layer | Decision | Notes |
|---|---|---|
| Monorepo | **Turborepo** + npm workspaces | `apps/*` (frontends) · `services/*` (NestJS microservices) · `packages/*` (shared libs) |
| Customer web | **Next.js (App Router) + Tailwind** — *migrating from Angular* | new `apps/web`; port pages against the same gateway REST API |
| Vendor web | **Angular 21** (unchanged for now) | migrate later; not on the critical path |
| Backend | **NestJS 11 microservices over TCP** + `api-gateway` (REST) | keep; the gateway already exposes clean REST |
| Relational data | **Postgres** (TypeORM) | auth, orders, bnpl, payments, circles |
| Catalogue | **MongoDB** | products, Q&A, search; add vector search here |
| Cache / hot features | **Redis** | sessions, rate-limit, discovery feature store |
| Auth | **Supabase Auth** (passkeys + OAuth + phone OTP) fronting NestJS | see §3 |
| Discovery | **LLM-augmented** recommendation-service | see `docs/discovery-algorithm.md` |
| Payments | **Ozow · PayShap · PayFast · Yoco** | see §4 |
| Deploy | **Docker** → EC2 (primary) · Render · Railway | see §5 |

**Polyglot is allowed where it earns its place.** Node/NestJS is the default. A future ML ranker (Stage-4 in the discovery doc) or embedding worker is a reasonable place for a small **Python** service (FastAPI) behind the same TCP/REST boundary — the microservice split makes this a drop-in, not a rewrite.

---

## 2. Frontend migration: Angular → Next.js

The migration is a **frontend swap, not a backend rewrite** — the `api-gateway` already exposes REST (`/auth`, `/products`, `/payments`, `/orders`, `/bnpl`, `/ai/chat`, `/vendors`, `/notifications`), which the Angular app consumes today. Next.js consumes the same endpoints.

- **New app:** `apps/web` (Next.js App Router, TypeScript, Tailwind 4 to match existing tokens).
- **Keep** `apps/web-customer` (Angular) building during the transition as a reference/fallback; retire it once parity is reached. `apps/web-vendor` stays Angular.
- **Shared types:** reuse `packages/shared-types` (`@chommie/shared-types`) across Next.js and services — single source of truth for DTOs.
- **Design system:** carry over the existing tokens — Action Orange `#FF6D1F`, Beige `#FAF3E1`, Charcoal `#131921`/`#222222` (README "Vibrant Amazonia"). Mobile-first, data-light (metered-connection reality).

**Port order** (highest-conversion path first): `home → product-list → product-detail → cart → checkout → auth → account/orders → bnpl/loyalty → circles (new)`.

**Why Next.js helps this product specifically:** server components + streaming reduce payload on metered mobile connections; server-side rendering improves first-load on low-end Android; route-level code-splitting keeps the initial bundle small — all aligned with the SA connectivity reality called out in `do.md`.

---

## 3. Auth: Supabase Auth fronting the NestJS services

Requirement (from the user): **passkeys, email + Google/social OAuth, and phone-number OTP**, with Amazon/Costco-grade low-friction UX. Supabase Auth supports all three natively, so we adopt it for identity and keep the existing NestJS `auth-service` for domain data (profiles, addresses, seller vetting, Trust/BNPL linkage).

```
Next.js (@supabase/ssr)
      │  passkey / Google / phone-OTP  → Supabase Auth issues JWT
      ▼
api-gateway  ── verifies Supabase JWT (JWKS) at the edge
      ▼
auth-service (NestJS) ── owns profile/address/role/seller data,
                          keyed by the Supabase user id
```

- **Passkeys (WebAuthn):** primary, phishing-resistant, no password to forget — ideal for a mobile-first base. Supabase passkey enrolment on the Next.js client.
- **Phone OTP:** critical for the SA market (many users are phone-first, no email). Wire an SMS provider Supabase supports; keep an eye on OTP cost.
- **Email + Google/social OAuth:** standard low-friction path; Amazon-style "continue as guest → convert to member" flow layered on top.
- **Migration:** existing custom-JWT `auth-service` endpoints (`/auth/login`, `/auth/verify-2fa`, …) remain during transition; new sign-ups go through Supabase; back-fill/link existing users by email/phone. No breaking change to downstream services — they only need to trust the new JWT issuer.

---

## 4. Payments: four rails for the SA staples market

Existing code integrates **PayFast** only. The target market is mobile-first, heavily **underbanked/card-light** households and informal resellers, so the rail mix matters more than for a generic store. Selected four (reusing PayFast):

| Rail | What it is | Why it's in the set |
|---|---|---|
| **Ozow** | instant bank-to-bank EFT (login-to-bank) | huge for customers with a bank account but no card; 10+ yrs in SA |
| **PayShap** | SARB rapid-payments rail; **proxy pay by phone number (ShapID)**, instant, low-value, low-cost, ISO 20022 | purpose-built for exactly this demographic — low-value, instant, no card, phone-native |
| **PayFast** | all-in-one gateway (cards, EFT, SnapScan, Mobicred) | **already integrated** — keep the work; broad method coverage |
| **Yoco** | cards + QR, 150k+ SA businesses | strong reach for the **reseller/spaza** tier and in-person QR |

**Architecture:** a **payment-provider abstraction** in `payment-service` — one `PaymentProvider` interface (`initiate`, `handleWebhook`, `verify`, `refund`), one adapter per rail, selected by `paymentMethod`. The existing PayFast `initiate_payfast` / `payfast_notify` commands become the first adapter; Ozow/PayShap/Yoco are additional adapters behind the same gateway routes. This keeps checkout UI provider-agnostic.

**Advice beyond the four (documented, not yet built):**
- **Capitec Pay** — Capitec's massive low-income footprint makes it a high-value addition for this exact base.
- **Cash / voucher rails (1Voucher, Flash, Kazang)** — for the genuinely **unbanked**, a cash-voucher top-up may matter *more* than a 4th card gateway. Strong differentiator for the stokvel/township wedge; flag for phase 2.
- **Aggregator option:** Peach Payments or PayU can deliver PayShap + cards + more through one integration if maintaining four direct adapters becomes heavy — a valid consolidation later.

---

## 5. Deployment: Docker-first, four targets

One Docker image per service (multi-stage builds already present). Compose for local; three cloud targets share the images.

- **Local:** `docker-compose.yml` (Postgres + Mongo + Redis + all services + fronts) — exists.
- **AWS EC2 (primary/prod):** `docker compose` on an EC2 instance (or ECS later). Add `infrastructure/` IaC + a compose override with prod env, Nginx/Caddy TLS, and managed data (RDS Postgres, Mongo Atlas, ElastiCache Redis) instead of in-box containers.
- **Render:** `render.yaml` blueprint exists — fix issues noted below; keep as a low-friction staging/preview target.
- **Railway:** add per-service configs (Railway reads Dockerfiles directly); good for cheap always-on previews and managed Postgres/Redis plugins.

**`render.yaml` issues to fix** (spotted during audit): service `type: pweb` is invalid (should be `pserv`/private or `web`); Render doesn't provision managed **MongoDB** — point `product-service` at **Mongo Atlas**; several private services need explicit inter-service host wiring. Track as a cleanup task before relying on Render.

---

## 6. Open decisions deferred (not blocking)

- Vector store: **Mongo Atlas Vector Search** (catalogue already in Mongo) vs **pgvector** (Supabase Postgres). Leaning Atlas to avoid a second copy of the catalogue.
- LLM provider wiring for discovery/concierge (Claude Haiku for batch re-rank, Sonnet/Opus for concierge) — keyed via env; see discovery doc §5.
- When to migrate `web-vendor` off Angular (after customer parity).

---

## 7. Naming

The repo carries drifted names (Chommie / Nexus / MadFast) and `do.md` is still `[Platform Name TBD]`. **Recommendation: standardise on "Chommie"** — it's the repo, the design system, the package scope (`@chommie/*`), and it reads as warm/friendly SA vernacular ("chommie" = friend), which fits the community-centered, stokvel-native positioning better than an enterprise-sounding alternative. Locking the name unblocks `do.md`'s title and all customer-facing copy.
