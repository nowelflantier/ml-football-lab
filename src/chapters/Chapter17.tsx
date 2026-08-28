import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ModelWorkbenchControls } from '../components/ModelWorkbench'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { evaluateConfig, modelLabel, type ModelConfig } from '../ml/modelLab'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Run = { config: ModelConfig; threshold: number; evaluation: ReturnType<typeof evaluateConfig> }
type Filter = 'all' | 'missed' | 'false-alert' | 'surprising'

const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle', 'is_header', 'is_penalty'], k: 7, depth: 3 }

export function Chapter17({ step, setStep, onComplete }: Props) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [threshold, setThreshold] = useState(0.25)
  const [runs, setRuns] = useState<Run[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inspected, setInspected] = useState<string[]>([])
  const split = useMemo(() => stratifiedSplit(realShots, 307, 0.3), [])

  const execute = () => {
    const evaluation = evaluateConfig(split.train, split.test, config, threshold)
    setRuns((current) => [...current.slice(-5), { config: { ...config, features: [...config.features] }, threshold, evaluation }])
  }

  const latest = runs.at(-1)
  const errors = latest ? split.test.map((shot, index) => {
    const probability = latest.evaluation.probabilities[index]
    const predictedGoal = probability >= latest.threshold
    const isError = predictedGoal !== shot.goal
    const surprise = shot.goal ? 1 - probability : probability
    return { shot, probability, predictedGoal, isError, surprise }
  }).filter((item) => item.isError).sort((a, b) => b.surprise - a.surprise) : []

  const visibleErrors = errors.filter((item) => {
    if (filter === 'missed') return item.shot.goal && !item.predictedGoal
    if (filter === 'false-alert') return !item.shot.goal && item.predictedGoal
    if (filter === 'surprising') return item.surprise >= 0.65
    return true
  })

  const selected = errors.find((item) => item.shot.id === selectedId) ?? visibleErrors[0]
  const inspect = (id: string) => {
    setSelectedId(id)
    setInspected((current) => current.includes(id) ? current : [...current, id])
  }

  if (step === 0) return (
    <LabShell visual={<div className="analyst-intro"><span>Score global</span><strong>?</strong><b>→</b><span>Quelles erreurs&nbsp;?</span><strong>?</strong></div>}>
      <Eyebrow>Chapitre 17 · Error Analysis</Eyebrow>
      <h1>Un score moyen ne te dit pas où ton modèle se trompe.</h1>
      <p className="lead">Tu vas arrêter de regarder seulement une métrique globale. Le but est de trouver des erreurs concrètes, les inspecter et chercher des motifs qui pourraient inspirer la prochaine feature ou le prochain réglage.</p>
      <ContinueButton onClick={() => setStep(1)}>Ouvrir la table des erreurs</ContinueButton>
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={latest ? <ErrorSummary latest={latest} errorCount={errors.length} /> : <div className="empty-lab-visual"><strong>Aucun modèle lancé</strong><span>Configure une version puis lance-la.</span></div>}>
      <Eyebrow>Chapitre 17 · Chercher les erreurs intéressantes</Eyebrow>
      <h1>Construis une version, puis ouvre ses erreurs une par une.</h1>
      <ModelWorkbenchControls config={config} onChange={setConfig} threshold={threshold} onThresholdChange={setThreshold} showThreshold />
      <button className="primary-lab-button" onClick={execute}>▶ Entraîner + générer les erreurs</button>
      {latest && <>
        <div className="segmented-control analyst-filters">
          {([['all','Toutes'],['missed','Buts ratés'],['false-alert','Fausses alertes'],['surprising','Très confiantes']] as const).map(([value,label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <div className="error-analysis-grid">
          <div className="error-list">{visibleErrors.slice(0, 12).map((item) => <button key={item.shot.id} className={selected?.shot.id === item.shot.id ? 'selected' : ''} onClick={() => inspect(item.shot.id)}><span>{item.shot.goal ? 'BUT RÉEL' : 'PAS BUT'}</span><strong>{Math.round(item.probability * 100)}%</strong><small>{item.shot.provenance?.player ?? 'Joueur'} · {item.shot.distance.toFixed(1)}m · {item.shot.angle.toFixed(0)}°</small></button>)}</div>
          {selected && <div className="error-inspector"><span>{selected.shot.provenance?.team ?? 'Équipe'}</span><strong>{selected.shot.provenance?.player ?? 'Joueur inconnu'}</strong><small>minute {selected.shot.provenance?.minute ?? '?'} · {selected.shot.body_part ?? 'body part ?'} · {selected.shot.shot_type ?? 'type ?'}</small><div><p><b>{Math.round(selected.probability * 100)}%</b><small>probabilité modèle</small></p><p><b>{selected.shot.goal ? 'BUT' : 'PAS BUT'}</b><small>résultat réel</small></p></div><p>distance {selected.shot.distance.toFixed(1)}m · angle {selected.shot.angle.toFixed(0)}° · pression {selected.shot.under_pressure ? 'oui' : 'non'} · première intention {selected.shot.first_time ? 'oui' : 'non'}</p></div>}
        </div>
      </>}
      <p className="practice-gate">{runs.length < 3 ? `Fais encore ${3 - runs.length} version(s) du modèle.` : inspected.length < 3 ? `Inspecte encore ${3 - inspected.length} erreur(s) concrète(s).` : 'Tu as assez d’éléments pour faire une vraie analyse d’erreurs.'}</p>
      {runs.length >= 3 && inspected.length >= 3 && <ContinueButton onClick={() => setStep(2)}>Formaliser cette méthode</ContinueButton>}
    </LabShell>
  )

  return (
    <LabShell visual={latest ? <ErrorSummary latest={latest} errorCount={errors.length} /> : undefined}>
      <Eyebrow>Chapitre 17 · Error Analysis</Eyebrow>
      <h1>Les erreurs deviennent des données pour ta prochaine hypothèse.</h1>
      <p className="lead">Tu as inspecté des tirs précis au lieu de rester au niveau du score. C’est souvent là qu’on découvre qu’un modèle manque d’une information, qu’un sous-groupe se comporte différemment ou qu’un seuil crée un mauvais compromis.</p>
      <div className="reveal-card"><span>Pratique débloquée</span><strong>Error analysis : classer les erreurs, inspecter les cas les plus informatifs et chercher des patterns avant de modifier le modèle.</strong></div>
      <div className="checkpoint"><span>Réflexe analyste</span><strong>Je ne demande pas seulement “combien d’erreurs ?” mais “quelles erreurs, sur quels tirs, et qu’est-ce qu’elles ont en commun ?”</strong></div>
      <ContinueButton onClick={onComplete}>Passer au laboratoire What-if</ContinueButton>
    </LabShell>
  )
}

function ErrorSummary({ latest, errorCount }: { latest: Run; errorCount: number }) {
  return <div className="error-summary"><span>{modelLabel(latest.config)}</span><strong>{errorCount} erreurs</strong><div><p><b>{latest.evaluation.falseNegative}</b><small>buts ratés</small></p><p><b>{latest.evaluation.falsePositive}</b><small>fausses alertes</small></p></div></div>
}
