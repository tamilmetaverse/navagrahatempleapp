# Navagraha — Meta Mudhaleedu

Desktop-first working v1 for nine-temple pilgrimage planning.

## Run

Node 22+, pnpm. `pnpm install`, `pnpm dev`, `pnpm build`.
`node --experimental-strip-types --test tests/planner.test.ts`
`pnpm exec tsc --noEmit`

## Scope

Interactive Leaflet/OpenStreetMap map, 1–3 day car itineraries, three origin towns, opening windows, pace, lunch, daily return, Tamil core controls, sequential completion, +90 minute replanning, browser-local save and text export.

No accounts, payments, queue predictions, ritual bookings or cloud sync. Basic darshan only. Persisted trips remain on this browser; refreshing restores plan and travel provenance. This is a testing release, not verified pilgrimage guidance.

## Data

Temple hours/contacts are seeded from the supplied Navagraha Temple Pilgrimage Guide dated 28 September 2026. Source links live in lib/navagraha/data.ts. Hours are provisional and festival exceptions are not yet modeled. Coordinates are approximate, not verified entrances. Thingalur and Suryanar/Ketu points were cross-checked against public map/Wikipedia-linked coordinate listings; all points require field confirmation.

## Routing

Server-side OSRM demo table and route APIs are used for this private prototype. No live traffic. Matrix times include 20% plus 5-minute leg buffers; visits include an additional 10-minute transition buffer. On network failure a dated OSRM road matrix snapshot (28 September 2026) is used. Route geometry falls back to a clearly labeled dashed connection line when unavailable. Replace demo routing with a licensed/SLA provider before public commercial use. OpenStreetMap attribution is included; no tile prefetch/offline tile caching.

The bounded beam-search planner accounts for all nine mandatory stops, midday closures, lunch, day-end return and delayed replan. It can report a partial draft if no complete route is found within its search; it does not prove global infeasibility or mathematical optimality.

## Deployment

Cloudflare-compatible Vinext worker through Sites. Hosting identity in .openai/hosting.json. `plan.md` is the longer roadmap; only the scope above is implemented.

## Validation

Eight focused planner regression tests cover complete routes, opening intervals, day-end deadlines, invalid input, weekday rules, completed prefix preservation, late return handling and bad matrices. Browser testing covers desktop map rendering, generate, temple details, day switching, progress and restore. Consult TESTING.md for actual executed results.
