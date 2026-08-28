import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { evaluateConfig } from '../ml/modelLab'
import { accuracy, predictProbability, shotLabels, trainLogistic } from '../ml/logistic'
import { realShotRow, realShotRows, type RealFeatureKey } from '../ml/realFeatures'
import { calibrationBuckets } from '../ml/validation'
import { trainDecisionTree, type TreeNode } from '../ml/tree'
import type { Shot } from '../types'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }

type Neighbor = { shot: Shot; distance: number }
type TreeTrace = { label: string; answer: 'oui' | 'non' }

const features: RealFeatureKey[] = ['distance', 'angle']
const featureNames = ['Distance', 'Angle']
const logisticConfig = { family: 'logistic' as const, features }

export function Chapter11({ step, setStep, onComplete }: Props) {
  const split = useMemo(() => stratifiedSplit(realShots, 83, 0.35), [])
  const sampleShots = useMemo(() => pickSampleShots(split.test), [split.test])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [k, setK] = useState(7)
  const [threshold, setThreshold] = useState(0.25)
  const [selectedBucket, setSelectedBucket] = useState(0)

  const selectedShot = sampleShots[selectedIndex] ?? split.test[0]
  const trainRows = useMemo(() => realShotRows(split.train, features), [split.train])
  const trainLabels = useMemo(() => shotLabels(split.train), [split.train])
  const logisticModel = useMemo(() => trainLogistic(trainRows, trainLabels, 3000), [trainRows, trainLabels])
  const treeModel = useMemo(() => trainDecisionTree(trainRows, trainLabels, 3, 8), [trainRows, trainLabels])

  const logisticProbability = predictProbability(logisticModel, realShotRow(selectedShot, features))
  const curve = [6, 10, 14, 20, 28].map((distance) => ({
    distance,
    probability: predictProbability(logisticModel, [distance, selectedShot.angle]),
  }))
  const neighbors = nearestNeighbors(split.train, selectedShot, k)
  const neighborProbability = neighbors.filter((neighbor) => neighbor.shot.goal).length / neighbors.length
  const treeTrace = traceTree(treeModel.root, realShotRow(selectedShot, features))
  const treeProbability = treeLeafProbability(treeModel.root, realShotRow(selectedShot, features))

  const metricEvaluation = evaluateConfig(split.train, split.test, logisticConfig, threshold)
  const correct = metricEvaluation.truePositive + metricEvaluation.trueNegative
  const actualGoals = metricEvaluation.truePositive + metricEvaluation.falseNegative
  const alerts = metricEvaluation.truePositive + metricEvaluation.falsePositive

  const probabilityEvaluation = evaluateConfig(split.train, split.test, logisticConfig, 0.25)
  const buckets = calibrationBuckets(probabilityEvaluation.probabilities, probabilityEvaluation.labels, 5)
  const bucket = buckets[selectedBucket] ?? buckets[0]
  const bucketGoals = Math.round(bucket.observed * bucket.count)

  const shotSelector = (
    <div className="bridge-shot-selector">
      {sampleShots.map((shot, index) => (
        <button key={shot.id} className={selectedIndex === index ? 'selected' : ''} onClick={() => setSelectedIndex(index)}>
          Tir {index + 1} · {shot.distance.toFixed(0)}m · {shot.goal ? '⚽' : 'raté'}
        </button>
      ))}
    </div>
  )

  if (step === 0) {
    return (
      <LabShell visual={<ModelPrimerOverview />}>
        <Eyebrow>Chapitre 11 · On ralentit avant de « calibrer »</Eyebrow>
        <h1>Avant de régler un modèle, il faut savoir ce que les boutons veulent dire.</h1>
        <p className="lead">Tu as raison de ne pas savoir quoi faire avec « logistique », « k-NN », « arbre » ou « Brier » : on te les a donnés trop tôt. Ce chapitre repart de ces objets, un par un.</p>
        <div className="intent-card"><strong>Objectif</strong><span>À la fin, tu dois pouvoir expliquer avec tes mots les trois familles de modèles, ce que mesurent les principaux chiffres, et ce que signifie une tranche comme « 0–20% ».</span></div>
        <ContinueButton onClick={() => setStep(1)}>Commencer par la logistique</ContinueButton>
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell visual={<SmoothProbabilityVisual curve={curve} selectedProbability={logisticProbability} />}>
        <Eyebrow>11.1 · Régression logistique</Eyebrow>
        <h1>Une courbe lisse plutôt qu’une règle « oui / non ».</h1>
        <p className="lead">La logistique regarde tous les exemples d’entraînement et apprend une relation continue. Un tir n’est pas simplement « bon » ou « mauvais » : il reçoit progressivement une probabilité.</p>
        {shotSelector}
        <div className="model-explanation"><strong>Ce que tu dois observer</strong><span>Pour le même angle, éloigner le tir fait généralement bouger la probabilité progressivement. Il n’y a pas besoin de trouver un voisin précis ni de suivre une série de règles.</span></div>
        <div className="feedback neutral"><strong>Tir sélectionné : {Math.round(logisticProbability * 100)}%</strong><span>Le nom technique est « régression logistique ». Ici, retiens surtout : <b>une relation globale et lisse apprise à partir de tous les exemples</b>.</span></div>
        <ContinueButton onClick={() => setStep(2)}>Voir une autre façon : les voisins</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell visual={<NeighborVisual neighbors={neighbors} probability={neighborProbability} />}>
        <Eyebrow>11.2 · k-NN</Eyebrow>
        <h1>Et si on regardait simplement les tirs les plus ressemblants ?</h1>
        <p className="lead">k-NN ne fabrique pas une grande courbe globale. Pour un nouveau tir, il cherche les <b>k exemples les plus proches</b> dans les données passées, puis regarde ce qui leur est arrivé.</p>
        {shotSelector}
        <div className="bridge-k-picker">{[3, 7, 15].map((value) => <button key={value} className={k === value ? 'selected' : ''} onClick={() => setK(value)}>Regarder {value} voisins</button>)}</div>
        <div className="model-explanation"><strong>Ce que tu modifies</strong><span>Avec un petit k, quelques tirs très proches décident presque tout. Avec un grand k, on consulte davantage d’exemples : la réponse devient généralement plus stable, mais moins locale.</span></div>
        <div className="feedback neutral"><strong>{neighbors.filter((neighbor) => neighbor.shot.goal).length} but(s) parmi {neighbors.length} voisins → environ {Math.round(neighborProbability * 100)}%</strong><span>k-NN = <b>k nearest neighbours</b>, c’est-à-dire « les k plus proches voisins ».</span></div>
        <ContinueButton onClick={() => setStep(3)}>Voir la troisième façon : l’arbre</ContinueButton>
      </LabShell>
    )
  }

  if (step === 3) {
    return (
      <LabShell visual={<TreePathVisual trace={treeTrace} probability={treeProbability} />}>
        <Eyebrow>11.3 · Arbre de décision</Eyebrow>
        <h1>Une suite de questions « si / alors » apprise par la machine.</h1>
        <p className="lead">L’arbre apprend des coupures dans les données. Pour prédire un tir, il suit un chemin de questions : par exemple « distance ≤ X ? », puis éventuellement une autre question sur l’angle.</p>
        {shotSelector}
        <div className="model-explanation"><strong>Ce que tu dois observer</strong><span>Deux tirs presque identiques peuvent parfois tomber de deux côtés différents d’une règle. Ajouter de la profondeur permet davantage de questions — donc davantage de détails, mais aussi davantage de risque de sur-apprentissage.</span></div>
        <div className="feedback neutral"><strong>Feuille atteinte : {Math.round(treeProbability * 100)}%</strong><span>« Arbre » signifie ici <b>un ensemble de règles si/alors apprises automatiquement</b>, pas un choix manuel de notre part.</span></div>
        <ContinueButton onClick={() => setStep(4)}>Maintenant : comprendre les chiffres</ContinueButton>
      </LabShell>
    )
  }

  if (step === 4) {
    return (
      <LabShell visual={<MetricPrimerVisual evaluation={metricEvaluation} correct={correct} actualGoals={actualGoals} alerts={alerts} />}>
        <Eyebrow>11.4 · Les métriques en français courant</Eyebrow>
        <h1>Un modèle peut être « bon » de plusieurs façons différentes.</h1>
        <p className="lead">Pour l’instant on garde un seul modèle fixe. Le seul bouton que tu manipules est le seuil : à partir de quelle probabilité on déclenche l’alerte « ce tir ressemble à un but ».</p>
        <div className="threshold-plain-language">
          <label><span>Déclencher une alerte si la probabilité dépasse…</span><strong>{Math.round(threshold * 100)}%</strong></label>
          <input type="range" min="0.05" max="0.6" step="0.05" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
        </div>
        <div className="model-explanation"><strong>Essaie 10%, 25%, puis 50%</strong><span>Baisser le seuil attrape généralement davantage de vrais buts, mais déclenche aussi davantage de fausses alertes. Il n’existe donc pas un seul chiffre magique qui raconte tout.</span></div>
        <div className="bridge-summary">
          <div><span>Accuracy</span><strong>Décisions justes</strong><small>Parmi tous les tirs, combien ont été classés correctement en BUT / PAS BUT.</small></div>
          <div><span>Recall</span><strong>Buts retrouvés</strong><small>Parmi les vrais buts, quelle proportion le modèle a réussi à signaler.</small></div>
          <div><span>Precision</span><strong>Alertes correctes</strong><small>Parmi les alertes « but probable », quelle proportion était vraiment un but.</small></div>
        </div>
        <ContinueButton onClick={() => setStep(5)}>Et pour les probabilités elles-mêmes ?</ContinueButton>
      </LabShell>
    )
  }

  if (step === 5) {
    return (
      <LabShell visual={<BucketPrimerVisual buckets={buckets} selected={selectedBucket} onSelect={setSelectedBucket} />}>
        <Eyebrow>11.5 · Comprendre enfin le graphique 0–20%, 20–40%…</Eyebrow>
        <h1>On regroupe ensemble les tirs auxquels le modèle avait donné des probabilités similaires.</h1>
        <p className="lead"><b>0–20%</b> ne veut pas dire « 0 à 20% de réussite du graphique ». Cela veut dire : « tous les tirs auxquels le modèle avait attribué entre 0% et 20% de chances de but ».</p>
        <div className="bucket-picker">
          {buckets.map((item, index) => <button key={index} className={selectedBucket === index ? 'selected' : ''} onClick={() => setSelectedBucket(index)}><strong>{Math.round(item.from * 100)}–{Math.round(item.to * 100)}%</strong><small>{item.count} tirs</small></button>)}
        </div>
        <div className="bucket-detail">
          <span>Tranche sélectionnée</span>
          <strong>{bucket.count} tirs · le modèle annonçait {Math.round(bucket.predicted * 100)}% en moyenne · {bucketGoals} ont réellement fini en but ({Math.round(bucket.observed * 100)}%).</strong>
          <p>Si le modèle disait environ 12% et qu’en réalité environ 12% de ces tirs deviennent des buts, cette tranche est bien calibrée. S’il disait 12% mais que 30% rentrent, ses probabilités racontent mal la réalité.</p>
        </div>
        <div className="model-explanation"><strong>Et « Brier » alors ?</strong><span>C’est simplement un score qui résume l’erreur de toutes ces probabilités en un nombre. <b>0 serait parfait ; plus bas est meilleur.</b> Une prédiction très sûre et fausse est davantage pénalisée qu’une prédiction hésitante et fausse.</span></div>
        <UnderTheHood><p>Techniquement, le Brier est la moyenne de <code>(probabilité − résultat)^2</code>, avec résultat = 1 pour un but et 0 sinon. Tu n’as pas besoin de mémoriser la formule pour l’utiliser correctement.</p></UnderTheHood>
        <ContinueButton onClick={() => setStep(6)}>Faire le point avant le vrai labo</ContinueButton>
      </LabShell>
    )
  }

  return (
    <LabShell visual={<ModelPrimerOverview activeAll />}>
      <Eyebrow>Chapitre 11 · Pont pédagogique terminé</Eyebrow>
      <h1>Maintenant, les réglages suivants ont un objet.</h1>
      <p className="lead">La suite pourra à nouveau te laisser expérimenter, mais avec une question précise derrière chaque bouton.</p>
      <div className="bridge-summary">
        <div><span>Logistique</span><strong>Relation globale et lisse</strong><small>Combine les features pour produire une probabilité continue.</small></div>
        <div><span>k-NN</span><strong>Voisins similaires</strong><small>Regarde ce qui est arrivé à k exemples proches.</small></div>
        <div><span>Arbre</span><strong>Règles si / alors</strong><small>Fait passer le tir dans des coupures apprises.</small></div>
      </div>
      <div className="checkpoint"><span>Les quatre lectures à garder</span><strong>Décisions justes · buts retrouvés · alertes correctes · erreur des probabilités.</strong></div>
      <ContinueButton onClick={onComplete}>Passer à la validation répétée</ContinueButton>
    </LabShell>
  )
}

