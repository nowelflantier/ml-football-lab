# Curriculum

## Cycle 1 — From intuition to evaluation

### 01 — Predict
- manual distance rule;
- prediction and error.

### 02 — Learn
- first browser-side logistic model;
- human rule vs learned relationship.

### 03 — Describe
- add angle;
- feature intuition.

### 04 — Test
- train/test;
- repeated reshuffles;
- generalisation.

### 05 — Probabilise
- probability as frequency;
- xG intuition.

### 06 — Distrust perfect scores
- overfitting;
- leakage.

### 07 — Compare
- logistic vs k-NN;
- first mini-lab;
- hyperparameter intuition.

## Cycle 2 — Make the experiment credible

Detailed shaping lives in `docs/cycle-2.md`.

### 08 — Measure
- class imbalance;
- naive baseline;
- error types and confusion matrix.

### 09 — Prepare
- real StatsBomb source data;
- raw event → model-ready row;
- provenance and preprocessing.

### 10 — Enrich
- feature engineering;
- categorical encoding;
- ablation on unseen data.

### 11 — Calibrate
- learner-configurable probability experiments;
- reliability buckets;
- Brier score;
- probability quality vs classification quality.

### 12 — Validate
- learner-configurable cross-validation;
- folds;
- mean performance and variability;
- fair comparison under a shared protocol.

## Cycle 3 — Model Workshop

Cycle 3 changes the learning mode: fewer reveal screens, more configuration → run → compare → keep/reject loops.

### 13 — Build a decision tree
- train a real browser-side decision tree;
- manipulate depth and minimum branch size;
- inspect train vs test behaviour and the first learned rule;
- experience model capacity directly.

### 14 — Tune without consuming the final test
- explicit train / validation / test split;
- tune k-NN or tree hyperparameters on validation;
- choose a candidate before revealing test;
- retrain on train + validation, then evaluate once on test.

### 15 — Open Model Workshop
- free choice of features;
- logistic / k-NN / tree;
- k, tree depth, threshold and fold count;
- persistent experiment history inside the chapter;
- direction signal relative to a fixed distance+angle baseline;
- select and defend a candidate rather than answer a quiz.

### 16 — Holdout challenge
- reserve three complete StatsBomb matches outside development;
- iterate only on the remaining matches using cross-validation;
- learner decides when to freeze a candidate;
- reveal holdout only after the decision;
- compare learner model, simple baseline and StatsBomb xG reference on the same untouched matches.

## Cycle 4 — Leave the tutorial

The next cycle should not simply add more guided chapters. Candidate direction:

- error analysis on confident mistakes and football slices;
- model interpretation / feature effects;
- build an xG map for a complete real match;
- compare goals vs model xG at player or team level when enough data is available;
- eventually widen to trees/ensembles, richer events, clustering, player similarity or tracking data.

Gate before implementation: playtest Chapters 11–16 and decide which tasks the learner can now perform without being prompted step-by-step.
