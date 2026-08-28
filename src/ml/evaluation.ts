import type { Shot } from '../types'
import { accuracy, predictProbability, shotLabels, shotRows, trainLogistic } from './logistic'

export type ShotFeature = 'distance' | 'angle'

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function shuffled<T>(items: T[], seed: number) {
  const random = seededRandom(seed)
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function stratifiedSplit(shots: Shot[], seed: number, testRatio = 0.3) {
  const goals = shuffled(shots.filter((shot) => shot.goal), seed * 2 + 1)
  const misses = shuffled(shots.filter((shot) => !shot.goal), seed * 2 + 2)
  const goalTestCount = Math.max(1, Math.round(goals.length * testRatio))
  const missTestCount = Math.max(1, Math.round(misses.length * testRatio))

  const test = [...goals.slice(0, goalTestCount), ...misses.slice(0, missTestCount)]
  const train = [...goals.slice(goalTestCount), ...misses.slice(missTestCount)]

  return {
    train: shuffled(train, seed * 7 + 3),
    test: shuffled(test, seed * 11 + 5),
  }
}

export function evaluateLogistic(train: Shot[], test: Shot[], features: ShotFeature[] = ['distance', 'angle']) {
  const model = trainLogistic(shotRows(train, features), shotLabels(train))
  const trainProbabilities = shotRows(train, features).map((row) => predictProbability(model, row))
  const testProbabilities = shotRows(test, features).map((row) => predictProbability(model, row))

  return {
    model,
    trainProbabilities,
    testProbabilities,
    trainAccuracy: accuracy(trainProbabilities, shotLabels(train)),
    testAccuracy: accuracy(testProbabilities, shotLabels(test)),
  }
}

export function brierScore(probabilities: number[], labels: number[]) {
  return probabilities.reduce((sum, probability, index) => sum + (probability - labels[index]) ** 2, 0) / probabilities.length
}
