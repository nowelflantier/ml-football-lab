import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { evaluateConfig } from '../ml/modelLab'
import { predictProbability, shotLabels, trainLogistic } from '../ml/logistic'
import { realShotRow, realShotRows, type RealFeatureKey } from '../ml/realFeatures'
import { trainDecisionTree, type TreeNode } from '../ml/tree'
import { calibrationBuckets } from '../ml/validation'
import type { Shot } from '../types'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Neighbor = { shot: Shot; distance: number }
type TreeTrace = { label: string; answer: 'oui' | 'non' }

const features: RealFeatureKey[] = ['distance', 'angle']
const featureNames = ['Distance', 'Angle']
const logisticConfig = { family: 'logistic' as const, features }

export function Chapter11({ step, setStep, onComplete }: Props) {
  const split = useMemo(() => stratifiedSplit(realShots, 83, 0.35), [])
  const samples = useMemo(() => pickSampleShots(split.test), [split.test])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [k, setK] = useState(7)
  const [threshold, setThreshold] = useState(0.25)
  const [bucketIndex, setBucketIndex] = useState(0)

  const shot = samples[selectedIndex] ?? split.test[0]
  const trainRows = useMemo(() => realShotRows(split.train, features), [split.train])
  const labels = useMemo(() => shotLabels(split.train), [split.train])
  const logistic = useMemo(() => trainLogistic(trainRows, labels, 3000), [trainRows, labels])
  const tree = useMemo(() => trainDecisionTree(trainRows, labels, 3, 8), [trainRows, labels])

  const logisticProbability = predictProbability(logistic, realShotRow(shot, features))
  const neighbors = nearestNeighbors(split.train, shot, k)
  const knnProbability = neighbors.filter((item) => item.shot.goal).length / neighbors.length
  const path = traceTree(tree.root, realShotRow(shot, features))
  const treeProbability = leafProbability(tree.root, realShotRow(shot, features))

  const metrics = evaluateConfig(split.train, split.test, logisticConfig, threshold)
  const correct = metrics.truePositive + metrics.trueNegative
  const actualGoals = metrics.truePositive + metrics.falseNegative
  const alerts = metrics.truePositive + metrics.falsePositive

  const probabilityEval = evaluateConfig(split.train, split.test, logisticConfig, 0.25)
  const buckets = calibrationBuckets(probabilityEval.probabilities, probabilityEval.labels, 5)
  const bucket = buckets[bucketIndex] ?? buckets[0]

  const shotPicker = (
    <div className="bridge-shot-selector">
      {samples.map((item, index) => (
        <button key={item.id} className={selectedIndex === index ? 'selected' : ''} onClick={() => setSelectedIndex(index)}>
          Tir {index + 1} · {item.distance.toFixed(0)}m · {item.goal ? '⚽' : 'raté'}
        </button>
      ))}
    </div>
  )

  if (step === 0) return (
    <LabShell visual={<ModelOverview />}>
      <Eyebrow>Chapitre 11 · Comprendre les outils</Eyebrow>
      <h1>On t’a donné trop de boutons avant de t’expliquer ce qu’ils pilotent.</h1>
      <p className="lead">On reprend donc les trois familles de modèles et les chiffres de mesure, un par un. Pas de tuning tant que leur rôle n’est pas clair.</p>
      <div className="intent-card"><strong>À la sortie</strong><span>Tu dois savoir raconter avec tes mots : logistique, k-NN, arbre, accuracy, recall, precision, calibration et Brier.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Commencer par la logistique</ContinueButton>
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={<LogisticVisual model={logistic} shot={shot} probability={logisticProbability} />}>
      <Eyebrow>11.1 · Logistique = relation lisse</Eyebrow>
      <h1>Elle apprend une tendance globale plutôt qu’une frontière brutale.</h1>
      <p className="lead">Tous les exemples d’entraînement contribuent à une relation continue entre les features et la probabilité de but.</p>
      {shotPicker}
      <div className="model-explanation"><strong>À observer</strong><span>À angle constant, éloigner le tir fait évoluer la probabilité progressivement. Le modèle ne cherche pas un cas précis : il applique la relation globale qu’il a apprise.</span></div>
      <div className="feedback neutral"><strong>Tir choisi : {Math.round(logisticProbability * 100)}%</strong><span><b>Régression logistique</b> = une relation lisse qui transforme les features en probabilité.</span></div>
      <ContinueButton onClick={() => setStep(2)}>Comparer avec les voisins</ContinueButton>
    </LabShell>
  )

  if (step === 2) return (
    <LabShell visual={<NeighborVisual neighbors={neighbors} probability={knnProbability} />}>
      <Eyebrow>11.2 · k-NN = voisins similaires</Eyebrow>
      <h1>Cette fois, le modèle regarde surtout des tirs qui ressemblent au nouveau.</h1>
      <p className="lead">Il cherche les <b>k plus proches voisins</b> dans les données passées puis regarde combien ont fini en but.</p>
      {shotPicker}
      <div className="bridge-k-picker">{[3, 7, 15].map((value) => <button key={value} className={k === value ? 'selected' : ''} onClick={() => setK(value)}>{value} voisins</button>)}</div>
      <div className="model-explanation"><strong>Ce que change k</strong><span>Petit k = réponse très locale, sensible à quelques exemples. Grand k = davantage d’exemples, réponse plus lissée.</span></div>
      <div className="feedback neutral"><strong>{neighbors.filter((item) => item.shot.goal).length}/{neighbors.length} voisin(s) ont marqué → {Math.round(knnProbability * 100)}%</strong><span>k-NN signifie <b>k nearest neighbours</b>.</span></div>
      <ContinueButton onClick={() => setStep(3)}>Comparer avec l’arbre</ContinueButton>
    </LabShell>
  )

  if (step === 3) return (
    <LabShell visual={<TreeVisual path={path} probability={treeProbability} />}>
      <Eyebrow>11.3 · Arbre = règles si / alors</Eyebrow>
      <h1>Le tir descend dans des règles apprises automatiquement.</h1>
      <p className="lead">L’arbre découpe les exemples avec des questions du type « distance ≤ X ? ». Chaque réponse envoie le tir vers la règle suivante.</p>
      {shotPicker}
      <div className="model-explanation"><strong>À observer</strong><span>Une profondeur plus grande autorise davantage de questions. Cela rend le modèle plus flexible, mais peut aussi le pousser à mémoriser des détails.</span></div>
      <div className="feedback neutral"><strong>Groupe final : {Math.round(treeProbability * 100)}%</strong><span><b>Arbre de décision</b> = une succession de règles si/alors apprises à partir des données.</span></div>
      <ContinueButton onClick={() => setStep(4)}>Comprendre les scores</ContinueButton>
    </LabShell>
  )

  if (step === 4) return (
    <LabShell visual={<MetricVisual metrics={metrics} correct={correct} actualGoals={actualGoals} alerts={alerts} />}>
      <Eyebrow>11.4 · Mesurer sans jargon</Eyebrow>
      <h1>« Bon modèle » peut vouloir dire plusieurs choses.</h1>
      <p className="lead">On garde maintenant le même modèle. Tu modifies seulement le seuil à partir duquel on déclenche l’alerte « but probable ».</p>
      <div className="threshold-plain-language"><label><span>Déclencher l’alerte à partir de…</span><strong>{Math.round(threshold * 100)}%</strong></label><input type="range" min="0.05" max="0.6" step="0.05" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></div>
      <div className="model-explanation"><strong>Essaie 10%, 25%, 50%</strong><span>Baisser le seuil retrouve généralement plus de buts mais crée plus de fausses alertes. Voilà pourquoi un seul score ne suffit pas.</span></div>
      <div className="bridge-summary">
        <div><span>Accuracy</span><strong>Décisions justes</strong><small>Parmi tous les tirs, combien ont été classés correctement.</small></div>
        <div><span>Recall</span><strong>Buts retrouvés</strong><small>Parmi les vrais buts, combien ont déclenché l’alerte.</small></div>
        <div><span>Precision</span><strong>Alertes correctes</strong><small>Parmi les alertes, combien étaient réellement des buts.</small></div>
      </div>
      <ContinueButton onClick={() => setStep(5)}>Comprendre les probabilités</ContinueButton>
    </LabShell>
  )

  if (step === 5) return (
    <LabShell visual={<CalibrationVisual buckets={buckets} selected={bucketIndex} onSelect={setBucketIndex} />}>
      <Eyebrow>11.5 · Le graphique 0–20%, 20–40%…</Eyebrow>
      <h1>Chaque tranche contient des tirs auxquels le modèle avait donné des probabilités proches.</h1>
      <p className="lead"><b>0–20%</b> signifie : « tous les tirs auxquels le modèle avait donné entre 0% et 20% de chances de but ».</p>
      <div className="bucket-picker">{buckets.map((item, index) => <button key={index} className={bucketIndex === index ? 'selected' : ''} onClick={() => setBucketIndex(index)}><strong>{Math.round(item.from * 100)}–{Math.round(item.to * 100)}%</strong><small>{item.count} tirs</small></button>)}</div>
      <div className="bucket-detail"><span>Tranche sélectionnée</span><strong>{bucket.count} tirs · annoncé {Math.round(bucket.predicted * 100)}% en moyenne · observé {Math.round(bucket.observed * 100)}% ({Math.round(bucket.observed * bucket.count)} buts).</strong><p>Si annoncé ≈ observé, cette tranche est bien calibrée. Sinon, les probabilités sont trop optimistes ou trop pessimistes.</p></div>
      <div className="model-explanation"><strong>Brier, enfin</strong><span>Le Brier résume l’erreur de toutes les probabilités. <b>0 serait parfait ; plus bas est meilleur.</b> Une prédiction très sûre et fausse coûte davantage.</span></div>
      <UnderTheHood><p>Formule : moyenne de <code>(probabilité − résultat)^2</code>, avec résultat = 1 pour un but et 0 sinon. Inutile de la mémoriser pour savoir lire le score.</p></UnderTheHood>
      <ContinueButton onClick={() => setStep(6)}>Faire le point</ContinueButton>
    </LabShell>
  )

  return (
    <LabShell visual={<ModelOverview active />}>
      <Eyebrow>Chapitre 11 · Pont terminé</Eyebrow>
      <h1>Les prochains boutons ont maintenant un sens.</h1>
      <div className="bridge-summary">
        <div><span>Logistique</span><strong>Relation lisse</strong><small>Apprend une tendance globale.</small></div>
        <div><span>k-NN</span><strong>Voisins similaires</strong><small>Regarde k exemples proches.</small></div>
        <div><span>Arbre</span><strong>Règles si/alors</strong><small>Suit des coupures apprises.</small></div>
      </div>
      <div className="checkpoint"><span>Pour mesurer</span><strong>Décisions justes · buts retrouvés · alertes correctes · erreur des probabilités.</strong></div>
      <ContinueButton onClick={onComplete}>Passer à la validation répétée</ContinueButton>
    </LabShell>
  )
}

