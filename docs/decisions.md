# Product and engineering decisions

- Independent educational demo, visibly labeled; no real Amazon affiliation, accounts or purchases.
- React + Vite + JavaScript + plain CSS + React Router. Context/reducer centralizes stock and item-identity invariants.
- Local curated sample catalogue: four departments, six products each. Integer-cent arithmetic. Sample reviews labeled as fictional.
- Variant ID is part of cart identity. Inventory is per variant; zero-stock choices stay visible but unavailable.
- Guest checkout keeps personal input exclusively in component memory. Only item snapshots, time, totals and simulated status persist.
- Free simulated shipping; taxes not calculated. No card fields, address persistence, analytics or network checkout.
- Readable URL query state and removable chips preserve navigation and make filtering reversible.
- Browser storage is treated as untrusted; schema validation and recovery protect rendering. Storage failures retain an in-memory session and surface a notice.
- Reference research is signed-out and partial. Blocked/unvisited paths are documented in research.md.
- Capture is a running, project-scoped session-store extractor. Startup/restart requirements and failed approaches are in CAPTURE-TEST.md. Captured entries are immutable.

## Verification refinements

- A rapid search test exposed an effect synchronizing URL state over newly typed input. Search submission now reads native FormData, with defaults keyed to navigation. The regression waits for rendered filter removal, not merely the earlier browser-URL update.
- Native radio updates under React Router transition asynchronously. Browser assertions wait for checked state after activation.
- Lazy off-screen images are loaded explicitly during the image audit; waiting for decode without requesting them caused a test timeout, not an application error.
- Empty panels inside titled pages use level-two headings, preserving a single primary heading.
- Gallery detail images are honest crops of the credited source photo. Selected quantity is clamped to remaining cart capacity.
