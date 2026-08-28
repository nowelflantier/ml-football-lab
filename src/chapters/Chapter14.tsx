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
    setRuns((current) => [...current, { config: { ...currentConfig, features: [...features] }, validationBrier: evaluation.brier, validationAccuracy: evaluation.accuracy }])
  }

  if (step === 0) return (
    <LabShell visual={<div className="three-way-split"><div>TRAIN</div><b>→</b><div>VALIDATION</div><b>→</b><div className="locked">TEST 🔒</div></div>}>
      <Eyebrow>Chapitre 14 · Régler sans regarder le corrigé final</Eyebrow>
      <h1>Si tu testes 20 réglages sur le test, le test n’est plus vraiment un test.</h1>
      <p className="lead">On va garder un troisième groupe complètement verrouillé. Tu peux expérimenter autant que tu veux sur la validation, choisir ton réglage, puis seulement ouvrir le test.</p>
      <div className="intent-card"><strong>Workflow</strong><span>TRAIN apprend les paramètres · VALIDATION sert à choisir tes hyperparamètres · TEST ne s’ouvre qu’après ta décision.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Commencer le tuning</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    return (
      <LabShell visual={<div className="tuning-scoreboard"><span>Validation uniquement</span><strong>{runs.at(-1)?.validationBrier.toFixed(3) ?? '—'}</strong><small>Brier · plus bas = meilleur</small><b>TEST 🔒</b></div>}>
        <Eyebrow>Chapitre 14 · Hyperparameter tuning</Eyebrow>
        <h1>Essaie, compare, puis verrouille une configuration.</h1>
        <div className="tuning-controls">
          <div className="segmented-control"><button className={family === 'knn' ? 'selected' : ''} onClick={() => setFamily('knn')}>k-NN</button><button className={family === 'tree' ? 'selected' : ''} onClick={() => setFamily('tree')}>Arbre</button></div>
          {family === 'knn' ? <label><span>k = {k}</span><input type="range" min="1" max="31" step="2" value={k} onChange={(event) => setK(Number(event.target.value))} /><small>Teste plusieurs voisinages.</small></label> : <label><span>profondeur = {depth}</span><input type="range" min="1" max="6" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} /><small>Teste plusieurs complexités.</small></label>}
        </div>
        <button className="primary-lab-button" onClick={execute}>▶ Tester sur VALIDATION</button>
        {runs.length > 0 && <div className="candidate-table">{runs.map((run, index) => <button key={index} className={selected === index ? 'selected' : ''} onClick={() => setSelected(index)}><span>#{index + 1}</span><strong>{modelLabel(run.config)}</strong><small>{Math.round(run.validationAccuracy * 100)}% accuracy</small><b>{run.validationBrier.toFixed(3)} Brier</b></button>)}</div>}
        <p className="practice-gate">{runs.length < 4 ? `Fais encore ${4 - runs.length} essai(s). Ensuite choisis une ligne à verrouiller.` : selected === null ? 'Sélectionne maintenant le candidat que tu veux envoyer au test.' : 'Candidat choisi. Le test est encore intact.'}</p>
        {runs.length >= 4 && selected !== null && <ContinueButton onClick={() => setStep(2)}>🔓 Ouvrir le test final pour ce réglage</ContinueButton>}
      </LabShell>
    )
  }

  const chosen = selected !== null ? runs[selected] : runs[0]
  const testEvaluation = chosen ? evaluateConfig([...split.train, ...split.validation], split.test, chosen.config, 0.25) : null
  return (
    <LabShell visual={chosen && testEvaluation ? <div className="validation-reveal"><span>{modelLabel(chosen.config)}</span><div><strong>{chosen.validationBrier.toFixed(3)}</strong><small>validation</small><b>→</b><strong>{testEvaluation.brier.toFixed(3)}</strong><small>test</small></div></div> : undefined}>
      <Eyebrow>Chapitre 14 · Le test n’est pas un terrain d’essai</Eyebrow>
      <h1>Ton choix rencontre enfin des données qu’il n’a jamais influencées.</h1>
      {testEvaluation && <p className="lead">Après avoir choisi le réglage sur validation, on réentraîne sur train + validation puis on mesure une seule fois sur test : {Math.round(testEvaluation.accuracy * 100)}% accuracy, Brier {testEvaluation.brier.toFixed(3)}.</p>}
      <div className="reveal-card"><span>Concept débloqué</span><strong>Tuning : choisir les hyperparamètres sur validation, pas sur le test. Le test final reste une estimation indépendante tant qu’il n’a pas servi à prendre tes décisions.</strong></div>
      <div className="checkpoint"><span>Réflexe</span><strong>Si je change mon modèle parce que j’ai vu son score test, alors ce test commence à devenir une nouvelle validation.</strong></div>
      <ContinueButton onClick={onComplete}>Ouvrir le vrai Model Workshop</ContinueButton>
    </LabShell>
  )
}
