# CURRENT

## Status

V0 vertical slice implemented locally with Vite + React + TypeScript.

### Implemented

- Chapter 01: observe shots, predict four outcomes, build a manual distance threshold, see errors.
- Chapter 02: browser-side logistic model using distance, probability curve, human/model comparison, first definition of "model".
- Chapter 03: same-distance/different-angle reveal, distance vs distance+angle, feature-selection exercise, end-of-V0 mental model.
- Chapter navigation and locking.
- Progress and manual threshold persisted in `localStorage`.
- Responsive layout.
- Offline StatsBomb event converter.

### Data

V0 currently uses pedagogical seed fixtures in `src/data/shots.ts`.

Next data task: select a stable open StatsBomb competition/match sample, run `scripts/prepare-shots.py`, review the derived shot distribution, and curate a learner-safe slice without changing the conceptual sequence.

## Next product gate

Have a true zero-ML learner play V0 without prior explanation. Evaluate:

- Were any steps confusing before the term was introduced?
- Did the learner understand prediction vs certainty?
- Did the learner understand human-authored rule vs learned model?
- Did "feature" make sense after the angle interaction?
- Could the learner restate the final loop in their own words?

Only then shape Chapter 04 (train/test).

## Validation note — current execution environment

- `git diff --check`: passed.
- App TypeScript was semantically checked with temporary React type stubs because package installation is unavailable in the current execution environment: passed.
- `scripts/prepare-shots.py` was smoke-tested against a minimal StatsBomb-shaped event file: passed.
- `npm install` timed out because the runtime could not reach the npm registry, so `npm run typecheck` and `npm run build` with the real React/Vite packages remain to be run in a networked environment before calling V0 build-validated.
