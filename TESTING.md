# Validation — 28 September 2026

Passed:
- TypeScript no-emit check.
- Eight planner regression tests in tests/planner.test.ts.
- Fetched 12-location OSRM matrix, checked finite durations and complete two-day route.
- Desktop browser: map tiles and all nine selectable pins render.
- Default plan generation, day switching, temple detail/contact links.
- Sequential stop completion and +90 minute replan preserve completed prefix.
- Saved itinerary restored after browser refresh (including completion state).

Constraints:
- Map locations are approximate; entrance accuracy requires local verification.
- Published opening hours are provisional; festival and ritual exceptions are not implemented.
- Preview server could not consistently fetch routing; dated OSRM road matrix fallback is included. Geometry uses a labeled connection line when unavailable.
- Mobile is not acceptance-tested in this desktop-first release.
- Browser console contained extension-origin metadata errors; no application-origin exception was observed in the inspected log sample.

## Vercel release verification

28 September 2026, application commit `c01dfbd6688d6df9e1ea3cfcea15dc0e7012fa90`, deployment `dpl_CmY9nurgTtR8RX2SFBfHe5NzU7nW`.

- `pnpm run build:vercel` passed locally using Next.js webpack; Vercel hosted compilation and TypeScript checks also passed.
- Public application opened at https://navagrahatempleapp.vercel.app/.
- Default two-day Kumbakonam plan scheduled 9/9 temples, with a 6 h 5 m drive estimate.
- Live map and road geometry rendered; day switching and local completion restoration after refresh were observed.
- Inspected console errors were extension-origin; no application-origin exception was observed in that sample.

No mobile, field, load, independent security or comprehensive outage validation is claimed. This documentation-only update does not change application behavior.
