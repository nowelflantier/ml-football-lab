export type Shot = {
  id: string
  x: number
  y: number
  distance: number
  angle: number
  goal: boolean
  source: 'pedagogical-seed'
}

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Progress = {
  chapter: ChapterId
  chapter1Step: number
  chapter2Step: number
  chapter3Step: number
  chapter4Step: number
  chapter5Step: number
  chapter6Step: number
  chapter7Step: number
  manualThreshold: number
  completed: number[]
}
