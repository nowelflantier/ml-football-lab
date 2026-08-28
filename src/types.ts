export type Shot = {
  id: string
  x: number
  y: number
  distance: number
  angle: number
  goal: boolean
  source: 'pedagogical-seed'
}

export type Progress = {
  chapter: 1 | 2 | 3
  chapter1Step: number
  chapter2Step: number
  chapter3Step: number
  manualThreshold: number
  completed: number[]
}
