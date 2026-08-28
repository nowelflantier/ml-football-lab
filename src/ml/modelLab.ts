import type { Shot } from '../types'
import { confusionMatrix } from './evaluation'
import { predictKnnProbability, trainKnn, type KnnModel } from './knn'
import { accuracy, predictProbability, shotLabels, trainLogistic } from './logistic'
import { realShotRows, type RealFeatureKey } from './realFeatures'
import { predictTreeProbability, trainDecisionTree, type TreeModel } from './tree'

export type ModelFamily = 'logistic' | 'knn' | 'tree'

export type ModelConfig = {
  family: ModelFamily
  features: RealFeatureKey[]
  k?: number
  depth?: number
  minSamples?: number
}

type TrainedModel =
  | { family: 'logistic'; model: ReturnType<typeof trainLogistic> }
  | { family: 'knn'; model: KnnModel; k: number }
  | { family: 'tree'; model: TreeModel }

export type Evaluation = {
  probabilities: number[]
  labels: number[]
  accuracy: number
  brier: number
  truePositive: number
  trueNegative: number
  falsePositive: number
  falseNegative: number
  precision: number
  recall: number
}

export function trainConfiguredModel(shots: Shot[], config: ModelConfig): TrainedModel {
  const rows = realShotRows(shots, config.features)
  const labels = shotLabels(shots)
  if (config.family === 'logistic') return { family: 'logistic', model: trainLogistic(rows, labels, 3000) }
  if (config.family === 'knn') return { family: 'knn', model: trainKnn(rows, labels), k: config.k ?? 7 }
  return {
    family: 'tree',
    model: trainDecisionTree(rows, labels, config.depth ?? 3, config.minSamples ?? 8),
  }
}

export function predictConfigured(model: TrainedModel, shots: Shot[], features: RealFeatureKey[]) {
  const rows = realShotRows(shots, features)
  if (model.family === 'logistic') return rows.map((row) => predictProbability(model.model, row))
  if (model.family === 'knn') return rows.map((row) => predictKnnProbability(model.model, row, model.k))
  return rows.map((row) => predictTreeProbability(model.model, row))
}

export function brierScore(probabilities: number[], labels: number[]) {
  if (!probabilities.length) return 0
  return probabilities.reduce((sum, value, index) => sum + (value - labels[index]) ** 2, 0) / probabilities.length
}

export function evaluateConfig(train: Shot[], test: Shot[], config: ModelConfig, threshold = 0.25): Evaluation {
  const model = trainConfiguredModel(train, config)
  const probabilities = predictConfigured(model, test, config.features)
  const labels = shotLabels(test)
  const matrix = confusionMatrix(probabilities, labels, threshold)
  const precisionDenominator = matrix.truePositive + matrix.falsePositive
  const recallDenominator = matrix.truePositive + matrix.falseNegative
  return {
    probabilities,
    labels,
    accuracy: accuracy(probabilities, labels, threshold),
    brier: brierScore(probabilities, labels),
    ...matrix,
    precision: precisionDenominator ? matrix.truePositive / precisionDenominator : 0,
    recall: recallDenominator ? matrix.truePositive / recallDenominator : 0,
  }
}

export function modelLabel(config: ModelConfig) {
  if (config.family === 'logistic') return 'Logistique'
  if (config.family === 'knn') return `k-NN · k=${config.k ?? 7}`
  return `Arbre · profondeur ${config.depth ?? 3}`
}
