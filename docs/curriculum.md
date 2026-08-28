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

### 13 — Build a decision tree
- real browser-side decision tree;
- depth, minimum branch size and feature controls;
- train vs test behaviour and learned first rule.

### 14 — Tune without consuming the final test
- explicit train / validation / test split;
- tune k-NN or tree settings on validation;
- choose before revealing test.

### 15 — Open Model Workshop
- free feature selection;
- logistic / k-NN / tree;
- hyperparameters, threshold and folds;
- run history and direction relative to a fixed baseline;
- learner selects and defends a candidate.

### 16 — Holdout challenge
- three complete StatsBomb matches outside development;
- iterate only on the remaining matches with CV;
- freeze a candidate before holdout reveal;
- compare candidate, simple baseline and StatsBomb xG reference.

## Cycle 4 — Football Analyst Mode

Cycle 4 intentionally stops teaching one new definition per chapter. The model becomes an instrument for asking football questions.

### 17 — Diagnose errors
- configure a model and threshold;
- generate concrete errors on unseen shots;
- filter missed goals, false alerts and high-confidence errors;
- inspect player / team / geometry / context;
- rerun modified model versions and use errors to generate new hypotheses.

### 18 — What-if lab
- pick real shots;
- modify distance, angle, header, penalty, pressure and first-time status;
- compare logistic, k-NN and tree probabilities live;
- experience sensitivity / counterfactual analysis while keeping the non-causal caveat explicit.

### 19 — Build a real match xG
- choose one of the 10 StatsBomb matches;
- exclude that match from training;
- predict every shot with a learner-configured model;
- aggregate team xG;
- inspect model xG vs StatsBomb xG vs actual outcome shot by shot.

### 20 — Open analyst dashboard
- leave-one-match-out prediction across all 10 matches;
- team-match table;
- sort by goals-over-xG, goals-under-xG or model-vs-StatsBomb disagreement;
- drill down from an interesting row to individual shots;
- rerun the entire dashboard with another model configuration.

## After the guided path

Do not automatically add another numbered tutorial cycle.

Future work should be triggered by a football question and may require:
- more seasons / matches;
- ensembles or gradient boosting;
- richer interpretation;
- player and team profiling;
- clustering / similarity;
- tracking or StatsBomb 360 data.
