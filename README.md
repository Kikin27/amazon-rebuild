# Amazon Rebuild

An independent educational shopping demo inspired by Amazon's dense catalogue, prominent search, product imagery and purchase flow. Built with React, Vite, JavaScript, plain CSS and React Router.

- **Public repository:** https://github.com/Kikin27/amazon-rebuild
- **Live website:** https://amazon-rebuild-lilac.vercel.app
- **Capture evidence:** [CAPTURE-TEST.md](CAPTURE-TEST.md)
- **Research:** [Observed flows and boundaries](docs/research.md) · [Reference screenshots](docs/recon/)
- **Decisions:** [Product and architecture choices](docs/decisions.md)
- **Image credits:** [Sources and license information](docs/image-credits.md)

No real authentication, payment, shipment or Amazon affiliation. All products, prices, ratings and reviews are sample data. Checkout is a simulation.

## Run locally

Use Node.js 22.12+ or 24 LTS and npm. No environment variables are required.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:browser
npm run build
npm run preview
```

Browser tests run in fresh desktop and mobile Chromium contexts. They cover URL search/filter/sort, variants and stock, cart persistence, wishlist, save for later, checkout validation, no-sensitive-data order persistence, direct-link refreshes, corrupted/unavailable storage, empty and invalid routes, reset, keyboard menu behavior, image loading and document overflow at 390/768/1440px. See [QA report](docs/qa.md) for actual results and limitations.

## Shopping features

24 products, six each in Electronics, Home & Kitchen, Clothing and Books. Locally stored photos, original book covers, detail-crop galleries, meaningful variants and unavailable choices. Search matches titles and descriptions; department/rating filters and sorting survive reload and browser navigation through URL query parameters. Applied filters have individually removable chips.

Cart identity includes product and variant. All arithmetic uses integer USD cents. Stock caps are enforced centrally. Buy Now adds the selected item to the current cart and opens checkout. Wishlist and save-for-later are distinct. Saved quantity beyond remaining stock stays saved rather than being lost.

Guest checkout validates name, email and address, offers one clearly labeled simulated payment choice, and never asks for card data. No payment is processed and nothing ships. Shipping is free and tax is not calculated. Successful checkout saves an immutable item/price snapshot and unique ID, clears the cart and opens confirmation. Duplicate order actions are rejected.

## Routes

| Route | Purpose |
|---|---|
| `/` | Hero, departments and recommendations |
| `/products` | URL-driven catalogue/search/filter/sort |
| `/products/:id` | Details, gallery, variants, quantity, cart and Buy Now |
| `/cart` | Quantity, removal, saved items and totals |
| `/wishlist` | Saved products and purchase actions |
| `/checkout` | Simulated guest checkout |
| `/order-success/:id` | Existing-order confirmation |
| `/orders` | Browser-local demo history |
| `/orders/:id` | Stored item and total snapshots |
| `/account` | Demo overview and explicit data reset |
| Any other path | Helpful not-found state |

## Architecture and privacy

`src/data/products.js` is the local catalogue and money formatter. `src/state/shop.js` is the pure reducer, normalization, stock enforcement and order snapshot layer; `ShopContext.jsx` manages React integration, local storage and feedback. `src/App.jsx` contains the route views and shared UI. `src/styles.css` contains responsive styling and reduced-motion support.

Storage key: `amazon-rebuild:v1`. Only cart, saved items, wishlist and non-sensitive demo orders persist. Personal form values stay in checkout component memory and disappear when the page is left. No analytics, checkout network request or server-side storage. Unknown fields are removed when loading stored orders. Invalid storage recovers without crashing; unavailable storage leaves shopping usable with an explanatory warning. Clearing this demo does not clear other websites' data.

## Capture

Capture uses genuine Codex Desktop session-store events, scoped to this project. Prompts and final responses are exported automatically, excluding reasoning, commentary and tool activity. Actual per-turn model metadata is used. The two-task canary evidence and failed startup attempts are preserved in `CAPTURE-TEST.md`.

Before starting a new Desktop work session after reboot:

```sh
python3 scripts/start-capture.py
```

The independent collector then automatically observes current and fresh tasks. It survives task completion, but is not installed as a reboot-persistent system service. `.capture/heartbeat.txt` records its latest scan; runtime files are ignored, `.agent-logs/` is tracked. Do not modify captured entry bodies. Commit completed captures with each milestone. A final answer cannot be captured before it finishes: commit that capture in a later coordinating turn before submission.

The transcript schema is implementation-specific. This extractor is verified against Codex Desktop 0.155.0-alpha.9.2; reverify after tool upgrades. `scripts/codex-captured` is an optional CLI startup wrapper, not the mechanism used for the Desktop canaries; CLI transcript compatibility must be verified separately before switching tools.

## Deployment

The public production site is https://amazon-rebuild-lilac.vercel.app. Vercel is connected to `Kikin27/amazon-rebuild` for deployments from `main`.

`vercel.json` rewrites direct routes to `/index.html`. Import this repository into Vercel with Vite, build `npm run build`, output `dist`, production branch `main`, and no environment variables. Use the repository root. Production access must be verified while signed out; a successful authenticated preview alone is insufficient.

## Scope and remaining user actions

Real accounts, marketplace sellers, subscriptions, returns, payment processing, tax calculation and fulfillment are intentionally omitted. Browser-local state is not shared across devices. Product photography is illustrative, not a claim about a real brand or exact selected variant. Detailed Amazon checkout and authenticated-account research were not completed; see the explicit research boundaries.

The user must record their own camera-on walkthrough and submit the links. A timed [walkthrough script](docs/walkthrough.md) and [submission checklist](docs/submission-checklist.md) are included. Neither recording nor actual submission is automated or claimed complete.