function ModelPrimerOverview({ activeAll = false }: { activeAll?: boolean }) {
  return <div className="model-primer-board">
    <div className={`model-primer-card ${activeAll ? 'active' : ''}`}><span>Logistique</span><strong>Une courbe lisse</strong><small>Apprend une relation globale entre les informations du tir et la probabilité de but.</small></div>
    <div className={`model-primer-card ${activeAll ? 'active' : ''}`}><span>k-NN</span><strong>Les voisins</strong><small>Regarde des tirs passés qui ressemblent au nouveau tir et utilise leurs résultats.</small></div>
    <div className={`model-primer-card ${activeAll ? 'active' : ''}`}><span>Arbre</span><strong>Des règles</strong><small>Apprend des questions successives « si / alors » qui découpent les exemples.</small></div>
  </div>
}

function SmoothProbabilityVisual({ curve, selectedProbability }: { curve: Array<{ distance: number; probability: number }>; selectedProbability: number }) {
  return <div className="smooth-probability-list">
    <div className="model-primer-card active"><span>Régression logistique</span><strong>Tir choisi · {Math.round(selectedProbability * 100)}%</strong><small>Même angle, distances différentes :</small></div>
    {curve.map((item) => <div className="smooth-probability-row" key={item.distance}><span>{item.distance} mètres</span><i style={{ width: `${Math.max(2, item.probability * 100)}%` }} /><strong>{Math.round(item.probability * 100)}%</strong></div>)}
  </div>
}

