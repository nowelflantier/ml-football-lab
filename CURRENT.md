# CURRENT

## Status

A full pedagogy audit is in progress on branch `refactor/pedagogy-global-pass` after repeated beginner playtests showed that the app was locally interactive but globally introducing technical controls too early.

The audit is documented in `docs/pedagogy-audit-2026-08-28.md`.

## Product structure after the audit

The app now distinguishes three levels instead of presenting 20 chapters as one mandatory syllabus.

### Guided beginner path — Chapters 01–12

#### 01–06 · Understand a prediction
- 01: observations, manual predictions and a distance rule;
- 02: examples → learned relation → model;
- 03: missing information → angle → feature;
- 04: known examples vs unseen test → generalisation;
- 05: probability and xG;
- 06: three concrete model mechanisms before technical names:
  - smooth global trend → logistic regression;
  - similar past cases → k-NN;
  - learned if/then rules → decision tree.

#### 07–12 · Trust the experiment
- 07: overfitting using only the already-understood neighbour method;
- 08: naive baseline, class imbalance, threshold and plain-language error types;
- 09: exact StatsBomb raw data → model-ready row and preprocessing;
- 10: feature experiments shown as counts first, then the data-leakage trap;
- 11: calibration with one fixed model and a weather-forecast analogy;
- 12: cross-validation with one fixed model and only fold count manipulable.

### Optional advanced practice — Chapters 13–16

`Model Workshop` is explicitly an advanced lab, not part of the beginner mental-model staircase.

- decision-tree capacity;
- validation-based tuning;
- open model workbench;
- untouched match-level holdout.

### Optional application — Chapters 17–20

`Football Analyst Mode` is open practice rather than another tutorial cycle.

- error analysis;
- what-if / sensitivity analysis;
- match xG builder;
- analyst dashboard.

## Pedagogical contract

Every new beginner concept should follow:

**concrete situation → learner prediction → manipulate one thing → visible consequence → second attempt → explanation → technical name → optional depth**

Hard invariants:
- no model-family name before its mechanism is shown;
- no metric without a plain-language interpretation or numerator / denominator;
- every percentage must say what population it describes;
- one conceptual variable per teaching experiment;
- no tuning control before its effect has been taught;
- QCM can force a prediction, but cannot be the primary learning mechanism;
- model probabilities are always framed as estimates produced by a model, never as physical truth.

## Navigation / UX

Desktop remains a fixed-height app with independent sidebar / visual / lesson scrolling.

The navigation now:
- shows progress against the 12-chapter guided path until Chapter 12 is complete;
- hides individual advanced chapters until their section is unlocked;
- presents Model Workshop and Football Analyst as optional post-guided sections.

## Runtime ML

All experiments still execute client-side on 297 StatsBomb Open Data shots from 10 Bundesliga 2023/24 matches:
- logistic regression;
- k-nearest-neighbours;
- decision tree;
- threshold metrics / confusion matrix;
- Brier / calibration buckets;
- stratified cross-validation;
- train / validation / test;
- match holdout;
- leave-one-match-out match xG.

Python remains offline data preparation only.

## Data safety

`statsbomb_xg_reference` remains benchmark-only and must never be used as an input feature for our own model.

## Build / CI

Permanent CI on `main` runs:
- real dependency installation;
- `npm run build` (`tsc -b && vite build`);
- Python syntax checks.

The current branch must pass CI and Vercel preview before merge.

## Next gate

Do not extend the chapter count.

First validate the audited path as a learning tool, especially Chapters 06–12:
- can the learner explain the three model mechanisms without relying on names?
- does overfitting become obvious after the k=1 self-neighbour example?
- are Chapter 10 percentages now unambiguous as whole-model test performance?
- does calibration make `0–20%` immediately readable?
- does Chapter 12 teach cross-validation without becoming a tuning workbench?

Only after those answers are positive should work continue on new ML topics.
