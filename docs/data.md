# Data

## Current V0

`src/data/shots.ts` contains small **pedagogical seed fixtures**. They are intentionally selected to produce readable early interactions and are marked `source: "pedagogical-seed"`.

They must never be described in the UI, documentation, or marketing as raw real-match StatsBomb observations.

## Intended open-data source

StatsBomb Open Data is maintained at:

https://github.com/hudl/open-data

Before redistributing or publishing analyses based on that data, review the current repository README and StatsBomb's stated data-use/attribution terms.

## Offline conversion

`scripts/prepare-shots.py` expects one or more StatsBomb event JSON files and extracts events whose type is `Shot`.

It outputs the small lesson-facing shape:

```json
{
  "id": "...",
  "x": 108.4,
  "y": 39.2,
  "distance": 10.2,
  "angle": 39.5,
  "goal": false,
  "source": "statsbomb-open-data"
}
```

Distance and angle are derived in approximate metric pitch coordinates from StatsBomb's 120 × 80 coordinate system using a 105 × 68 m pitch and a 7.32 m goal.

## Curation policy

Raw realism is not enough for pedagogy. After generating sourced shots:

1. preserve provenance;
2. inspect class balance and geometry;
3. choose a small learner-safe slice;
4. ensure outcomes still include useful counterexamples (close misses, longer goals);
5. do not hand-edit outcomes to make a lesson cleaner;
6. if a pedagogical example must be invented, label it as such rather than mixing provenance.