function NeighborVisual({ neighbors, probability }: { neighbors: Neighbor[]; probability: number }) {
  return <div className="neighbor-list">
    <div className="model-primer-card active"><span>k-NN</span><strong>{Math.round(probability * 100)}%</strong><small>Proportion de buts parmi les voisins affichés.</small></div>
    {neighbors.map((neighbor, index) => <div className={`neighbor-row ${neighbor.shot.goal ? 'goal' : ''}`} key={neighbor.shot.id}><span>Voisin {index + 1}</span><strong>{neighbor.shot.distance.toFixed(1)}m · {neighbor.shot.angle.toFixed(0)}°</strong><b>{neighbor.shot.goal ? '⚽' : '×'}</b></div>)}
  </div>
}

function TreePathVisual({ trace, probability }: { trace: TreeTrace[]; probability: number }) {
  return <div className="tree-path-list">
    <div className="model-primer-card active"><span>Arbre de décision</span><strong>Chemin d’un tir</strong><small>Chaque réponse choisit la branche suivante.</small></div>
    {trace.map((item, index) => <div className="tree-path-row" key={`${item.label}-${index}`}><span>Question {index + 1}</span><strong>{item.label}</strong><b>{item.answer}</b></div>)}
    <div className="tree-path-row"><span>Feuille finale</span><strong>Probabilité observée dans ce groupe</strong><b>{Math.round(probability * 100)}%</b></div>
  </div>
}

