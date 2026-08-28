export type TreeNode = {
  probability: number
  samples: number
  featureIndex?: number
  threshold?: number
  left?: TreeNode
  right?: TreeNode
}

export type TreeModel = {
  root: TreeNode
  maxDepth: number
  minSamples: number
}

function probability(labels: number[]) {
  if (!labels.length) return 0
  return labels.reduce((sum, label) => sum + label, 0) / labels.length
}

function gini(labels: number[]) {
  if (!labels.length) return 0
  const p = probability(labels)
  return 1 - p * p - (1 - p) * (1 - p)
}

function bestSplit(rows: number[][], labels: number[], minSamples: number) {
  let best: { featureIndex: number; threshold: number; score: number } | null = null
  const featureCount = rows[0]?.length ?? 0

  for (let featureIndex = 0; featureIndex < featureCount; featureIndex += 1) {
    const values = Array.from(new Set(rows.map((row) => row[featureIndex]))).sort((a, b) => a - b)
    if (values.length < 2) continue

    const thresholds: number[] = []
    for (let index = 0; index < values.length - 1; index += 1) {
      thresholds.push((values[index] + values[index + 1]) / 2)
    }

    const stride = Math.max(1, Math.floor(thresholds.length / 28))
    for (let index = 0; index < thresholds.length; index += stride) {
      const threshold = thresholds[index]
      const leftLabels: number[] = []
      const rightLabels: number[] = []

      rows.forEach((row, rowIndex) => {
        if (row[featureIndex] <= threshold) leftLabels.push(labels[rowIndex])
        else rightLabels.push(labels[rowIndex])
      })

      if (leftLabels.length < minSamples || rightLabels.length < minSamples) continue
      const weighted = (leftLabels.length * gini(leftLabels) + rightLabels.length * gini(rightLabels)) / labels.length
      if (!best || weighted < best.score) best = { featureIndex, threshold, score: weighted }
    }
  }

  return best
}

function build(rows: number[][], labels: number[], depth: number, maxDepth: number, minSamples: number): TreeNode {
  const node: TreeNode = { probability: probability(labels), samples: labels.length }
  if (depth >= maxDepth || labels.length < minSamples * 2 || gini(labels) === 0) return node

  const split = bestSplit(rows, labels, minSamples)
  if (!split) return node

  const leftRows: number[][] = []
  const leftLabels: number[] = []
  const rightRows: number[][] = []
  const rightLabels: number[] = []

  rows.forEach((row, index) => {
    if (row[split.featureIndex] <= split.threshold) {
      leftRows.push(row)
      leftLabels.push(labels[index])
    } else {
      rightRows.push(row)
      rightLabels.push(labels[index])
    }
  })

  return {
    ...node,
    featureIndex: split.featureIndex,
    threshold: split.threshold,
    left: build(leftRows, leftLabels, depth + 1, maxDepth, minSamples),
    right: build(rightRows, rightLabels, depth + 1, maxDepth, minSamples),
  }
}

export function trainDecisionTree(rows: number[][], labels: number[], maxDepth = 3, minSamples = 8): TreeModel {
  if (!rows.length || rows.length !== labels.length) throw new Error('Tree training requires matching non-empty rows and labels')
  return { root: build(rows, labels, 0, maxDepth, minSamples), maxDepth, minSamples }
}

export function predictTreeProbability(model: TreeModel, row: number[]) {
  let node = model.root
  while (node.featureIndex !== undefined && node.threshold !== undefined && node.left && node.right) {
    node = row[node.featureIndex] <= node.threshold ? node.left : node.right
  }
  return node.probability
}

export function treeNodeCount(node: TreeNode): number {
  return 1 + (node.left ? treeNodeCount(node.left) : 0) + (node.right ? treeNodeCount(node.right) : 0)
}
