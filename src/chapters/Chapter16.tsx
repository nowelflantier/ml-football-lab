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
    setRuns((current) => [...current.slice(-9), { config: { ...config, features: [...config.features] }, folds, result }])
  }

  const lockAndReveal = () => {
    if (candidate === null) return
    setLockedCandidate(candidate)
    setStep(2)
  }

  if (step === 0) return (
    <LabShell visual={<div className="holdout-intro"><div><strong>{split.develop.length}</strong><span>tirs développement</span></div><b>+</b><div className="locked"><strong>{split.holdout.length}</strong><span>tirs · 3 matchs 🔒</span></div></div>}>
      <Eyebrow>Chapitre 16 · Ton premier vrai xG baseline</Eyebrow>
      <h1>Trois matchs sortent complètement de ton atelier.</h1>
      <p className="lead">Tu peux expérimenter librement sur les {split.develop.length} tirs de développement. Les {split.holdout.length} tirs de trois matchs entiers ne participeront ni à tes folds ni à tes décisions.</p>
      <div className="intent-card"><strong>Ta mission</strong><span>Construire un candidat que tu es prêt à défendre sans connaître son score sur les 3 matchs holdout.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Commencer le développement</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const latest = runs.at(-1)
    return (
      <LabShell visual={<div className="holdout-status"><span>DÉVELOPPEMENT</span><strong>{latest ? `${latest.result.meanBrier.toFixed(3)} Brier` : 'aucun essai'}</strong><b>HOLDOUT 🔒</b><small>matchs {split.holdoutMatchIds.join(' · ')}</small></div>}>
        <Eyebrow>Chapitre 16 · Développe sans regarder le final</Eyebrow>
        <h1>Fais tes essais. Puis décide toi-même quand arrêter.</h1>
        <ModelWorkbenchControls config={config} onChange={setConfig} />
        <div className="workbench-block inline-fold-control"><span>Validation interne</span><div className="segmented-control">{[3, 5, 7].map((count) => <button key={count} className={folds === count ? 'selected' : ''} onClick={() => setFolds(count)}>{count} folds</button>)}</div></div>
        <button className="primary-lab-button" onClick={execute}>▶ Évaluer sur le développement</button>
        {runs.length > 0 && <div className="candidate-table final-candidates">{runs.map((run, index) => <button key={index} className={candidate === index ? 'selected' : ''} onClick={() => setCandidate(index)}><span>#{index + 1}</span><strong>{modelLabel(run.config)}</strong><small>{run.config.features.length} feat. · {run.folds} folds</small><b>{run.result.meanBrier.toFixed(3)} Brier</b><em>{Math.round(run.result.meanAccuracy * 100)}% acc · variation {Math.round(run.result.accuracyRange * 100)} pts</em></button>)}</div>}
        <p className="practice-gate">{runs.length < 4 ? `Fais encore au moins ${4 - runs.length} essai(s) avant le holdout.` : candidate === null ? 'Sélectionne le candidat que tu es prêt à figer.' : 'Tu peux encore expérimenter, ou figer ce candidat maintenant.'}</p>
        {runs.length >= 4 && candidate !== null && <button className="holdout-button" onClick={lockAndReveal}>🔒 Figer ce candidat et ouvrir les 3 matchs</button>}
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
      <Eyebrow>Cycle 3 terminé · Holdout reveal</Eyebrow>
      <h1>Voilà ce que ton modèle vaut sur trois matchs qu’il n’a jamais influencés.</h1>
      {candidateHoldout && chosen && <p className="lead">Ton {modelLabel(chosen.config)} obtient un Brier de {candidateHoldout.brier.toFixed(3)} sur le holdout, contre {baselineHoldout.brier.toFixed(3)} pour notre baseline distance + angle.</p>}
      <div className="holdout-detail"><div><span>Ton candidat</span><strong>{candidateHoldout?.brier.toFixed(3)}</strong><small>Brier holdout</small></div><div><span>Baseline simple</span><strong>{baselineHoldout.brier.toFixed(3)}</strong><small>Brier holdout</small></div><div><span>StatsBomb référence</span><strong>{referenceBrier.toFixed(3)}</strong><small>Brier sur les mêmes tirs</small></div></div>
      <p>La valeur StatsBomb est ici un <strong>benchmark externe</strong>, jamais une feature d’entraînement. Avec seulement trois matchs de holdout, elle ne transforme pas ce test en verdict universel : elle donne simplement un point de comparaison concret.</p>
      <div className="reveal-card"><span>Mini-projet accompli</span><strong>Tu as formulé des features, choisi des familles de modèles, réglé des hyperparamètres, utilisé la cross-validation, sélectionné un candidat puis ouvert un vrai holdout par match.</strong></div>
      <div className="checkpoint"><span>À partir d’ici</span><strong>Le prochain cycle peut quitter le tutoriel linéaire : analyse des erreurs, interprétation du modèle, construction d’un xG de match et questions football plus ouvertes.</strong></div>
      <ContinueButton onClick={onComplete}>Terminer le Model Workshop</ContinueButton>
    </LabShell>
  )
}

function FinalScoreboard({ candidate, candidateBrier, baselineBrier, referenceBrier }: { candidate: Run; candidateBrier: number; baselineBrier: number; referenceBrier: number }) {
  const delta = baselineBrier - candidateBrier
  return <div className={`final-scoreboard ${delta > 0 ? 'positive' : ''}`}><span>{delta > 0 ? 'Tu bats la baseline sur ce holdout' : 'La baseline reste devant sur ce holdout'}</span><strong>{modelLabel(candidate.config)}</strong><div><p><small>TON MODÈLE</small><b>{candidateBrier.toFixed(3)}</b></p><p><small>BASELINE</small><b>{baselineBrier.toFixed(3)}</b></p><p><small>STATSBOMB REF.</small><b>{referenceBrier.toFixed(3)}</b></p></div></div>
}
