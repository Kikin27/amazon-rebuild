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

Desktop storefront reviewed in the actual Codex browser. True breakpoint captures come from Playwright with explicit viewports because Codex's viewport override did not reliably apply to the chosen tab. The mobile full-page screenshot was visually inspected: header/search stack, two-column department cards and product cards, wrapped banner copy and footer all fit without clipping. Tablet and checkout/product/cart captures are reviewed below as verification continues.

## Production checks

Deployment and unauthenticated verification are in progress. Production results will be recorded here after actual checks.

## Limits

This is Chromium coverage, including touch/mobile emulation, not physical-device Safari testing. No real authentication, payment or shipping is present. Signed-in Amazon checkout was not researched. Local orders are device/browser-specific and clear when demo data is reset.
