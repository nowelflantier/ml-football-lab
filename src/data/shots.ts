import type { Shot } from '../types'

// V0 pedagogical fixtures: plausible football shots designed to make the first
// concepts readable. They are intentionally NOT presented as raw StatsBomb
// observations. scripts/prepare-shots.py converts StatsBomb event JSON into the
// same shape so this seed can later be replaced by sourced real observations.
export const learningShots: Shot[] = [
  { id: 'S01', x: 113.5, y: 40.0, distance: 5.7, angle: 65, goal: true, source: 'pedagogical-seed' },
  { id: 'S02', x: 111.0, y: 34.0, distance: 9.3, angle: 39, goal: true, source: 'pedagogical-seed' },
  { id: 'S03', x: 115.5, y: 28.5, distance: 10.5, angle: 16.4, goal: false, source: 'pedagogical-seed' },
  { id: 'S04', x: 108.0, y: 39.0, distance: 10.6, angle: 39, goal: true, source: 'pedagogical-seed' },
  { id: 'S05', x: 107.5, y: 30.0, distance: 13.7, angle: 24, goal: false, source: 'pedagogical-seed' },
  { id: 'S06', x: 106.0, y: 42.0, distance: 12.4, angle: 31, goal: true, source: 'pedagogical-seed' },
  { id: 'S07', x: 105.0, y: 50.0, distance: 15.6, angle: 20, goal: false, source: 'pedagogical-seed' },
  { id: 'S08', x: 104.0, y: 37.0, distance: 14.2, angle: 28.5, goal: true, source: 'pedagogical-seed' },
  { id: 'S09', x: 103.0, y: 43.0, distance: 15.1, angle: 26.9, goal: false, source: 'pedagogical-seed' },
  { id: 'S10', x: 102.0, y: 29.0, distance: 18.3, angle: 19.7, goal: true, source: 'pedagogical-seed' },
  { id: 'S11', x: 101.0, y: 40.0, distance: 16.6, angle: 25, goal: false, source: 'pedagogical-seed' },
  { id: 'S12', x: 100.0, y: 35.0, distance: 18.2, angle: 21, goal: false, source: 'pedagogical-seed' },
  { id: 'S13', x: 98.0, y: 47.0, distance: 20.4, angle: 17, goal: false, source: 'pedagogical-seed' },
  { id: 'S14', x: 96.0, y: 39.0, distance: 21.0, angle: 19.7, goal: false, source: 'pedagogical-seed' },
  { id: 'S15', x: 94.0, y: 32.0, distance: 23.9, angle: 15, goal: false, source: 'pedagogical-seed' },
  { id: 'S16', x: 92.0, y: 44.0, distance: 24.8, angle: 15, goal: false, source: 'pedagogical-seed' },
  { id: 'S17', x: 109.5, y: 22.0, distance: 18.0, angle: 14, goal: false, source: 'pedagogical-seed' },
  { id: 'S18', x: 109.0, y: 58.0, distance: 18.4, angle: 13, goal: false, source: 'pedagogical-seed' },
]

export const challengeShots: Shot[] = [
  { id: 'N01', x: 112.0, y: 38.0, distance: 7.3, angle: 51, goal: true, source: 'pedagogical-seed' },
  { id: 'N02', x: 108.5, y: 49.0, distance: 13.6, angle: 22, goal: false, source: 'pedagogical-seed' },
  { id: 'N03', x: 104.5, y: 40.0, distance: 13.6, angle: 30, goal: true, source: 'pedagogical-seed' },
  { id: 'N04', x: 101.5, y: 31.0, distance: 18.7, angle: 18, goal: false, source: 'pedagogical-seed' },
  { id: 'N05', x: 110.5, y: 55.0, distance: 15.6, angle: 17, goal: false, source: 'pedagogical-seed' },
  { id: 'N06', x: 99.0, y: 41.0, distance: 18.4, angle: 22, goal: true, source: 'pedagogical-seed' },
  { id: 'N07', x: 106.0, y: 26.0, distance: 16.8, angle: 17, goal: false, source: 'pedagogical-seed' },
  { id: 'N08', x: 108.0, y: 36.0, distance: 11.2, angle: 34, goal: true, source: 'pedagogical-seed' },
]

export const sameDistancePair: Shot[] = [
  { id: 'A', x: 108.0, y: 40.0, distance: 10.5, angle: 40, goal: true, source: 'pedagogical-seed' },
  { id: 'B', x: 111.0, y: 28.0, distance: 10.5, angle: 22, goal: false, source: 'pedagogical-seed' },
]
