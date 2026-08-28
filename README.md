# ML Football Lab

An interactive football-first machine-learning lab built with Vite, React and TypeScript.

The project teaches ML by making the learner encounter a problem before revealing the concept that names it. It starts with a hand-written distance rule and progressively reaches real browser-side train/test evaluation, probabilistic xG intuition, overfitting, leakage and model comparison.

## Cycle 1

1. Predict — build a manual rule.
2. Learn — train a first logistic model.
3. Describe — discover features through distance + angle.
4. Test — separate train/test and observe generalisation.
5. Probabilise — connect model probabilities to xG.
6. Distrust — experience overfitting and leakage.
7. Compare — compare logistic regression and k-NN, then tune k.

All model experiments in Chapters 04–07 are computed in the browser from the current dataset. There is no ML backend in Cycle 1.

## Run locally

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm run build
```

## Data provenance

`src/data/shots.ts` currently contains explicit pedagogical fixtures, not claimed real observations. `scripts/prepare-shots.py` converts StatsBomb event JSON into the same shape so a sourced dataset can replace the seed in a later cycle without rewriting the app architecture.

See `AGENTS.md`, `CURRENT.md`, `DECISIONS.md` and `docs/` before making structural changes.
