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
    setRuns((current) => [...current.slice(-6), { depth, minSamples, features: [...features], trainAccuracy: trainEvaluation.accuracy, testAccuracy: testEvaluation.accuracy, brier: testEvaluation.brier, nodes: treeNodeCount(model.root), root }])
  }

  if (step === 0) return (
    <LabShell visual={<div className="tree-intro"><span>Distance &lt; 11m ?</span><b>↙︎</b><b>↘︎</b><span>Angle large ?</span><span>Angle petit ?</span></div>}>
      <Eyebrow>Chapitre 13 · Construire des règles en cascade</Eyebrow>
      <h1>Et si le modèle apprenait une suite de questions&nbsp;?</h1>
      <p className="lead">Un arbre de décision découpe les données avec des règles successives. Cette fois, tu vas régler directement combien de niveaux de règles il a le droit de construire.</p>
      <div className="intent-card"><strong>À tester</strong><span>Faible profondeur = modèle simple. Grande profondeur = plus de règles, donc plus de capacité à coller aux exemples. Observe train ET test.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Ouvrir l’atelier arbre</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const triedShallow = runs.some((run) => run.depth === 1)
    const triedDeep = runs.some((run) => run.depth >= 4)
    const latest = runs.at(-1)
    return (
      <LabShell visual={latest ? <TreeRunVisual run={latest} /> : <div className="empty-lab-visual"><strong>Arbre non entraîné</strong><span>Régle sa profondeur puis lance-le.</span></div>}>
        <Eyebrow>Chapitre 13 · Decision Tree Lab</Eyebrow>
        <h1>Fais volontairement un arbre trop simple, puis trop profond.</h1>
        <div className="tree-controls">
          <label><span>Profondeur max · {depth}</span><input type="range" min="1" max="6" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} /><small>Nombre maximal de niveaux de décisions.</small></label>
          <label><span>Minimum de tirs par branche · {minSamples}</span><input type="range" min="4" max="30" step="2" value={minSamples} onChange={(event) => setMinSamples(Number(event.target.value))} /><small>Plus ce nombre est petit, plus l’arbre peut créer des règles spécifiques.</small></label>
        </div>
        <div className="workbench-feature-grid tree-feature-grid">{baseFeatures.map((feature) => <button key={feature} className={features.includes(feature) ? 'selected' : ''} onClick={() => toggle(feature)}>{realFeatureLabels[feature]}</button>)}</div>
        <button className="primary-lab-button" onClick={execute}>▶ Construire cet arbre</button>
        {runs.length > 0 && <div className="tree-run-history">{runs.map((run, index) => <div key={index}><span>#{index + 1} · depth {run.depth} · {run.nodes} nœuds</span><strong>{Math.round(run.trainAccuracy * 100)}% train → {Math.round(run.testAccuracy * 100)}% test</strong><small>Brier {run.brier.toFixed(3)} · racine : {run.root}</small></div>)}</div>}
        <p className="practice-gate">{!triedShallow || !triedDeep || runs.length < 3 ? 'Teste au moins depth=1, un arbre depth≥4, et fais 3 essais au total.' : 'Tu as vu les deux extrêmes.'}</p>
        {triedShallow && triedDeep && runs.length >= 3 && <ContinueButton onClick={() => setStep(2)}>Lire ce que tu viens de provoquer</ContinueButton>}
      </LabShell>
    )
  }

  const latest = runs.at(-1)
  return (
    <LabShell visual={latest ? <TreeRunVisual run={latest} /> : undefined}>
      <Eyebrow>Chapitre 13 · Complexité</Eyebrow>
      <h1>Tu contrôles directement la capacité du modèle.</h1>
      <p className="lead">La profondeur et le minimum d’exemples ne sont pas appris automatiquement ici : tu les règles. Plus de capacité peut aider, puis finir par capturer des détails trop spécifiques.</p>
      <div className="reveal-card"><span>Concepts débloqués</span><strong>Arbre de décision · profondeur · complexité du modèle. Un hyperparamètre contrôle la façon dont le modèle peut apprendre.</strong></div>
      <div className="checkpoint"><span>Ce qui change maintenant</span><strong>Tu ne choisis plus seulement des données : tu commences à concevoir la forme du modèle lui-même.</strong></div>
      <ContinueButton onClick={onComplete}>Apprendre à régler sans tricher</ContinueButton>
    </LabShell>
  )
}

function TreeRunVisual({ run }: { run: Run }) {
  return <div className="tree-run-visual"><span>Arbre depth {run.depth}</span><strong>{run.nodes} nœuds</strong><div><b>{Math.round(run.trainAccuracy * 100)}%</b><small>train</small><b>{Math.round(run.testAccuracy * 100)}%</b><small>test</small></div><p>Première règle : {run.root}</p></div>
}