function ModelOverview({ active = false }: { active?: boolean }) {
  return <div className="model-primer-board">{[
    ['Logistique', 'Une relation lisse', 'Tous les exemples contribuent à une tendance globale.'],
    ['k-NN', 'Des voisins', 'La prédiction vient des exemples passés les plus ressemblants.'],
    ['Arbre', 'Des règles', 'Le tir suit des questions si/alors apprises.'],
  ].map(([name, title, copy]) => <div key={name} className={`model-primer-card ${active ? 'active' : ''}`}><span>{name}</span><strong>{title}</strong><small>{copy}</small></div>)}</div>
}

function LogisticVisual({ model, shot, probability }: { model: ReturnType<typeof trainLogistic>; shot: Shot; probability: number }) {
  const rows = [6, 10, 14, 20, 28].map((distance) => ({ distance, probability: predictProbability(model, [distance, shot.angle]) }))
  return <div className="smooth-probability-list"><div className="model-primer-card active"><span>Logistique</span><strong>Tir choisi · {Math.round(probability * 100)}%</strong><small>Même angle, distance modifiée :</small></div>{rows.map((row) => <div className="smooth-probability-row" key={row.distance}><span>{row.distance} m</span><i style={{ width: `${Math.max(2, row.probability * 100)}%` }} /><strong>{Math.round(row.probability * 100)}%</strong></div>)}</div>
}

