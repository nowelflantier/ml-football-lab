# DECISIONS

## D-001 — Football is the course world

Use one broad football theme across the early curriculum rather than unrelated toy datasets. It reduces context switching while allowing varied ML concepts later.

## D-002 — Dedicated interactive lab

The app is the primary learning surface. Chat is for design, questions, and debriefs; lesson answers should not be spoiled in chat before the learner experiences them.

## D-003 — Vite + React + TypeScript

Static-first. No backend, database, auth, or production Python runtime in V0. Progress uses `localStorage`.

## D-004 — Three micro-chapters before train/test

V0 teaches data/prediction, manual rule vs learned model, and features. Formal train/test evaluation is deliberately postponed to Chapter 04.

## D-005 — Seed fixtures are temporary and explicit

Use a tiny pedagogical seed to validate the experience quickly. Never misrepresent it as sourced match data. Keep an offline StatsBomb converter so real open-data observations can replace it later.

## D-006 — No premature generic course engine

Keep chapter components explicit for V0. Extract a generic schema only after later chapters demonstrate stable repeated patterns.
