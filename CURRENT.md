# CURRENT

## Status

The learning path now runs through Chapter 16 on branch `codex/cycles-2-3-workshop`.

Main currently contains Chapters 01–10. The new branch finishes Cycle 2 and adds a full Cycle 3 Model Workshop.

## Implemented learning staircase

### Cycle 1 — 01–07

- prediction and manual rules;
- first logistic model;
- features;
- train/test;
- probability / xG intuition;
- overfitting and leakage;
- first mini-lab comparing logistic and k-NN.

### Cycle 2 — 08–12

- 08: baseline, class imbalance, error types and threshold tradeoffs on real StatsBomb data;
- 09: exact raw StatsBomb excerpt → model-ready row, provenance and derived features;
- 10: feature engineering and one-feature-at-a-time ablation;
- 11: learner-configurable calibration lab with reliability buckets and Brier score;
- 12: learner-configurable cross-validation with 3/5/7 folds and score variability.

### Cycle 3 — 13–16

- 13: real browser-side decision tree with editable depth / minimum samples / feature set;
- 14: explicit train / validation / test tuning workflow;
- 15: open Model Workshop with logistic / k-NN / tree, features, hyperparameters, threshold, folds, run history and direction signals relative to a fixed baseline;
- 16: final xG baseline challenge with three entire matches held out from development, candidate freeze, final reveal and comparison to both the simple baseline and StatsBomb xG reference.

## Pedagogical mode

The original concept-first sequence remains useful for Chapters 01–10, but the user playtests showed that QCM-style interactions were not enough.

From Chapter 11 onward the dominant loop is now:

**question → configure → run → inspect result → change one thing → rerun → compare history → keep/reject → explain**

There should be no hidden correct configuration in the Model Workshop. Direction signals are always relative to an explicit baseline and can report mixed tradeoffs.

## Runtime ML

All current experiments execute in the browser on 297 sourced StatsBomb shots:

- logistic regression;
- k-nearest-neighbours;
- decision tree;
- threshold metrics / confusion matrix;
- Brier score;
- calibration buckets;
- stratified cross-validation;
- train / validation / test splitting;
- match-level holdout.

Python remains an offline data-preparation layer only.

## Data

Real-data source:
- StatsBomb Open Data;
- 1. Bundesliga 2023/24;
- `competition_id = 9`;
- `season_id = 281`;
- 297 shots embedded from 10 matches.

The generated dataset preserves selected exact upstream fields for the raw-data lesson and a reference StatsBomb xG value.

`statsbomb_xg_reference` must never be used as a feature for our own xG model. It is only revealed as an external benchmark after the final holdout.

## Build / CI

Permanent CI on `main` runs:
- real dependency installation;
- `npm run build` (`tsc -b && vite build`);
- Python syntax checks.

The next gate for this branch is CI + Vercel preview on Chapters 11–16 before merge.

## Next pedagogical gate

Playtest Chapters 11–16 without restarting earlier chapters.

Questions to answer:
- Does Chapter 11 finally feel like experimentation rather than a quiz?
- Is cross-validation understandable when manipulated repeatedly?
- Does tree depth make model complexity tangible?
- Does validation-vs-test tuning feel practically useful?
- Does the Chapter 15 workbench provide enough feedback to form a direction without dictating a solution?
- Does the Chapter 16 holdout feel like a meaningful mini-project?

## After Cycle 3

Do not automatically add another tutorial cycle. The likely next direction is a less guided Cycle 4:
- error analysis;
- model interpretation;
- full-match xG output;
- open football questions and analysis tasks.
