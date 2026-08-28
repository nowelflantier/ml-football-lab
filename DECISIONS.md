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
