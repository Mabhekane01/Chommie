# Chommie — Design Philosophy

> **Your chommie is good with money.**

This document is the north star for how Chommie looks, moves and speaks. It exists
because the product roadmap is unusually wide: staples today, then entertainment,
e-hailing and banking. A design system that only works for a grocery store will
have to be thrown away twice. This one is built to hold all of it from day one.

---

## 1. The word is the brief

*Chommie* is South African slang for **friend** — not "customer", not "user", not
"member". A chommie is the person who tells you the truth about money, who knows
a guy, who shows up. That is a remarkably precise product brief:

| A chommie… | So the product… |
|---|---|
| tells you the truth about prices | shows savings vs retail as *proof*, never as a claim |
| doesn't upsell you | never lets ad money outrank a staple |
| knows your area | discovery is circle-, calendar- and area-aware |
| brings people together | circles are social and visibly collective |
| is fun to be around | the interface has warmth and humour, not corporate polish |

Everything below is downstream of that. When a design decision is unclear, ask:
**would a good friend do this?** A good friend does not use a countdown timer to
rush you. A good friend does not hide the total until checkout.

---

## 2. The core tension, and how we resolve it

Gen Z design in 2026 rewards boldness — oversized type, high-contrast dopamine
colour, expressive motion, anti-minimalism. Meanwhile we handle people's grocery
money, and will soon handle their bank balance. Those two pull hard against each
other:

- **Pure Gen Z maximalism** on a banking screen reads as *unserious*. Nobody
  trusts their salary to a toy.
- **Pure fintech minimalism** across the whole app reads as *cold* — it is exactly
  the "imported grocery app" do.md §10 says we are not.

We resolve it with one rule, and it is the most important line in this document:

> ### Calm at the till, loud in the aisles.

**Anywhere money is decided — prices, totals, balances, installments, payouts —
the design goes quiet, precise and high-clarity.** Tabular numerals, generous
space, no decoration competing with the number, no motion that delays the truth.
This is the Apple half: clarity, deference, depth.

**Everywhere else — discovery, circles, rewards, entertainment, empty states,
celebrations — the design is warm, expressive and playful.** Big type, saturated
accents, personality in the copy, motion with character.

This single rule is what will let us bolt entertainment onto the same app as a
bank account without either one poisoning the other. The playful surfaces earn
attention; the calm surfaces earn trust. Users learn the difference *visually*,
which means the interface itself signals "this is the serious bit" without a
single word of explanation.

---

## 3. Influences, and what we actually take

**Apple — take the discipline.** Clarity, deference, depth. Content outranks
chrome. Type does the work of hierarchy so borders don't have to. Motion is
physics, not decoration, and it is *fast*. We take Apple's restraint and apply it
hardest to the money surfaces.

**Claude — take the warmth.** Warm neutrals instead of clinical grey-white, soft
edges, generous breathing room, and a voice that is human and plain-spoken rather
than institutional. Claude proves an interface can feel calm and *kind* at the
same time. This is the base temperature of the whole product.

**Amazon — take the utility, leave the aesthetics.** Amazon is unbeatable at
density, findability and trust signals (stock, delivery date, reviews, price
history). We keep all of that. We drop the visual language entirely — the current
palette is literally Amazon's nav charcoal `#131921`, which makes us look like a
clone of the incumbent we are positioned against. A friend does not look like a
warehouse.

**Kasi culture — take the confidence.** Township creative culture is expressive,
proudly local and unafraid of colour. That is the licence for our accent palette.
The caution: *reference, don't costume*. We express it through colour energy,
warmth and voice — not through borrowed motifs or pattern pastiche.

---

## 4. One home, many worlds

The super-app problem is coherence: five verticals must feel like one product, and
each must still feel like itself. The pattern that works (Grab, Gojek, Revolut) is
**a shared skeleton with a per-world accent**.

Everything structural is identical across worlds — same navigation, same card,
same type scale, same radii, same motion, same money formatting. The only thing
that changes is a single accent colour and the iconography.

| World | Accent | Token | Feeling |
|---|---|---|---|
| **Shop** — staples & marketplace | Sunset orange | `--color-shop` | warm, everyday, appetite |
| **Circles** — stokvel buying | Rose | `--color-circles` | social, collective, human |
| **Money** — BNPL, wallet, banking | Jade | `--color-money` | growth, calm, go |
| **Ride** — e-hailing | Sky | `--color-ride` | motion, maps, clarity |
| **Play** — entertainment | Violet | `--color-play` | night, media, escape |

Shop is also the brand default: Chommie's signature colour *is* the Shop accent,
because staples are the front door.

**Why this scales:** adding a sixth world is a single token plus an icon, not a
redesign. And because the skeleton never changes, a user who learns to read a
Chommie card in the grocery aisle can read one in the banking tab without
relearning anything.

---

## 5. Design principles

### 5.1 Proof over persuasion
The savings number is the hero of the entire product (do.md §6.1). Gen Z is
fluent in marketing and allergic to it. So we never *say* "great value" — we show
`R284 saved vs retail` and let the number argue. Every savings figure must be
traceable to a real retail benchmark, or it must not appear.

