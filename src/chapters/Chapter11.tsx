import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { MetricCards, ModelWorkbenchControls } from '../components/ModelWorkbench'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { evaluateConfig, modelLabel, type ModelConfig } from '../ml/modelLab'
import { calibrationBuckets } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }

type Run = {
  config: ModelConfig
  evaluation: ReturnType<typeof evaluateConfig>
  buckets: ReturnType<typeof calibrationBuckets>
}

const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle'], k: 7, depth: 3 }

export function Chapter11({ step, setStep, onComplete }: Props) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [runs, setRuns] = useState<Run[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const split = useMemo(() => stratifiedSplit(realShots, 83, 0.35), [])

  const execute = () => {
    const evaluation = evaluateConfig(split.train, split.test, config, 0.25)
    const run = { config: { ...config, features: [...config.features] }, evaluation, buckets: calibrationBuckets(evaluation.probabilities, evaluation.labels, 5) }
    setRuns((current) => [...current.slice(-5), run])
  }

  if (step === 0) {
    return (
      <LabShell visual={<div className="calibration-intro"><strong>30%</strong><span>annoncé par le modèle</span><b>→</b><strong>?</strong><span>dans la réalité</span></div>}>
        <Eyebrow>Chapitre 11 · Est-ce qu’un 30% mérite d’être appelé 30%&nbsp;?</Eyebrow>
        <h1>Cette fois, tu vas tester la qualité des probabilités.</h1>
        <p className="lead">Un modèle peut classer correctement beaucoup de tirs tout en produisant de mauvaises probabilités. Pour un xG, c’est un problème : 30% devrait réellement ressembler à 30% sur beaucoup de situations.</p>
        <div className="intent-card"><strong>Ce que tu vas faire</strong><span>Configurer plusieurs modèles, les lancer sur les mêmes tirs inconnus, puis comparer ce qu’ils annoncent avec ce qui arrive réellement.</span></div>
        <ContinueButton onClick={() => setStep(1)}>Ouvrir le labo de calibration</ContinueButton>
      </LabShell>
    )
  }

  if (step === 1) {
    const latest = runs.at(-1)
    return (
      <LabShell visual={latest ? <CalibrationVisual run={latest} /> : <div className="empty-lab-visual"><strong>Aucun essai</strong><span>Configure un modèle puis lance-le.</span></div>}>
        <Eyebrow>Chapitre 11 · Labo de calibration</Eyebrow>
        <h1>Construis trois versions et regarde leurs probabilités.</h1>
        <p className="lead">Tu peux changer les features, la famille du modèle et ses réglages. Chaque clic sur « Lancer » entraîne réellement une nouvelle version.</p>
        <ModelWorkbenchControls config={config} onChange={setConfig} />
        <button className="primary-lab-button" onClick={execute}>▶ Entraîner + mesurer</button>
        {latest && <MetricCards accuracy={latest.evaluation.accuracy} brier={latest.evaluation.brier} recall={latest.evaluation.recall} precision={latest.evaluation.precision} />}
        {runs.length > 0 && <RunHistory runs={runs} selected={selected} onSelect={setSelected} />}
        <p className="practice-gate">{runs.length < 3 ? `Encore ${3 - runs.length} essai(s) avant de trancher.` : 'Tu as assez d’essais pour comparer.'}</p>
        {runs.length >= 3 && <ContinueButton onClick={() => setStep(2)}>Choisir la version la plus crédible</ContinueButton>}
      </LabShell>
    )
  }

  const chosen = selected !== null ? runs[selected] : runs.at(-1)
  return (
    <LabShell visual={chosen ? <CalibrationVisual run={chosen} /> : undefined}>
      <Eyebrow>Chapitre 11 · Calibration</Eyebrow>
      <h1>Une bonne probabilité doit tenir sa promesse.</h1>
      <p className="lead">Les barres comparent la probabilité moyenne annoncée dans chaque tranche et la fréquence de buts réellement observée. Plus les deux se ressemblent, mieux le modèle est calibré.</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Calibration : vérifier que les probabilités annoncées correspondent aux fréquences observées. Brier : une mesure globale de l’erreur probabiliste ; plus bas est meilleur.</strong></div>
      <UnderTheHood><p>Le Brier calcule la moyenne de l’écart au carré entre la probabilité annoncée et le résultat réel 0/1. Contrairement à l’accuracy, il pénalise aussi la mauvaise confiance.</p></UnderTheHood>
      <div className="checkpoint"><span>Réflexe</span><strong>Pour un modèle xG, je ne veux pas seulement qu’il classe bien : je veux que ses pourcentages soient crédibles.</strong></div>
      <ContinueButton onClick={onComplete}>Passer à la validation répétée</ContinueButton>
    </LabShell>
  )
}

function CalibrationVisual({ run }: { run: Run }) {
  return (
    <div className="calibration-board">
      <div className="calibration-title"><span>{modelLabel(run.config)}</span><strong>Brier {run.evaluation.brier.toFixed(3)}</strong></div>
      {run.buckets.map((bucket, index) => (
        <div key={index} className="calibration-row">
          <span>{Math.round(bucket.from * 100)}–{Math.round(bucket.to * 100)}%</span>
          <div><i className="predicted" style={{ width: `${bucket.predicted * 100}%` }} /><i className="observed" style={{ width: `${bucket.observed * 100}%` }} /></div>
          <small>{bucket.count} tirs · annoncé {Math.round(bucket.predicted * 100)}% / réel {Math.round(bucket.observed * 100)}%</small>
        </div>
      ))}
    </div>
  )
}

function RunHistory({ runs, selected, onSelect }: { runs: Run[]; selected: number | null; onSelect: (index: number) => void }) {
  return <div className="workbench-history">{runs.map((run, index) => <button key={index} className={selected === index ? 'selected' : ''} onClick={() => onSelect(index)}><span>#{index + 1} · {modelLabel(run.config)}</span><small>{run.config.features.length} features</small><strong>Brier {run.evaluation.brier.toFixed(3)}</strong></button>)}</div>
}
