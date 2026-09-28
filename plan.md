# Navagraha Interactive Map — Build Plan

## 1. Overview

Build a Tamil-first, mobile-first pilgrimage planner for the nine Navagraha temples in the Cauvery delta and Thirunallar. A pilgrim enters trip dates, origin, end point, available days, pace, ritual commitments, and optional stops. The app returns a feasible, editable itinerary with a map, arrival and departure estimates, temple opening windows, breaks, and practical guidance. During the trip, the pilgrim marks stops complete and replans the remainder from the current time and location.

The nine core temples are mandatory in a complete circuit. Their visiting order is flexible unless the user explicitly locks an order or ritual. Uppiliappan, Swamimalai, and other places are optional. If the constraints cannot accommodate all nine, explain the conflict and suggest the smallest useful changes; never quietly omit a mandatory temple.

### Initial reference and data caution

Use `Navagraha_Temple_Pilgrimage_Guide_2026(1).pdf` as a **seed reference**, not a source of guaranteed current opening hours. It includes nine temple profiles, phone numbers, schedules, rituals, and source notes (prepared 28 September 2026). Its reported TNSTC one-day order is Thingalur → Alangudi → Thirunageswaram → Suryanar Kovil → Kanjanur → Vaitheeswarankoil → Keezhaperumpallam → Thiruvenkadu → Thirunallar. Keep this as a benchmark itinerary, not a fixed religious order or proof that every date is feasible. The guide flags uncertainty around Suryanar Kovil and Kanjanur hours and special-day changes. Preserve those warnings in the app.

### Target user flow

1. Open the map and inspect the nine temple pins.
2. Select `Plan trip`; enter start and end points, trip dates, 1–3 days, vehicle, daily start/end times, pace, and accessibility needs.
3. Choose `basic darshan` or `ritual-focused`; optionally lock temple/time commitments and add ranked optional shrines.
4. Receive day-by-day cards beside the route map. Each card shows drive time, arrival, opening status, estimated visit time, departure, confidence, temple contact, and navigation link.
5. Edit a stop or break, regenerate, and save/share the trip URL.
6. On the road, mark a stop completed or enter an actual delay; replan unfinished stops without losing completed history.

## 2. Build strategy and non-goals

Create a working vertical slice immediately: **nine seeded temples → trip form → constrained itinerary → map/timeline → replan**. Start with a Kumbakonam-origin, two-day, private-car scenario, then generalize inputs. Use mock road durations only for the first local UI smoke test; production itinerary calculations must use a road-routing provider and clearly identify stale/fallback estimates.

For one party and one vehicle, model a time-window-constrained itinerary (TSP with time windows and multi-day breaks). Do not build a fleet VRPTW system. Do not make crowd prediction, paid bookings, astronomy, user accounts, ads, or a full native app prerequisites for launch. Keep interfaces ready to add them later. Do not claim live queues or confirmed pooja slots without a real source.

## 3. Recommended stack and repository

- **Web:** Next.js App Router, TypeScript, Tailwind CSS, responsive PWA, Tamil and English translation dictionaries. MapLibre GL JS for the map UI with a properly licensed tile provider. Use OpenStreetMap data according to its license and attribution rules. The route/polyline provider is configurable.
- **API and planner:** Next.js server routes for MVP; a separate Python FastAPI + OR-Tools service only if the constraint model outgrows the TypeScript implementation. With nine fixed stops, an exact or bounded-search TypeScript solver is practical and avoids a second runtime. Keep `RouteSolver` and `TravelTimeProvider` interfaces so the implementation can change.
- **Database:** PostgreSQL with PostGIS for temples, entrances, nearby facilities, schedules, and optional POIs. Prisma or Drizzle migrations. SQLite or in-memory seeded data may be used for the first local slice if PostgreSQL setup blocks progress, but retain the canonical schema.
- **Road data:** Provider adapter for route matrix and polylines (for example Google Routes or another licensed routing API). Call from the server, cache permitted results under provider terms, and keep API keys server-side. Do not mix Google route content with an incompatible map display or storage arrangement; check the chosen provider terms before implementation.
- **State:** URL/shareable trip identifier plus local IndexedDB cache for saved itinerary and completion events. Anonymous trips first; optional accounts later.

Suggested structure:

```text
app/[locale]/page.tsx                 map and landing
app/[locale]/plan/page.tsx            trip input
app/[locale]/trip/[id]/page.tsx       map and itinerary
app/api/plan/route.ts                 create itinerary
app/api/trips/[id]/route.ts           read/update trip
app/api/trips/[id]/replan/route.ts    recalculate unfinished stops
components/map/                       pins, route, layers
components/itinerary/                 day and stop cards
components/forms/                     inputs and validation
lib/planner/                           solver, scoring, explanation
lib/routing/                           provider adapters and cache
lib/schedules/                         recurring hours and exceptions
lib/i18n/                              ta/en dictionaries
db/schema/                             SQL migrations
db/seed/                               sourced temple records
tests/                                 routing and acceptance fixtures
```

## 4. Data model

Use stable UUIDs internally, with `slug` and external provider place IDs as separate fields. All times are stored with `Asia/Kolkata` interpretation. Store local calendar dates and local opening intervals explicitly; convert to instants when generating a trip. Support intervals crossing a date boundary even if none of the seed temples uses one.

| Entity | Required fields | Notes |
|---|---|---|
| `Temple` | id, slug, graha, Tamil/English names, description, district, address, location point, mandatory, contact | Nine core rows; distinguish main deity and graha shrine. |
| `AccessPoint` | id, temple_id, type (`entrance`, `parking`, `dropoff`), point, directions_note, verified_at | Route vehicles to a verified access point, not automatically to the temple centroid. Unknown points remain visibly unverified. |
| `OpeningRule` | id, temple_id, weekdays, start_local, end_local, effective dates, source_id, confidence | Multiple morning/evening intervals; weekday differences. |
| `ScheduleException` | id, temple_id, local_date, override intervals/closed/unknown, reason, source_id, verified_at | Overrides recurring schedule; unknown must not be treated as open. |
| `RitualOffering` | id, temple_id, name, expected duration range, schedule rule, booking note, source_id | Only use as a hard time anchor when a user confirms a slot. |
| `Place` | id, category, names, point, opening rules, dietary/accessibility tags, optional | Optional shrines, restaurants, toilets, clinics, fuel, rest stops. |
| `Facility` | id, place/temple_id, type, coordinates, accessibility attributes, verification status/date, source_id | No unsupported wheelchair/toilet assurances. |
| `Source` | id, title, URL/phone, source_type, checked_at, reliability, notes | Field-level provenance for schedules and claims. |
| `Trip` | id, dates, origin/end coordinates, day settings, vehicle, pace, preferences, created_at, version | Share token separate from id if public sharing is enabled. |
| `TripStop` | id, trip_id, place_id, day, order, ETA, ETD, estimated duration, status, locked window | Preserve planned and actual timestamps separately. |
| `VisitEvent` | id, trip_stop_id, type, actual_time, device_event_id | Idempotent completion/delay events for offline sync. |
| `TravelLeg` | origin, destination, departure bucket, duration, distance, polyline, provider, fetched_at | Cache only according to provider terms; reflect uncertainty. |

Seed the guide's nine temples and its source register. Mark secondary schedules as `provisional`. Do not fabricate coordinates, entrance locations, facility claims, queue durations, or restaurant recommendations. If exact coordinates are unavailable, begin with clearly labeled approximate temple points and disable precise arrival guidance until verified.

## 5. Detailed modules

### M1 — Temple data and editorial admin

Implement typed seed imports, migrations, and a small protected admin page or seed file workflow to correct records. Each visible operational claim should carry a source and last checked date. Add validation for duplicate grahas, missing mandatory temples, invalid coordinates, overlapping schedule exceptions, and broken source links. Search by Tamil/English name, graha, and district.

**Done when:** all nine core temples load; source and uncertainty labels appear on details; a corrected schedule can be published without a code rewrite.

### M2 — Map and spatial experience

Show nine distinguishable graha markers, clustering only for optional places at low zoom, a selected-day route polyline, current stop, entrances/parking where verified, and fit-to-route controls. Marker selection opens a temple card. Provide accessible list navigation when map gestures are difficult. Include attribution and a clear handoff link for turn-by-turn navigation.

**Done when:** the map and timeline select the same stop; each marker opens its details; route lines and pins remain usable on a narrow phone screen.

### M3 — Trip setup and constraints