### 5.2 The total is never a surprise
Show the real number as early as it is knowable, and show what changed it.
Circle discount, member pricing, coins, VAT, delivery — itemised, always. A friend
tells you what something costs before you're standing at the till.

### 5.3 Built for a R10 data bundle
Most of our users are on mid-range Android over expensive mobile data. **Performance
is a design constraint, not an engineering afterthought.** Server-render by default,
lazy-load images, no decorative video, no webfont that blocks first paint, and every
screen must be usable before the last asset lands. A beautiful screen that costs
someone R4 of data to look at is a badly designed screen.

### 5.4 Together is cheaper — make it visible
Circles are our structural moat. Collective progress should be *seen*: how many
members, how close to the next tier, what the group unlocked. Social proof here is
honest proof, not vanity metrics.

### 5.5 Celebrate the person, not the platform
Milestones — first order, savings passing the annual fee, a circle hitting Gold —
get a real moment of delight. But we celebrate *their* win, never our own growth.
No "you're our 10,000th customer!" That is the platform talking about itself.

### 5.6 Accessible is the floor
WCAG AA contrast on every text/background pair, hit targets ≥44px, full keyboard
navigation, motion honouring `prefers-reduced-motion`, and never colour as the
*sole* carrier of meaning. Non-negotiable, not a phase-two item.

---

## 6. The system

### 6.1 Colour

**Base** — shared by every world. Warm, never grey.

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#14100E` | primary text, dark surfaces (warm near-black) |
| `--color-ink-700` | `#4A403A` | secondary text |
| `--color-sand` | `#FDF6EC` | page background |
| `--color-sand-200` | `#F4E8D8` | subtle fills, borders |
| `--color-sand-300` | `#E7D6C0` | stronger borders |
| `--color-paper` | `#FFFFFF` | card surface |

The critical change from the old palette: the dark tone is a **warm espresso**,
not Amazon's blue-black. Warmth is the entire brand thesis; a cold neutral
undermines it on every single screen.

**Accents** — one per world, all tuned to sit on sand and on ink.

| Token | Value |
|---|---|
| `--color-shop` (brand) | `#FF5A1F` |
| `--color-circles` | `#E9407A` |
| `--color-money` | `#0FA968` |
| `--color-ride` | `#0EA5E9` |
| `--color-play` | `#A855F7` |

**Semantics** stay separate from world accents so "success" never collides with
"Money": `--color-positive`, `--color-warning`, `--color-danger`.

### 6.2 Typography

Two roles, deliberately contrasted — this is where the personality lives.

- **Display** (`--font-display`): headlines, hero numbers, empty states.
  Chunky, tight tracking, set large and confident. This is the "loud in the
  aisles" voice.
- **UI** (`--font-sans`): everything functional. Quiet, highly legible, boring on
  purpose.

**Money is always `tabular-nums`.** Non-negotiable: proportional digits make
columns of rands jitter and read as sloppy, which is the last impression a
financial product can afford. Use the `.money` utility.

Scale is a 1.25 ratio, with headlines allowed to jump the scale for impact.

### 6.3 Shape

Old build used `rounded-sm` (2px) everywhere — square, institutional, Amazon.
Friendliness is carried by curvature, so:

- Cards / sheets: `--radius-card` (18px)
- Buttons / chips / pills: fully rounded (999px)
- Inputs / small surfaces: `--radius-sm` (12px)

### 6.4 Elevation
Shadows are **tinted with ink, never black** — a neutral shadow on a warm
background reads as dirt. Two levels only: `--shadow-card` at rest,
`--shadow-lift` on hover/active. Depth communicates hierarchy (Apple), it does not
decorate.

### 6.5 Motion
- `--ease-chommie: cubic-bezier(0.22, 1, 0.36, 1)` — quick out, soft landing.
- Durations: `120ms` micro (hover), `220ms` standard (cards, sheets), `380ms`
  celebratory (milestones only).
- Money never animates *into* place. A total that counts up is a total you can't
  trust at a glance.
- All of it collapses under `prefers-reduced-motion`.

---

## 7. Voice

Second person, present tense, contractions, plain words. Rands written in full
(`R89,99`). Short sentences.

| Don't | Do |
|---|---|
| "Your order has been successfully placed." | "Order's in. We'll tell you when it ships." |
| "Insufficient funds available." | "That's R40 short. Want to use your coins?" |
| "Congratulations! You've unlocked Silver tier." | "Silver unlocked — that's 5% off staples for everyone in the circle." |
| "No items found." | "Nothing here yet. Start with the staples." |

Warmth is never at the expense of precision. On a money screen, being clear beats
being charming — every time.

---

## 8. What this rules out

Stating these plainly so they don't creep back in:

- Countdown timers and false scarcity on staples. A friend doesn't rush you into
  buying maize meal.
- Ads that outrank a staple on price. Structurally impossible by design, and the
  UI must never imply otherwise.
- Dark patterns in cancellation, pausing or unsubscribing. Pausing a membership is
  one tap and we don't guilt anyone for it.
- Confetti on a screen where someone just went into debt.
- Borrowed cultural motifs used as decoration.