function NeighborVisual({ neighbors, probability }: { neighbors: Neighbor[]; probability: number }) {
  return <div className="neighbor-list"><div className="model-primer-card active"><span>k-NN</span><strong>{Math.round(probability * 100)}%</strong><small>Part de buts chez les voisins ci-dessous.</small></div>{neighbors.map((item, index) => <div key={item.shot.id} className={`neighbor-row ${item.shot.goal ? 'goal' : ''}`}><span>Voisin {index + 1}</span><strong>{item.shot.distance.toFixed(1)}m · {item.shot.angle.toFixed(0)}°</strong><b>{item.shot.goal ? '⚽' : '×'}</b></div>)}</div>
}

function TreeVisual({ path, probability }: { path: TreeTrace[]; probability: number }) {
  return <div className="tree-path-list"><div className="model-primer-card active"><span>Arbre</span><strong>Chemin du tir</strong><small>Chaque réponse choisit la branche suivante.</small></div>{path.map((item, index) => <div className="tree-path-row" key={index}><span>Question {index + 1}</span><strong>{item.label}</strong><b>{item.answer}</b></div>)}<div className="tree-path-row"><span>Groupe final</span><strong>Probabilité du groupe</strong><b>{Math.round(probability * 100)}%</b></div></div>
}

function MetricVisual({ metrics, correct, actualGoals, alerts }: { metrics: ReturnType<typeof evaluateConfig>; correct: number; actualGoals: number; alerts: number }) {
  return <div className="metric-primer-board">
    <div className="metric-explainer-card"><span>Décisions justes · accuracy</span><strong>{correct}/{metrics.labels.length}</strong><small>{Math.round(metrics.accuracy * 100)}% des tirs classés correctement.</small></div>
    <div className="metric-explainer-card"><span>Buts retrouvés · recall</span><strong>{metrics.truePositive}/{actualGoals}</strong><small>{Math.round(metrics.recall * 100)}% des vrais buts détectés.</small></div>
    <div className="metric-explainer-card"><span>Alertes correctes · precision</span><strong>{metrics.truePositive}/{alerts}</strong><small>{alerts ? `${Math.round(metrics.precision * 100)}% des alertes étaient justes.` : 'Aucune alerte.'}</small></div>
    <div className="metric-explainer-card"><span>Fausses alertes</span><strong>{metrics.falsePositive}</strong><small>Tirs signalés comme « but probable » qui n’ont pas marqué.</small></div>
  </div>
}