function MetricPrimerVisual({ evaluation, correct, actualGoals, alerts }: { evaluation: ReturnType<typeof evaluateConfig>; correct: number; actualGoals: number; alerts: number }) {
  return <div className="metric-primer-board">
    <div className="metric-explainer-card"><span>Décisions justes · accuracy</span><strong>{correct}/{evaluation.labels.length}</strong><small>{Math.round(evaluation.accuracy * 100)}% de tous les tirs sont classés correctement.</small></div>
    <div className="metric-explainer-card"><span>Buts retrouvés · recall</span><strong>{evaluation.truePositive}/{actualGoals}</strong><small>Le modèle a signalé {Math.round(evaluation.recall * 100)}% des buts qui ont réellement eu lieu.</small></div>
    <div className="metric-explainer-card"><span>Alertes correctes · precision</span><strong>{evaluation.truePositive}/{alerts || 0}</strong><small>{alerts ? `${Math.round(evaluation.precision * 100)}% des alertes étaient de vrais buts.` : 'Aucune alerte avec ce seuil.'}</small></div>
    <div className="metric-explainer-card"><span>Fausses alertes</span><strong>{evaluation.falsePositive}</strong><small>Tirs annoncés comme « but probable » qui n’ont finalement pas été des buts.</small></div>
  </div>
}

