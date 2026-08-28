# Data

## Current app state

`src/data/shots.ts` contains small **pedagogical seed fixtures**. They are intentionally selected to produce readable early interactions and are marked `source: "pedagogical-seed"`.

They must never be described in the UI, documentation or marketing as raw real-match StatsBomb observations.

## Open-data source

StatsBomb Open Data is maintained in `hudl/open-data`.

StatsBomb states that selected leagues / matches are freely available for public use for research projects and genuine football analytics interest. If research, analysis or insights based on the data are published or shared, their README asks that StatsBomb is stated as the data source and that their logo is used.

Always re-check the upstream README before public redistribution because upstream terms can change independently of this repo.

## Initial Cycle 2 source selection

The first real-data candidate is intentionally narrow and reproducible:

- competition: 1. Bundesliga;
- `competition_id = 9`;
- season: 2023/2024;
- `season_id = 281`;
- upstream match index: `data/matches/9/281.json`.

The upstream index is the source of truth for match IDs. Do not duplicate a handwritten match list in application code.

Why this sample:

- modern event data;
- enough matches / shots to make class imbalance, calibration and cross-validation meaningful;
- a coherent football context rather than an arbitrary mixture of competitions;
- 360 data is available for some/all listed matches upstream, leaving room for a later advanced cycle without being required now.

## Reproducible offline fetch

The web app never fetches StatsBomb at runtime.

Use:

```bash
python scripts/fetch-statsbomb-sample.py 9 281 --limit 3
```

for a smoke sample, or omit `--limit` for the full upstream match index.

Files are downloaded under:

```text
data/raw/statsbomb/9/281/
├── matches.json
├── fetch-summary.json
└── events/
    ├── <match_id>.json
    └── ...
```

`data/raw/` is working data and should not be committed.

## Model-ready conversion

`scripts/prepare-shots.py` accepts one or more StatsBomb event JSON files and extracts `Shot` events.

Example:

```bash
python scripts/prepare-shots.py \
  data/raw/statsbomb/9/281/events/*.json \
  -o data/generated/bundesliga-2023-24-shots.json
```

A generated row contains geometry, useful prediction-time fields and provenance:

```json
{
  "id": "...",
  "match_id": 3895292,
  "x": 108.4,
  "y": 39.2,
  "distance": 10.2,
  "angle": 39.5,
  "goal": false,
  "body_part": "Right Foot",
  "shot_type": "Open Play",
  "technique": "Normal",
  "first_time": false,
  "under_pressure": true,
  "play_pattern": "Regular Play",
  "statsbomb_xg_reference": 0.21,
  "source": "statsbomb-open-data",
  "provenance": {
    "event_file": "3895292.json",
    "minute": 51,
    "second": 4,
    "period": 2,
    "team": "Bayer Leverkusen",
    "player": "...",
    "outcome": "Saved"
  }
}
```

Distance and angle are derived in approximate metric pitch coordinates from StatsBomb's 120 × 80 coordinate system using a 105 × 68 m pitch and a 7.32 m goal.

## Feature safety

Fields should be classified by whether they exist **at prediction time**.

Potential Cycle 2 features include:

- distance;
- angle;
- body part;
- shot type;
- technique;
- first-time flag;
- under-pressure flag when present;
- play pattern.

Forbidden training inputs include anything derived from the result of the shot.

`statsbomb_xg_reference` is deliberately preserved for a later educational comparison with StatsBomb's upstream xG value. It is **never** an input feature for our xG model. Feeding it to our model would collapse the exercise into target-like leakage / model copying rather than learning from event context.

## Curation policy

Raw realism is not enough for pedagogy. After generating sourced shots:

1. preserve provenance;
2. inspect class balance and shot geometry distributions;
3. inspect missingness for every candidate feature;
4. keep the full generated dataset for evaluation experiments;
5. choose small learner-safe slices only for individual visual exercises;
6. ensure slices contain useful counterexamples such as close misses and longer goals;
7. do not hand-edit outcomes to make a lesson cleaner;
8. if a pedagogical example must be invented, label it as such rather than mixing provenance;
9. never tune a lesson by peeking at test outcomes and then silently presenting the resulting test score as unbiased.

## Promotion gate into the app

Real data should not replace the seed globally in one commit.

The intended transition is:

- Chapters 01–08 may keep controlled pedagogical fixtures where they improve concept discovery;
- Chapter 09 explicitly reveals and switches to sourced real data;
- later chapters can use larger real datasets for feature engineering, calibration and cross-validation;
- all real-data screens must retain source attribution somewhere discoverable in the UI.
