import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { evaluateConfig, type ModelConfig } from '../ml/modelLab'
import { realFeatureLabels, realShotRows, type RealFeatureKey } from '../ml/realFeatures'
import { trainDecisionTree, treeNodeCount } from '../ml/tree'
import { shotLabels } from '../ml/logistic'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Run = { depth: number; minSamples: number; features: RealFeatureKey[]; trainAccuracy: number; testAccuracy: number; brier: number; nodes: number; root: string }
const baseFeatures: RealFeatureKey[] = ['distance', 'angle', 'is_header', 'is_penalty']

export function Chapter13({ step, setStep, onComplete }: Props) {
  const [depth, setDepth] = useState(2)
  const [minSamples, setMinSamples] = useState(8)
  const [features, setFeatures] = useState<RealFeatureKey[]>(baseFeatures)
  const [runs, setRuns] = useState<Run[]>([])
  const split = useMemo(() => stratifiedSplit(realShots, 109, 0.3), [])

  const toggle = (feature: RealFeatureKey) => {
    if (features.includes(feature) && features.length === 1) return
    setFeatures((current) => current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature])
  }

  const execute = () => {
    const config: ModelConfig = { family: 'tree', features, depth, minSamples }
    const trainEvaluation = evaluateConfig(split.train, split.train, config, 0.25)
    const testEvaluation = evaluateConfig(split.train, split.test, config, 0.25)
    const model = trainDecisionTree(realShotRows(split.train, features), shotLabels(split.train), depth, minSamples)
    const rootFeature = model.root.featureIndex === undefined ? 'aucune séparation' : realFeatureLabels[features[model.root.featureIndex]]
    const root = model.root.threshold === undefined ? rootFeature : `${rootFeature} ≤ ${model.root.threshold.toFixed(1)}`
    setRuns((current) => [...current.slice(-5), { depth, minSamples, features: [...features], trainAccuracy: trainEvaluation.accuracy, testAccuracy: testEvaluation.accuracy, brier: testEvaluation.brier, nodes: treeNodeCount(model.root), root }])
  }

  if (step === 0) return (
    <LabShell visual={<div className="tree-intro"><span>Distance &lt; 11m ?</span><b>↙︎</b><b>↘︎</b><span>Angle large ?</span><span>Angle petit ?</span></div>}>
      <Eyebrow>Chapitre 13 · Construire des règles en cascade</Eyebrow>
      <h1>Et si le modèle apprenait une suite de questions&nbsp;?</h1>
      <p className="lead">Tu connais déjà le principe de l’arbre. Ici, tu peux modifier sa profondeur : plus de niveaux autorisent davantage de règles.</p>
      <div className="intent-card"><strong>À observer</strong><span>La profondeur change la complexité de l’arbre. Un arbre très profond peut mieux coller au train sans forcément mieux fonctionner sur test.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Construire un arbre</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const latest = runs.at(-1)
    const triedShallow = runs.some((run) => run.depth === 1)
    const triedDeep = runs.some((run) => run.depth >= 4)
    return (
      <LabShell visual={latest ? <TreeRunVisual run={latest} /> : <div className="empty-lab-visual"><strong>Arbre non entraîné</strong><span>Choisis une profondeur puis lance-le.</span></div>}>
        <Eyebrow>Chapitre 13 · Decision Tree Lab</Eyebrow>
        <h1>Construis un arbre, puis regarde train et test.</h1>
        <div className="tree-controls">
          <label><span>Profondeur max · {depth}</span><input type="range" min="1" max="6" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} /><small>Nombre maximal de niveaux de décisions.</small></label>
          <label><span>Minimum de tirs par branche · {minSamples}</span><input type="range" min="4" max="30" step="2" value={minSamples} onChange={(event) => setMinSamples(Number(event.target.value))} /><small>Petit nombre = règles potentiellement plus spécifiques.</small></label>
        </div>
        <div className="workbench-feature-grid tree-feature-grid">{baseFeatures.map((feature) => <button key={feature} className={features.includes(feature) ? 'selected' : ''} onClick={() => toggle(feature)}>{realFeatureLabels[feature]}</button>)}</div>
        <button className="primary-lab-button" onClick={execute}>▶ Construire cet arbre</button>
        {runs.length > 0 && <div className="tree-run-history">{runs.map((run, index) => <div key={index}><span>#{index + 1} · profondeur {run.depth} · {run.nodes} nœuds</span><strong>{Math.round(run.trainAccuracy * 100)}% train → {Math.round(run.testAccuracy * 100)}% test</strong><small>Première règle : {run.root}</small></div>)}</div>}
        {latest && <>
          <div className="optional-challenge"><strong>Défi optionnel</strong><span>{triedShallow && triedDeep ? 'Tu as déjà comparé un arbre très simple et un plus profond.' : 'Essaie profondeur 1 puis profondeur 4 ou plus si tu veux voir la complexité changer fortement.'}</span></div>
          <ContinueButton onClick={() => setStep(2)}>J’ai compris ce que contrôle la profondeur</ContinueButton>
        </>}
      </LabShell>
    )
  }

  const latest = runs.at(-1)
  return (
    <LabShell visual={latest ? <TreeRunVisual run={latest} /> : undefined}>
      <Eyebrow>Chapitre 13 · Complexité</Eyebrow>
      <h1>La profondeur contrôle la capacité de l’arbre.</h1>
      <p className="lead">Elle n’est pas apprise automatiquement ici : c’est toi qui fixes combien de niveaux de règles l’arbre peut construire. Plus de capacité peut aider, puis finir par capturer des détails trop spécifiques.</p>
      <div className="reveal-card"><span>Concept</span><strong>Un hyperparamètre est un réglage choisi avant l’entraînement qui contrôle la manière dont le modèle peut apprendre.</strong></div>
      <ContinueButton onClick={onComplete}>Apprendre à régler sans consommer le test</ContinueButton>
    </LabShell>
  )
}

function TreeRunVisual({ run }: { run: Run }) {
  return <div className="tree-run-visual"><span>Arbre profondeur {run.depth}</span><strong>{run.nodes} nœuds</strong><div><b>{Math.round(run.trainAccuracy * 100)}%</b><small>train</small><b>{Math.round(run.testAccuracy * 100)}%</b><small>test</small></div><p>Première règle : {run.root}</p></div>
}
