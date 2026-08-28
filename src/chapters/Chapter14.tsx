import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { realShots } from '../data/realShots'
import { evaluateConfig, modelLabel, type ModelConfig } from '../ml/modelLab'
import { trainValidationTestSplit } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Family = 'knn' | 'tree'
type Run = { config: ModelConfig; validationBrier: number; validationAccuracy: number }
const features: ModelConfig['features'] = ['distance', 'angle', 'is_header', 'first_time', 'is_penalty']

export function Chapter14({ step, setStep, onComplete }: Props) {
  const [family, setFamily] = useState<Family>('knn')
  const [k, setK] = useState(7)
  const [depth, setDepth] = useState(3)
  const [runs, setRuns] = useState<Run[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const split = useMemo(() => trainValidationTestSplit(realShots, 137), [])

  const currentConfig: ModelConfig = family === 'knn'
    ? { family: 'knn', features, k }
    : { family: 'tree', features, depth, minSamples: 8 }

  const execute = () => {
    const evaluation = evaluateConfig(split.train, split.validation, currentConfig, 0.25)
    const run = { config: { ...currentConfig, features: [...features] }, validationBrier: evaluation.brier, validationAccuracy: evaluation.accuracy }
    setSelected(runs.length)
    setRuns((current) => [...current, run])
  }

  if (step === 0) return (
    <LabShell visual={<div className="three-way-split"><div>TRAIN</div><b>→</b><div>VALIDATION</div><b>→</b><div className="locked">TEST 🔒</div></div>}>
      <Eyebrow>Chapitre 14 · Régler sans regarder le corrigé final</Eyebrow>
      <h1>Le test final ne doit pas servir à choisir tes réglages.</h1>
      <p className="lead">On garde donc trois groupes : <strong>train</strong> pour apprendre, <strong>validation</strong> pour essayer des réglages, et <strong>test</strong> verrouillé jusqu’à ta décision.</p>
      <ContinueButton onClick={() => setStep(1)}>Faire un essai sur validation</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const chosen = selected !== null ? runs[selected] : undefined
    return (
      <LabShell visual={<div className="tuning-scoreboard"><span>Validation uniquement</span><strong>{runs.at(-1)?.validationBrier.toFixed(3) ?? '—'}</strong><small>erreur probabiliste · plus bas = meilleur</small><b>TEST 🔒</b></div>}>
        <Eyebrow>Chapitre 14 · Choisir avant d’ouvrir le test</Eyebrow>
        <h1>Teste un réglage sur validation, puis décide si tu veux ouvrir le test.</h1>
        <div className="tuning-controls">
          <div className="segmented-control"><button className={family === 'knn' ? 'selected' : ''} onClick={() => setFamily('knn')}>Voisins · k-NN</button><button className={family === 'tree' ? 'selected' : ''} onClick={() => setFamily('tree')}>Arbre</button></div>
          {family === 'knn'
            ? <label><span>Nombre de voisins · k = {k}</span><input type="range" min="1" max="31" step="2" value={k} onChange={(event) => setK(Number(event.target.value))} /></label>
            : <label><span>Profondeur = {depth}</span><input type="range" min="1" max="6" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} /></label>}
        </div>
        <button className="primary-lab-button" onClick={execute}>▶ Tester sur VALIDATION</button>
        {runs.length > 0 && <div className="candidate-table">{runs.map((run, index) => <button key={index} className={selected === index ? 'selected' : ''} onClick={() => setSelected(index)}><span>#{index + 1}</span><strong>{modelLabel(run.config)}</strong><small>{Math.round(run.validationAccuracy * 100)}% de décisions justes</small><b>{run.validationBrier.toFixed(3)} erreur prob.</b></button>)}</div>}
        {chosen && <>
          <div className="optional-challenge"><strong>Tu peux expérimenter davantage</strong><span>Essaie un autre k ou une autre profondeur si tu veux comparer. Ce n’est pas obligatoire : l’idée importante est de choisir avant de voir le test.</span></div>
          <ContinueButton onClick={() => setStep(2)}>🔓 Figer ce candidat et ouvrir le test</ContinueButton>
        </>}
      </LabShell>
    )
  }

  const chosen = selected !== null ? runs[selected] : runs[0]
  const testEvaluation = chosen ? evaluateConfig([...split.train, ...split.validation], split.test, chosen.config, 0.25) : null
  return (
    <LabShell visual={chosen && testEvaluation ? <div className="validation-reveal"><span>{modelLabel(chosen.config)}</span><div><strong>{chosen.validationBrier.toFixed(3)}</strong><small>validation</small><b>→</b><strong>{testEvaluation.brier.toFixed(3)}</strong><small>test</small></div></div> : undefined}>
      <Eyebrow>Chapitre 14 · Test final</Eyebrow>
      <h1>Ton choix rencontre enfin des données qu’il n’a pas utilisées pour décider.</h1>
      {testEvaluation && <p className="lead">Après ton choix, on réentraîne sur train + validation puis on mesure sur test : {Math.round(testEvaluation.accuracy * 100)}% de décisions justes, erreur probabiliste {testEvaluation.brier.toFixed(3)}.</p>}
      <div className="reveal-card"><span>Réflexe</span><strong>Les réglages se choisissent sur validation. Le test reste utile tant qu’on ne l’utilise pas pour modifier ensuite notre modèle.</strong></div>
      <ContinueButton onClick={onComplete}>Ouvrir le Model Workshop</ContinueButton>
    </LabShell>
  )
}
