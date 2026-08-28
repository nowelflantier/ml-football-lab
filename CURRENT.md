# CURRENT

## Status

Cycle 1 is implemented on `main` with Vite + React + TypeScript. A practice-first revision of Chapters 04–07 is currently in PR #3 after the first live playtest found the conceptual sequence clear but too demonstration-heavy.

### Stable foundation

- Chapter 01: observe shots, predict outcomes, build a manual distance threshold, see errors.
- Chapter 02: browser-side logistic model using distance, probability curve, human/model comparison.
- Chapter 03: same-distance/different-angle reveal, distance vs distance+angle, feature-selection exercise.
- Chapter navigation and locking through 7 chapters.
- V0 progress migration preserved from `ml-football-lab-progress-v0` to V1 storage.
- Responsive layout.

### Practice-first revision in PR #3

- Chapter 04: learner chooses the test ratio and must run at least three real retraining/evaluation experiments; score variation is experienced rather than merely explained.
- Chapter 05: learner estimates four shot probabilities with sliders before model probabilities are revealed, then derives total xG.
- Chapter 06: learner searches k values to create a perfect train score, then discovers overfitting on test; learner also builds feature sets until a post-shot leakage feature creates the suspicious score jump.
- Chapter 07: mini-lab with model family, feature selection, k, decision threshold, explicit train/test runs, run history and live false-positive / false-negative inspection.
- `practice.css` isolates the new interaction styles from the validated base UI.

## Pedagogical rule after first playtest

The learning loop is now:

**question → learner prediction → manipulation → result → second attempt → explanation → vocabulary → optional technical reveal**

From Chapter 04 onward, a technical concept should normally be something the learner has just manipulated, not something shown in a static explanation.

## Runtime ML boundary

The current educational experiments intentionally run directly in the browser:

- logistic regression implemented in TypeScript;
- deterministic train/test splitting;
- k-nearest-neighbours implemented in TypeScript;
- confusion matrix / threshold evaluation;
- evaluation recalculated on interaction.

This is sufficient for educational datasets in the hundreds or low thousands of observations. A Python/backend path should only be introduced when data volume, model complexity or reproducibility requirements justify it.

## Build status

A malformed `tsconfig.node.json` originally blocked Vercel with `TS1005: '}' expected`.

Fixed on `main` in commit `d5e6161`. A full Linux/Node 24 build then passed with real dependencies.

Permanent CI is now merged on `main` and runs the real app build plus Python syntax checks on PRs.

## Data

The current app still uses pedagogical seed fixtures in `src/data/shots.ts`.

Cycle 2 has a prepared real-data source:
- StatsBomb Open Data;
- 1. Bundesliga;
- season 2023/2024;
- `competition_id = 9`;
- `season_id = 281`.

A reproducible offline downloader reads the upstream match index, and `prepare-shots.py` preserves richer prediction-time fields plus provenance.

Real-data smoke test completed successfully on match `3895292`:
- 29 shots extracted;
- 1 goal;
- geometry, body part, shot type, pressure/context and StatsBomb xG reference parsed.

`statsbomb_xg_reference` is reference-only and must never be used as a training feature for our own xG model.

## Cycle 2 shaping

Detailed plan lives in `docs/cycle-2.md`.

Planned staircase:
- 08: baseline, class imbalance, confusion matrix, false-positive / false-negative intuition;
- 09: reveal real StatsBomb raw data and preprocessing;
- 10: richer feature engineering and ablation;
- 11: probability calibration;
- 12: cross-validation and evaluation stability.

Do not implement 08–12 until the practice-first Chapters 04–07 are playtested. The next gate is now whether the learner feels they are genuinely running experiments rather than watching demonstrations.
