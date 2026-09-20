# Verification report

## Local checks completed

- `npm run lint`: passed.
- `npm test`: 10 tests passed. Catalogue shape, variant identity, stock/quantity rejection, integer-cent totals, saved-item overflow preservation, corrupted and blocked storage, sanitized order snapshots, duplicate rejection and reset.
- `npm run test:browser`: 10 tests passed across desktop and mobile Chromium. Search/filter/sort, wishlist/save-for-later/cart persistence, checkout validation and successful order creation, no personal data in storage, order refresh, empty and invalid routes, unavailable storage, keyboard drawer activation/Escape/focus return, loaded images and no horizontal document overflow.
- Layout tests visit eight routes at 390, 768 and 1440px in each browser profile. Screenshots are stored under `docs/qa/`.
- Search regression also passed three consecutive runs per browser profile after synchronizing the assertion to the rendered navigation state.
- `npm run build`: passed with Vite 7.3.6; production assets generated.

## Failures found and resolved

Initial lint caught an unused mapping. The first browser run found a search-input synchronization race, a radio assertion racing React's transition, and an audit waiting indefinitely on off-screen lazy images. Subsequent runs caught duplicate primary headings in empty states and a test reading URL changes before the corresponding React view committed. These were fixed and the full suite rerun. No test results are claimed retroactively for the failed runs.

## Visual review

Desktop storefront reviewed in the actual Codex browser. True breakpoint captures come from Playwright with explicit viewports because Codex's viewport override did not reliably apply to the chosen tab. The mobile full-page screenshot was visually inspected: header/search stack, two-column department cards and product cards, wrapped banner copy and footer all fit without clipping. Refreshed tablet home and desktop/mobile product and populated checkout captures were visually reviewed: images load, content stacks correctly, controls remain readable, and no document clipping was observed. Populated cart and tablet checkout were also reviewed.

## Production checks

On September 20, 2026, all **12 browser tests passed** against https://amazon-rebuild-lilac.vercel.app using fresh unauthenticated desktop and mobile Chromium contexts (two workers, 18.5 seconds). This includes the additional gallery, stock-cap and Buy Now tests. Public homepage and direct product routes returned HTTP 200. GitHub repository visibility is public and its website field points to this production URL.

The first production run exposed an ambiguous quantity label in the new test and a mobile navigation timeout. The quantity select now has an explicit associated label; the complete production suite passed after deploying that fix and using two workers. Screenshot capture now waits for home images to decode, correcting prematurely blank tablet captures.

## Limits

This is Chromium coverage, including touch/mobile emulation, not physical-device Safari testing. No real authentication, payment or shipping is present. Signed-in Amazon checkout was not researched. Local orders are device/browser-specific and clear when demo data is reset.
