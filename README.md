# Navagraha — Meta Mudhaleedu

Desktop-first working v1 for nine-temple pilgrimage planning.

**Live app:** https://navagrahatempleapp.vercel.app/

**Documentation:** [Project handoff and source documents](docs/README.md) · [Next steps](docs/NEXT_STEPS.md)

## Run

Use the Node engine and pnpm version specified in package.json.

For the Vercel / Next.js application:
```sh
pnpm install --frozen-lockfile
pnpm exec next dev
pnpm run build:vercel
pnpm exec next start
```

The original `pnpm dev`, `pnpm build` and `pnpm start` scripts support the Sites/Vinext runtime; they are not the Vercel build path.
`node --experimental-strip-types --test tests/planner.test.ts`
`pnpm exec tsc --noEmit`

## Scope

Interactive Leaflet/OpenStreetMap map, 1–3 day car itineraries, three origin towns, opening windows, pace, lunch, daily return, Tamil core controls, sequential completion, +90 minute replanning, browser-local save and text export.

No accounts, payments, queue predictions, ritual bookings or cloud sync. Basic darshan only. Persisted trips remain on this browser; refreshing restores plan and travel provenance. This is a testing release, not verified pilgrimage guidance.

## Data

Temple hours/contacts are seeded from the supplied Navagraha Temple Pilgrimage Guide dated 28 September 2026. Source links live in lib/navagraha/data.ts. Hours are provisional and festival exceptions are not yet modeled. Coordinates are approximate, not verified entrances. Thingalur and Suryanar/Ketu points were cross-checked against public map/Wikipedia-linked coordinate listings; all points require field confirmation.

## Routing

Server-side OSRM demo table and route APIs are used for this public testing release. No live traffic. Matrix times include 20% plus 5-minute leg buffers; visits include an additional 10-minute transition buffer. On network failure a dated OSRM road matrix snapshot (28 September 2026) is used. Route geometry falls back to a clearly labeled dashed connection line when unavailable. Replace demo routing with a licensed/SLA provider before public commercial use. OpenStreetMap attribution is included; no tile prefetch/offline tile caching.

The bounded beam-search planner accounts for all nine mandatory stops, midday closures, lunch, day-end return and delayed replan. It can report a partial draft if no complete route is found within its search; it does not prove global infeasibility or mathematical optimality.

## Deployment

Primary deployment: Vercel, Next.js preset, configured in `vercel.json`. The hosted release was verified on 28 September 2026 at application commit `c01dfbd6688d6df9e1ea3cfcea15dc0e7012fa90`.

An earlier Cloudflare-compatible Vinext deployment through Sites remains separate. Hosting identity for that deployment is in `.openai/hosting.json`. `plan.md` is the original longer roadmap; only the scope above is implemented.

## Validation

Eight focused planner regression tests cover complete routes, opening intervals, day-end deadlines, invalid input, weekday rules, completed prefix preservation, late return handling and bad matrices. Browser testing covers desktop map rendering, generate, temple details, day switching, progress and restore. Consult TESTING.md for actual executed results.
