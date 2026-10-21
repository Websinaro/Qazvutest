<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/afbd5c5c-ba38-4589-a4ae-67ed4f146060

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database (PostgreSQL only)

This app uses **PostgreSQL as the only production database**, accessed
through Drizzle ORM (`drizzle-orm/node-postgres`) via a pooled connection.
There is no SQLite / sql.js / PGlite / in-memory fallback anywhere in the
codebase — if `DATABASE_URL` is missing or unreachable, requests fail
loudly instead of silently degrading.

```
Next.js → Service layer (src/server/modules/*) → Drizzle ORM → PostgreSQL
```

### Setup

1. Provision a PostgreSQL database and set `DATABASE_URL` in `.env.local`
   (see `.env.example`). Also set `JWT_SECRET`, `JWT_REFRESH_SECRET`, and
   `PAYMENT_SECRET` — these have no hardcoded fallback and the app will
   refuse to start without them.
2. Apply the schema:
   ```
   npm run db:migrate
   ```
   This runs `src/db/migrate.mjs`, a small runner that applies every
   `*.sql` file in `src/db/migrations/` in order, tracked in a
   `schema_migrations` table so re-running it is a no-op. It does **not**
   recreate tables on every server boot.
3. (Optional) Seed demo data — categories, products, a demo customer,
   and seller account, plus one delivered order so review
   eligibility can be tested immediately:
   ```
   npm run db:seed
   ```
4. `npm run dev`

### Admin access (one-time bootstrap)

Nobody can become an admin by registering or logging in — public
registration always creates a `CUSTOMER`. The first admin is created once,
from the server shell:

```
ADMIN_BOOTSTRAP_EMAIL=you@example.com \
ADMIN_BOOTSTRAP_PASSWORD='a-long-Strong-pass-123' \
npm run admin:bootstrap
```

(`ADMIN_BOOTSTRAP_USERNAME` is optional.) The command refuses to run if any
admin already exists, so it is a one-time operation; unset the variables
afterwards. Further admins can only be promoted by an existing admin from the
admin dashboard. The old `ADMIN_EMAIL` / `ADMIN_PASSWORD` variables are no
longer read.

### Schema changes going forward

`src/db/schema.ts` is the source of truth. For schema changes:
- Hand-write a new numbered file in `src/db/migrations/` (e.g.
  `0001_add_something.sql`) and update `schema.ts` to match, or
- Use `npm run db:generate` (drizzle-kit) to diff `schema.ts` against the
  database and scaffold a migration, then adjust as needed.

Either way, `npm run db:migrate` applies whatever is in
`src/db/migrations/` that hasn't been applied yet.

## Auth

Access and refresh tokens are issued as `HttpOnly`, `Secure` (in
production), `SameSite=Lax` cookies — never exposed to client JavaScript
and never stored in `localStorage`. Refresh sessions are tracked in the
`sessions` table in PostgreSQL, so logout and "change password" can revoke
them server-side instead of just deleting a client-side token.

## Orders

Checkout (`POST /api/orders`) runs entirely inside one PostgreSQL
transaction: validate cart/products/variants → price → atomically reserve
inventory (`UPDATE ... WHERE stock >= qty`) → create order/items/timeline →
clear cart → commit. Any failure rolls the whole transaction back.

Order status transitions are validated against an explicit state machine
(`src/lib/orderStateMachine.ts`) — e.g. `DELIVERED → PROCESSING` is always
rejected, regardless of caller.

## UI / design system

The storefront follows a "market stall" look: warm paper, ink, flat ruled
surfaces and a few hand-made details. All business logic (contexts, API
routes, services, DB) is unchanged.

- **Type:** Young Serif for h1/h2 (one weight, so headings never fake bold), Hanken Grotesk for
  body text, Caveat for the odd handwritten note, Geist Mono for prices and small labels
  (`next/font/google` in `app/layout.tsx`).
- **Colour:** paper `#f3eee3`, ink `#1b231d`, leaf green `brand-*`, marigold for stickers and
  highlights, chili for sale marks. Dark mode (`.dark`) flips `--page / --card / --ink / --rule`.
- **Surfaces:** hairline rules instead of shadows. `bg-card`, `border-rule`, `text-ink`,
  `bg-paper` follow the theme. Radii are small (6 to 12px); big pills became rectangles.
- **Utilities** (`app/globals.css`): `sticker`, `ticket` (perforated deals coupon), `receipt`
  (torn cart summary), `eyebrow`, `figures`, `leader`, `note`, `btn-ink`, `print-in`, `scribble`.
- **Hand-drawn parts:** `src/components/ui/Hand.tsx` (underline, ring, arrow, tick) and `BrandMark.tsx`.
- **Icons:** Phosphor via `src/components/ui/icons.tsx`, unchanged.
- **Motion:** `motion` for grid entrances, drawers and toasts; honours `prefers-reduced-motion`.
