# African Dish (Ounjé) — African food marketplace

A recommendation-first food marketplace for African cuisine (Port Harcourt, London, Manchester, Birmingham).
Instead of an endless menu, the app shows a small set of contextual picks (time of day, allergens, preferences,
distance, price) and a low-friction checkout.

**Stack:** React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Firebase (Auth, Firestore, Cloud Functions) · Motion · lucide-react.

## Roles

| Role | What they can do |
| --- | --- |
| `customer` | Browse recommendations, manage allergens/preferences, cart, checkout, track and rate orders. |
| `restaurant_staff` | Merchant dashboard: stock, availability, open/closed, accept / prepare / mark ready, assign courier. |
| `courier` | Courier dashboard: see assigned orders, move them `out_for_delivery` → `delivered`, chat with customer. |
| `admin` | Read/override any order, approve role requests, verify restaurants. Admins are created out-of-band (see below). |

Users always sign up as `customer`. Upgrading to `restaurant_staff` / `courier` is done by submitting a **role request**
(`roleRequests/{uid}_{role}`) which an admin approves in the Admin console (a rules-enforced batch write sets `users/{uid}.role`
and links staff to their restaurant; Firestore rules forbid self-promotion). Admins can also verify newly created restaurants. A clearly flagged *demo-only* role switcher exists for
local exploration and only changes local UI state.

## Getting started

```bash
bun install          # or: npm install
npm run dev          # http://localhost:3000
```

Firebase web config lives in `firebase-applet-config.json` (public client config, not a secret).

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm test` | Start the Firestore emulator and run all rules + integrity + flow + unit tests |
| `npm run clean` | Remove `dist/` and `functions/lib/` |

## Testing

`npm test` runs `firebase emulators:exec --only firestore "tsx src/tests/runAllTests.ts"`. It needs a **Java runtime** for the
Firestore emulator. The suite contains:

- `orderIntegrity.test.ts` – client-side total calculation and state-transition helpers.
- `firestoreRulesReal.test.ts` – security rules against the real `firestore.rules` via `@firebase/rules-unit-testing`.
- `roleFlow.test.ts` – full customer → payment webhook → restaurant → courier → rating lifecycle, plus negative cases.
- `recommendationEngine.test.ts` – unit tests of the recommendation engine (allergen exclusion, price sensitivity, skip logic).

## Firebase notes

- **Rules:** `firestore.rules` is the source of truth for who may read/write. The order state machine in the rules
  mirrors `VALID_ORDER_TRANSITIONS` in `src/services/orderService.ts`; `roleFlow.test.ts` checks the two stay in sync.
- **Trusted server path:** clients can *create* an order (`payment_pending`, `paymentStatus: 'pending'`) but can **never** mark
  it `paid`. `functions/` contains Cloud Functions (TypeScript, `firebase-admin`):
  - `placeOrder` (callable) – recomputes item prices, fees and totals server-side from `meals` / `restaurants` documents.
  - `paystackWebhook` (HTTP) – verifies the `x-paystack-signature` HMAC-SHA512 using `PAYSTACK_SECRET_KEY` and, through the
    Admin SDK (which bypasses rules), moves the order `payment_pending → paid → restaurant_pending`.
  - `simulatePayment` (callable) – **development only**; refuses to run unless `FUNCTIONS_EMULATOR=true` or
    `ALLOW_PAYMENT_SIMULATION=true`.
  Rules can only check *shape* (field allowlist, non-negative numbers, initial status); authoritative pricing is done by the function.
- **Secrets:** set `PAYSTACK_SECRET_KEY` via `firebase functions:secrets:set PAYSTACK_SECRET_KEY` (never commit it).
- **Creating the first admin:** set `role: 'admin'` on `users/{uid}` via the Firebase console or the Admin SDK.
- **Demo seed data:** `seedFirestoreInitialData` only runs for signed-in admins and gives demo restaurants an `ownerId` and `verified` flags.

### Functions development

```bash
cd functions && npm install && npm run build   # compiles TypeScript to functions/lib
firebase emulators:start --only firestore,functions
```

## CI

`.github/workflows/ci.yml` runs type-check, build and tests on every push/PR; Dependabot keeps npm and GitHub Actions current.
