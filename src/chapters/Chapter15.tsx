import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ModelWorkbenchControls } from '../components/ModelWorkbench'
import { realShots } from '../data/realShots'
import { modelLabel, type ModelConfig } from '../ml/modelLab'
import { crossValidate } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Run = { config: ModelConfig; threshold: number; folds: number; result: ReturnType<typeof crossValidate>; direction: Direction }
type Direction = { label: string; positive: number; probability: string; classification: string; stability: string }

const baselineConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle'], k: 7, depth: 3 }
const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle'], k: 7, depth: 3 }

export function Chapter15({ step, setStep, onComplete }: Props) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [threshold, setThreshold] = useState(0.25)
  const [folds, setFolds] = useState(5)
  const [runs, setRuns] = useState<Run[]>([])
  const [candidate, setCandidate] = useState<number | null>(null)
  const baseline = useMemo(() => crossValidate(realShots, baselineConfig, 5, 0.25, 211), [])

  const directionFor = (result: ReturnType<typeof crossValidate>): Direction => {
    const probabilityBetter = result.meanBrier < baseline.meanBrier - 0.002
    const classificationBetter = result.meanAccuracy > baseline.meanAccuracy + 0.005
    const stabilityBetter = result.accuracyRange < baseline.accuracyRange - 0.01
    const positive = [probabilityBetter, classificationBetter, stabilityBetter].filter(Boolean).length
    return {
      positive,
      label: positive >= 2 ? 'Bonne direction' : positive === 1 ? 'Compromis intéressant' : 'Pas mieux que la baseline',
      probability: probabilityBetter ? 'mieux' : result.meanBrier <= baseline.meanBrier + 0.002 ? 'semblable' : 'moins bien',
      classification: classificationBetter ? 'mieux' : result.meanAccuracy >= baseline.meanAccuracy - 0.005 ? 'semblable' : 'moins bien',
      stability: stabilityBetter ? 'mieux' : result.accuracyRange <= baseline.accuracyRange + 0.01 ? 'semblable' : 'moins bien',
    }
  }

  const execute = () => {
    const result = crossValidate(realShots, config, folds, threshold, 211)
    setRuns((current) => [...current.slice(-9), { config: { ...config, features: [...config.features] }, threshold, folds, result, direction: directionFor(result) }])
  }

  if (step === 0) return (
    <LabShell visual={<div className="workshop-intro"><span>BASELINE</span><strong>distance + angle</strong><b>→</b><span>TON MODÈLE</span><strong>?</strong></div>}>
      <Eyebrow>Chapitre 15 · Model Workshop</Eyebrow>
      <h1>Il n’y a plus de bonne réponse cachée.</h1>
      <p className="lead">Ta référence est un modèle logistique simple avec distance + angle. Ton travail est d’essayer des configurations, de lire les compromis, puis de décider laquelle mérite d’être gardée.</p>
      <div className="intent-card"><strong>Ce qui compte</strong><span>Brier pour la qualité des probabilités, accuracy pour les décisions au seuil choisi, et variation entre folds pour la stabilité. Une amélioration sur un axe peut coûter sur un autre.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Entrer dans le workbench</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const latest = runs.at(-1)
    const families = new Set(runs.map((run) => run.config.family)).size
    const featureSets = new Set(runs.map((run) => [...run.config.features].sort().join('|'))).size
    const ready = runs.length >= 5 && families >= 2 && featureSets >= 3 && candidate !== null
    return (
      <LabShell visual={latest ? <DirectionBoard run={latest} baseline={baseline} /> : <BaselineBoard baseline={baseline} />}>
        <Eyebrow>Chapitre 15 · Atelier libre</Eyebrow>
        <h1>Construis, lance, lis, recommence.</h1>
        <ModelWorkbenchControls config={config} onChange={setConfig} threshold={threshold} onThresholdChange={setThreshold} showThreshold />
        <div className="workbench-block inline-fold-control"><span>4 · Combien de folds pour comparer</span><div className="segmented-control">{[3, 5, 7].map((count) => <button key={count} className={folds === count ? 'selected' : ''} onClick={() => setFolds(count)}>{count}</button>)}</div></div>
        <button className="primary-lab-button" onClick={execute}>▶ Lancer cette expérience</button>
        {runs.length > 0 && <div className="candidate-table workshop-candidates">{runs.map((run, index) => <button key={index} className={candidate === index ? 'selected' : ''} onClick={() => setCandidate(index)}><span>#{index + 1}</span><strong>{modelLabel(run.config)}</strong><small>{run.config.features.length} feat. · {run.folds} folds · seuil {Math.round(run.threshold * 100)}%</small><b className={run.direction.positive >= 2 ? 'good-direction' : ''}>{run.direction.label}</b><em>Brier {run.result.meanBrier.toFixed(3)} · Acc {Math.round(run.result.meanAccuracy * 100)}%</em></button>)}</div>}
        <p className="practice-gate">{runs.length < 5 ? `Fais encore ${5 - runs.length} expérience(s).` : families < 2 ? 'Essaie au moins deux familles de modèles.' : featureSets < 3 ? 'Teste au moins trois jeux de features différents.' : candidate === null ? 'Sélectionne le candidat que tu garderais.' : 'Tu as un candidat et assez d’expériences pour le défendre.'}</p>
        {ready && <ContinueButton onClick={() => setStep(2)}>Garder ce candidat</ContinueButton>}
      </LabShell>
    )
  }

  const chosen = candidate !== null ? runs[candidate] : runs.at(-1)
  return (
    <LabShell visual={chosen ? <DirectionBoard run={chosen} baseline={baseline} /> : undefined}>
      <Eyebrow>Chapitre 15 · Model selection</Eyebrow>
      <h1>Ton modèle n’est pas “le meilleur”. C’est ton meilleur candidat actuel.</h1>
      {chosen && <p className="lead">Tu gardes {modelLabel(chosen.config)} avec {chosen.config.features.length} features. Sur ton protocole : Brier {chosen.result.meanBrier.toFixed(3)}, accuracy {Math.round(chosen.result.meanAccuracy * 100)}%, variation {Math.round(chosen.result.accuracyRange * 100)} points.</p>}
      <div className="reveal-card"><span>Ce que tu viens de faire</span><strong>Model selection : comparer plusieurs hypothèses sous un protocole commun, conserver l’historique et choisir un candidat selon des critères explicites.</strong></div>
      <div className="checkpoint"><span>Prochaine épreuve</span><strong>Le chapitre suivant réserve des matchs entiers que ton workbench ne peut pas voir. À toi de décider quand ton modèle est prêt.</strong></div>
      <ContinueButton onClick={onComplete}>Construire mon premier vrai xG baseline</ContinueButton>
    </LabShell>
  )
}

function BaselineBoard({ baseline }: { baseline: ReturnType<typeof crossValidate> }) {
  return <div className="direction-board baseline"><span>Baseline</span><strong>Logistique · distance + angle</strong><div><b>{baseline.meanBrier.toFixed(3)}</b><small>Brier</small><b>{Math.round(baseline.meanAccuracy * 100)}%</b><small>accuracy</small></div></div>
}

function DirectionBoard({ run, baseline }: { run: Run; baseline: ReturnType<typeof crossValidate> }) {
  return <div className={`direction-board ${run.direction.positive >= 2 ? 'positive' : ''}`}><span>{run.direction.label}</span><strong>{modelLabel(run.config)}</strong><div className="direction-metrics"><p><small>Probabilités</small><b>{run.direction.probability}</b><em>{run.result.meanBrier.toFixed(3)} vs {baseline.meanBrier.toFixed(3)}</em></p><p><small>Classification</small><b>{run.direction.classification}</b><em>{Math.round(run.result.meanAccuracy * 100)}% vs {Math.round(baseline.meanAccuracy * 100)}%</em></p><p><small>Stabilité</small><b>{run.direction.stability}</b><em>{Math.round(run.result.accuracyRange * 100)} vs {Math.round(baseline.accuracyRange * 100)} pts</em></p></div></div>
}
