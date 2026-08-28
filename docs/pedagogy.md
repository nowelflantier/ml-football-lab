# Pedagogy

## Goal

Teach machine-learning intuition to a learner starting near zero. Success is conceptual transfer plus the ability to run and interpret a small experiment, not API memorisation.

By the end of Cycle 1, the learner should naturally be able to reason along these lines:

> I define what I want to predict, choose features available at prediction time, let a model learn from training examples, judge it on unseen data, change one thing, rerun the experiment and inspect what changed before concluding.

## Learning loop

Prefer:

**question → learner prediction → manipulation → observed consequence → second attempt → short explanation → vocabulary → optional technical reveal**

over:

**definition → lecture → quiz**

The learner should feel the missing concept before seeing its name. A chapter is successful when the next question occurs naturally before the UI asks it.

The second attempt is important: after seeing a consequence, the learner should usually get a chance to change a parameter, feature or decision and observe a different result before the chapter explains the concept.

## Practice progression

Autonomy should increase through the cycle rather than staying constant.

- Chapters 01–03: heavily guided discovery; one new source of complexity at a time.
- Chapter 04: learner chooses evaluation setup and repeats real train/test experiments.
- Chapter 05: learner produces probabilities before seeing the model's probabilities.
- Chapter 06: learner deliberately causes overfitting and discovers leakage through feature experiments.
- Chapter 07: learner gets a small sandbox with model family, features, hyperparameter and threshold controls plus experiment history.
- Cycle 2+: increasingly open experiments on sourced football data.

Do not let interactivity collapse into decorative controls. A control is valuable when the learner must form a hypothesis, change it and interpret the resulting model behaviour.

## Technical-depth policy

Cycle 1 starts deliberately abstract and becomes progressively more concrete.

- Chapters 01–03 optimise for conceptual intuition.
- From Chapter 04 onward, important metrics must come from actual browser-side computations, not prewritten illustrative numbers.
- Technical mechanics appear after the intuition in optional `Sous le capot` disclosures.
- Whenever possible, technical vocabulary should refer to something the learner has just manipulated.
- Do not hide the fact that models are code and maths; delay details until they answer a question the learner already has.
- Avoid a sudden jump from visual intuition to unexplained equations or libraries.

## Difficulty policy

Change one source of complexity at a time.

- When introducing prediction, use one input: distance.
- When introducing learning, reuse exactly the same football problem.
- When introducing features, add only angle.
- Introduce train/test before discussing model families.
- Introduce probability meaning before calibration metrics.
- Introduce overfitting before asking the learner to compare flexible models.
- Introduce a decision threshold through direct false-positive / false-negative changes before naming more advanced classification metrics.
- Do not simultaneously introduce richer football tactics, data cleaning, model families and evaluation theory.

## Vocabulary policy

A term should appear after the learner has experienced the problem it names.

Examples:
- `prediction` after making one;
- `model` after the computer learns a relationship;
- `feature` after the learner sees why distance cannot distinguish two shots;
- `train/test` after the learner encounters the familiar-example evaluation trap;
- `overfitting` after the learner creates a perfect train score that weakens on unseen data;
- `leakage` after the learner selects a future-derived feature and sees a miraculous score;
- `hyperparameter` after the learner changes k and observes behaviour change;
- `false positive / false negative` after the learner moves a decision threshold and sees the error trade-off.

## Guardrails

- Never equate a training score with real-world quality.
- Never claim the pedagogical seed demonstrates calibration or production xG quality.
- Keep `source: pedagogical-seed` explicit until sourced observations replace it.
- Whenever a number is presented as the result of a model experiment in Chapters 04+, compute it from the current dataset in the app.
- Prefer explicit `Train + test` actions for meaningful experiments so the learner understands that a new model/evaluation has been run.
- Preserve experiment history when it helps compare configurations instead of replacing the previous result instantly.