function CalibrationVisual({ buckets, selected, onSelect }: { buckets: ReturnType<typeof calibrationBuckets>; selected: number; onSelect: (index: number) => void }) {
  const bucket = buckets[selected] ?? buckets[0]
  return <div className="bucket-explainer"><div className="model-primer-card active"><span>Calibration</span><strong>Groupes de probabilités</strong><small>Clique une tranche.</small></div><div className="bucket-picker">{buckets.map((item, index) => <button key={index} className={selected === index ? 'selected' : ''} onClick={() => onSelect(index)}><strong>{Math.round(item.from * 100)}–{Math.round(item.to * 100)}%</strong><small>{item.count} tirs</small></button>)}</div><div className="bucket-detail"><span>Ce groupe</span><strong>annoncé {Math.round(bucket.predicted * 100)}% · observé {Math.round(bucket.observed * 100)}%</strong><p>{bucket.count} tirs.</p></div></div>
}

function pickSampleShots(shots: Shot[]) {
  const goals = shots.filter((shot) => shot.goal)
  const misses = shots.filter((shot) => !shot.goal)
  return [goals[0], misses[0], goals[1], misses[Math.floor(misses.length / 2)]].filter((shot): shot is Shot => Boolean(shot))
}

function nearestNeighbors(train: Shot[], target: Shot, k: number): Neighbor[] {
  const rows = realShotRows(train, features)
  const targetRow = realShotRow(target, features)
  const means = features.map((_, index) => rows.reduce((sum, row) => sum + row[index], 0) / rows.length)
  const scales = features.map((_, index) => Math.sqrt(rows.reduce((sum, row) => sum + (row[index] - means[index]) ** 2, 0) / rows.length) || 1)
  return train.map((shot, index) => ({
    shot,
    distance: Math.sqrt(rows[index].reduce((sum, value, featureIndex) => sum + (((value - means[featureIndex]) / scales[featureIndex]) - ((targetRow[featureIndex] - means[featureIndex]) / scales[featureIndex])) ** 2, 0)),
  })).sort((a, b) => a.distance - b.distance).slice(0, k)
}

function traceTree(root: TreeNode, row: number[]): TreeTrace[] {
  const trace: TreeTrace[] = []
  let node = root
  while (node.featureIndex !== undefined && node.threshold !== undefined && node.left && node.right) {
    const left = row[node.featureIndex] <= node.threshold
    trace.push({ label: `${featureNames[node.featureIndex]} ≤ ${node.threshold.toFixed(1)} ?`, answer: left ? 'oui' : 'non' })
    node = left ? node.left : node.right
  }
  return trace
}

function leafProbability(root: TreeNode, row: number[]) {
  let node = root
  while (node.featureIndex !== undefined && node.threshold !== undefined && node.left && node.right) node = row[node.featureIndex] <= node.threshold ? node.left : node.right
  return node.probability
}
