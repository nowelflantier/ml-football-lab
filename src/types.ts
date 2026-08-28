export type ShotProvenance = {
  event_file?: string | null
  minute?: number | null
  second?: number | null
  period?: number | null
  team?: string | null
  player?: string | null
  outcome?: string | null
}

export type RawShotExcerpt = {
  location?: unknown
  under_pressure?: unknown
  play_pattern?: unknown
  team?: unknown
  player?: unknown
  shot?: unknown
}

export type Shot = {
  id: string
  x: number
  y: number
  distance: number
  angle: number
  goal: boolean
  source: 'pedagogical-seed' | 'statsbomb-open-data'
  match_id?: number | null
  body_part?: string | null
  shot_type?: string | null
  technique?: string | null
  first_time?: boolean
  under_pressure?: boolean
  play_pattern?: string | null
  statsbomb_xg_reference?: number | null
  raw_excerpt?: RawShotExcerpt
  provenance?: ShotProvenance
}

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type Progress = {
  chapter: ChapterId
  chapter1Step: number
  chapter2Step: number
  chapter3Step: number
  chapter4Step: number
  chapter5Step: number
  chapter6Step: number
  chapter7Step: number
  chapter8Step: number
  chapter9Step: number
  chapter10Step: number
  manualThreshold: number
  completed: number[]
}
