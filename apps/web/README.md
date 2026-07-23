# apps/web — Chommie customer app (Next.js)

The customer-facing storefront, **migrating from `apps/web-customer` (Angular)** to Next.js
(App Router + Tailwind 4). It consumes the same REST surface from the NestJS `api-gateway`
that the Angular app uses today — see `docs/ARCHITECTURE.md` §2.

## Run

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL and Supabase keys
npm install                  # from the repo root (workspaces)
npm run dev --workspace web  # http://localhost:4300
```

You'll want the gateway + services running too (`npm run dev` at the repo root) and the
catalogue seeded (`npm run seed`).

## Layout

- `app/` — App Router routes (server components by default).
- `lib/api.ts` — typed client for the api-gateway; degrades gracefully if it's down.
- `lib/supabase/` — auth clients (passkeys / OAuth / phone OTP), see `docs/ARCHITECTURE.md` §3.
- `components/` — presentational components carrying the "Vibrant Amazonia" tokens.

## Migration status

Foundation only. Port order (highest-conversion first):
`home → product-list → product-detail → cart → checkout → auth → account/orders → circles (new)`.
The Angular app keeps building until parity is reached.
