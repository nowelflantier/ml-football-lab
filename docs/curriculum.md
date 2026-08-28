# Curriculum

## Cycle 1 — From intuition to evaluation

### 01 — Predict
Experience:
- inspect a small set of shots;
- predict unseen outcomes;
- create a manual distance-threshold rule;
- observe correct and incorrect predictions.

Concepts unlocked:
- observation;
- variable;
- target;
- prediction;
- error.

### 02 — Learn
Experience:
- reuse the same distance problem;
- train a tiny logistic model in the browser;
- see a probability curve;
- compare the manual rule with the learned relation.

Concept unlocked:
- model;
- minimal intuition for machine learning.

### 03 — Describe
Experience:
- compare two shots at the same distance but different angles;
- add angle;
- select information that directly describes shot geometry.

Concept unlocked:
- feature.

### 04 — Test
Experience:
- first see an attractive score on familiar examples;
- reserve unseen shots;
- compare train and test scores;
- repeatedly reshuffle a deterministic stratified split and retrain in-browser.

Concepts unlocked:
- train/test split;
- generalisation;
- evaluation variance on a small dataset.

### 05 — Probabilise
Experience:
- see a low-probability shot become a goal;
- reason about probabilities as frequencies rather than promises;
- sum shot probabilities;
- connect the same mechanism to expected goals.

Concepts unlocked:
- probabilistic prediction;
- calibration intuition without claiming the seed model is calibrated;
- xG as per-shot goal probability and sum of shot probabilities.

### 06 — Distrust perfect scores
Experience:
- compare a smooth logistic model with 1-nearest-neighbour;
- see 100% train accuracy fail to dominate on test;
- inspect an intentionally leaked post-shot feature.

Concepts unlocked:
- overfitting;
- data leakage;
- prediction-time feature availability.

### 07 — Compare
Experience:
- compare logistic regression and k-nearest-neighbours on the same train/test problem;
- inspect per-shot probability differences;
- change k live and immediately reevaluate on the test set.

Concepts unlocked:
- model family;
- hyperparameter;
- model comparison as behaviour + unseen-data evaluation, not train score.

## Cycle 2 — From a model that runs to an experiment you can trust

Detailed shaping lives in `docs/cycle-2.md`. The intended staircase is:

### 08 — 90% correct. Is that actually good?
- class imbalance;
- naive baseline;
- confusion matrix;
- false positives / false negatives;
- precision and recall only after the error types are intuitive.

### 09 — Where did our data actually come from?
- move from pedagogical seed to sourced StatsBomb Open Data;
- raw event vs model-ready row;
- provenance;
- preprocessing, derived features and missing values.

### 10 — Which information deserves to become a feature?
- richer prediction-time football features;
- categorical encoding intuition;
- one-feature-at-a-time comparisons;
- ablation and unseen-data evaluation.

### 11 — If the model says 30%, does 30% really happen?
- calibration;
- reliability diagram;
- probability quality vs classification quality;
- Brier score only as optional technical depth.

### 12 — One train/test split was lucky. Now what?
- repeated validation;
- folds;
- cross-validation;
- mean performance and variability;
- fair model comparison using the same evaluation protocol.

## Later cycles

Only after Cycle 2 is understood should the curriculum widen toward:
- decision trees;
- random forests / gradient boosting;
- feature importance and richer model interpretation;
- clustering;
- player similarity;
- dimensionality reduction;
- richer event sequences or tracking data.
