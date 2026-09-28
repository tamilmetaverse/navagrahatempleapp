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
