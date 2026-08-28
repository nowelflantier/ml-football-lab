# AGENTS.md

This repository is a learning product first and a React application second.

## Read before changing code

- Product/pedagogy: `docs/pedagogy.md`
- Curriculum and concept order: `docs/curriculum.md`
- Data provenance and transformation: `docs/data.md`
- UI principles: `docs/design.md`
- Current work: `CURRENT.md`
- Stable decisions: `DECISIONS.md`

## Commands

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Non-negotiable V0 invariants

1. Do not introduce a concept before the learner needs it.
2. Keep football complexity flat while introducing a new ML concept.
3. Interaction precedes explanation whenever practical.
4. Do not call the pedagogical seed data "real StatsBomb shots".
5. Do not add backend, auth, database, or Python runtime to the web app.
6. Chapter 04 owns the formal train/test reveal; do not move that lesson into V0.
7. Animations must explain state or causality, not decorate.
8. Preserve a path to replace seed shots with generated StatsBomb-derived observations.

## Architecture

- `src/chapters/`: lesson orchestration and interactions.
- `src/components/`: reusable visual primitives.
- `src/ml/`: tiny browser-side ML implementation used as a teaching mechanism.
- `src/data/`: lesson-facing data only.
- `scripts/`: offline data preparation.

Prefer small reusable primitives over a generic lesson-engine abstraction until at least two more chapters prove the abstraction is needed.
