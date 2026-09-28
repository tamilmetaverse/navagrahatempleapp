# Navagraha project handoff

Prepared for Meta Mudhaleedu · 28 September 2026

## Release overview

The first desktop web version of the Navagraha pilgrimage planner is deployed on Vercel. This handoff records the implemented scope, architecture, test evidence, source documents and ordered next steps for Meta Mudhaleedu. It is the current implementation reference as of 28 September 2026.

Live application: https://navagrahatempleapp.vercel.app/
Source repository: https://github.com/tamilmetaverse/navagrahatempleapp
Verified application commit: c01dfbd6688d6df9e1ea3cfcea15dc0e7012fa90

### What we have delivered

- An interactive Leaflet map with OpenStreetMap tiles, nine temple pins, temple details, source links, contact links and external directions.

- One to three day car itineraries from Kumbakonam, Thanjavur or Mayiladuthurai, with a travel date, daily time limits and three visit paces.

- Opening-window-aware scheduling, a 45-minute lunch, travel buffers and a return to the starting town each night. A partial result identifies unscheduled temples.

- Sequential visit completion, replanning with a 90-minute delay, browser-local saved progress, text itinerary download and Tamil core controls.

### Current boundary

This release plans basic darshan. Mobile acceptance, optional shrines, ritual appointments, facility filtering, live queues, astronomical calculations, accounts, cloud sync and monetization are not implemented. Saved trips are tied to the current browser. Saving a trip does not make the app an offline PWA.

Temple hours remain provisional and coordinates are approximate. A successful generated plan is an estimate, not a guaranteed pilgrimage schedule. The solver uses a bounded search and does not prove that its result is globally optimal or that a partial result means no feasible complete route exists.


## Implemented architecture

The Vercel deployment runs Next.js with React and TypeScript. The browser holds the trip UI, Leaflet map, planner and local saved state. Two server routes obtain road data. Static temple records and a dated road-time snapshot are shipped with the application. No application database or agent runtime is required.

### Modules and files

- app/page.tsx owns preferences, day selection, generation, completion, delayed replanning, saved state and export.

- components/temple-map.tsx renders pins and road geometry. If geometry cannot be fetched, it displays a labeled connection line.

- lib/navagraha/planner.ts implements the bounded beam search, keeping up to 1,800 candidate states, and accounts for visit windows, lunch, day limits and completed visits.

- lib/navagraha/data.ts contains the nine temples and three origins. lib/navagraha/road-snapshot.json supplies the dated road-time fallback.

- app/api/travel/route.ts requests an OSRM duration matrix, adds 20 percent plus five minutes per leg and caches successful results in memory for one hour. On failure it returns the 28 September 2026 snapshot.

- app/api/route/route.ts requests OSRM route geometry. The map can try OSRM directly before falling back to a dashed line. None of these routes supplies live traffic.

### How a trip flows through the system

The pilgrim chooses a date, origin and pace. The browser requests the road matrix, then the planner schedules the nine core temples within the selected day limits. The UI displays each day and requests its route geometry. Completion updates local storage. A delayed replan preserves completed visits and reschedules the remainder.

### Deployment configuration

vercel.json selects Next.js, installs with pnpm install --frozen-lockfile, builds with pnpm run build:vercel and uses .next output. The build:vercel script runs next build --webpack. The older Sites/Vinext build remains in the repository; use the explicit Vercel commands when testing this deployment.


## Validation and operating limits

### Completed checks

- Eight planner regression tests passed, covering a complete nine-stop plan, opening windows and nightly return, short-trip partial results, invalid dates or end times, weekday rules, completed-prefix preservation, late return recovery and invalid matrices.

- TypeScript checking and the local Vercel-compatible production build passed. Vercel also completed its hosted build and deployment successfully.

- The live Vercel app generated all nine stops for the default two-day Kumbakonam trip and displayed a road route. The inspected result estimated 6 hours 5 minutes of driving.

- Desktop browser checks covered day switching and saved progress after refresh. Earlier version checks also covered temple details, sequential completion and the 90-minute replan. The inspected live console sample showed extension-origin errors but no application-origin exception.

### What these checks do not establish

There has been no temple-office or field validation, mobile acceptance run, load test, independent accessibility audit, security audit or exhaustive provider-outage test. The original production build and browser checks are evidence for this release, not a claim that every input combination or real-world trip is correct.

### Commands for the next engineer

Use the package manager pinned in package.json. Install dependencies with pnpm install --frozen-lockfile. Run node --experimental-strip-types --test tests/planner.test.ts and pnpm exec tsc --noEmit. Build with pnpm run build:vercel. For a local Next.js session, use pnpm exec next dev; for the built app, use pnpm exec next start.

### Known follow-up work

Verify temple entrances, opening windows and exceptional days. Make the exact road-data timestamp and fallback source visible in the UI and export. The existing UI describes OSRM estimates generically even though the server distinguishes the snapshot. Keep that distinction when saving and restoring a trip.

Before expanding beyond a small pilot, select a routing service appropriate for the expected usage and verify its current limits and terms. The present public OSRM demo service has no application-specific availability guarantee. Keep OpenStreetMap attribution and avoid bulk tile prefetching.


## Next implementation steps

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


## References and continuation

### Later work

After the desktop pilot, adapt the layout for mobile and test it on actual devices. Add an offline itinerary only with explicit cache/version behavior. Introduce anonymous share links and a database only when cross-device trip sharing is needed. Ritual commitments should use confirmed temple schedules; astronomical calculations require a chosen convention and independently checked outputs. Crowd estimation needs observations before predictions. Ads and premium features follow evidence of repeat use.

### Documents preserved in the repository

- docs/reference/Temple_Pilgrimage_Guide_2026.pdf is the user-supplied temple reference, originally named Navagraha_Temple_Pilgrimage_Guide_2026(1).pdf. It seeded temple profiles, contacts, hours and ritual context. Its wording does not replace field verification.

- docs/reference/Original_Build_Plan.md preserves the original broad build specification, including scenarios and proposed modules.

- docs/reference/Original_User_Flow.pdf preserves the original visual flow and user story.

- docs/reference/Proposed_Architecture.png preserves the original target architecture image.

- docs/reference/Original_Engineering_Handoff.docx preserves the earlier combined planning document for Meta Mudhaleedu.

Those original designs include mobile-first/PWA, database, sync and other future capabilities. They are historical planning material. For the deployed implementation, use this document, docs/STATUS.md, docs/NEXT_STEPS.md, docs/ARCHITECTURE.md and TESTING.md. The root plan.md carries a release-scope notice to prevent accidental implementation of the entire original roadmap.

### How to continue with Claude Cursor or Codex

Read README.md, docs/STATUS.md, docs/NEXT_STEPS.md and TESTING.md first. Work on the first incomplete next step only. Keep the desktop UI minimal. Preserve the nine mandatory temples, completed-stop history, explicit fallback labels and nightly return constraints. Add tests for changed planner behavior, run type checking and the Vercel build, inspect the desktop flow, then describe what changed and what remains unverified. Do not add autonomous runtime agents, account systems or a database without a feature that needs them.

Release record: Vercel deployment dpl_CmY9nurgTtR8RX2SFBfHe5NzU7nW completed on 28 September 2026 from application commit c01dfbd6688d6df9e1ea3cfcea15dc0e7012fa90. This documentation update does not change application behavior.

