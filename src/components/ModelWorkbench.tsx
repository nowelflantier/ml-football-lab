import { realFeatureLabels, type RealFeatureKey } from '../ml/realFeatures'
import type { ModelConfig, ModelFamily } from '../ml/modelLab'

const availableFeatures: RealFeatureKey[] = ['distance', 'angle', 'is_header', 'first_time', 'under_pressure', 'is_penalty']

const familyCopy: Record<ModelFamily, { title: string; subtitle: string }> = {
  logistic: { title: 'Logistique', subtitle: 'relation lisse' },
  knn: { title: 'k-NN', subtitle: 'voisins similaires' },
  tree: { title: 'Arbre', subtitle: 'règles si / alors' },
}

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
        <span>1 · Quelles informations le modèle peut utiliser ?</span>
        <div className="workbench-feature-grid">
          {availableFeatures.map((feature) => (
            <button key={feature} className={config.features.includes(feature) ? 'selected' : ''} onClick={() => toggleFeature(feature)}>
              {realFeatureLabels[feature]}
            </button>
          ))}
        </div>
        <small>Tu modifies les colonnes disponibles pour apprendre. Ajouter une information ne garantit pas qu’elle aidera sur des tirs inconnus.</small>
      </div>

      <div className="workbench-block">
        <span>2 · Quelle façon d’apprendre ?</span>
        <div className="segmented-control workbench-models">
          {(Object.keys(familyCopy) as ModelFamily[]).map((family) => (
            <button key={family} className={config.family === family ? 'selected' : ''} onClick={() => setFamily(family)}>
              {familyCopy[family].title}
              <small>{familyCopy[family].subtitle}</small>
            </button>
          ))}
        </div>
        {config.family === 'knn' && (
          <label className="workbench-slider">
            <span>Combien de voisins similaires consulter ? · k = {config.k ?? 7}</span>
            <input type="range" min="1" max="25" step="2" value={config.k ?? 7} onChange={(event) => onChange({ ...config, k: Number(event.target.value) })} />
            <small>Petit k = quelques cas très proches décident beaucoup. Grand k = davantage d’exemples, réponse généralement plus lissée.</small>
          </label>
        )}
        {config.family === 'tree' && (
          <label className="workbench-slider">
            <span>Combien d’étages de règles autoriser ? · profondeur {config.depth ?? 3}</span>
            <input type="range" min="1" max="6" step="1" value={config.depth ?? 3} onChange={(event) => onChange({ ...config, depth: Number(event.target.value) })} />
            <small>Plus profond = davantage de questions « si / alors ». Cela peut capturer plus de détails, mais aussi sur-apprendre.</small>
          </label>
        )}
      </div>

      {showThreshold && threshold !== undefined && onThresholdChange && (
        <div className="workbench-block">
          <span>3 · À partir de quand déclencher l’alerte « but probable » ?</span>
          <label className="workbench-slider">
            <span>Seuil = {Math.round(threshold * 100)}%</span>
            <input type="range" min="0.05" max="0.7" step="0.05" value={threshold} onChange={(event) => onThresholdChange(Number(event.target.value))} />
            <small>Baisser le seuil retrouve souvent plus de vrais buts, mais crée aussi plus de fausses alertes.</small>
          </label>
        </div>
      )}
    </div>
  )
}

export function MetricCards({ accuracy, brier, recall, precision }: { accuracy: number; brier: number; recall: number; precision: number }) {
  return (
    <div className="metric-grid workbench-metrics">
      <div className="metric"><strong>{Math.round(accuracy * 100)}%</strong><span>Décisions justes</span><small>accuracy · tous les tirs</small></div>
      <div className="metric"><strong>{brier.toFixed(3)}</strong><span>Erreur des probabilités</span><small>Brier · plus bas = mieux</small></div>
      <div className="metric"><strong>{Math.round(recall * 100)}%</strong><span>Buts retrouvés</span><small>recall · parmi les vrais buts</small></div>
      <div className="metric"><strong>{Math.round(precision * 100)}%</strong><span>Alertes correctes</span><small>precision · parmi les alertes</small></div>
    </div>
  )
}
