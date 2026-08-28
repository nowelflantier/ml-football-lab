# Curriculum

The product now distinguishes a **guided beginner path** (01–12) from optional advanced practice (13–20).

The guided path follows one invariant:

**concrete problem → learner prediction → manipulation → visible consequence → second attempt → explanation → technical name → optional depth**

## Guided path A — Understand a prediction (01–06)

### 01 — Predict
- observe simple shot data;
- make predictions;
- build a manual distance rule;
- experience prediction error.

### 02 — Learn
- give examples to the computer instead of writing the rule;
- first learned probability curve;
- understand `model` as a learned relation.

### 03 — Describe
- feel why distance alone is insufficient;
- add angle;
- introduce `feature` only after the missing-information problem appears.

### 04 — Test
- expose the problem of evaluating on already-seen examples;
- train/test split;
- repeated reshuffles;
- generalisation.

### 05 — Probabilise
- low probability does not mean impossible;
- estimate probabilities manually;
- add probabilities across shots;
- xG intuition.

### 06 — Three ways to predict
- same single input: shot distance;
- method A: learn a smooth global trend;
- method B: use similar past examples;
- method C: follow learned if/then rules;
- reveal `logistic regression`, `k-NN`, and `decision tree` only after the mechanism is understood.

## Guided path B — Trust the experiment (07–12)

### 07 — Overfit
- use the already-understood neighbour method;
- deliberately optimise performance on known examples;
- see k=1 reach a perfect train score because each training shot can be its own neighbour;
- compare known vs unseen performance;
- name overfitting afterwards.

### 08 — Measure
- class imbalance;
- naive always-no-goal baseline;
- threshold tradeoff;
- plain-language error types before confusion-matrix terminology.

### 09 — Prepare
- exact StatsBomb raw excerpt;
- raw event → model-ready row;
- source vs derived columns;
- provenance and preprocessing.

### 10 — Enrich, then detect leakage
- test one legitimate feature at a time;
- primary result shown as `correct decisions / test shots`, with percentage secondary;
- explicitly distinguish model performance from feature value / importance;
- add a post-outcome column and observe the suspicious score jump;
- introduce feature engineering and data leakage together because they answer the same question: which columns are legitimate inputs?

### 11 — Calibrate
- one fixed model only;
- weather-forecast analogy;
- `0–20%` explained as the group of shots assigned probabilities in that range;
- expected goals in the group vs observed goals;
- introduce calibration after the bucket interpretation is clear;
- Brier only as optional summary depth.

### 12 — Validate repeatedly
- one fixed model only;
- rotate which group is hidden for testing;
- manipulate only 3 / 5 / 7 folds;
- compare average performance and variability;
- introduce cross-validation afterwards.

At the end of Chapter 12, the beginner guided path is complete.

## Optional advanced practice — Model Workshop (13–16)

The controls here are allowed to become denser because every major control has already been introduced separately in the guided path.

### 13 — Decision-tree capacity
- depth and minimum branch size;
- train vs test behaviour;
- learned rules and node count.

### 14 — Tune without consuming the final test
- explicit train / validation / test split;
- hyperparameter tuning on validation;
- final test remains locked until a candidate is selected.

### 15 — Open Model Workshop
- free feature selection;
- logistic / k-NN / tree;
- hyperparameters, threshold and folds;
- experiment history;
- direction relative to an explicit baseline, not a hidden correct answer.

### 16 — Match-level holdout challenge
- entire matches withheld from development;
- iterate on the development set;
- freeze a candidate;
- reveal the untouched holdout only afterwards;
- compare learner model, simple baseline and StatsBomb xG reference.

## Optional application — Football Analyst Mode (17–20)

No hidden answer is expected here. The model becomes an instrument for football analysis.

### 17 — Diagnose errors
- filter real missed goals / false alerts / confident mistakes;
- inspect concrete shots;
- form new hypotheses.

### 18 — What-if lab
- modify one shot feature at a time;
- compare model reactions;
- distinguish sensitivity from causality.

### 19 — Match xG builder
- train without the selected match;
- predict every shot in that match;
- aggregate by team;
- compare learner xG, StatsBomb xG and real outcomes.

### 20 — Analyst dashboard
- leave-one-match-out across all 10 matches;
- sort team-match rows by over/underperformance or disagreement;
- drill down into shots;
- rerun with another model configuration.

## Future work

Do not add another numbered cycle automatically. New techniques should be introduced because a real football question requires them.

Possible later needs:
- more matches / seasons;
- ensembles / gradient boosting;
- richer model interpretation;
- player / team profiling;
- clustering / similarity;
- tracking or StatsBomb 360 data.
