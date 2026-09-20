# Amazon customer-flow research — 2026-09-20

Public amazon.com inspected in Codex's browser, signed out, with Philippines delivery region and PHP display chosen by the site. Screenshots are direct browser captures. No credentials, addresses, purchases, or subscriptions were entered. These are reference evidence only, not licensed product assets for our demo.

## Observed flows

| Flow | Actual sequence and observation | Evidence |
|---|---|---|
| Homepage | Open amazon.com. Dark two-level navigation, left logo and delivery region, large center search, account/orders/cart on right. Broad promotional hero overlaps dense white category cards on a pale gray background. Cards mix one large photo and four-image grids. | `recon/01-home-desktop.png` |
| Search | Typed “wireless headphones”, pressed Enter. Count and keyword above results, left filter rail, sort control on the right. Product cards include ratings, price, delivery copy, variants and a product link. Suggestions were not verified. | `recon/02-search-desktop.png` |
| Sort | Selected “Price: Low to High”; resulting sort control showed that option selected. | `recon/03-sort-price.png` |
| Rating filter | Applied “4 Stars & Up”; count changed from over 40,000 to over 20,000 and control became “Remove 4 Stars & Up filter to expand results.” | `recon/10-rating-filter.png` |
| Product | Opened Hybrid Active Noise Cancelling Bluetooth Headphones, ASIN B0HDP855VQ. Thumbnail gallery on left, title/rating/price/features in center, separate purchase panel on right. Product has three color variants with price labels. | `recon/04-product-desktop.png` |
| Variants | Selected Pink. Radio state changed to checked and text changed to “Color: Pink.” Prices vary by color. | `recon/05-product-pink-variant.png` |
| Reviews | Rating summary and count were observed on product and search. Product DOM exposes product information and review section further below; detailed review filtering and writing were not exercised. | Product screenshot |
| Cart | Opened header cart. “Your Amazon Cart is empty,” sign-in link and recommendations. No items added. | `recon/06-empty-cart.png` |
| Orders and sign-in | Clicked Returns & Orders. Redirected to “Sign in or create account” with email/mobile field and Continue. Stopped before credentials or terms acceptance. | `recon/07-orders-sign-in-required.png` |
| No matches | Searched “zzzxqvnomatch82736”. “No results for your search query,” help and browsing-history recommendations. | `recon/09-no-match.png` |
| Narrow viewport | Requested 390×844 browser viewport. Desktop-user-agent site retained a desktop layout with horizontal overflow; screenshot is not evidence of Amazon's native mobile experience. Mobile user-agent flows remain unverified. | `recon/08-home-390-desktop-user-agent.png` |

## Blocked and unvisited steps — not claimed complete

The inspected offer emphasized a Prime-exclusive price and a Join Prime button, with a regular-price option underneath. No subscription was started. Populated-cart quantity/removal/save-for-later, address validation, delivery selection, payment, review-order, and order placement were not exercised. Checkout requires a purchasable cart and eventually account details; they remain unverified. Account creation, stored addresses, authenticated list editing and order management also remain unverified. The Add to List entry point was visible on the product page, but list creation was not exercised.

## Product judgments

Preserve the recognizable dark navigation, prominent search, dense white merchandising cards, product-led imagery, orange/yellow action hierarchy, and separate buy box. Avoid copying ads, Prime enrollment, unsupported seller controls, and unverified delivery promises. The actual site has competing membership and regular pricing; a demo benefits from one clearly stated price and a direct, simulated guest path.

Our deliberate improvement is visible, individually removable filter chips and persistent checkout totals. Search state lives in the URL. On mobile, put search on its own row, use two-column product grids, expose a working filter disclosure, and stack checkout with a readable total.

Implement: 24 local sample products, catalogue search/category/rating/sort, variants, stock-limited cart, save for later, wishlist, guest checkout, confirmation/history and demo account/reset. Simulate: shipping, payment, order status, reviews, account. Omit: actual login, subscriptions, payment capture, seller marketplace, recommendations model, tax calculation, backend and real shipping. Prices use USD as requested, independently of the reference site's regional PHP display.

Research was recorded and committed before application code. It is deliberately honest about coverage; it is not a claim of exhaustive authenticated Amazon exploration.
