# Cycle 2 — From a model that runs to an experiment you can trust

Cycle 1 teaches the mental model of supervised ML. Cycle 2 should make the learner feel the next set of problems before naming the tools used to solve them.

Do not implement these chapters blindly. Chapters 04–07 are still under playtest; this document fixes the intended staircase, not every screen or sentence.

## 08 — 90% correct. Is that actually good?

### Tension to create

Show a dataset where goals are relatively rare. Ask the learner to judge a model with a high accuracy score, then reveal a deliberately useless baseline that predicts `NO GOAL` for every shot and still scores surprisingly well.

### Experience

1. Show only the headline accuracy of the current model.
2. Ask whether the score feels good.
3. Reveal the class distribution: far more misses than goals.
4. Introduce the dumb baseline: always predict `NO GOAL`.
5. Compare the two models not only by total correct answers but by the four kinds of outcomes.
6. Let the learner change the decision threshold and watch false positives / false negatives move.

### Concepts unlocked

- class imbalance;
- baseline;
- accuracy can mislead;
- true positive / true negative / false positive / false negative;
- confusion matrix as a visual summary;
- precision and recall only after the learner has understood the two error types.

### Keep out for now

- F1 score as a formula to memorise;
- ROC/AUC;
- optimisation jargon.

### Exit check

The learner should naturally say something close to: "A model is not good just because its accuracy is high; I need to compare it with a simple baseline and look at what kinds of mistakes it makes."

---

## 09 — Where did our data actually come from?

### Tension to create

Until now the app deliberately hides the raw source. The learner has used clean columns such as distance, angle and outcome. Now reveal a real StatsBomb shot event and ask: "Where are those columns in this object?"

### Experience

1. Start with one real StatsBomb event JSON object.
2. Highlight the original location and shot outcome fields.
3. Reconstruct the small lesson row from that event.
4. Calculate distance and angle from the coordinates.
5. Show several real shots and their provenance: match, minute, team, player.
6. Reveal that some fields can be absent or represented categorically.
7. Let the learner inspect raw → transformed side by side rather than edit JSON manually.

### Concepts unlocked

- raw data vs model-ready data;
- provenance;
- transformation / preprocessing;
- derived feature;
- missing values;
- data cleaning as part of ML, not administrative work before ML.

### Dataset gate

Use sourced StatsBomb Open Data, not the pedagogical seed. Initial source candidate:

- repository: `hudl/open-data`;
- competition: 1. Bundesliga (`competition_id = 9`);
- season: 2023/2024 (`season_id = 281`).

The match index is versioned upstream and should be fetched by script; do not hand-maintain a list of match IDs in the lesson code.

### Exit check

The learner should understand that `distance` and `angle` are not magic columns delivered by football: we decided to derive them from a raw event representation.

---

## 10 — Which information deserves to become a feature?

### Tension to create

Distance + angle now feel obviously incomplete. Offer several real pre-shot fields and ask which ones the model is allowed to use and which ones actually improve unseen-data performance.

### Candidate prediction-time features

- distance;
- angle;
- body part;
- shot type;
- technique;
- first-time shot;
- under pressure when available;
- play pattern / set-piece context.

Keep post-outcome fields excluded by construction.

### Experience

1. Learner predicts which feature will help most.
2. Add one feature at a time.
3. Retrain on exactly the same folds/splits.
4. Compare the change on unseen data, not train data.
5. Show a plausible feature that barely helps.
6. Show that more columns do not automatically mean a better model.
7. Inspect a few error slices rather than only the headline score.

### Concepts unlocked

- feature engineering;
- categorical feature;
- encoding intuition;
- ablation: compare with and without one feature;
- usefulness must be measured on unseen data.

### Exit check

The learner should stop asking only "does this feature make football sense?" and also ask "does it improve generalisation without leaking information?"

---

## 11 — If the model says 30%, does 30% really happen?

### Tension to create

Cycle 1 explains what a probability is supposed to mean. Cycle 2 tests whether the model's probabilities deserve that interpretation.

### Experience

1. Gather a much larger set of real predictions.
2. Group predictions into broad buckets, for example around 10%, 20%, 30%, etc.
3. Compare predicted probability with observed goal frequency.
4. Visualise a perfectly calibrated diagonal and the model's actual curve.
5. Compare two models that can have similar classification accuracy but different probability quality.

### Concepts unlocked

- calibration;
- reliability diagram;
- Brier score as an optional `Sous le capot` metric;
- classification quality and probability quality are different questions.

### Important wording

Never imply that one isolated shot proves a probability wrong. Calibration is a property observed over many comparable predictions.

### Exit check

The learner should be able to explain why a useful xG model needs credible probabilities, not merely good `goal / no goal` classification.

---

## 12 — One train/test split was lucky. Now what?

### Tension to create

Reuse the reshuffle interaction from Chapter 04, but on enough real data that the learner can see a distribution of scores rather than one dramatic small-sample jump.

### Experience

1. Show the model score for one split.
2. Repeat with several splits.
3. Ask which score should be reported.
4. Introduce folds: each group becomes validation data once while the others train the model.
5. Display the distribution / mean and variability across folds.
6. Use the same folds to compare two model configurations fairly.

### Concepts unlocked

- cross-validation;
- fold;
- mean performance;
- variance / uncertainty of evaluation;
- fair model comparison using the same evaluation protocol.

### Keep out for now

- nested cross-validation;
- exhaustive hyperparameter search;
- statistical significance tests.

### Exit check

The learner should understand that model evaluation is an experiment design problem, not a single score-producing button.

---

## Cycle 2 completion gate

After Chapter 12 the learner should be able to answer, in plain language:

1. What naive baseline should I beat?
2. What kinds of errors does my model make?
3. Where did the data and features come from?
4. Did a new feature improve unseen-data performance?
5. Are the predicted probabilities calibrated?
6. Is the result stable across several validation folds?

Only after this gate should the curriculum widen toward trees / boosting, richer interpretation, clustering and player similarity.
