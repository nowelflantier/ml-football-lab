# CURRENT

## Status

Cycle 1 is implemented and merged on `main` with Vite + React + TypeScript.

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

## Runtime ML boundary

The current educational experiments intentionally run directly in the browser:

- logistic regression implemented in TypeScript;
- deterministic train/test splitting;
- k-nearest-neighbours implemented in TypeScript;
- evaluation recalculated on interaction.

This is sufficient for educational datasets in the hundreds or low thousands of observations. A Python/backend path should only be introduced when data volume, model complexity, or reproducibility requirements justify it.

## Build status

A malformed `tsconfig.node.json` originally blocked Vercel with `TS1005: '}' expected`.

Fixed on `main` in commit `d5e6161`.

After the fix, a full Linux/Node 24 build was reproduced successfully with real dependencies:
- `npm install`;
- `tsc -b`;
- `vite build`.

A permanent CI workflow is being added with the Cycle 2 shaping branch so future PRs verify the app build and Python script syntax before merge.

## Data

The current app still uses pedagogical seed fixtures in `src/data/shots.ts`.

Cycle 2 shaping has now selected a stable real-data source:
- StatsBomb Open Data;
- 1. Bundesliga;
- season 2023/2024;
- `competition_id = 9`;
- `season_id = 281`.

A reproducible offline downloader now reads the upstream match index instead of hard-coding match IDs, and `prepare-shots.py` preserves richer prediction-time fields plus provenance.

Real-data smoke test completed successfully on match `3895292`:
- 29 shots extracted;
- 1 goal;
- geometry, body part, shot type, pressure/context and StatsBomb xG reference all parsed.

`statsbomb_xg_reference` is reference-only and must never be used as a training feature for our own xG model.

## Cycle 2 shaping

Detailed plan lives in `docs/cycle-2.md`.

Planned staircase:
- 08: baseline, class imbalance, confusion matrix, false-positive / false-negative intuition;
- 09: reveal real StatsBomb raw data and preprocessing;
- 10: richer feature engineering and ablation;
- 11: probability calibration;
- 12: cross-validation and evaluation stability.

Do not implement 08–12 blindly until the Chapter 04–07 playtest confirms the current pacing.

## Next product gate

Play through Chapters 04–07 as a zero-ML learner and capture where technical detail feels either too early or too magical.

Key questions:
- Does the train/test trap land before the vocabulary is revealed?
- Does repeated reshuffling make evaluation variance intuitive?
- Does the xG chapter distinguish probability from deterministic outcome?
- Are overfitting and leakage clearly different failure modes?
- Does changing k feel like a meaningful first hyperparameter rather than a random slider?
- Are `Sous le capot` sections enough technical depth without breaking the main flow?
