# Next implementation steps

Follow this order and keep each change small enough to build, inspect and revert. There is no weekly schedule. The first milestone is a more trustworthy desktop planner; mobile work follows it.

### 1 Verify the nine temple records

Collect confirmed entrance coordinates, normal hours, weekly variations, holiday exceptions, public office contacts and accessibility notes. Store source URL, verification date, verification method and confidence per record. Acceptance: every operational field is either supported by recorded evidence or visibly marked unverified.

### 2 Harden routing and saved state

Introduce a small provider interface, validate the entire saved-trip payload and propagate the matrix source and timestamp into the UI and text export. Add focused tests for corrupt storage, timeouts, stale snapshots and missing geometry. Acceptance: a provider failure still produces a clearly labeled estimate, never an unexplained blank map or false live-data claim.

### 3 Improve control of the desktop itinerary

Allow a user-entered delay and daily visit or driving limits. Offer a clear explanation for unscheduled temples and practical changes such as adding a day or starting earlier. Acceptance: completed visits remain fixed, constraints are respected and a search limitation is not presented as proven impossibility.

### 4 Add optional shrines

Add verified Uppiliappan and Swamimalai records, with explicit optional selection and visit duration. Prioritize all nine core temples before optional visits. Acceptance: adding an optional shrine cannot silently remove a core temple; omitted optional stops are explained.

### 5 Add verified practical facilities

Start with a small curated list of parking, toilets, seating, drinking water, vegetarian food and emergency contacts. Show distance, evidence and verification date. Acceptance: unknown wheelchair access or dietary suitability remains unknown rather than being inferred from proximity.

### 6 Complete Tamil and accessibility checks

Translate remaining messages and data cautions, then test keyboard access, focus order, contrast and desktop zoom. Acceptance: a pilgrim can configure, inspect and export a trip without a mouse, and important warnings are available in both languages.



## Deferred

Mobile and offline PWA, cloud sharing, confirmed ritual slots, astronomy, crowd analytics, ads and subscriptions follow the desktop pilot. No dates or weekly commitments are assigned.
