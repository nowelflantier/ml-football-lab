# DECISIONS

## 2026-08-28 — Vite + React + TypeScript

Keep the lab as a client-side Vite/React application. The educational models are small enough to train and evaluate in-browser, which makes the causal link between a learner interaction and a model result immediate.

## 2026-08-28 — Question before vocabulary

A concept is introduced only after the learner has experienced the problem it solves. The intended sequence is question → manipulation → consequence → explanation → vocabulary.

## 2026-08-28 — Technical depth ramps after foundations

Chapters 01–03 stay intentionally intuitive. Starting with Chapter 04, displayed experimental results are computed live and an optional `Sous le capot` layer starts exposing implementation/math details. This avoids both lecture-first teaching and a later cliff from abstraction to code.

## 2026-08-28 — Evaluation before model zoo

Train/test and generalisation come before comparing model families. Overfitting/leakage come before hyperparameter tuning. The learner should know what a fair comparison means before being offered several algorithms.

## 2026-08-28 — In-browser ML first

Use small deterministic TypeScript implementations for the first learning cycle: logistic regression, splitting, k-NN, and metrics. Do not add TensorFlow, Python, notebooks, or a backend until the curriculum needs capabilities that justify the extra machinery.

## 2026-08-28 — Pedagogical seed remains explicit

The current shot fixtures are designed for conceptual readability and must remain labelled as `pedagogical-seed`. The StatsBomb converter exists to enable a later real-data cycle, but provenance must not be blurred.

## 2026-08-28 — Mechanism before model-family name

Beginner chapters must not require the learner to understand labels such as `logistic regression`, `k-NN`, or `decision tree` in order to know what to do.

Teach the mechanism first with one concrete variable and an analogy:
- global smooth trend;
- similar past cases;
- learned if/then rules.

Reveal the technical family name only after the learner has manipulated the mechanism.

## 2026-08-28 — One conceptual variable per guided experiment

In Chapters 01–12, a learning screen should normally change one conceptual dimension at a time. Do not combine model family, features, hyperparameters, threshold, and validation protocol in the same beginner exercise.

Dense multi-control workbenches are reserved for post-guided practice.

## 2026-08-28 — Counts and meaning before metric shorthand

A beginner-facing metric must first answer a plain question and identify its population.

Prefer:
- `78 / 89 tirs de test correctement classés`;
- `6 buts repérés sur 8 vrais buts`;
- `4 alertes correctes sur 10 alertes`.

Only then show shorthand such as accuracy / recall / precision or a percentage. A percentage must never be visually ambiguous with a feature value or feature importance.

## 2026-08-28 — Guided path ends at Chapter 12

Chapters 01–12 form the beginner curriculum. Chapters 13–16 are `Model Workshop` advanced practice, and Chapters 17–20 are `Football Analyst Mode` application tasks.

The navigation and progress UI should reflect that distinction instead of presenting twenty chapters as one mandatory syllabus.

## 2026-08-28 — No new numbered cycle until the audited path is validated

Do not extend the chapter count beyond 20 until the revised Chapters 06–12 are playtested as a coherent sequence. New ML techniques should later be introduced because a football question needs them, not because the curriculum has room for another topic.
