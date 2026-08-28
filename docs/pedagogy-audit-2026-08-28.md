# Pedagogy audit — 2026-08-28

## Why this audit exists

Live beginner playtests showed that the app's local interactions often worked while the global learning staircase did not. The product gradually accumulated technical controls and then tried to explain them after the learner had already used them.

The goal of this pass is not to improve isolated screens. It is to make the application a coherent learning tool for someone starting with almost no ML vocabulary.

## Core teaching contract

For every new concept, the intended order is:

1. **Concrete situation** — a small problem the learner can understand without ML vocabulary.
2. **Prediction / hypothesis** — the learner says what they expect.
3. **Manipulation** — change one thing only.
4. **Visible consequence** — result expressed first in plain language / counts.
5. **Second attempt** — the learner can immediately test another case.
6. **Mental model** — short explanation of what mechanism produced the result.
7. **Technical name** — only now reveal the canonical term.
8. **Optional depth** — formula / implementation under `Sous le capot`.

A chapter fails the contract if the learner must understand a technical label in order to know which button to press.

## Global findings

### Chapters 01–05 — strong foundation

These chapters broadly follow the desired sequence:

- 01 starts from observations and a manual rule;
- 02 lets the computer learn instead of the learner choosing a threshold;
- 03 introduces a missing piece of information before naming `feature`;
- 04 creates the exam / unseen-data problem before naming generalisation;
- 05 makes the learner estimate probabilities before connecting them to xG.

Required cleanup:

- remove premature implementation jargon such as `logistic regression` / `sigmoid` from optional technical disclosures before model families have been taught;
- keep reminding the learner that a displayed probability is a model estimate, not a physical truth.

### Chapter 06 — structurally wrong in current version

Current version uses k-NN to teach overfitting before k-NN itself has a mental model. It then adds a second independent topic, data leakage, in the same chapter.

**Decision:** replace Chapter 06 with the concrete three-method primer currently developed later:

- learn a smooth trend;
- look at similar past cases;
- follow learned if/then rules;
- reveal `logistic regression`, `k-NN`, and `decision tree` only after each mechanism is understood.

### Chapter 07 — too many knobs too early

Current version exposes model family, features, k, threshold, train/test, confusion matrix and error inspection at once.

**Decision:** replace with a focused overfitting chapter using only the already-understood neighbour method.

The only main variable should be `k`:

- small k can memorize local examples;
- k=1 makes the training-set trick especially concrete because each training shot can be its own neighbour;
- compare train vs unseen test;
- name `overfitting` only after the learner creates it.

### Chapter 08 — conceptually sound

Baseline and error types are useful after train/test and overfitting.

Keep the plain-language error names first:

- buts repérés;
- fausses alertes;
- buts ratés;
- ratés bien écartés.

Technical names remain secondary.

### Chapter 09 — strong and concrete

Raw StatsBomb → clean model row is one of the clearest chapters.

Keep it largely intact.

### Chapter 10 — output semantics are ambiguous

Beginner playtest interpreted a value such as `89%` as potentially describing the added feature (`pressure`) rather than the model's overall test performance.

**Decision:** rewrite the results around counts and explicit sentences.

Primary presentation:

- `78 / 89 tirs de test correctement classés`;
- secondary: `88% de décisions justes`;
- explicit warning: **this percentage is a score for the whole model, not the value or importance of the feature**.

One legitimate feature at a time is still useful. Then add the leakage trap here, because it naturally answers: "can every measurable column be used as a feature?"

### Chapter 11 — calibration was introduced before model mechanisms

The previous chapter tried to repair missing model-family understanding and simultaneously teach metrics / calibration / Brier. That was too much.

**Decision:** model mechanisms move to Chapter 06. Chapter 11 becomes calibration only, with one fixed model and no family / feature tuning.

Concrete framing:

- analogy with repeated weather forecasts;
- `0–20%` means shots that received predictions between 0 and 20%;
- expected number of goals vs observed number of goals;
- calibration name afterwards;
- Brier only as an optional summary once the bucket idea is clear.

### Chapter 12 — cross-validation has unnecessary configuration

Current version lets the learner simultaneously change model, features and fold count.

**Decision:** use one fixed known model. The only manipulated variable is the validation protocol (`3 / 5 / 7` folds).

The learning objective is evaluation stability, not model tuning.

### Chapters 13–16 — useful, but not part of the beginner staircase

Keep as **Model Workshop** after the guided path is complete.

By this point the learner should already understand:

- three model mechanisms;
- train/test;
- overfitting;
- baseline / error types;
- features / leakage;
- calibration;
- repeated validation.

Only then do hyperparameter controls become meaningful practice rather than unexplained knobs.

### Chapters 17–20 — useful analyst practice

Keep as an optional **Football Analyst Mode**. These are application tasks, not concepts the beginner must complete to understand basic ML.

## Revised learning staircase

### Cycle 1 — Understand prediction (01–06)

1. Observe and make a prediction.
2. Let the machine learn a relation.
3. Add relevant information / features.
4. Separate learning data from unseen data.
5. Understand probability and xG.
6. Discover three concrete ways to produce a prediction.

### Cycle 2 — Trust the experiment (07–12)

7. Create overfitting yourself.
8. Beat a baseline and inspect error types.
9. Transform raw data into model-ready data.
10. Test features and discover leakage.
11. Check whether probabilities mean what they claim.
12. Repeat evaluation with cross-validation.

### Model Workshop — optional advanced practice (13–16)

13. Decision-tree capacity.
14. Train / validation / final test tuning.
15. Open model workshop.
16. Match-level holdout challenge.

### Football Analyst Mode — optional application (17–20)

17. Error analysis.
18. What-if / sensitivity analysis.
19. Match xG builder.
20. Analyst dashboard.

## UI / navigation findings

The 20-item navigation makes the app feel like one long mandatory syllabus.

Changes required:

- present 01–12 as the **guided path**;
- label 13–16 as optional `Model Workshop`;
- label 17–20 as optional `Football Analyst Mode`;
- do not render every locked advanced chapter before its section is unlocked; show a compact locked section teaser instead;
- on the guided path, top progress should read against 12 chapters, not 20;
- preserve independent desktop scrolling for navigation, visual panel and lesson panel.

## Content invariants for future changes

1. No model-family name before its concrete mechanism has been shown.
2. No metric is displayed without a plain-language numerator / denominator or interpretation nearby.
3. A percentage must always state what population it refers to.
4. Change one conceptual variable per teaching experiment.
5. Do not make the learner tune a control whose effect has not been taught.
6. QCM is acceptable for prediction / commitment, not as the main learning mechanism.
7. Advanced workbenches may contain many controls only after the guided path has taught each control separately.
8. A model probability must never be presented as the true probability of the physical event; always frame it as the estimate produced by that model from its data and features.
