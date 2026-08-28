import { realFeatureLabels, type RealFeatureKey } from '../ml/realFeatures'
import type { ModelConfig, ModelFamily } from '../ml/modelLab'

const availableFeatures: RealFeatureKey[] = ['distance', 'angle', 'is_header', 'first_time', 'under_pressure', 'is_penalty']

export function ModelWorkbenchControls({
  config,
  onChange,
  threshold,
  onThresholdChange,
  showThreshold = false,
}: {
  config: ModelConfig
  onChange: (config: ModelConfig) => void
  threshold?: number
  onThresholdChange?: (threshold: number) => void
  showThreshold?: boolean
}) {
  const setFamily = (family: ModelFamily) => onChange({ ...config, family })
  const toggleFeature = (feature: RealFeatureKey) => {
    const has = config.features.includes(feature)
    if (has && config.features.length === 1) return
    onChange({ ...config, features: has ? config.features.filter((item) => item !== feature) : [...config.features, feature] })
  }

  return (
    <div className="workbench-controls">
      <div className="workbench-block">
        <span>1 · Ce que le modèle voit</span>
        <div className="workbench-feature-grid">
          {availableFeatures.map((feature) => (
            <button key={feature} className={config.features.includes(feature) ? 'selected' : ''} onClick={() => toggleFeature(feature)}>
              {realFeatureLabels[feature]}
            </button>
          ))}
        </div>
      </div>

      <div className="workbench-block">
        <span>2 · Comment il apprend</span>
        <div className="segmented-control workbench-models">
          <button className={config.family === 'logistic' ? 'selected' : ''} onClick={() => setFamily('logistic')}>Logistique</button>
          <button className={config.family === 'knn' ? 'selected' : ''} onClick={() => setFamily('knn')}>k-NN</button>
          <button className={config.family === 'tree' ? 'selected' : ''} onClick={() => setFamily('tree')}>Arbre</button>
        </div>
        {config.family === 'knn' && (
          <label className="workbench-slider">
            <span>Voisins consultés · k = {config.k ?? 7}</span>
            <input type="range" min="1" max="25" step="2" value={config.k ?? 7} onChange={(event) => onChange({ ...config, k: Number(event.target.value) })} />
            <small>Petit k = très local · grand k = plus lissé</small>
          </label>
        )}
        {config.family === 'tree' && (
          <label className="workbench-slider">
            <span>Profondeur max = {config.depth ?? 3}</span>
            <input type="range" min="1" max="6" step="1" value={config.depth ?? 3} onChange={(event) => onChange({ ...config, depth: Number(event.target.value) })} />
            <small>Plus profond = davantage de règles et de détails</small>
          </label>
        )}
      </div>

      {showThreshold && threshold !== undefined && onThresholdChange && (
        <div className="workbench-block">
          <span>3 · Quand dire « but probable »</span>
          <label className="workbench-slider">
            <span>Seuil = {Math.round(threshold * 100)}%</span>
            <input type="range" min="0.05" max="0.7" step="0.05" value={threshold} onChange={(event) => onThresholdChange(Number(event.target.value))} />
            <small>Baisser le seuil détecte plus de buts mais crée souvent plus de fausses alertes.</small>
          </label>
        </div>
      )}
    </div>
  )
}

export function MetricCards({ accuracy, brier, recall, precision }: { accuracy: number; brier: number; recall: number; precision: number }) {
  return (
    <div className="metric-grid workbench-metrics">
      <div className="metric"><strong>{Math.round(accuracy * 100)}%</strong><span>accuracy</span></div>
      <div className="metric"><strong>{brier.toFixed(3)}</strong><span>Brier ↓</span></div>
      <div className="metric"><strong>{Math.round(recall * 100)}%</strong><span>buts repérés</span></div>
      <div className="metric"><strong>{Math.round(precision * 100)}%</strong><span>précision alertes</span></div>
    </div>
  )
}
