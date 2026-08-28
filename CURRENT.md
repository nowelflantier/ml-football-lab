# CURRENT

## Status

The learning path now runs through Chapter 20 on branch `codex/cycle-4-analyst-mode`.

Main contains Chapters 01–16. This branch adds a less guided Cycle 4 focused on using the model as an analysis instrument rather than learning another isolated ML definition.

## Implemented learning staircase

### Cycle 1 — 01–07 · Understand
- prediction and manual rules;
- first logistic model;
- features;
- train/test;
- probability / xG intuition;
- overfitting and leakage;
- first mini-lab comparing logistic and k-NN.

### Cycle 2 — 08–12 · Measure
- baseline and class imbalance;
- real StatsBomb raw data and preprocessing;
- feature engineering;
- calibration and Brier score;
- configurable cross-validation.

### Cycle 3 — 13–16 · Build
- browser-side decision tree;
- validation-based hyperparameter tuning;
- open model workbench;
- match-level holdout challenge and external StatsBomb xG benchmark.

### Cycle 4 — 17–20 · Analyse
- 17: configurable model + threshold, concrete error list, error filters and shot-level inspection;
- 18: what-if / sensitivity lab comparing logistic, k-NN and tree on editable shot features;
- 19: choose a real match, train on the other nine, predict every shot, aggregate team xG and compare to goals / StatsBomb xG;
- 20: open 10-match analyst dashboard with model switching, team-match sorting by overperformance / underperformance / xG disagreement and drill-down to shots.

## Pedagogical mode

Chapters 01–10 remain concept-first.

Chapters 11–16 use the experiment loop:

**question → configure → run → inspect → change one thing → rerun → compare history → keep/reject**

Cycle 4 deliberately weakens the tutor framing again:

**build an instrument → ask a football question → surface interesting rows → inspect the underlying shots → form a new hypothesis**

There should be no hidden correct answer in Cycles 3–4.

## Runtime ML

Everything currently executes in the browser on 297 sourced StatsBomb shots across 10 matches:
- logistic regression;
- k-nearest-neighbours;
- decision tree;
- threshold metrics / confusion matrix;
- Brier score and calibration buckets;
- stratified cross-validation;
- train / validation / test split;
- match-level holdout;
- leave-one-match-out xG generation for the analyst dashboard.

Python remains offline data preparation only.

## Data

Source:
- StatsBomb Open Data;
- 1. Bundesliga 2023/24;
- competition 9 / season 281;
- 297 shots from 10 matches.

`statsbomb_xg_reference` is benchmark-only and never an input feature for our model.

## Build / CI

Permanent CI on `main` runs real dependency installation, `npm run build` and Python syntax checks.

Next gate: CI + Vercel preview for Chapters 17–20 before merge.

## Next pedagogical gate

The user should first playtest Chapters 11–20 rather than replay earlier material.

Key questions:
- Does the open Model Workshop finally feel like genuine experimentation?
- Can the learner articulate why one candidate is preferable without a hidden answer?
- Does error analysis naturally produce new hypotheses?
- Does the what-if lab make model behaviour tangible without implying causality?
- Does match-level xG feel like a real analytical output rather than another lesson artifact?
- Does the dashboard create curiosity about football questions?

## After Chapter 20

Do not automatically extend chapter count again.

Future work should be driven by concrete questions and may include:
- more matches / seasons;
- ensembles and gradient boosting;
- interpretation / feature effects;
- player and team profiles;
- clustering / similarity;
- tracking / 360 data.
