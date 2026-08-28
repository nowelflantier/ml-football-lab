# CURRENT

## Status

Cycle 1 is implemented locally with Vite + React + TypeScript.

### Implemented

- Chapter 01: observe shots, predict outcomes, build a manual distance threshold, see errors.
- Chapter 02: browser-side logistic model using distance, probability curve, human/model comparison.
- Chapter 03: same-distance/different-angle reveal, distance vs distance+angle, feature-selection exercise.
- Chapter 04: true train/test evaluation, deterministic stratified reshuffles, in-browser retraining, generalisation.
- Chapter 05: probability-as-frequency intuition, xG connection, probability summation exercise.
- Chapter 06: 1-NN overfitting demonstration plus post-shot leakage trap.
- Chapter 07: logistic vs k-NN comparison, per-shot predictions, live k hyperparameter experiment.
- Progressive `Sous le capot` technical disclosures from Chapter 04 onward.
- Chapter navigation and locking through 7 chapters.
- V0 progress migration preserved from `ml-football-lab-progress-v0` to V1 storage.
- Responsive layout.
- Offline StatsBomb event converter.

## Runtime ML boundary

The current educational experiments intentionally run directly in the browser:

- logistic regression implemented in TypeScript;
- deterministic train/test splitting;
- k-nearest-neighbours implemented in TypeScript;
- evaluation recalculated on interaction.

This is sufficient for educational datasets in the hundreds or low thousands of observations. A Python/backend path should only be introduced when data volume, model complexity, or reproducibility requirements justify it.

## Data

The current app still uses pedagogical seed fixtures in `src/data/shots.ts`.

Next data gate:
1. select a stable open StatsBomb competition/match sample;
2. run `scripts/prepare-shots.py`;
3. inspect class balance and shot geometry distributions;
4. curate a learner-safe real-data slice;
5. verify that the conceptual reveals still work before replacing the seed.

Do not silently present the current seed as real StatsBomb observations.

## Next product gate

Play through Chapters 04–07 as a zero-ML learner and capture where technical detail feels either too early or too magical.

Key questions:
- Does the train/test trap land before the vocabulary is revealed?
- Does repeated reshuffling make evaluation variance intuitive?
- Does the xG chapter distinguish probability from deterministic outcome?
- Are overfitting and leakage clearly different failure modes?
- Does changing k feel like a meaningful first hyperparameter rather than a random slider?
- Are `Sous le capot` sections enough technical depth without breaking the main flow?

## Validation status

Pending fresh validation after Chapters 04–07:
- real React/Vite `npm run typecheck`;
- real React/Vite `npm run build`;
- browser playthrough of all seven chapters.