function BucketPrimerVisual({ buckets, selected, onSelect }: { buckets: ReturnType<typeof calibrationBuckets>; selected: number; onSelect: (index: number) => void }) {
  return <div className="bucket-explainer">
    <div className="model-primer-card active"><span>Calibration</span><strong>Des groupes de probabilités</strong><small>Clique une tranche pour lire ce qu’elle contient réellement.</small></div>
    <div className="bucket-picker">{buckets.map((bucket, index) => <button key={index} className={selected === index ? 'selected' : ''} onClick={() => onSelect(index)}><strong>{Math.round(bucket.from * 100)}–{Math.round(bucket.to * 100)}%</strong><small>{bucket.count} tirs</small></button>)}</div>
    {buckets.map((bucket, index) => selected === index ? <div className="bucket-detail" key={index}><span>Ce groupe</span><strong>annoncé {Math.round(bucket.predicted * 100)}% · observé {Math.round(bucket.observed * 100)}%</strong><p>{bucket.count} tirs dans cette tranche.</p></div> : null)}
  </div>
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
  const scales = features.map((_, index) => {
    const variance = rows.reduce((sum, row) => sum + (row[index] - means[index]) ** 2, 0) / rows.length
    return Math.sqrt(variance) || 1
  })
  return train.map((shot, shotIndex) => {
    const row = rows[shotIndex]
    const distance = Math.sqrt(row.reduce((sum, value, featureIndex) => {
      const a = (value - means[featureIndex]) / scales[featureIndex]
      const b = (targetRow[featureIndex] - means[featureIndex]) / scales[featureIndex]
      return sum + (a - b) ** 2
    }, 0))
    return { shot, distance }
  }).sort((a, b) => a.distance - b.distance).slice(0, k)
}

function traceTree(root: TreeNode, row: number[]): TreeTrace[] {
  const trace: TreeTrace[] = []
  let node = root
  while (node.featureIndex !== undefined && node.threshold !== undefined && node.left && node.right) {
    const goesLeft = row[node.featureIndex] <= node.threshold
    trace.push({ label: `${featureNames[node.featureIndex]} ≤ ${node.threshold.toFixed(1)} ?`, answer: goesLeft ? 'oui' : 'non' })
    node = goesLeft ? node.left : node.right
  }
  return trace
}

function treeLeafProbability(root: TreeNode, row: number[]) {
  let node = root
  while (node.featureIndex !== undefined && node.threshold !== undefined && node.left && node.right) {
    node = row[node.featureIndex] <= node.threshold ? node.left : node.right
  }
  return node.probability
}
