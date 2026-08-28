# ML Football Lab

A tiny interactive course for learning machine-learning fundamentals through football, one small conceptual step at a time.

## V0

Three chapters:

1. **Predict** — inspect shots, make predictions, then build a manual distance rule.
2. **Learn** — let a simple logistic model learn from the same examples.
3. **Describe** — add shot angle and discover the idea of a feature.

The V0 intentionally stops before formal train/test evaluation, overfitting, model comparison, clustering, or neural networks.

## Run locally

```bash
npm install
npm run dev
```

Checks:

```bash
npm run typecheck
npm run build
```

## Data status

`src/data/shots.ts` currently contains **explicitly labelled pedagogical seed fixtures**. They are plausible football shots designed to validate the learning experience; they are not presented as raw StatsBomb observations.

`scripts/prepare-shots.py` converts StatsBomb Open Data event JSON into the same small shape (`x`, `y`, metric distance, shooting angle, goal). This lets us replace the seed with sourced observations without changing the lesson components.

StatsBomb Open Data: https://github.com/hudl/open-data

See `docs/data.md` before changing data provenance.
