export type KnnModel = {
  rows: number[][]
  labels: number[]
  means: number[]
  scales: number[]
}

function stats(rows: number[][]) {
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

export function trainKnn(rows: number[][], labels: number[]): KnnModel {
  const { means, scales } = stats(rows)
  return { rows, labels, means, scales }
}

export function predictKnnProbability(model: KnnModel, row: number[], k = 3) {
  const neighbors = model.rows
    .map((known, index) => {
      const distance = Math.sqrt(known.reduce((sum, value, featureIndex) => {
        const knownValue = (value - model.means[featureIndex]) / model.scales[featureIndex]
        const newValue = (row[featureIndex] - model.means[featureIndex]) / model.scales[featureIndex]
        return sum + (knownValue - newValue) ** 2
      }, 0))
      return { distance, label: model.labels[index] }
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.max(1, Math.min(k, model.rows.length)))

  return neighbors.reduce((sum, neighbor) => sum + neighbor.label, 0) / neighbors.length
}
