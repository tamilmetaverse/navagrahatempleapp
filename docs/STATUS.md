# Current release status

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



See [full handoff](handoff/Project_Handoff.md), [architecture](ARCHITECTURE.md), [next steps](NEXT_STEPS.md), and [validation](../TESTING.md).
