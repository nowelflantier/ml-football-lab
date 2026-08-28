# CURRENT

## Status

The guided pedagogy audit is merged on `main`. A follow-up advanced-flow friction pass is now in progress on branch `fix/advanced-flow-friction` after the learner became blocked in Chapter 19 and reported that too many post-guided interactions behaved like mandatory QA chores.

## Product structure

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

`Model Workshop` is advanced practice, not part of the beginner staircase.

Current friction-pass rule:
- one meaningful run is enough to continue;
- extra model families / depths / feature sets are optional challenges;
- no quotas exist purely to unlock the next screen.

### Optional application — Chapters 17–20

`Football Analyst Mode` is open practice.

The friction pass changes these chapters so their core question works with a sensible default model:
- 17: generate and inspect model errors; model controls are optional;
- 18: one what-if perturbation is enough to continue;
- 19: choose one real match, calculate its xG once, then continue; model tuning is optional;
- 20: calculate the dashboard once and explore as much or as little as useful.

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
- model probabilities are always framed as estimates produced by a model, never as physical truth;
- post-guided exploration can suggest repetition but must not hard-block on arbitrary quotas.

## Navigation / UX

Desktop remains a fixed-height app with independent sidebar / visual / lesson scrolling.

The navigation:
- shows progress against the 12-chapter guided path until Chapter 12 is complete;
- hides individual advanced chapters until their section is unlocked;
- presents Model Workshop and Football Analyst as optional post-guided sections.

## Runtime ML

All experiments execute client-side on 297 StatsBomb Open Data shots from 10 Bundesliga 2023/24 matches:
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

The current friction branch must pass CI and Vercel preview before merge.

## Next gate

Do not extend the chapter count and do not ask the learner to manually QA every interaction.

First make the existing 01–20 experience stable, non-blocking and understandable enough to use end-to-end.
