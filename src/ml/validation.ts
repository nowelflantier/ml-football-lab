import type { Shot } from '../types'
import { evaluateConfig, type ModelConfig } from './modelLab'

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function shuffled<T>(items: T[], seed: number) {
  const random = seededRandom(seed)
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function stratifiedFolds(shots: Shot[], foldCount: number, seed = 19) {
  const count = Math.max(2, Math.min(foldCount, shots.length))
  const folds = Array.from({ length: count }, () => [] as Shot[])
  const goals = shuffled(shots.filter((shot) => shot.goal), seed * 2 + 1)
  const misses = shuffled(shots.filter((shot) => !shot.goal), seed * 2 + 2)
  goals.forEach((shot, index) => folds[index % count].push(shot))
  misses.forEach((shot, index) => folds[index % count].push(shot))
  return folds.map((fold, index) => shuffled(fold, seed * 31 + index))
}

export type FoldMetric = {
  fold: number
  accuracy: number
  brier: number
  recall: number
  precision: number
  size: number
}

export function crossValidate(shots: Shot[], config: ModelConfig, foldCount = 5, threshold = 0.25, seed = 19) {
  const folds = stratifiedFolds(shots, foldCount, seed)
  const metrics: FoldMetric[] = folds.map((test, index) => {
    const train = folds.flatMap((fold, foldIndex) => (foldIndex === index ? [] : fold))
    const evaluation = evaluateConfig(train, test, config, threshold)
    return {
      fold: index + 1,
      accuracy: evaluation.accuracy,
      brier: evaluation.brier,
      recall: evaluation.recall,
      precision: evaluation.precision,
      size: test.length,
    }
  })

  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
  const briers = metrics.map((metric) => metric.brier)
  const accuracies = metrics.map((metric) => metric.accuracy)
  return {
    folds: metrics,
    meanBrier: mean(briers),
    meanAccuracy: mean(accuracies),
    meanRecall: mean(metrics.map((metric) => metric.recall)),
    meanPrecision: mean(metrics.map((metric) => metric.precision)),
    brierRange: Math.max(...briers) - Math.min(...briers),
    accuracyRange: Math.max(...accuracies) - Math.min(...accuracies),
  }
}

export type CalibrationBucket = {
  from: number
  to: number
  predicted: number
  observed: number
  count: number
}

export function calibrationBuckets(probabilities: number[], labels: number[], bucketCount = 5): CalibrationBucket[] {
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    from: index / bucketCount,
    to: (index + 1) / bucketCount,
    probabilities: [] as number[],
    labels: [] as number[],
  }))

  probabilities.forEach((probability, index) => {
    const bucketIndex = Math.min(bucketCount - 1, Math.floor(probability * bucketCount))
    buckets[bucketIndex].probabilities.push(probability)
    buckets[bucketIndex].labels.push(labels[index])
  })

  return buckets.map((bucket) => ({
    from: bucket.from,
    to: bucket.to,
    predicted: bucket.probabilities.length
      ? bucket.probabilities.reduce((sum, value) => sum + value, 0) / bucket.probabilities.length
      : (bucket.from + bucket.to) / 2,
    observed: bucket.labels.length
      ? bucket.labels.reduce((sum, value) => sum + value, 0) / bucket.labels.length
      : 0,
    count: bucket.labels.length,
  }))
}

export function groupHoldoutByMatch(shots: Shot[], holdoutMatchCount = 3, seed = 71) {
  const matchIds = Array.from(new Set(shots.map((shot) => shot.match_id).filter((id): id is number => typeof id === 'number')))
  const shuffledIds = shuffled(matchIds, seed)
  const holdoutIds = new Set(shuffledIds.slice(0, holdoutMatchCount))
  return {
    develop: shots.filter((shot) => !shot.match_id || !holdoutIds.has(shot.match_id)),
    holdout: shots.filter((shot) => shot.match_id && holdoutIds.has(shot.match_id)),
    holdoutMatchIds: [...holdoutIds],
  }
}

export function trainValidationTestSplit(shots: Shot[], seed = 47) {
  const folds = stratifiedFolds(shots, 6, seed)
  return {
    train: folds.slice(0, 4).flat(),
    validation: folds[4],
    test: folds[5],
  }
}
