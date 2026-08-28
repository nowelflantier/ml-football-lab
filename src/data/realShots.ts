import generated from './statsbomb-shots.generated.json'
import type { Shot } from '../types'

type GeneratedDataset = {
  metadata: {
    source: string
    source_repo: string
    shot_count: number
    notes: string[]
  }
  shots: Shot[]
}

const dataset = generated as GeneratedDataset

export const realShots = dataset.shots
export const realShotMetadata = dataset.metadata
