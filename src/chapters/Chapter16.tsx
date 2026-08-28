import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ModelWorkbenchControls } from '../components/ModelWorkbench'
import { realShots } from '../data/realShots'
import { brierScore, evaluateConfig, modelLabel, type ModelConfig } from '../ml/modelLab'
import { crossValidate, groupHoldoutByMatch } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Run = { config: ModelConfig; folds: number; result: ReturnType<typeof crossValidate> }
const baselineConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle'], k: 7, depth: 3 }
const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle'], k: 7, depth: 3 }

export function Chapter16({ step, setStep, onComplete }: Props) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [folds, setFolds] = useState(5)
  const [runs, setRuns] = useState<Run[]>([])
  const [candidate, setCandidate] = useState<number | null>(null)
  const [lockedCandidate, setLockedCandidate] = useState<number | null>(null)
  const split = useMemo(() => groupHoldoutByMatch(realShots, 3, 233), [])

  const execute = () => {
    const result = crossValidate(split.develop, config, folds, 0.25, 251)
    const run = { config: { ...config, features: [...config.features] }, folds, result }
    const nextRuns = [...runs.slice(-8), run]
    setRuns(nextRuns)
    setCandidate(nextRuns.length - 1)
  }

  const lockAndReveal = () => {
    if (candidate === null) return
    setLockedCandidate(candidate)
    setStep(2)
  }

  if (step === 0) return (
    <LabShell visual={<div className="holdout-intro"><div><strong>{split.develop.length}</strong><span>tirs développement</span></div><b>+</b><div className="locked"><strong>{split.holdout.length}</strong><span>tirs · 3 matchs 🔒</span></div></div>}>
      <Eyebrow>Chapitre 16 · Holdout par match</Eyebrow>
      <h1>Trois matchs restent complètement hors de ton atelier.</h1>
      <p className="lead">Tu développes ton modèle sur les autres matchs. Quand tu le décides, tu figes un candidat et seulement ensuite tu regardes les 3 matchs holdout.</p>
      <ContinueButton onClick={() => setStep(1)}>Préparer un candidat</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const latest = runs.at(-1)
    const chosen = candidate !== null ? runs[candidate] : undefined
    return (
      <LabShell visual={<div className="holdout-status"><span>DÉVELOPPEMENT</span><strong>{latest ? `${latest.result.meanBrier.toFixed(3)} erreur prob.` : 'aucun essai'}</strong><b>HOLDOUT 🔒</b><small>3 matchs jamais utilisés pour décider</small></div>}>
        <Eyebrow>Chapitre 16 · Avant le reveal</Eyebrow>
        <h1>Lance au moins une version, puis décide quand tu es prêt.</h1>
        <ModelWorkbenchControls config={config} onChange={setConfig} />
        <div className="workbench-block inline-fold-control"><span>Validation interne</span><div className="segmented-control">{[3, 5, 7].map((count) => <button key={count} className={folds === count ? 'selected' : ''} onClick={() => setFolds(count)}>{count} folds</button>)}</div></div>
        <button className="primary-lab-button" onClick={execute}>▶ Évaluer sur le développement</button>
        {runs.length > 0 && <div className="candidate-table final-candidates">{runs.map((run, index) => <button key={index} className={candidate === index ? 'selected' : ''} onClick={() => setCandidate(index)}><span>#{index + 1}</span><strong>{modelLabel(run.config)}</strong><small>{run.config.features.length} feat. · {run.folds} folds</small><b>{run.result.meanBrier.toFixed(3)} erreur prob.</b><em>{Math.round(run.result.meanAccuracy * 100)}% décisions · variation {Math.round(run.result.accuracyRange * 100)} pts</em></button>)}</div>}
        {chosen && <>
          <div className="optional-challenge"><strong>Tu peux continuer à développer</strong><span>Essaie d’autres versions si ça t’intéresse. Mais le principe du holdout ne demande pas un nombre minimum d’essais : il demande seulement que tu choisisses avant de voir le résultat final.</span></div>
          <button className="holdout-button" onClick={lockAndReveal}>🔒 Figer ce candidat et ouvrir les 3 matchs</button>
        </>}
      </LabShell>
    )
  }

  const chosen = lockedCandidate !== null ? runs[lockedCandidate] : undefined
  const candidateHoldout = chosen ? evaluateConfig(split.develop, split.holdout, chosen.config, 0.25) : null
  const baselineHoldout = evaluateConfig(split.develop, split.holdout, baselineConfig, 0.25)
  const referenceProbabilities = split.holdout.map((shot) => shot.statsbomb_xg_reference ?? 0)
  const labels = split.holdout.map((shot) => shot.goal ? 1 : 0)
  const referenceBrier = brierScore(referenceProbabilities, labels)

  return (
    <LabShell visual={candidateHoldout && chosen ? <FinalScoreboard candidate={chosen} candidateBrier={candidateHoldout.brier} baselineBrier={baselineHoldout.brier} referenceBrier={referenceBrier} /> : undefined}>
      <Eyebrow>Chapitre 16 · Holdout reveal</Eyebrow>
      <h1>Voilà le résultat sur trois matchs qui n’ont pas influencé ton choix.</h1>
      {candidateHoldout && chosen && <p className="lead">Ton {modelLabel(chosen.config)} obtient une erreur probabiliste de {candidateHoldout.brier.toFixed(3)}, contre {baselineHoldout.brier.toFixed(3)} pour la baseline distance + angle.</p>}
      <div className="holdout-detail"><div><span>Ton candidat</span><strong>{candidateHoldout?.brier.toFixed(3)}</strong><small>erreur holdout</small></div><div><span>Baseline simple</span><strong>{baselineHoldout.brier.toFixed(3)}</strong><small>même holdout</small></div><div><span>StatsBomb référence</span><strong>{referenceBrier.toFixed(3)}</strong><small>mêmes tirs</small></div></div>
      <p>Avec seulement trois matchs, ce n’est pas un verdict universel. C’est une démonstration du principe : <strong>garder des données vraiment hors de la boucle de décision</strong>.</p>
      <ContinueButton onClick={onComplete}>Passer au mode analyste</ContinueButton>
    </LabShell>
  )
}

function FinalScoreboard({ candidate, candidateBrier, baselineBrier, referenceBrier }: { candidate: Run; candidateBrier: number; baselineBrier: number; referenceBrier: number }) {
  const delta = baselineBrier - candidateBrier
  return <div className={`final-scoreboard ${delta > 0 ? 'positive' : ''}`}><span>{delta > 0 ? 'Tu bats la baseline sur ce holdout' : 'La baseline reste devant sur ce holdout'}</span><strong>{modelLabel(candidate.config)}</strong><div><p><small>TON MODÈLE</small><b>{candidateBrier.toFixed(3)}</b></p><p><small>BASELINE</small><b>{baselineBrier.toFixed(3)}</b></p><p><small>STATSBOMB REF.</small><b>{referenceBrier.toFixed(3)}</b></p></div></div>
}
