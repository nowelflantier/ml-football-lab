# Pedagogy

## Goal

Teach machine-learning intuition to a learner starting near zero. Success is conceptual transfer, not API memorisation.

By the end of V0, the learner should naturally be able to say something close to:

> I give examples and features to a model so it can learn a relationship useful for making a prediction.

## Learning loop

Prefer:

**question → manipulation → observed consequence → short explanation → vocabulary**

over:

**definition → lecture → quiz**

## Difficulty policy

Change one source of complexity at a time.

- When introducing prediction, use one input: distance.
- When introducing learning, reuse exactly the same football problem.
- When introducing features, add only angle.
- Do not simultaneously introduce richer football tactics, data cleaning, model families, or evaluation theory.

## Vocabulary policy

A term should appear after the learner has experienced the problem it names.

Examples:

- `prediction` after making one.
- `model` after the computer learns a relationship.
- `feature` after the learner sees why distance cannot distinguish two shots.
- `train/test` only after the learner encounters the evaluation trap in Chapter 04.

## Guardrail

Do not equate a training/example-set score with real-world quality. V0 may display descriptive scores on the same examples, but must explicitly avoid claiming generalisation.
