import type { Shot } from '../types'

export type RealFeatureKey = 'distance' | 'angle' | 'is_header' | 'first_time' | 'under_pressure' | 'is_penalty'

export const realFeatureLabels: Record<RealFeatureKey, string> = {
  distance: 'Distance',
  angle: 'Angle',
  is_header: 'Tir de la tête',
  first_time: 'Première intention',
  under_pressure: 'Sous pression',
  is_penalty: 'Penalty',
}

export function realShotRow(shot: Shot, features: RealFeatureKey[]) {
  return features.map((feature) => {
    switch (feature) {
      case 'distance':
        return shot.distance
      case 'angle':
        return shot.angle
      case 'is_header':
        return shot.body_part === 'Head' ? 1 : 0
      case 'first_time':
        return shot.first_time ? 1 : 0
      case 'under_pressure':
        return shot.under_pressure ? 1 : 0
      case 'is_penalty':
        return shot.shot_type === 'Penalty' ? 1 : 0
    }
  })
}

export const realShotRows = (shots: Shot[], features: RealFeatureKey[]) =>
  shots.map((shot) => realShotRow(shot, features))
