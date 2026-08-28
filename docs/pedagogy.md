# Pedagogy

## Goal

Teach machine-learning intuition to a learner starting near zero. Success is conceptual transfer, not API memorisation.

By the end of Cycle 1, the learner should naturally be able to reason along these lines:

> I define what I want to predict, choose features available at prediction time, let a model learn from training examples, and judge it on unseen data rather than trusting its training score.

## Learning loop

Prefer:

**question → manipulation → observed consequence → short explanation → vocabulary → optional technical reveal**

over:

**definition → lecture → quiz**

The learner should feel the missing concept before seeing its name. A chapter is successful when the next question occurs naturally before the UI asks it.

## Technical-depth policy

Cycle 1 starts deliberately abstract and becomes progressively more concrete.

- Chapters 01–03 optimise for conceptual intuition.
- From Chapter 04 onward, important metrics must come from actual browser-side computations, not prewritten illustrative numbers.
- Technical mechanics appear after the intuition in optional `Sous le capot` disclosures.
- Do not hide the fact that models are code and maths; delay details until they answer a question the learner already has.
- Avoid a sudden jump from visual intuition to unexplained equations or libraries.

## Difficulty policy

Change one source of complexity at a time.

- When introducing prediction, use one input: distance.
- When introducing learning, reuse exactly the same football problem.
- When introducing features, add only angle.
- Introduce train/test before discussing model families.
- Introduce probability meaning before calibration metrics.
- Introduce overfitting before asking the learner to tune k.
- Do not simultaneously introduce richer football tactics, data cleaning, model families, and evaluation theory.

## Vocabulary policy

A term should appear after the learner has experienced the problem it names.

Examples:
- `prediction` after making one;
- `model` after the computer learns a relationship;
- `feature` after the learner sees why distance cannot distinguish two shots;
- `train/test` after the learner encounters the familiar-example evaluation trap;
- `overfitting` after a perfect train score loses on unseen data;
- `leakage` after a future-derived feature creates a miraculous score;
- `hyperparameter` after the learner changes k and observes behaviour change.

## Guardrails

- Never equate a training score with real-world quality.
- Never claim the pedagogical seed demonstrates calibration or production xG quality.
- Keep `source: pedagogical-seed` explicit until sourced observations replace it.
- Whenever a number is presented as the result of a model experiment in Chapters 04+, compute it from the current dataset in the app.
