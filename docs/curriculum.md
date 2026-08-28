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
- calibration intuition (without claiming the seed model is calibrated);
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

## Next staircase

The next cycle should move from the pedagogical seed to sourced football data without abandoning the learning sequence.

Candidate topics:
- inspect a real StatsBomb shot distribution;
- data cleaning and missing values;
- feature engineering from event data;
- calibration plots and Brier/log loss after probability intuition is secure;
- richer xG baseline;
- cross-validation once the learner has felt split variance;
- model interpretation and error slices;
- only later: clustering, player similarity, dimensionality, trees/boosting, richer event sequences.
