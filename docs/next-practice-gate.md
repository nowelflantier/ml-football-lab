# Practice gate after the second Cycle 1 playtest

The second playtest confirms that the practice-first direction works better, but two issues remain:

1. completed chapters cannot be restarted from step 0 by clicking them in navigation;
2. some controls still feel technical before their purpose is fully understood.

## Immediate rules

- Clicking an already-unlocked chapter should restart that chapter at step 0 without clearing progress in other chapters.
- Before a technical control appears, explain in one sentence what the learner is changing and what they should watch for.
- Prefer plain-language intent labels before technical terms. Example: `How strict should the model be before saying GOAL?` before introducing `decision threshold`.
- Do not require the learner to manipulate a control they cannot yet describe in plain language.

## Next implementation slice

Implement Chapters 08–10 only:

- 08: baseline, class imbalance, kinds of mistakes;
- 09: raw StatsBomb event → clean model row;
- 10: richer real-data features and one-at-a-time feature experiments.

Hold calibration and cross-validation (11–12) until this slice has been playtested.
