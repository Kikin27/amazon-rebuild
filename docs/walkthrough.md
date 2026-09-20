# Camera-on walkthrough — target 4 minutes 20 seconds

Use the deployed production website. Keep your camera visible throughout. Use invented sample checkout details; do not show personal account data or credentials. Rehearse once and stay below five minutes. This is a script, not a completed recording.

| Time | Screen/action | Suggested narration |
|---|---|---|
| 0:00–0:20 | Homepage | “This is my independent Amazon-style shopping demo. I prioritized a complete, responsive journey from finding a product to a simulated order, with clear boundaries around payments and personal data.” |
| 0:20–0:55 | Search “wireless”; filter 4.5 stars; remove chip | “Search, department, rating and sorting are in the URL, so refresh and browser navigation preserve the view. Applied filters are easy to see and remove.” |
| 0:55–1:20 | Open headphones; switch Sand; inspect gallery | “There are 24 sample products in four departments. Variants have their own cart identity and stock limits. Unavailable options stay visible but disabled. Photos are local and credited.” |
| 1:20–1:50 | Add to cart; change quantity; save and restore | “The cart updates immediately. Money uses integer cents. Save for later preserves a specific variant; the wishlist stores products to revisit.” |
| 1:50–2:30 | Checkout; submit empty to show validation; fill sample data; place demo order | “Checkout is guest-only, with no real card fields or charges. The order total stays visible. Name, email and address are never written to browser storage. The saved order contains only product snapshots, totals, time and simulated status.” |
| 2:30–2:55 | Confirmation → order details → refresh | “Order history survives refresh in this browser. Direct product and order routes work in production. Missing links and empty states have useful recovery paths.” |
| 2:55–3:20 | Mobile browser view; wishlist and account | “The layout adapts to phone, tablet and desktop. The demo account explains the simulation and lets you reset only this project's saved data.” |
| 3:20–3:45 | Research and QA docs | “I documented observed Amazon behavior separately from blocked or unvisited flows. Automated tests cover cart invariants, storage recovery and the shopping journey. Visual checks cover 390, 768 and 1440 pixels.” |
| 3:45–4:20 | Public repo → CAPTURE-TEST.md → commit history | “Automatic capture records actual prompts and final responses, without reasoning or tool logs. Both session canaries and failed setup attempts are preserved. Commits show capture setup, research, implementation and fixes in order. The public links and walkthrough are ready for the evaluator.” |

Only say the final sentence about readiness after the submission checklist is actually complete. Show the actual test results and deployment status, not a claim from this script. Stop recording by 4:30 to allow margin. Test the shared video link signed out.