Form inputs: start/end locations, start date, 1–3 days, daily earliest departure/latest finish, private car initially, normal/relaxed/express pace, number of travellers, senior/walking/rest constraints, meal windows, nine mandatory temples, optional POIs with priorities, and fixed ritual commitments. Validate inputs client- and server-side. Provide sensible editable visit-duration and buffer presets; label these as assumptions until field-tested.

**Done when:** user can submit a two-day Kumbakonam trip without an account and review every assumption before generation.

### M4 — Hours, rituals, and calendar rules

Compute effective opening intervals by date from recurring rules and exceptions. Respect midday closures, holidays, and special unknown status. For a ritual, represent `confirmed_slot`, `preferred_window`, and `informational` separately. Compute Rahu Kalam only after choosing and documenting the authoritative sunrise/sunset method; never infer a guaranteed abhishekam booking from it. Initially allow manually entered fixed windows and display published ritual notes.

**Done when:** a planned visit never starts in a known closure; an unverified special-day schedule triggers a warning; a locked ritual window remains fixed through replanning.

### M5 — Routing and itinerary solver

Define `TravelTimeProvider.getMatrix(points, departureDateTime)` and `getRoute(orderedPoints)`; persist provider identity and retrieval time. Solver inputs are travel-time matrix, daily bounds, opening intervals, visit-duration estimates, meal/rest blocks, mandatory stops, optional stop scores, locked stops, and origin/end points. Find feasible schedules across 1–3 days; optimize lexicographically: (1) visit all nine and obey hard constraints, (2) minimize overtime/fragility, (3) minimize driving and waiting, (4) include high-priority optional stops. A small search/branch-and-bound or OR-Tools implementation is acceptable; isolate scoring and explain the selected route. Cluster geographically only as a search heuristic, never as a rule that prevents a better feasible route.

If no complete itinerary exists, return structured reasons (for example `TEMPLE_CLOSED`, `RITUAL_CONFLICT`, `DAY_TOO_SHORT`) and concrete options such as add a day, shift departure, remove an optional stop, or relax a preferred time. Include slack/buffer per stop and never promise exact queue times.

**Done when:** solver visits each mandatory temple exactly once, obeys windows and day bounds, supports multi-day overnight reset, and explains infeasible inputs.

### M6 — Itinerary UI and trip editing

Show day headers with start/end, driving/visiting/waiting/break totals; stop cards with estimated arrival/departure, hours, source confidence, visit purpose, and navigation/contact links. Allow manual reorder or lock a stop, then rerun feasibility checks. Show changes between old and new plan. Save a shareable read-only link; avoid exposing traveller location history by default.

**Done when:** a pilgrim can tell what happens next without interpreting the map and can see the reason a manual edit fails.

### M7 — Live progress, offline cache, and sync

Cache the trip shell, temple profiles, and last itinerary in the PWA. Queue idempotent visit events locally when offline, sync on reconnect, and resolve conflicting edits by trip version plus event timestamps/device IDs. `Replan from here` freezes completed stops and confirmed future commitments, takes current time/location and updated durations, then recalculates remaining stops. Clearly show when travel information is old or live routing is unavailable.

**Done when:** mark-complete works offline and survives refresh; reconnect does not duplicate events; replanning preserves completed stops.

### M8 — Facilities and accessibility

Support category filters for toilets, accessible toilets, parking, vegetarian food, water, pharmacies, clinics, and fuel. Store exact point, hours, features, verification time, and source. Show `unverified` rather than implying suitability. For a family with walking limits, add transfer and rest buffers and prioritize verified drop-off/parking information. Emergency links use phone dialing and map navigation; no unsupported medical triage.

**Done when:** facility records can be updated independently and users can filter for verified accessibility attributes.

### M9 — History and devotional content

Provide concise Tamil and English temple stories, historical context with citations, and separate labels for documented history versus tradition. Add an optional history layer for the map, suitable for children, without interrupting trip navigation. Keep temple-specific worship guidance subject to local priest and temple-office instructions.

**Done when:** each temple has a readable profile with explicit source notes and no unsourced historical claims.

### M10 — Later analytics and monetization hooks

Collect optional anonymous actual arrival, queue, and visit durations after consent. Only show crowd estimates after enough observations for the particular temple/day/time and label sample size and uncertainty. Keep ads away from navigation and emergency actions. Do not implement payments until the free core planner proves useful.

## 6. API contracts

Implement schema validation (for example Zod), consistent JSON errors, and versioned request/response types.

