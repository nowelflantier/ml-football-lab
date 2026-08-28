import type { Shot } from '../types'

type Model = {
  weights: number[]
  bias: number
  means: number[]
  scales: number[]
}

const sigmoid = (value: number) => 1 / (1 + Math.exp(-value))

const standardize = (rows: number[][]) => {
  const featureCount = rows[0]?.length ?? 0
  const means = Array.from({ length: featureCount }, (_, index) =>
    rows.reduce((sum, row) => sum + row[index], 0) / rows.length,
  )
  const scales = Array.from({ length: featureCount }, (_, index) => {
    const variance = rows.reduce((sum, row) => sum + (row[index] - means[index]) ** 2, 0) / rows.length
    return Math.sqrt(variance) || 1
  })
  return { means, scales }
}

export function trainLogistic(rows: number[][], labels: number[], iterations = 4500, learningRate = 0.06): Model {
  const { means, scales } = standardize(rows)
  const normalized = rows.map((row) => row.map((value, index) => (value - means[index]) / scales[index]))
  const weights = Array.from({ length: rows[0].length }, () => 0)
  let bias = 0

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const weightGradients = Array.from({ length: weights.length }, () => 0)
    let biasGradient = 0

    normalized.forEach((row, rowIndex) => {
      const score = row.reduce((sum, value, featureIndex) => sum + value * weights[featureIndex], bias)
      const error = sigmoid(score) - labels[rowIndex]
      row.forEach((value, featureIndex) => {
        weightGradients[featureIndex] += error * value
      })
      biasGradient += error
    })

    weights.forEach((_, featureIndex) => {
      weights[featureIndex] -= (learningRate * weightGradients[featureIndex]) / normalized.length
    })
    bias -= (learningRate * biasGradient) / normalized.length
  }

  return { weights, bias, means, scales }
}

export function predictProbability(model: Model, row: number[]) {
  const normalized = row.map((value, index) => (value - model.means[index]) / model.scales[index])
  const score = normalized.reduce((sum, value, index) => sum + value * model.weights[index], model.bias)
  return sigmoid(score)
}

export const shotRows = (shots: Shot[], features: Array<'distance' | 'angle'>) =>
  shots.map((shot) => features.map((feature) => shot[feature]))

export const shotLabels = (shots: Shot[]) => shots.map((shot) => (shot.goal ? 1 : 0))

export function accuracy(probabilities: number[], labels: number[], threshold = 0.5) {
  const correct = probabilities.filter((probability, index) => (probability >= threshold ? 1 : 0) === labels[index]).length
  return correct / labels.length
}

export function thresholdAccuracy(shots: Shot[], threshold: number) {
  const correct = shots.filter((shot) => (shot.distance < threshold) === shot.goal).length
  return { correct, total: shots.length, ratio: correct / shots.length }
}

export function bestDistanceThreshold(shots: Shot[]) {
  let best = { threshold: 5, correct: 0, total: shots.length, ratio: 0 }
  for (let threshold = 5; threshold <= 26; threshold += 0.1) {
    const result = thresholdAccuracy(shots, threshold)
    if (result.correct > best.correct) best = { threshold, ...result }
  }
  return best
}
