# Zoorvan Majoon

A Pakistani single-product ecommerce application built with Next.js 16 App Router, JavaScript/JSX, Tailwind CSS 4, Zustand, Formik/Yup, NextAuth (Auth.js), Prisma 6 and PostgreSQL.

The storefront uses the supplied maroon, herbal green, muted gold, warm cream and beige palette. English copy, Urdu accents, PKR pricing, Pakistani mobile validation and cash on delivery keep the experience familiar and practical. Fonts are served locally.

## Run locally

```sh
npm install
cp .env.example .env
# Configure DATABASE_URL and AUTH_SECRET in .env.
npm run db:migrate
npm run db:seed
npm run dev
```

Do not copy over an existing `.env`. Generate a secret with `openssl rand -base64 32`. Never commit credentials.

The seed reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment. The admin password needs at least 12 characters. Existing accounts and product records are not overwritten. Prisma CLI loads `.env`; the seed command uses Node's `--env-file-if-exists=.env` option.

Open http://localhost:3000. Set `STORE_PREVIEW=true` to try the storefront and read-only admin without touching the configured database. `COMMERCE_ENABLED=false` keeps checkout in explicit demonstration mode even with the database connected.

For a fresh database, `db:migrate` applies the committed migrations. An existing database originally created with `db:push` must first be compared with the initial migration and baselined; never reset a database containing store data.

## Routes and modules

| Area           | Routes / capabilities                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Storefront     | `/`, `/shop`, `/cart`, `/checkout`, `/order-success`, `/track-order`, `/contact`                                                                                                                                   |
| Policies       | `/terms-and-conditions`, `/privacy-policy`; draft fallback or published admin content                                                                                                                              |
| Authentication | `/login`, `/register`, `/forgot-password`, `/reset-password`                                                                                                                                                       |
| Customer       | `/account`, `/account/profile`, `/account/orders`, `/account/history`, `/account/settings`                                                                                                                         |
| Administration | `/admin`, `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/customers`, `/admin/coupons`, `/admin/reviews`, `/admin/content`, `/admin/settings`, `/admin/staff`, `/admin/reports`, `/admin/activity` |

Admin supports order details and fulfilment stages, manual courier references, product price/description/availability, stock levels, customer listing, coupon creation/editing, review moderation, policy editing, store settings, administrator creation, order/revenue summaries, and an audit trail. Historical orders and audit records are retained. Admin and customer listings currently show up to 100 records; add server-side pagination for a larger catalogue/order volume.

Customers can save their delivery details, change passwords, view their account's orders, and submit a review after delivery. Approved reviews appear on the product page. Guest orders are not automatically attached to later registrations.

## Structure

```text
prisma/
  schema.prisma
  migrations/
  seed.js
src/
  app/
    (store)/       # Shopping and policy pages
    (auth)/        # Sign in, registration and recovery
    (account)/     # Authenticated customer pages
    (admin)/       # Protected store management
    api/           # Server-side validation and mutations
  auth.js          # NextAuth credentials and session checks
  components/
    store/
    forms/
    admin/
  lib/             # Catalog, database, validation, security and admin queries
  store/cart.js    # Persisted Zustand bag
public/images/     # Provisional product artwork
```

## Commerce and authentication behavior

- Prices, shipping and discounts are calculated again on the server in integer PKR. Applied coupon totals are shown before submission. A changed quoted total requires the customer to review their bag.
- Order creation, stock reservations and coupon usage are atomic PostgreSQL transactions. Stock is restored once when an unshipped order is cancelled.
- Allowed order progression: pending → confirmed → processing → shipped → delivered. Cancellation is allowed before shipment. Courier and tracking number are required to mark an order shipped.
- Every admin mutation checks the current database role. Customer data is scoped to the authenticated account. Public tracking requires the order number and checkout mobile and returns no contact/address information.
- Passwords use bcrypt. Reset tokens are random, hashed at rest, expire after 30 minutes and can be used once. Password changes invalidate prior sessions.
- Password-recovery delivery requires `SMTP_URL`, `EMAIL_FROM`, and a canonical `AUTH_URL`. Without these, the UI explains that email recovery is not configured. No email was sent during development testing.
- Mutations check same-origin requests. Authentication uses Auth.js CSRF protection. Basic rate limits currently run per process; use a shared Redis/database limiter and deployment-level abuse controls when scaling across instances.
- Preview checkout stores only its reference, total, status and mobile in session storage. It does not create orders or collect payments. Bag quantities persist in local storage.

## Before opening for live orders

1. Replace the provisional packaging image and confirm price, weight, ingredients, directions, suitability and product copy. Product detail accordions in `src/app/(store)/shop/page.jsx` deliberately contain no invented formula or dosage.
2. Publish final terms and privacy text through Admin → Content. Confirm return eligibility, delivery coverage, dispatch estimates and the merchant's identity/contact details.
3. Set delivery fees, support email and WhatsApp in Admin → Settings. Courier booking and delivery updates are manual; no courier service or online payment gateway is integrated.
4. Configure SMTP for password recovery. Transactional order emails/SMS are not integrated.
5. Set stock and product availability in admin, then set `COMMERCE_ENABLED=true`. Keep `STORE_PREVIEW=false`. Use HTTPS, a secure `AUTH_SECRET`, database backups and your production `AUTH_URL`.

## Verification

```sh
npm test                 # Pricing, quantity validation, forms, origin and rate-limit tests
npm run lint
npm run build
npm run test:e2e         # Chrome: preview purchase flow, tracking, routes and mobile
npm run test:integration # Isolated PostgreSQL: real accounts and order lifecycle
```

Browser tests use the installed Google Chrome (`channel: chrome`). Preview tests start on port 3001. Integration tests require a disposable PostgreSQL server at `127.0.0.1:54329`, user `zoorvan_test`, database `postgres`, and start the app on port 3002. **The integration suite deletes records in that isolated database.** It explicitly rejects a different database URL. Apply migrations there first:

```sh
DATABASE_URL=postgresql://zoorvan_test@127.0.0.1:54329/postgres npm run db:migrate
```

The temporary local PostgreSQL server can be created with `initdb` / `pg_ctl`. Never point integration tests at the merchant's database.

Dependency overrides pin patched `deepmerge-ts` and Nodemailer versions. NextAuth is v5 beta because its App Router integration is used; the checked-in lockfile fixes the installed release. Recheck Auth.js and SMTP compatibility when updating dependencies.