```text
GET  /api/temples?locale=ta
GET  /api/temples/:slug
GET  /api/places?bbox=...&category=...&verified=true
POST /api/plan       -> { trip, itinerary, warnings, assumptions }
GET  /api/trips/:id  -> saved itinerary and version
PATCH /api/trips/:id -> edited preferences/locks with expectedVersion
POST /api/trips/:id/events -> idempotent progress event
POST /api/trips/:id/replan -> updated itinerary, delta, warnings
```

`POST /api/plan` should return `422` with a structured infeasibility result, not a generic server failure. Do not serialize provider secrets or private user coordinates into public share metadata.

## 7. Exact coding-agent execution order

1. Inspect the repo and package manager. If empty, scaffold the stack above. Add README setup, `.env.example`, lint/typecheck scripts, and a single local start command.
2. Create schema, source-aware seed data for nine temples, and validation. Extract information from the attached PDF manually or via text extraction, reviewing the result. Do not scrape a map provider or silently invent operational details.
3. Implement temple list/details and responsive map with seeded approximate pins clearly labeled where appropriate. Verify the Tamil font, translations, and mobile layout.
4. Implement trip setup with a default Kumbakonam two-day fixture. Build the schedule evaluator and unit tests for closures, weekday differences, exceptions, and timezone handling.
5. Implement routing provider interface and local deterministic fixture matrix. Implement solver against that matrix, plus infeasibility explanations. Replace fixture matrix with a configured licensed road provider for real trips; handle rate limits, errors, and staleness.
6. Render itinerary timeline and route polyline. Add edit/lock, regenerate, and navigation handoff.
7. Persist anonymous trips and add event-based progress and replan. Add minimal PWA cache with honest offline/stale labels.
8. Add facility records only after verified entries exist. Add history content and optional shrines separately from the core planner.
9. Run the acceptance scenarios below, fix issues, and provide a short README describing configuration, source provenance, unsupported features, and how to update temple data.

At each step, keep the application runnable; do not wait to finish all modules before showing a usable map and itinerary.

## 8. Acceptance scenarios and checks

1. **Default:** Kumbakonam origin, two days, normal pace, basic darshan. Nine unique core temples appear across days; route includes lunch and honors published opening windows.
2. **One-day express:** Attempt all nine; if infeasible under selected start/end times or uncertain hours, show the reason and suggested adjustment. Do not silently drop stops.
3. **Ritual anchor:** Lock Thirunageswaram into a user-confirmed window; other stops move around it or a conflict is reported.
4. **Senior pace:** Longer visit and rest buffers change the plan, potentially requiring another day.
5. **Midday closure:** Arrival during a closed interval causes waiting or a different order; the UI displays the gap.
6. **Unknown special day:** Missing verified hours shows a confirmation warning rather than treating normal hours as certain.
7. **Delay:** Mark three temples completed and add a 90-minute delay. Replanning retains completed history and recalculates only unfinished visits.
8. **Offline:** A saved itinerary and temple contact information remain visible; completion events sync once after reconnect.
9. **Map correctness:** Each driving destination is a verified entrance/parking point where one exists, and approximate points are labeled.
10. **Language/accessibility:** Core flow works in Tamil and English, on a phone, with keyboard and screen-reader labels.

Test the schedule and solver with deterministic fixtures. Smoke-test the complete flow in a browser. For field validation, compare predicted versus actual arrival, darshan, and departure times and correct the visit-duration assumptions before claiming the planner is reliable.

## 9. Definition of the first shippable version

The first release is ready when a user can enter a one- or two-day private-car trip, receive and edit a source-aware nine-temple itinerary, open every stop on a map, see uncertain hours, save it, and replan after a delay. All nine mandatory temples must be accounted for, and infeasible trips must have intelligible explanations. Queue estimates, special booking, and astronomy can follow after their data and rules are validated.

## 10. Prompt to hand to Claude, Cursor, or Codex

> Build the application described in `plan.md`. Start by inspecting the repository. Implement the smallest runnable vertical slice first: nine sourced temple records, Tamil-first map, default Kumbakonam two-day trip form, time-window-aware itinerary, and timeline. Use the PDF as seed reference while preserving its uncertainty notes. Follow the module order and acceptance scenarios in the plan. Keep the app runnable after each step, run typecheck and focused tests, and report the commands, environment variables, implemented features, and remaining unverified data. Do not fabricate live temple hours, verified entrance pins, queue data, or ritual bookings.
